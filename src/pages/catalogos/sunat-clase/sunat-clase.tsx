import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { agregarSunatClase } from '../../../api/sunat-clases';
import { TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { CampoEtiqueta } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { opcionesDeSunatFamilia } from '../../../api/sunat-familias';
import type { ObjetoCodigoReducido } from '../../../dtos/objeto-reducido';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatClaseDtoEsquema } from '../../../dtos/sunat-clase-dto';
import {
  sunatClaseListadoEsquema,
  type SunatClaseListadoDto,
} from '../../../dtos/sunat-clase-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_CLASE } from '../../../seguridad/objetos';
import './sunat-clase.scss';

const RUTA = '/api/administracion/sunat-clases';

export function SunatClase() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_CLASE);
  const [altaVisible, setAltaVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [familiaCodigo, setFamiliaCodigo] = useState('');
  const [opciones, setOpciones] = useState<ObjetoCodigoReducido[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!altaVisible)
      return;
    let vigente = true;
    opcionesDeSunatFamilia()
      .then((datos) => {
        if (vigente)
          setOpciones(datos);
      })
      .catch((error: unknown) => {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar las familias SUNAT.';
        notify(mensaje, 'error', 3000);
      });
    return () => {
      vigente = false;
    };
  }, [altaVisible]);

  function abrirFicha(fila: SunatClaseListadoDto) {
    navigate(`/sunat-clase/${encodeURIComponent(fila.codigo)}`, {
      state: { titulo: textoValorPorDefecto(fila, sunatClaseListadoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setCodigo('');
    setNombre('');
    setFamiliaCodigo('');
  }

  async function guardarAlta() {
    const codigoLimpio = codigo.trim();
    const nombreLimpio = nombre.trim();
    if (!codigoLimpio) {
      notify('El código es obligatorio.', 'warning', 2500);
      return;
    }
    if (!familiaCodigo.trim()) {
      notify('La familia es obligatoria.', 'warning', 2500);
      return;
    }
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarSunatClase({
      codigo: codigoLimpio,
      familiaDto: { id: familiaCodigo.trim(), valor: '' },
      nombre: nombreLimpio,
    });
      setAltaVisible(false);
      setCodigo('');
      setNombre('');
      setFamiliaCodigo('');
      notify('Clase SUNAT guardada.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la clase SUNAT.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<SunatClaseListadoDto>
        titulo="Clases SUNAT"
        ruta={RUTA}
        clave="codigo"
        esquema={sunatClaseListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirFicha}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
        mostrarClave
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nueva clase SUNAT"
        guardando={guardando}
        rejilla
        alCerrar={cerrarAlta}
      >
        <TextoCampo
            etiqueta={sunatClaseDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatClaseDtoEsquema.codigo.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setCodigo}
        />
        <CampoEtiqueta etiqueta="Familia">
          <ComboReducido
            etiqueta=""
            valor={ familiaCodigo || null }
            opciones={opciones}
            alCambiar={(id) => setFamiliaCodigo(id ?? '')}
            deshabilitado={guardando}
          />
        </CampoEtiqueta>
        <TextoCampo
            etiqueta={sunatClaseDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatClaseDtoEsquema.nombre.longitudMaxima}
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
