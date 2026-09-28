import { leerMensajeError, solicitarApi } from './cliente-http';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

export interface PermisoObjetoApi {
  objetoId: number;
  permisoLectura: boolean;
  permisoEscritura: boolean;
  permisoEliminacion: boolean;
  permisoEjecucion: boolean;
}

export interface PermisosUsuarioApi {
  esAdministrador: boolean;
  permisos: PermisoObjetoApi[];
}

export async function obtenerPermisosUsuario(): Promise<PermisosUsuarioApi> {
  const respuesta = await solicitarApi('/api/administracion/permisos/usuario');
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los permisos.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<PermisosUsuarioApi>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los permisos.');

  return cuerpo.datos;
}
