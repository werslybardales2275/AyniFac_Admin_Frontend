import { leerMensajeError, solicitarApi } from './cliente-http';
import type { UsuarioInquilinoDto } from '../dtos/usuario-inquilino-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

/** Listado anidado en el inquilino. ListaCatalogo pagina sobre esta ruta. No hay borrado. */
export function rutaUsuariosInquilino(inquilinoId: string): string {
  return `/api/administracion/inquilinos/${inquilinoId}/usuarios`;
}

async function leerUsuario(respuesta: Response, respaldo: string): Promise<UsuarioInquilinoDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<UsuarioInquilinoDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerUsuarioInquilino(inquilinoId: string, usuarioId: string): Promise<UsuarioInquilinoDto> {
  const respuesta = await solicitarApi(`${rutaUsuariosInquilino(inquilinoId)}/${usuarioId}`);
  return leerUsuario(respuesta, 'No se pudo abrir el usuario.');
}

export async function agregarUsuarioInquilino(inquilinoId: string, usuario: UsuarioInquilinoDto): Promise<UsuarioInquilinoDto> {
  const respuesta = await solicitarApi(rutaUsuariosInquilino(inquilinoId), {
    method: 'POST',
    body: JSON.stringify(usuario),
  });
  return leerUsuario(respuesta, 'No se pudo guardar el usuario.');
}

export async function modificarUsuarioInquilino(inquilinoId: string, usuario: UsuarioInquilinoDto): Promise<UsuarioInquilinoDto> {
  const respuesta = await solicitarApi(`${rutaUsuariosInquilino(inquilinoId)}/${usuario.usuarioId}`, {
    method: 'PUT',
    body: JSON.stringify(usuario),
  });
  return leerUsuario(respuesta, 'No se pudo guardar el usuario.');
}
