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
  '/SunatUnidad_ListView': '/sunat-unidad',
  '/SunatSegmento_ListView': '/sunat-segmento',
  '/SunatFamilia_ListView': '/sunat-familia',
  '/SunatClase_ListView': '/sunat-clase',
  '/SunatProducto_ListView': '/sunat-producto',
  '/SunatMoneda_ListView': '/sunat-moneda',
  '/SunatMotivoNotaCredito_ListView': '/sunat-motivo-nota-credito',
  '/SunatMotivoNotaDebito_ListView': '/sunat-motivo-nota-debito',
  '/SunatMedioPagoDetraccion_ListView': '/sunat-medio-pago-detraccion',
  '/SunatMotivoDetraccion_ListView': '/sunat-motivo-detraccion',
  '/TipoInformacion_ListView': '/tipo-informacion',
};

/** Iconos del menú (nombres del backend) traducidos a los SVG de public/icons. */
const ICONOS_MENU: Record<string, string> = {
  'nav-plataforma': '/icons/configuracion.svg',
  inquilino: '/icons/direccion.svg',
  'modulo-operativo': '/icons/equipo.svg',
  'nav-seguridad': '/icons/seguridad.svg',
  rol: '/icons/equipo.svg',
  'usuario-plataforma': '/icons/persona.svg',
  'nav-sunat': '/icons/nav-valores-sunat.svg',
  'sunat-unidad': '/icons/unidad-medida.svg',
  'sunat-segmento': '/icons/categoria.svg',
  'sunat-familia': '/icons/dependencia.svg',
  'sunat-clase': '/icons/composicion.svg',
  'sunat-producto': '/icons/producto.svg',
  'sunat-moneda': '/icons/moneda.svg',
  'sunat-motivo-nota-credito': '/icons/motivo-nota-sunat.svg',
  'sunat-motivo-nota-debito': '/icons/motivo-nota-sunat.svg',
  'sunat-medio-pago-detraccion': '/icons/medio-pago.svg',
  'sunat-motivo-detraccion': '/icons/motivo-detraccion.svg',
  'nav-tablas': '/icons/nav-tablas.svg',
  'tipo-informacion': '/icons/tablas.svg',
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
    icon: ICONOS_MENU[nodo.icono] ?? (hijos ? 'folder' : 'doc'),
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
