import { leerMensajeError, solicitarApi } from './cliente-http';
import type { ObjetoReducido } from '../dtos/objeto-reducido';
import type { RolObjetoPlataformaDto } from '../dtos/rol-objeto-plataforma-dto';
import type { RolObjetoPlataformaListadoDto } from '../dtos/rol-objeto-plataforma-listado-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

function rutaDe(rolId: number): string {
  return `/api/administracion/roles-plataforma/${rolId}/objetos`;
}

export interface PermisosObjetoRol {
  objetoId: number;
  permisoLectura: boolean;
  permisoEscritura: boolean;
  permisoEliminacion: boolean;
}

/** Tipos de TipoObjetoAdmin para el combo: id y nombre del menú. */
export async function listarObjetosAdmin(): Promise<ObjetoReducido[]> {
  const respuesta = await solicitarApi('/api/administracion/objetos-admin');
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los objetos.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoReducido[]>;
  if (!cuerpo.exito)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los objetos.');

  return cuerpo.datos ?? [];
}

export async function listarObjetosDelRol(rolId: number): Promise<RolObjetoPlataformaListadoDto[]> {
  const respuesta = await solicitarApi(rutaDe(rolId));
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los objetos del rol.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<RolObjetoPlataformaListadoDto[]>;
  if (!cuerpo.exito)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los objetos del rol.');

  return cuerpo.datos ?? [];
}

export async function agregarObjetoAlRol(
  rolId: number,
  permisos: PermisosObjetoRol,
): Promise<RolObjetoPlataformaDto> {
  const respuesta = await solicitarApi(rutaDe(rolId), {
    method: 'POST',
    body: JSON.stringify({
      rolObjetoId: '00000000-0000-0000-0000-000000000000',
      rolId,
      objetoNombre: '',
      ...permisos,
    }),
  });
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo asignar el objeto.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<RolObjetoPlataformaDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo asignar el objeto.');

  return cuerpo.datos;
}

export async function modificarObjetoDelRol(
  rolId: number,
  fila: RolObjetoPlataformaListadoDto,
  permisos: PermisosObjetoRol,
): Promise<RolObjetoPlataformaDto> {
  const respuesta = await solicitarApi(`${rutaDe(rolId)}/${fila.rolObjetoId}`, {
    method: 'PUT',
    body: JSON.stringify({
      rolObjetoId: fila.rolObjetoId,
      rolId,
      objetoId: fila.objetoId,
      objetoNombre: fila.objetoNombre,
      permisoLectura: permisos.permisoLectura,
      permisoEscritura: permisos.permisoEscritura,
      permisoEliminacion: permisos.permisoEliminacion,
    }),
  });
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo guardar el objeto del rol.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<RolObjetoPlataformaDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo guardar el objeto del rol.');

  return cuerpo.datos;
}

export async function quitarObjetoDelRol(rolId: number, rolObjetoId: string): Promise<void> {
  const respuesta = await solicitarApi(`${rutaDe(rolId)}/${rolObjetoId}`, { method: 'DELETE' });
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo quitar el objeto del rol.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<boolean>;
  if (!cuerpo.exito)
    throw new Error(cuerpo.mensaje || 'No se pudo quitar el objeto del rol.');
}
