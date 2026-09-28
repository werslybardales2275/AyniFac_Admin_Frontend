import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import CheckBox from 'devextreme-react/check-box';
import NumberBox from 'devextreme-react/number-box';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import { agregarUsuario } from '../../../api/usuarios';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, CampoFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { usuarioDtoEsquema, type UsuarioDto } from '../../../dtos/usuario-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_USUARIO } from '../../../seguridad/objetos';
import './usuario.scss';

const RUTA = '/api/usuarios';

export function Usuario() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_USUARIO);
  const [altaVisible, setAltaVisible] = useState(false);
  const [empleado, setEmpleado] = useState('');
  const [dni, setDni] = useState('');
  const [correo, setCorreo] = useState('');
  const [username, setUsername] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [sucursalId, setSucursalId] = useState<number | null>(null);
  const [rolId, setRolId] = useState<number | null>(null);
  const [activo, setActivo] = useState(true);
  const [esAdministrador, setEsAdministrador] = useState(false);
  const [guardando, setGuardando] = useState(false);

  function abrirUsuario(usuario: UsuarioDto) {
    navigate(`/usuario/${usuario.usuarioId}`, {
      state: { titulo: textoValorPorDefecto(usuario, usuarioDtoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setEmpleado('');
    setDni('');
    setCorreo('');
    setUsername('');
    setContrasena('');
    setSucursalId(null);
    setRolId(null);
    setActivo(true);
    setEsAdministrador(false);
  }

  async function guardarAlta() {
    const empleadoLimpio = empleado.trim();
    const dniLimpio = dni.trim();
    const correoLimpio = correo.trim();
    const usernameLimpio = username.trim();
    const contrasenaLimpia = contrasena.trim();

    if (!empleadoLimpio) {
      notify('El empleado es obligatorio.', 'warning', 2500);
      return;
    }
    if (!dniLimpio) {
      notify('El DNI es obligatorio.', 'warning', 2500);
      return;
    }
    if (!correoLimpio) {
      notify('El correo es obligatorio.', 'warning', 2500);
      return;
    }
    if (!usernameLimpio) {
      notify('El usuario es obligatorio.', 'warning', 2500);
      return;
    }
    if (contrasenaLimpia.length < 8) {
      notify('La contraseña debe tener al menos 8 caracteres.', 'warning', 2500);
      return;
    }
    if (!sucursalId || sucursalId <= 0) {
      notify('La sucursal indicada no es válida.', 'warning', 2500);
      return;
    }
    if (!rolId || rolId <= 0) {
      notify('El rol indicado no es válido.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarUsuario({
        empleado: empleadoLimpio,
        dni: dniLimpio,
        correo: correoLimpio,
        username: usernameLimpio,
        contrasena: contrasenaLimpia,
        sucursalId,
        rolId,
        activo,
        esAdministrador,
      });
      setAltaVisible(false);
      setEmpleado('');
      setDni('');
      setCorreo('');
      setUsername('');
      setContrasena('');
      setSucursalId(null);
      setRolId(null);
      setActivo(true);
      setEsAdministrador(false);
      notify('Usuario guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el usuario.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<UsuarioDto>
        titulo="Usuarios"
        ruta={RUTA}
        clave="usuarioId"
        esquema={usuarioDtoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirUsuario}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo usuario"
        guardando={guardando}
        alCerrar={cerrarAlta}
      >
        <CampoFormulario>
          <TextBox
            label="Empleado"
            labelMode="floating"
            value={empleado}
            maxLength={usuarioDtoEsquema.empleado.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setEmpleado(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <TextBox
            label="DNI"
            labelMode="floating"
            value={dni}
            maxLength={usuarioDtoEsquema.dni.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setDni(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <TextBox
            label="Correo"
            labelMode="floating"
            value={correo}
            maxLength={usuarioDtoEsquema.correo.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setCorreo(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <TextBox
            label="Usuario"
            labelMode="floating"
            value={username}
            maxLength={usuarioDtoEsquema.username.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setUsername(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <TextBox
            label="Contraseña"
            labelMode="floating"
            mode="password"
            value={contrasena}
            maxLength={usuarioDtoEsquema.contrasena.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setContrasena(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <NumberBox
            label="Sucursal"
            labelMode="floating"
            value={sucursalId ?? undefined}
            min={1}
            format="#"
            disabled={guardando}
            onValueChanged={(evento) => setSucursalId(evento.value ?? null)}
          />
        </CampoFormulario>
        <CampoFormulario>
          <NumberBox
            label="Rol"
            labelMode="floating"
            value={rolId ?? undefined}
            min={1}
            format="#"
            disabled={guardando}
            onValueChanged={(evento) => setRolId(evento.value ?? null)}
          />
        </CampoFormulario>
        <CampoFormulario>
          <CheckBox
            text="Activo"
            value={activo}
            disabled={guardando}
            onValueChanged={(evento) => setActivo(evento.value === true)}
          />
        </CampoFormulario>
        <CampoFormulario>
          <CheckBox
            text="Es administrador"
            value={esAdministrador}
            disabled={guardando}
            onValueChanged={(evento) => setEsAdministrador(evento.value === true)}
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
