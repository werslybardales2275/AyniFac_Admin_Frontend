import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { agregarSunatSegmento } from '../../../api/sunat-segmentos';
import { TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatSegmentoDtoEsquema } from '../../../dtos/sunat-segmento-dto';
import {
  sunatSegmentoListadoEsquema,
  type SunatSegmentoListadoDto,
} from '../../../dtos/sunat-segmento-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_SEGMENTO } from '../../../seguridad/objetos';
import './sunat-segmento.scss';

const RUTA = '/api/administracion/sunat-segmentos';

export function SunatSegmento() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_SEGMENTO);
  const [altaVisible, setAltaVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  function abrirFicha(fila: SunatSegmentoListadoDto) {
    navigate(`/sunat-segmento/${encodeURIComponent(fila.codigo)}`, {
      state: { titulo: textoValorPorDefecto(fila, sunatSegmentoListadoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setCodigo('');
    setNombre('');
  }

  async function guardarAlta() {
    const codigoLimpio = codigo.trim();
    const nombreLimpio = nombre.trim();
    if (!codigoLimpio) {
      notify('El código es obligatorio.', 'warning', 2500);
      return;
    }
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarSunatSegmento({
      codigo: codigoLimpio,
      nombre: nombreLimpio,
    });
      setAltaVisible(false);
      setCodigo('');
      setNombre('');
      notify('Segmento SUNAT guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el segmento SUNAT.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<SunatSegmentoListadoDto>
        titulo="Segmentos SUNAT"
        ruta={RUTA}
        clave="codigo"
        esquema={sunatSegmentoListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirFicha}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
        mostrarClave
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo segmento SUNAT"
        guardando={guardando}
        rejilla
        alCerrar={cerrarAlta}
      >
        <TextoCampo
            etiqueta={sunatSegmentoDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatSegmentoDtoEsquema.codigo.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setCodigo}
        />
        <TextoCampo
            etiqueta={sunatSegmentoDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatSegmentoDtoEsquema.nombre.longitudMaxima}
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
