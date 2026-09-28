import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import CheckBox from 'devextreme-react/check-box';
import DropDownButton from 'devextreme-react/drop-down-button';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { opcionesDeRolPlataforma } from '../../../api/roles-plataforma';
import { modificarUsuarioPlataforma, obtenerUsuarioPlataforma } from '../../../api/usuarios-plataforma';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { CampoFormulario, FormularioCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { usuarioPlataformaDtoEsquema, type UsuarioPlataformaDto } from '../../../dtos/usuario-plataforma-dto';
import type { ObjetoReducido } from '../../../dtos/objeto-reducido';
import { camposDeFicha, textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_USUARIO_PLATAFORMA } from '../../../seguridad/objetos';
import './usuario-plataforma.scss';

const RUTA_LISTA = '/api/administracion/usuarios-plataforma';
const CAMPOS_FICHA = camposDeFicha(usuarioPlataformaDtoEsquema, 'usuarioPlataformaId');

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function usuarioIdDe(path: string): string {
  const coincidencia = /\/usuario-plataforma\/([0-9a-fA-F-]{36})$/.exec(path);
  return coincidencia?.[1] ?? '';
}

export function UsuarioPlataformaEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_USUARIO_PLATAFORMA);
  const usuarioPlataformaId = usuarioIdDe(ruta);
  const [dni, setDni] = useState('');
  const [empleado, setEmpleado] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [userName, setUserName] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState<ObjetoReducido | null>(null);
  const [roles, setRoles] = useState<ObjetoReducido[]>([]);
  const [activo, setActivo] = useState(true);
  const [esAdministrador, setEsAdministrador] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const usuario = await obtenerUsuarioPlataforma(usuarioPlataformaId);
        if (!vigente)
          return;
        aplicar(usuario);
        renombrarDocumento(ruta, textoValorPorDefecto(usuario, usuarioPlataformaDtoEsquema));
        const rolesCargados = await opcionesDeRolPlataforma(usuario.rolDto.id);
        if (!vigente)
          return;
        setRoles(rolesCargados);
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir el usuario de plataforma.';
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    }

    if (usuarioPlataformaId)
      void cargar();
    else
      setCargando(false);

    return () => {
      vigente = false;
    };
  }, [usuarioPlataformaId, ruta, renombrarDocumento]);

  function aplicar(usuario: UsuarioPlataformaDto) {
    setDni(usuario.dni);
    setEmpleado(usuario.empleado);
    setTelefono(usuario.telefono);
    setCorreo(usuario.correo);
    setUserName(usuario.userName);
    setContrasena('');
    setRol(usuario.rolDto.id > 0 ? usuario.rolDto : null);
    setActivo(usuario.activo);
    setEsAdministrador(usuario.esAdministrador);
  }

  function cerrar() {
    cerrarDocumento(ruta);
  }

  async function guardar(cerrarAlTerminar: boolean) {
    if (!permiso.escritura)
      return;

    const dniLimpio = dni.trim();
    const empleadoLimpio = empleado.trim();
    const telefonoLimpio = telefono.trim();
    const correoLimpio = correo.trim();
    const usuarioLimpio = userName.trim();
    const contrasenaLimpia = contrasena.trim();

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
    if (contrasenaLimpia && contrasenaLimpia.length < 8) {
      notify('La contraseña debe tener al menos 8 caracteres.', 'warning', 2500);
      return;
    }
    if (!rol || rol.id <= 0) {
      notify('El rol indicado no es válido.', 'warning', 2500);
      return;
    }

    const usuario: UsuarioPlataformaDto = {
      usuarioPlataformaId,
      dni: dniLimpio,
      empleado: empleadoLimpio,
      telefono: telefonoLimpio,
      correo: correoLimpio,
      userName: usuarioLimpio,
      contrasena: contrasenaLimpia || null,
      rolDto: rol,
      activo,
      esAdministrador,
    };

    setGuardando(true);
    try {
      const guardado = await modificarUsuarioPlataforma(usuario);
      aplicar(guardado);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, usuarioPlataformaDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Usuario de plataforma guardado.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el usuario de plataforma.';
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
    if (campo === 'dni')
      return dni;
    if (campo === 'empleado')
      return empleado;
    if (campo === 'telefono')
      return telefono;
    if (campo === 'correo')
      return correo;
    if (campo === 'userName')
      return userName;
    return '';
  }

  function cambiarTexto(campo: (typeof CAMPOS_FICHA)[number], valor: string) {
    if (campo === 'dni')
      setDni(valor);
    else if (campo === 'empleado')
      setEmpleado(valor);
    else if (campo === 'telefono')
      setTelefono(valor);
    else if (campo === 'correo')
      setCorreo(valor);
    else if (campo === 'userName')
      setUserName(valor);
  }

  const titulo = textoValorPorDefecto({
    usuarioPlataformaId,
    dni,
    empleado,
    telefono,
    correo,
    userName,
    rolDto: rol ?? { id: 0, valor: '' },
    activo,
    esAdministrador,
    contrasena: contrasena || null,
  }, usuarioPlataformaDtoEsquema);

  return (
    <div className="usuario-plataforma-edicion ficha-detalle">
      <h2>{titulo || 'Usuario de plataforma'}</h2>
      <div className="usuario-plataforma-edicion-acciones">
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
      {cargando && <p>Cargando usuario…</p>}
      <FormularioCampos>
      {CAMPOS_FICHA.map((campo) => {
        const meta = usuarioPlataformaDtoEsquema[campo];
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

        if (campo === 'rolDto') {
          return (
            <CampoFormulario key={campo}>
              <ComboReducido
                etiqueta={meta.etiqueta}
                valor={rol?.id ?? null}
                opciones={roles}
                deshabilitado={bloqueado || soloLectura}
                alCambiar={(id) => {
                  if (id == null) {
                    setRol(null);
                    return;
                  }
                  const opcion = roles.find((item) => item.id === id);
                  setRol(opcion ?? { id, valor: rol?.id === id ? rol.valor : '' });
                }}
              />
            </CampoFormulario>
          );
        }

        if (meta.control !== 'texto')
          return null;

        const controles = [
          <CampoFormulario key={campo}>
            <TextBox
              label={meta.etiqueta}
              labelMode="floating"
              value={valorTextoDe(campo)}
              maxLength={'longitudMaxima' in meta ? meta.longitudMaxima : undefined}
              valueChangeEvent="input"
              readOnly={lectura}
              disabled={bloqueado}
              onValueChanged={(evento) => cambiarTexto(campo, evento.value ?? '')}
            />
          </CampoFormulario>,
        ];

        if (campo === 'userName') {
          controles.push(
            <CampoFormulario key="contrasena">
              <TextBox
                label={editando ? 'Nueva contraseña' : 'Contraseña'}
                labelMode="floating"
                mode="password"
                value={contrasena}
                maxLength={usuarioPlataformaDtoEsquema.contrasena.longitudMaxima}
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
