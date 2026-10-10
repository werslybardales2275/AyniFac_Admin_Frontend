import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import type { TextBoxRef } from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import { opcionesDeRolPlataforma } from '../../../api/roles-plataforma';
import { agregarUsuarioPlataforma } from '../../../api/usuarios-plataforma';
import { BooleanoCampo, CampoEtiqueta, TextoCampo, textoEscrito } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import type { ObjetoReducido } from '../../../dtos/objeto-reducido';
import { usuarioPlataformaDtoEsquema } from '../../../dtos/usuario-plataforma-dto';
import {
  usuarioPlataformaListadoEsquema,
  type UsuarioPlataformaListadoDto,
} from '../../../dtos/usuario-plataforma-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_USUARIO_PLATAFORMA } from '../../../seguridad/objetos';
import './usuario-plataforma.scss';

const RUTA = '/api/administracion/usuarios-plataforma';

export function UsuarioPlataforma() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_USUARIO_PLATAFORMA);
  const [altaVisible, setAltaVisible] = useState(false);
  const [dni, setDni] = useState('');
  const [empleado, setEmpleado] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [userName, setUserName] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rolId, setRolId] = useState<number | null>(null);
  const [roles, setRoles] = useState<ObjetoReducido[]>([]);
  const [cargandoRoles, setCargandoRoles] = useState(false);
  const [activo, setActivo] = useState(true);
  const [esAdministrador, setEsAdministrador] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const campoDni = useRef<TextBoxRef>(null);
  const campoEmpleado = useRef<TextBoxRef>(null);
  const campoTelefono = useRef<TextBoxRef>(null);
  const campoCorreo = useRef<TextBoxRef>(null);
  const campoUsuario = useRef<TextBoxRef>(null);
  const campoContrasena = useRef<TextBoxRef>(null);

  useEffect(() => {
    if (!altaVisible)
      return;

    let vigente = true;
    setCargandoRoles(true);
    opcionesDeRolPlataforma()
      .then((datos) => {
        if (vigente)
          setRoles(datos);
      })
      .catch((error: unknown) => {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los roles de plataforma.';
        notify(mensaje, 'error', 3000);
      })
      .finally(() => {
        if (vigente)
          setCargandoRoles(false);
      });

    return () => {
      vigente = false;
    };
  }, [altaVisible]);

  function abrirUsuario(usuario: UsuarioPlataformaListadoDto) {
    navigate(`/usuario-plataforma/${usuario.usuarioPlataformaId}`, {
      state: { titulo: textoValorPorDefecto(usuario, usuarioPlataformaListadoEsquema) },
    });
  }

  function limpiarAlta() {
    setDni('');
    setEmpleado('');
    setTelefono('');
    setCorreo('');
    setUserName('');
    setContrasena('');
    setRolId(null);
    setActivo(true);
    setEsAdministrador(false);
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    limpiarAlta();
  }

  async function guardarAlta() {
    const dniLimpio = textoEscrito(campoDni, dni).trim();
    const empleadoLimpio = textoEscrito(campoEmpleado, empleado).trim();
    const telefonoLimpio = textoEscrito(campoTelefono, telefono).trim();
    const correoLimpio = textoEscrito(campoCorreo, correo).trim();
    const usuarioLimpio = textoEscrito(campoUsuario, userName).trim();
    const contrasenaLimpia = textoEscrito(campoContrasena, contrasena).trim();

    if (!dniLimpio) {
      notify('El DNI es obligatorio.', 'warning', 2500);
      return;
    }
    if (!empleadoLimpio) {
      notify('El empleado es obligatorio.', 'warning', 2500);
      return;
    }
    if (!telefonoLimpio) {
      notify('El teléfono es obligatorio.', 'warning', 2500);
      return;
    }
    if (!correoLimpio) {
      notify('El correo es obligatorio.', 'warning', 2500);
      return;
    }
    if (!usuarioLimpio) {
      notify('El usuario es obligatorio.', 'warning', 2500);
      return;
    }
    if (contrasenaLimpia.length < 8) {
      notify('La contraseña debe tener al menos 8 caracteres.', 'warning', 2500);
      return;
    }
    if (!rolId || rolId <= 0) {
      notify('El rol indicado no es válido.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarUsuarioPlataforma({
        dni: dniLimpio,
        empleado: empleadoLimpio,
        telefono: telefonoLimpio,
        correo: correoLimpio,
        userName: usuarioLimpio,
        contrasena: contrasenaLimpia,
        rolDto: roles.find((item) => item.id === rolId) ?? { id: rolId, valor: '' },
        activo,
        esAdministrador,
      });
      setAltaVisible(false);
      limpiarAlta();
      notify('Usuario de plataforma guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el usuario de plataforma.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<UsuarioPlataformaListadoDto>
        titulo="Usuarios de plataforma"
        ruta={RUTA}
        clave="usuarioPlataformaId"
        esquema={usuarioPlataformaListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirUsuario}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo usuario de plataforma"
        guardando={guardando}
        alCerrar={cerrarAlta}
      >
        <TextoCampo
          referencia={campoDni}
          etiqueta={usuarioPlataformaDtoEsquema.dni.etiqueta}
          valor={dni}
          longitudMaxima={usuarioPlataformaDtoEsquema.dni.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setDni}
        />
        <TextoCampo
          referencia={campoEmpleado}
          etiqueta={usuarioPlataformaDtoEsquema.empleado.etiqueta}
          valor={empleado}
          longitudMaxima={usuarioPlataformaDtoEsquema.empleado.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setEmpleado}
        />
        <TextoCampo
          referencia={campoTelefono}
          etiqueta={usuarioPlataformaDtoEsquema.telefono.etiqueta}
          valor={telefono}
          longitudMaxima={usuarioPlataformaDtoEsquema.telefono.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setTelefono}
        />
        <TextoCampo
          referencia={campoCorreo}
          etiqueta={usuarioPlataformaDtoEsquema.correo.etiqueta}
          valor={correo}
          longitudMaxima={usuarioPlataformaDtoEsquema.correo.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setCorreo}
        />
        <TextoCampo
          referencia={campoUsuario}
          etiqueta={usuarioPlataformaDtoEsquema.userName.etiqueta}
          valor={userName}
          longitudMaxima={usuarioPlataformaDtoEsquema.userName.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setUserName}
        />
        <TextoCampo
          referencia={campoContrasena}
          etiqueta={usuarioPlataformaDtoEsquema.contrasena.etiqueta}
          mode="password"
          valor={contrasena}
          longitudMaxima={usuarioPlataformaDtoEsquema.contrasena.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setContrasena}
        />
        <CampoEtiqueta etiqueta={usuarioPlataformaDtoEsquema.rolDto.etiqueta}>
          <ComboReducido
            etiqueta=""
            valor={rolId}
            opciones={roles}
            deshabilitado={guardando || cargandoRoles}
            alCambiar={setRolId}
          />
        </CampoEtiqueta>
        <BooleanoCampo
          etiqueta={usuarioPlataformaDtoEsquema.activo.etiqueta}
          valor={activo}
          deshabilitado={guardando}
          alCambiar={setActivo}
        />
        <BooleanoCampo
          etiqueta={usuarioPlataformaDtoEsquema.esAdministrador.etiqueta}
          valor={esAdministrador}
          deshabilitado={guardando}
          alCambiar={setEsAdministrador}
        />
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarAlta(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarAlta} />
        </AccionesFormulario>
      </PopupFormulario>
    </>
  );
}
