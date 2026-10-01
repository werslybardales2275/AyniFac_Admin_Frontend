import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { agregarSunatFamilia } from '../../../api/sunat-familias';
import { TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { CampoEtiqueta } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { opcionesDeSunatSegmento } from '../../../api/sunat-segmentos';
import type { ObjetoCodigoReducido } from '../../../dtos/objeto-reducido';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatFamiliaDtoEsquema } from '../../../dtos/sunat-familia-dto';
import {
  sunatFamiliaListadoEsquema,
  type SunatFamiliaListadoDto,
} from '../../../dtos/sunat-familia-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_FAMILIA } from '../../../seguridad/objetos';
import './sunat-familia.scss';

const RUTA = '/api/administracion/sunat-familias';

export function SunatFamilia() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_FAMILIA);
  const [altaVisible, setAltaVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [segmentoCodigo, setSegmentoCodigo] = useState('');
  const [opciones, setOpciones] = useState<ObjetoCodigoReducido[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!altaVisible)
      return;
    let vigente = true;
    opcionesDeSunatSegmento()
      .then((datos) => {
        if (vigente)
          setOpciones(datos);
      })
      .catch((error: unknown) => {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los segmentos SUNAT.';
        notify(mensaje, 'error', 3000);
      });
    return () => {
      vigente = false;
    };
  }, [altaVisible]);

  function abrirFicha(fila: SunatFamiliaListadoDto) {
    navigate(`/sunat-familia/${encodeURIComponent(fila.codigo)}`, {
      state: { titulo: textoValorPorDefecto(fila, sunatFamiliaListadoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setCodigo('');
    setNombre('');
    setSegmentoCodigo('');
  }

  async function guardarAlta() {
    const codigoLimpio = codigo.trim();
    const nombreLimpio = nombre.trim();
    if (!codigoLimpio) {
      notify('El código es obligatorio.', 'warning', 2500);
      return;
    }
    if (!segmentoCodigo.trim()) {
      notify('El segmento es obligatorio.', 'warning', 2500);
      return;
    }
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarSunatFamilia({
      codigo: codigoLimpio,
      segmentoDto: { id: segmentoCodigo.trim(), valor: '' },
      nombre: nombreLimpio,
    });
      setAltaVisible(false);
      setCodigo('');
      setNombre('');
      setSegmentoCodigo('');
      notify('Familia SUNAT guardada.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la familia SUNAT.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<SunatFamiliaListadoDto>
        titulo="Familias SUNAT"
        ruta={RUTA}
        clave="codigo"
        esquema={sunatFamiliaListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirFicha}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
        mostrarClave
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nueva familia SUNAT"
        guardando={guardando}
        rejilla
        alCerrar={cerrarAlta}
      >
        <TextoCampo
            etiqueta={sunatFamiliaDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatFamiliaDtoEsquema.codigo.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setCodigo}
        />
        <CampoEtiqueta etiqueta="Segmento">
          <ComboReducido
            etiqueta=""
            valor={ segmentoCodigo || null }
            opciones={opciones}
            alCambiar={(id) => setSegmentoCodigo(id ?? '')}
            deshabilitado={guardando}
          />
        </CampoEtiqueta>
        <TextoCampo
            etiqueta={sunatFamiliaDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatFamiliaDtoEsquema.nombre.longitudMaxima}
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
