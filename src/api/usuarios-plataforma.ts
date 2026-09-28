import { leerMensajeError, solicitarApi } from './cliente-http';
import type { ObjetoReducido } from '../dtos/objeto-reducido';
import type { UsuarioPlataformaDto } from '../dtos/usuario-plataforma-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

export interface UsuarioPlataformaAlta {
  dni: string;
  empleado: string;
  telefono: string;
  correo: string;
  userName: string;
  contrasena: string;
  rolDto: ObjetoReducido;
  activo: boolean;
  esAdministrador: boolean;
}

const usuarioVacio = '00000000-0000-0000-0000-000000000000';

async function leerUsuario(respuesta: Response, respaldo: string): Promise<UsuarioPlataformaDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<UsuarioPlataformaDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerUsuarioPlataforma(usuarioPlataformaId: string): Promise<UsuarioPlataformaDto> {
  const respuesta = await solicitarApi(`/api/administracion/usuarios-plataforma/${usuarioPlataformaId}`);
  return leerUsuario(respuesta, 'No se pudo abrir el usuario de plataforma.');
}

export async function agregarUsuarioPlataforma(usuario: UsuarioPlataformaAlta): Promise<UsuarioPlataformaDto> {
  const respuesta = await solicitarApi('/api/administracion/usuarios-plataforma', {
    method: 'POST',
    body: JSON.stringify({
      usuarioPlataformaId: usuarioVacio,
      ...usuario,
    }),
  });
  return leerUsuario(respuesta, 'No se pudo guardar el usuario de plataforma.');
}

export async function modificarUsuarioPlataforma(usuario: UsuarioPlataformaDto): Promise<UsuarioPlataformaDto> {
  const respuesta = await solicitarApi(`/api/administracion/usuarios-plataforma/${usuario.usuarioPlataformaId}`, {
    method: 'PUT',
    body: JSON.stringify(usuario),
  });
  return leerUsuario(respuesta, 'No se pudo guardar el usuario de plataforma.');
}
