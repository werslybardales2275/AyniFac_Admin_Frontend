import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import { agregarRolPlataforma } from '../../../api/roles-plataforma';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, CampoFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { rolPlataformaDtoEsquema } from '../../../dtos/rol-plataforma-dto';
import {
  rolPlataformaListadoEsquema,
  type RolPlataformaListadoDto,
} from '../../../dtos/rol-plataforma-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_ROL_PLATAFORMA } from '../../../seguridad/objetos';
import './rol-plataforma.scss';

const RUTA = '/api/administracion/roles-plataforma';

export function RolPlataforma() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_ROL_PLATAFORMA);
  const [altaVisible, setAltaVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  function abrirRol(rol: RolPlataformaListadoDto) {
    navigate(`/rol-plataforma/${rol.rolId}`, {
      state: { titulo: textoValorPorDefecto(rol, rolPlataformaListadoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setNombre('');
  }

  async function guardarAlta() {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarRolPlataforma(nombreLimpio);
      setAltaVisible(false);
      setNombre('');
      notify('Rol de plataforma guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el rol de plataforma.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<RolPlataformaListadoDto>
        titulo="Roles de plataforma"
        ruta={RUTA}
        clave="rolId"
        esquema={rolPlataformaListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirRol}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo rol de plataforma"
        guardando={guardando}
        alCerrar={cerrarAlta}
      >
        <CampoFormulario>
          <TextBox
            label="Nombre"
            labelMode="floating"
            value={nombre}
            maxLength={rolPlataformaDtoEsquema.nombre.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setNombre(evento.value ?? '')}
            onEnterKey={() => { void guardarAlta(); }}
          />
        </CampoFormulario>
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarAlta(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarAlta} />
        </AccionesFormulario>
      </PopupFormulario>
    </>
  );
}
