import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import type { TextBoxRef } from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import { agregarModuloOperativo } from '../../../api/modulos-operativos';
import { TextoCampo, textoEscrito } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { moduloOperativoDtoEsquema } from '../../../dtos/modulo-operativo-dto';
import {
  moduloOperativoListadoEsquema,
  type ModuloOperativoListadoDto,
} from '../../../dtos/modulo-operativo-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_MODULO_OPERATIVO } from '../../../seguridad/objetos';
import './modulo-operativo.scss';

const RUTA = '/api/administracion/modulos-operativos';

export function ModuloOperativo() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_MODULO_OPERATIVO);
  const [altaVisible, setAltaVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const campoNombre = useRef<TextBoxRef>(null);

  function abrirModulo(modulo: ModuloOperativoListadoDto) {
    navigate(`/modulo-operativo/${modulo.moduloOperativoId}`, {
      state: { titulo: textoValorPorDefecto(modulo, moduloOperativoListadoEsquema) },
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
      await agregarModuloOperativo(nombreLimpio);
      setAltaVisible(false);
      setNombre('');
      notify('Módulo operativo guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el módulo operativo.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<ModuloOperativoListadoDto>
        titulo="Módulos operativos"
        ruta={RUTA}
        clave="moduloOperativoId"
        esquema={moduloOperativoListadoEsquema}
        onNuevo={() => {
          setNombre('');
          setAltaVisible(true);
        }}
        onAbrir={abrirModulo}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo módulo operativo"
        guardando={guardando}
        rejilla
        alCerrar={cerrarAlta}
      >
        <TextoCampo
          referencia={campoNombre}
          etiqueta={moduloOperativoDtoEsquema.nombre.etiqueta}
          valor={nombre}
          longitudMaxima={moduloOperativoDtoEsquema.nombre.longitudMaxima}
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
