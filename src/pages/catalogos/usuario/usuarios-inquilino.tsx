import { memo, useState } from 'react';
import Button from 'devextreme-react/button';
import SelectBox from 'devextreme-react/select-box';
import notify from 'devextreme/ui/notify';
import {
  agregarUsuarioInquilino,
  modificarUsuarioInquilino,
  obtenerUsuarioInquilino,
  opcionesDePersonaInquilino,
  rutaUsuariosInquilino,
} from '../../../api/usuarios-inquilino';
import { BooleanoCampo, CampoEtiqueta, TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
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
import type { ObjetoReducido } from '../../../dtos/objeto-reducido';
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
  const [personas, setPersonas] = useState<ObjetoReducido[]>([]);
  const [guardando, setGuardando] = useState(false);

  async function cargarPersonas(personaId?: number) {
    const lista = await opcionesDePersonaInquilino(inquilinoId, personaId);
    setPersonas(lista);
  }

  function abrirAlta() {
    setEdicion(false);
    setUsuario(usuarioInquilinoVacio());
    setPersonas([]);
    setFormularioVisible(true);
    void cargarPersonas().catch((error: unknown) => {
      const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar las personas.';
      notify(mensaje, 'error', 3000);
    });
  }

  async function abrirUsuario(fila: UsuarioInquilinoListadoDto) {
    try {
      const abierto = await obtenerUsuarioInquilino(inquilinoId, fila.usuarioId);
      setEdicion(true);
      setUsuario(abierto);
      setPersonas(abierto.personaDto.id > 0 ? [abierto.personaDto] : []);
      setFormularioVisible(true);
      await cargarPersonas(abierto.personaDto.id);
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
      username: usuario.username.trim(),
      contrasena: contrasenaLimpia,
    };

    if (preparado.personaDto.id <= 0) {
      notify('La persona es obligatoria.', 'warning', 2500);
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
        <CampoEtiqueta etiqueta={usuarioInquilinoDtoEsquema.personaDto.etiqueta}>
          <SelectBox
            labelMode="hidden"
            dataSource={personas}
            valueExpr="id"
            displayExpr="valor"
            value={usuario.personaDto.id > 0 ? usuario.personaDto.id : null}
            searchEnabled
            disabled={guardando}
            onValueChanged={(evento) => {
              if (!evento.event)
                return;
              const id = evento.value as number | null;
              const elegida = personas.find((persona) => persona.id === id) ?? { id: 0, valor: '' };
              cambiar({ ...usuario, personaDto: elegida });
            }}
          />
        </CampoEtiqueta>
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
