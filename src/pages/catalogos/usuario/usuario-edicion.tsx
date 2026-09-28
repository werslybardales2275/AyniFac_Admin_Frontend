import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import CheckBox from 'devextreme-react/check-box';
import DropDownButton from 'devextreme-react/drop-down-button';
import NumberBox from 'devextreme-react/number-box';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarUsuario, obtenerUsuario } from '../../../api/usuarios';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { CampoFormulario, FormularioCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { usuarioDtoEsquema, type UsuarioDto } from '../../../dtos/usuario-dto';
import { camposDeFicha, textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_USUARIO } from '../../../seguridad/objetos';
import './usuario.scss';

const RUTA_LISTA = '/api/usuarios';
const CAMPOS_FICHA = camposDeFicha(usuarioDtoEsquema, 'usuarioId');

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function usuarioIdDe(path: string): string {
  const coincidencia = /\/usuario\/([0-9a-fA-F-]{36})$/.exec(path);
  return coincidencia?.[1] ?? '';
}

export function UsuarioEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_USUARIO);
  const usuarioId = usuarioIdDe(ruta);
  const [empleado, setEmpleado] = useState('');
  const [dni, setDni] = useState('');
  const [correo, setCorreo] = useState('');
  const [username, setUsername] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [sucursalId, setSucursalId] = useState<number | null>(null);
  const [sucursalNombre, setSucursalNombre] = useState('');
  const [rolId, setRolId] = useState<number | null>(null);
  const [rolNombre, setRolNombre] = useState('');
  const [activo, setActivo] = useState(true);
  const [esAdministrador, setEsAdministrador] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const usuario = await obtenerUsuario(usuarioId);
        if (!vigente)
          return;
        setEmpleado(usuario.empleado);
        setDni(usuario.dni);
        setCorreo(usuario.correo ?? '');
        setUsername(usuario.username);
        setSucursalId(usuario.sucursalId);
        setSucursalNombre(usuario.sucursalNombre);
        setRolId(usuario.rolId);
        setRolNombre(usuario.rolNombre);
        setActivo(usuario.activo);
        setEsAdministrador(usuario.esAdministrador);
        renombrarDocumento(ruta, textoValorPorDefecto(usuario, usuarioDtoEsquema));
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir el usuario.';
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    }

    if (usuarioId)
      void cargar();
    else
      setCargando(false);

    return () => {
      vigente = false;
    };
  }, [usuarioId, ruta, renombrarDocumento]);

  function cerrar() {
    cerrarDocumento(ruta);
  }

  async function guardar(cerrarAlTerminar: boolean) {
    if (!permiso.escritura)
      return;

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
    if (contrasenaLimpia && contrasenaLimpia.length < 8) {
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

    const usuario: UsuarioDto = {
      usuarioId,
      empleado: empleadoLimpio,
      dni: dniLimpio,
      correo: correoLimpio,
      username: usernameLimpio,
      contrasena: contrasenaLimpia || null,
      sucursalId,
      sucursalNombre,
      rolId,
      rolNombre,
      activo,
      esAdministrador,
    };

    setGuardando(true);
    try {
      const guardado = await modificarUsuario(usuario);
      setEmpleado(guardado.empleado);
      setDni(guardado.dni);
      setCorreo(guardado.correo ?? '');
      setUsername(guardado.username);
      setContrasena('');
      setSucursalId(guardado.sucursalId);
      setSucursalNombre(guardado.sucursalNombre);
      setRolId(guardado.rolId);
      setRolNombre(guardado.rolNombre);
      setActivo(guardado.activo);
      setEsAdministrador(guardado.esAdministrador);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, usuarioDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Usuario guardado.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el usuario.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  function alElegirAccion(evento: ItemClickEvent) {
    const accion = evento.itemData as AccionGuardar | undefined;
    void guardar(accion?.id === 'guardar-cerrar');
  }

  const bloqueado = cargando || guardando;
  const soloLectura = !editando;

  function valorTextoDe(campo: (typeof CAMPOS_FICHA)[number]): string {
    if (campo === 'empleado')
      return empleado;
    if (campo === 'dni')
      return dni;
    if (campo === 'correo')
      return correo;
    if (campo === 'username')
      return username;
    if (campo === 'sucursalNombre')
      return sucursalNombre;
    if (campo === 'rolNombre')
      return rolNombre;
    return '';
  }

  function cambiarTexto(campo: (typeof CAMPOS_FICHA)[number], valor: string) {
    if (campo === 'empleado')
      setEmpleado(valor);
    else if (campo === 'dni')
      setDni(valor);
    else if (campo === 'correo')
      setCorreo(valor);
    else if (campo === 'username')
      setUsername(valor);
  }

  const titulo = textoValorPorDefecto({
    usuarioId,
    empleado,
    dni,
    correo,
    sucursalId: sucursalId ?? 0,
    sucursalNombre,
    rolId: rolId ?? 0,
    rolNombre,
    activo,
    esAdministrador,
    username,
    contrasena: contrasena || null,
  }, usuarioDtoEsquema);

  return (
    <div className="usuario-edicion ficha-detalle">
      <h2>{titulo || 'Usuario'}</h2>
      <div className="usuario-edicion-acciones">
        {!editando && permiso.escritura && (
          <Button
            text="Editar"
            icon="edit"
            type="default"
            stylingMode="contained"
            disabled={cargando}
            onClick={() => setEditando(true)}
          />
        )}
        {editando && (
          <DropDownButton
            text="Guardar"
            icon="save"
            type="default"
            stylingMode="contained"
            splitButton={true}
            displayExpr="text"
            keyExpr="id"
            items={accionesGuardar}
            disabled={bloqueado || !permiso.escritura}
            onButtonClick={() => { void guardar(false); }}
            onItemClick={alElegirAccion}
          />
        )}
        <Button text="Cerrar" stylingMode="outlined" disabled={guardando} onClick={cerrar} />
      </div>
      <FormularioCampos>
      {CAMPOS_FICHA.map((campo) => {
        const meta = usuarioDtoEsquema[campo];
        const lectura = soloLectura || ('soloLectura' in meta && meta.soloLectura);

        if (campo === 'activo' || campo === 'esAdministrador') {
          const marcado = campo === 'activo' ? activo : esAdministrador;
          return (
            <CampoFormulario key={campo}>
              <CheckBox
                text={meta.etiqueta}
                value={marcado}
                readOnly={lectura}
                disabled={bloqueado}
                onValueChanged={(evento) => {
                  const valor = evento.value === true;
                  if (campo === 'activo')
                    setActivo(valor);
                  else
                    setEsAdministrador(valor);
                }}
              />
            </CampoFormulario>
          );
        }

        if (campo === 'sucursalId' || campo === 'rolId') {
          const numero = campo === 'sucursalId' ? sucursalId : rolId;
          return (
            <CampoFormulario key={campo}>
              <NumberBox
                label={meta.etiqueta}
                labelMode="floating"
                value={numero ?? undefined}
                min={1}
                format="#"
                readOnly={lectura}
                disabled={bloqueado}
                onValueChanged={(evento) => {
                  const valor = evento.value ?? null;
                  if (campo === 'sucursalId')
                    setSucursalId(valor);
                  else
                    setRolId(valor);
                }}
              />
            </CampoFormulario>
          );
        }

        if (meta.control !== 'texto')
          return null;

        const valorTexto = valorTextoDe(campo);
        const controles = [
          <CampoFormulario key={campo}>
            <TextBox
              label={meta.etiqueta}
              labelMode="floating"
              value={valorTexto}
              maxLength={'longitudMaxima' in meta ? meta.longitudMaxima : undefined}
              valueChangeEvent="input"
              readOnly={lectura}
              disabled={bloqueado}
              onValueChanged={(evento) => cambiarTexto(campo, evento.value ?? '')}
            />
          </CampoFormulario>,
        ];

        if (campo === 'username') {
          controles.push(
            <CampoFormulario key="contrasena">
              <TextBox
                label="Nueva contraseña"
                labelMode="floating"
                mode="password"
                value={contrasena}
                maxLength={usuarioDtoEsquema.contrasena.longitudMaxima}
                valueChangeEvent="input"
                readOnly={soloLectura}
                disabled={bloqueado}
                onValueChanged={(evento) => setContrasena(evento.value ?? '')}
              />
            </CampoFormulario>,
          );
        }

        return controles;
      })}
      </FormularioCampos>
    </div>
  );
}
