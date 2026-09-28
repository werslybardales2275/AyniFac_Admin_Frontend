import { leerMensajeError, solicitarApi } from './cliente-http';
import type { RolMenuPlataformaDto } from '../dtos/rol-menu-plataforma-dto';
import type { RolMenuPlataformaNodo } from '../dtos/rol-menu-plataforma-nodo';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

function rutaDe(rolId: number): string {
  return `/api/administracion/roles-plataforma/${rolId}/menus`;
}

/** Árbol de menús asignados al rol. Las carpetas sin asignación agrupan a los hijos. */
export async function listarMenusDelRol(rolId: number): Promise<RolMenuPlataformaNodo[]> {
  const respuesta = await solicitarApi(rutaDe(rolId));
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los menús del rol.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<RolMenuPlataformaNodo[]>;
  if (!cuerpo.exito)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los menús del rol.');

  return cuerpo.datos ?? [];
}

export async function agregarMenuAlRol(rolId: number, menuId: number): Promise<RolMenuPlataformaDto> {
  const respuesta = await solicitarApi(rutaDe(rolId), {
    method: 'POST',
    body: JSON.stringify({ rolId, menuId, menuNombre: '' }),
  });
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo asignar el menú.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<RolMenuPlataformaDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo asignar el menú.');

  return cuerpo.datos;
}

export async function quitarMenuDelRol(rolId: number, menuId: number): Promise<void> {
  const respuesta = await solicitarApi(`${rutaDe(rolId)}/${menuId}`, { method: 'DELETE' });
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo quitar el menú del rol.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<boolean>;
  if (!cuerpo.exito)
    throw new Error(cuerpo.mensaje || 'No se pudo quitar el menú del rol.');
}
