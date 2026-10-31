import { memo, useState } from 'react';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import {
  agregarUsuarioInquilino,
  modificarUsuarioInquilino,
  obtenerUsuarioInquilino,
  rutaUsuariosInquilino,
} from '../../../api/usuarios-inquilino';
import { BooleanoCampo, TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import {
  usuarioInquilinoDtoEsquema,
  usuarioInquilinoVacio,
  type UsuarioInquilinoDto,
} from '../../../dtos/usuario-inquilino-dto';
import {
  usuarioInquilinoListadoEsquema,
  type UsuarioInquilinoListadoDto,
} from '../../../dtos/usuario-inquilino-listado-dto';
import { OBJETO_INQUILINO } from '../../../seguridad/objetos';

interface UsuariosInquilinoProps {
  inquilinoId: string;
}

/**
 * Listado de usuarios del inquilino abierto.
 * Alta y edición en popup; la opción eliminar no se muestra:
 * la baja se hace con Activo = false en la edición.
 */
export const UsuariosInquilino = memo(function UsuariosInquilino({ inquilinoId }: UsuariosInquilinoProps) {
  const permiso = usePermisoObjeto(OBJETO_INQUILINO);
  const ruta = rutaUsuariosInquilino(inquilinoId);
  const [edicion, setEdicion] = useState(false);
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioInquilinoDto>(() => usuarioInquilinoVacio());
  const [guardando, setGuardando] = useState(false);

  function abrirAlta() {
    setEdicion(false);
    setUsuario(usuarioInquilinoVacio());
    setFormularioVisible(true);
  }

  async function abrirUsuario(fila: UsuarioInquilinoListadoDto) {
    try {
      const abierto = await obtenerUsuarioInquilino(inquilinoId, fila.usuarioId);
      setEdicion(true);
      setUsuario(abierto);
      setFormularioVisible(true);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo abrir el usuario.';
      notify(mensaje, 'error', 3000);
    }
  }

  function cambiar(siguiente: UsuarioInquilinoDto) {
    setUsuario(siguiente);
  }

  function cerrarFormulario() {
    if (guardando)
      return;
    setFormularioVisible(false);
    setUsuario(usuarioInquilinoVacio());
  }

  async function guardar() {
    if (!permiso.escritura || guardando)
      return;

    const contrasenaLimpia = (usuario.contrasena ?? '').trim();
    const preparado: UsuarioInquilinoDto = {
      ...usuario,
      dni: usuario.dni.trim(),
      empleado: usuario.empleado.trim(),
      correo: usuario.correo.trim(),
      username: usuario.username.trim(),
      contrasena: contrasenaLimpia,
    };

    if (!preparado.dni) {
      notify('El DNI es obligatorio.', 'warning', 2500);
      return;
    }
    if (!preparado.empleado) {
      notify('El empleado es obligatorio.', 'warning', 2500);
      return;
    }
    if (!preparado.correo) {
      notify('El correo es obligatorio.', 'warning', 2500);
      return;
    }
    if (!preparado.username) {
      notify('El usuario es obligatorio.', 'warning', 2500);
      return;
    }
    if ((!edicion || contrasenaLimpia.length > 0) && contrasenaLimpia.length < 8) {
      notify('La contraseña debe tener al menos 8 caracteres.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      if (edicion)
        await modificarUsuarioInquilino(inquilinoId, { ...preparado, contrasena: contrasenaLimpia || null });
      else
        await agregarUsuarioInquilino(inquilinoId, preparado);

      setFormularioVisible(false);
      setUsuario(usuarioInquilinoVacio());
      notify('Usuario guardado.', 'success', 2000);
      recargarCatalogo(ruta);
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
    <div className="inquilino-usuarios">
      <ListaCatalogo<UsuarioInquilinoListadoDto>
        titulo="Usuarios"
        ruta={ruta}
        clave="usuarioId"
        esquema={usuarioInquilinoListadoEsquema}
        onNuevo={abrirAlta}
        onAbrir={(fila) => { void abrirUsuario(fila); }}
        puedeCrear={permiso.escritura}
        puedeEliminar={false}
        iconoAbrir="edit"
      />
      <PopupFormulario
        visible={formularioVisible}
        titulo={edicion ? 'Editar usuario' : 'Nuevo usuario'}
        guardando={guardando}
        alCerrar={cerrarFormulario}
      >
        <TextoCampo
          etiqueta={usuarioInquilinoDtoEsquema.dni.etiqueta}
          valor={usuario.dni}
          longitudMaxima={usuarioInquilinoDtoEsquema.dni.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={(valor) => cambiar({ ...usuario, dni: valor })}
        />
        <TextoCampo
          etiqueta={usuarioInquilinoDtoEsquema.empleado.etiqueta}
          valor={usuario.empleado}
          longitudMaxima={usuarioInquilinoDtoEsquema.empleado.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={(valor) => cambiar({ ...usuario, empleado: valor })}
        />
        <TextoCampo
          etiqueta={usuarioInquilinoDtoEsquema.correo.etiqueta}
          valor={usuario.correo}
          longitudMaxima={usuarioInquilinoDtoEsquema.correo.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={(valor) => cambiar({ ...usuario, correo: valor })}
        />
        <TextoCampo
          etiqueta={usuarioInquilinoDtoEsquema.username.etiqueta}
          valor={usuario.username}
          longitudMaxima={usuarioInquilinoDtoEsquema.username.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={(valor) => cambiar({ ...usuario, username: valor })}
        />
        <TextoCampo
          etiqueta={edicion ? 'Nueva contraseña' : usuarioInquilinoDtoEsquema.contrasena.etiqueta}
          mode="password"
          valor={usuario.contrasena ?? ''}
          longitudMaxima={usuarioInquilinoDtoEsquema.contrasena.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={(valor) => cambiar({ ...usuario, contrasena: valor })}
        />
        <BooleanoCampo
          etiqueta={usuarioInquilinoDtoEsquema.activo.etiqueta}
          valor={usuario.activo}
          deshabilitado={guardando}
          alCambiar={(valor) => cambiar({ ...usuario, activo: valor })}
        />
        <BooleanoCampo
          etiqueta={usuarioInquilinoDtoEsquema.esAdministrador.etiqueta}
          valor={usuario.esAdministrador}
          deshabilitado={guardando}
          alCambiar={(valor) => cambiar({ ...usuario, esAdministrador: valor })}
        />
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardar(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarFormulario} />
        </AccionesFormulario>
      </PopupFormulario>
    </div>
  );
});
