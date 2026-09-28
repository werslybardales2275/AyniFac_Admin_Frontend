import { leerMensajeError, solicitarApi } from './cliente-http';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

export interface NodoMenu {
  menuId: number;
  nombre: string;
  icono: string;
  url: string;
  items?: NodoMenu[] | null;
}

/** Árbol de menu_admin.json recortado al usuario de plataforma autenticado. */
export async function obtenerMenusUsuario(): Promise<NodoMenu[]> {
  const respuesta = await solicitarApi('/api/administracion/menus/usuario');
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los menús.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<NodoMenu[]>;
  if (!cuerpo.exito)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los menús.');

  return cuerpo.datos ?? [];
}

/** Árbol completo de menu_admin.json para elegirlo al asignar menús a un rol. */
export async function obtenerArbolMenus(): Promise<NodoMenu[]> {
  const respuesta = await solicitarApi('/api/administracion/menus/arbol');
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo cargar el árbol de menús.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<NodoMenu[]>;
  if (!cuerpo.exito)
    throw new Error(cuerpo.mensaje || 'No se pudo cargar el árbol de menús.');

  return cuerpo.datos ?? [];
}
