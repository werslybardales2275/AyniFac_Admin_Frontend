import { leerMensajeError, solicitarApi } from './cliente-http';
import type { NodoMenu } from './menus';
import type { ModuloOperativoDetalleNodo } from '../dtos/modulo-operativo-detalle-nodo';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

function rutaDe(moduloOperativoId: number): string {
  return `/api/administracion/modulos-operativos/${moduloOperativoId}/detalles`;
}

interface NodoCrudo {
  menuId: number;
  nombre?: string;
  menuNombre?: string;
  menuPadreId?: number | null;
  asignado?: boolean;
  items?: NodoCrudo[] | null;
}

/** El texto visible es nombre. menuNombre cubre una respuesta que todavía trae el listado plano. */
function aNodo(nodo: NodoCrudo): ModuloOperativoDetalleNodo {
  return {
    menuId: nodo.menuId,
    nombre: nodo.nombre || nodo.menuNombre || '',
    menuPadreId: nodo.menuPadreId ?? null,
    asignado: nodo.asignado ?? true,
    items: nodo.items?.map(aNodo),
  };
}

/** Árbol de menús asignados al módulo. Las carpetas sin asignación agrupan a los hijos. */
export async function listarMenusDelModulo(moduloOperativoId: number): Promise<ModuloOperativoDetalleNodo[]> {
  const respuesta = await solicitarApi(rutaDe(moduloOperativoId));
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los menús del módulo.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<NodoCrudo[]>;
  if (!cuerpo.exito)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los menús del módulo.');

  return (cuerpo.datos ?? []).map(aNodo);
}

export async function agregarMenuAlModulo(moduloOperativoId: number, menuId: number): Promise<void> {
  const respuesta = await solicitarApi(rutaDe(moduloOperativoId), {
    method: 'POST',
    body: JSON.stringify({
      moduloOperativoDetalleId: 0,
      moduloOperativoId,
      menuId,
      menuNombre: '',
    }),
  });
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo asignar el menú.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<unknown>;
  if (!cuerpo.exito)
    throw new Error(cuerpo.mensaje || 'No se pudo asignar el menú.');
}

export async function quitarMenuDelModulo(moduloOperativoId: number, menuId: number): Promise<void> {
  const respuesta = await solicitarApi(`${rutaDe(moduloOperativoId)}/${menuId}`, { method: 'DELETE' });
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo quitar el menú del módulo.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<boolean>;
  if (!cuerpo.exito)
    throw new Error(cuerpo.mensaje || 'No se pudo quitar el menú del módulo.');
}

/** Árbol de menu.json para elegirlo al asignar menús al módulo. */
export async function obtenerArbolMenusOperativos(moduloOperativoId: number): Promise<NodoMenu[]> {
  const respuesta = await solicitarApi(`${rutaDe(moduloOperativoId)}/arbol`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo cargar el árbol de menús.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<NodoMenu[]>;
  if (!cuerpo.exito)
    throw new Error(cuerpo.mensaje || 'No se pudo cargar el árbol de menús.');

  return cuerpo.datos ?? [];
}
