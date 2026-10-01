import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { agregarSunatProducto } from '../../../api/sunat-productos';
import { TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { CampoEtiqueta } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { opcionesDeSunatClase } from '../../../api/sunat-clases';
import type { ObjetoCodigoReducido } from '../../../dtos/objeto-reducido';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatProductoDtoEsquema } from '../../../dtos/sunat-producto-dto';
import {
  sunatProductoListadoEsquema,
  type SunatProductoListadoDto,
} from '../../../dtos/sunat-producto-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_PRODUCTO } from '../../../seguridad/objetos';
import './sunat-producto.scss';

const RUTA = '/api/administracion/sunat-productos';

export function SunatProducto() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_PRODUCTO);
  const [altaVisible, setAltaVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [claseCodigo, setClaseCodigo] = useState('');
  const [opciones, setOpciones] = useState<ObjetoCodigoReducido[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!altaVisible)
      return;
    let vigente = true;
    opcionesDeSunatClase()
      .then((datos) => {
        if (vigente)
          setOpciones(datos);
      })
      .catch((error: unknown) => {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar las clases SUNAT.';
        notify(mensaje, 'error', 3000);
      });
    return () => {
      vigente = false;
    };
  }, [altaVisible]);

  function abrirFicha(fila: SunatProductoListadoDto) {
    navigate(`/sunat-producto/${encodeURIComponent(fila.codigo)}`, {
      state: { titulo: textoValorPorDefecto(fila, sunatProductoListadoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setCodigo('');
    setNombre('');
    setClaseCodigo('');
  }

  async function guardarAlta() {
    const codigoLimpio = codigo.trim();
    const nombreLimpio = nombre.trim();
    if (!codigoLimpio) {
      notify('El código es obligatorio.', 'warning', 2500);
      return;
    }
    if (!claseCodigo.trim()) {
      notify('La clase es obligatoria.', 'warning', 2500);
      return;
    }
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarSunatProducto({
      codigo: codigoLimpio,
      claseDto: { id: claseCodigo.trim(), valor: '' },
      nombre: nombreLimpio,
    });
      setAltaVisible(false);
      setCodigo('');
      setNombre('');
      setClaseCodigo('');
      notify('Producto SUNAT guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el producto SUNAT.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<SunatProductoListadoDto>
        titulo="Productos SUNAT"
        ruta={RUTA}
        clave="codigo"
        esquema={sunatProductoListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirFicha}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
        mostrarClave
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo producto SUNAT"
        guardando={guardando}
        rejilla
        alCerrar={cerrarAlta}
      >
        <TextoCampo
            etiqueta={sunatProductoDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatProductoDtoEsquema.codigo.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setCodigo}
        />
        <CampoEtiqueta etiqueta="Clase">
          <ComboReducido
            etiqueta=""
            valor={ claseCodigo || null }
            opciones={opciones}
            alCambiar={(id) => setClaseCodigo(id ?? '')}
            deshabilitado={guardando}
          />
        </CampoEtiqueta>
        <TextoCampo
            etiqueta={sunatProductoDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatProductoDtoEsquema.nombre.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setNombre}
        />
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarAlta(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarAlta} />
        </AccionesFormulario>
      </PopupFormulario>
    </>
  );
}
