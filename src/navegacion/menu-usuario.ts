import type { NodoMenu } from '../api/menus';

export interface ItemMenuNav {
  id: number;
  text: string;
  icon?: string;
  path?: string;
  expanded?: boolean;
  items?: ItemMenuNav[];
}

/**
 * URLs de menu_admin.json que ya tienen pantalla.
 * El resto se muestra en el menú y todavía no navega.
 */
const rutasPantalla: Record<string, string> = {
  '/Inquilino_ListView': '/inquilino',
  '/ModuloOperativo_ListView': '/modulo-operativo',
  '/RolPlataforma_ListView': '/rol-plataforma',
  '/UsuarioPlataforma_ListView': '/usuario-plataforma',
};

export function aItemsMenu(nodos: NodoMenu[], expandido: boolean): ItemMenuNav[] {
  return nodos.map(nodo => aItem(nodo, expandido));
}

function aItem(nodo: NodoMenu, expandido: boolean): ItemMenuNav {
  const hijos = nodo.items?.length ? aItemsMenu(nodo.items, expandido) : undefined;
  const path = rutaDe(nodo.url);

  return {
    id: nodo.menuId,
    text: nodo.nombre,
    icon: hijos ? 'folder' : undefined,
    path,
    expanded: hijos ? expandido : undefined,
    items: hijos,
  };
}

function rutaDe(url: string): string | undefined {
  const limpia = url.trim();
  if (!limpia || limpia === '#')
    return undefined;

  return rutasPantalla[limpia];
}

export function clavesDeRuta(nodos: ItemMenuNav[], ruta: string, ancestros: number[] = []): number[] | undefined {
  for (const nodo of nodos) {
    if (nodo.path === ruta)
      return [...ancestros, nodo.id];

    if (nodo.items) {
      const hallado = clavesDeRuta(nodo.items, ruta, [...ancestros, nodo.id]);
      if (hallado)
        return hallado;
    }
  }

  return undefined;
}
