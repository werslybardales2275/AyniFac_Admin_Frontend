import { leerMensajeError, solicitarApi } from './cliente-http';
import type { ObjetoGuidReducido } from '../dtos/objeto-reducido';
import type { UsuarioDto } from '../dtos/usuario-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

export interface UsuarioAlta {
  empleado: string;
  dni: string;
  correo: string;
  sucursalId: number;
  rolId: number;
  activo: boolean;
  esAdministrador: boolean;
  username: string;
  contrasena: string;
}

const usuarioVacio = '00000000-0000-0000-0000-000000000000';

async function leerUsuario(respuesta: Response, respaldo: string): Promise<UsuarioDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<UsuarioDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function listaReducidaUsuario(
  pagina = 1,
  tamanoPagina = 20,
  criterio = '',
): Promise<ObjetoGuidReducido[]> {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: String(tamanoPagina),
  });
  const texto = criterio.trim();
  if (texto)
    parametros.set('criterio', texto);

  const respuesta = await solicitarApi(`/api/usuarios/opciones?${parametros.toString()}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los usuarios.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoGuidReducido[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los usuarios.');

  return cuerpo.datos;
}

export async function obtenerReducidoUsuario(usuarioId: string): Promise<ObjetoGuidReducido> {
  const respuesta = await solicitarApi(`/api/usuarios/opciones/${usuarioId}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo abrir el usuario.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoGuidReducido>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo abrir el usuario.');

  return cuerpo.datos;
}

export async function obtenerUsuario(usuarioId: string): Promise<UsuarioDto> {
  const respuesta = await solicitarApi(`/api/usuarios/${usuarioId}`);
  return leerUsuario(respuesta, 'No se pudo abrir el usuario.');
}

export async function agregarUsuario(usuario: UsuarioAlta): Promise<UsuarioDto> {
  const respuesta = await solicitarApi('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      usuarioId: usuarioVacio,
      sucursalNombre: '',
      rolNombre: '',
      ...usuario,
    }),
  });
  return leerUsuario(respuesta, 'No se pudo guardar el usuario.');
}

export async function modificarUsuario(usuario: UsuarioDto): Promise<UsuarioDto> {
  const respuesta = await solicitarApi(`/api/usuarios/${usuario.usuarioId}`, {
    method: 'PUT',
    body: JSON.stringify(usuario),
  });
  return leerUsuario(respuesta, 'No se pudo guardar el usuario.');
}
