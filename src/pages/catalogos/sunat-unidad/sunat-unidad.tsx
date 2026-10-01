import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { agregarSunatUnidad } from '../../../api/sunat-unidades';
import { TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatUnidadDtoEsquema } from '../../../dtos/sunat-unidad-dto';
import {
  sunatUnidadListadoEsquema,
  type SunatUnidadListadoDto,
} from '../../../dtos/sunat-unidad-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_UNIDAD } from '../../../seguridad/objetos';
import './sunat-unidad.scss';

const RUTA = '/api/administracion/sunat-unidades';

export function SunatUnidad() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_UNIDAD);
  const [altaVisible, setAltaVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  function abrirUnidad(unidad: SunatUnidadListadoDto) {
    navigate(`/sunat-unidad/${encodeURIComponent(unidad.codigo)}`, {
      state: { titulo: textoValorPorDefecto(unidad, sunatUnidadListadoEsquema) },
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
      await agregarSunatUnidad({ codigo: codigoLimpio, nombre: nombreLimpio });
      setAltaVisible(false);
      setCodigo('');
      setNombre('');
      notify('Unidad SUNAT guardada.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la unidad SUNAT.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<SunatUnidadListadoDto>
        titulo="Unidades SUNAT"
        ruta={RUTA}
        clave="codigo"
        esquema={sunatUnidadListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirUnidad}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
        mostrarClave
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nueva unidad SUNAT"
        guardando={guardando}
        rejilla
        alCerrar={cerrarAlta}
      >
        <TextoCampo
          etiqueta="Código"
          valor={codigo}
          longitudMaxima={sunatUnidadDtoEsquema.codigo.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setCodigo}
        />
        <TextoCampo
          etiqueta="Nombre"
          valor={nombre}
          longitudMaxima={sunatUnidadDtoEsquema.nombre.longitudMaxima}
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
