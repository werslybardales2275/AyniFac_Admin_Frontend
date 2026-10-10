import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import type { TextBoxRef } from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import { agregarTipoInformacion } from '../../../api/tipos-informacion';
import { TextoCampo, textoEscrito } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { tipoInformacionDtoEsquema } from '../../../dtos/tipo-informacion-dto';
import {
  tipoInformacionListadoEsquema,
  type TipoInformacionListadoDto,
} from '../../../dtos/tipo-informacion-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_TIPO_INFORMACION } from '../../../seguridad/objetos';
import './tipo-informacion.scss';

const RUTA = '/api/administracion/tipos-informacion';

export function TipoInformacion() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_TIPO_INFORMACION);
  const [altaVisible, setAltaVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const campoNombre = useRef<TextBoxRef>(null);

  function abrirTipo(tipo: TipoInformacionListadoDto) {
    navigate(`/tipo-informacion/${tipo.tipoInformacionId}`, {
      state: { titulo: textoValorPorDefecto(tipo, tipoInformacionListadoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setNombre('');
  }

  async function guardarAlta() {
    const nombreLimpio = textoEscrito(campoNombre, nombre).trim();
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarTipoInformacion(nombreLimpio);
      setAltaVisible(false);
      setNombre('');
      notify('Tipo de información guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el tipo de información.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<TipoInformacionListadoDto>
        titulo="Tipos de información"
        ruta={RUTA}
        clave="tipoInformacionId"
        esquema={tipoInformacionListadoEsquema}
        onNuevo={() => {
          setNombre('');
          setAltaVisible(true);
        }}
        onAbrir={abrirTipo}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo tipo de información"
        guardando={guardando}
        alCerrar={cerrarAlta}
      >
        <TextoCampo
          referencia={campoNombre}
          etiqueta={tipoInformacionDtoEsquema.nombre.etiqueta}
          valor={nombre}
          longitudMaxima={tipoInformacionDtoEsquema.nombre.longitudMaxima}
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
