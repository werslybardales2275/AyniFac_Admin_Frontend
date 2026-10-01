import type { ReactNode } from 'react';
import {
    ProfilePage,
    UsuarioPlataformaPage,
    InquilinoPage,
    ModuloOperativoPage,
    RolPlataformaPage,
    SunatUnidadPage,
    SunatSegmentoPage,
    SunatFamiliaPage,
    SunatClasePage,
    SunatProductoPage,
    SunatMonedaPage,
    SunatMotivoNotaCreditoPage,
    SunatMotivoNotaDebitoPage,
    SunatMedioPagoDetraccionPage,
    SunatMotivoDetraccionPage
} from './pages';
import { withNavigationWatcher } from './contexts/navigation-hooks';

const routeData = [
    {
        path: '/profile',
        titulo: 'Perfil',
        element: ProfilePage
    },
    {
        path: '/usuario-plataforma',
        titulo: 'Usuarios de plataforma',
        element: UsuarioPlataformaPage
    },
    {
        path: '/inquilino',
        titulo: 'Inquilinos',
        element: InquilinoPage
    },
    {
        path: '/modulo-operativo',
        titulo: 'Módulos operativos',
        element: ModuloOperativoPage
    },
    {
        path: '/rol-plataforma',
        titulo: 'Roles de plataforma',
        element: RolPlataformaPage
    },
    {
        path: '/sunat-unidad',
        titulo: 'Unidades SUNAT',
        element: SunatUnidadPage
    },
    {
        path: '/sunat-segmento',
        titulo: 'Segmentos SUNAT',
        element: SunatSegmentoPage
    },
    {
        path: '/sunat-familia',
        titulo: 'Familias SUNAT',
        element: SunatFamiliaPage
    },
    {
        path: '/sunat-clase',
        titulo: 'Clases SUNAT',
        element: SunatClasePage
    },
    {
        path: '/sunat-producto',
        titulo: 'Productos SUNAT',
        element: SunatProductoPage
    },
    {
        path: '/sunat-moneda',
        titulo: 'Monedas SUNAT',
        element: SunatMonedaPage
    },
    {
        path: '/sunat-motivo-nota-credito',
        titulo: 'Motivos de nota de crédito',
        element: SunatMotivoNotaCreditoPage
    },
    {
        path: '/sunat-motivo-nota-debito',
        titulo: 'Motivos de nota de débito',
        element: SunatMotivoNotaDebitoPage
    },
    {
        path: '/sunat-medio-pago-detraccion',
        titulo: 'Medios de pago de detracción',
        element: SunatMedioPagoDetraccionPage
    },
    {
        path: '/sunat-motivo-detraccion',
        titulo: 'Motivos de detracción',
        element: SunatMotivoDetraccionPage
    }
];

export const routes = routeData.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
});

/** Vista de edición que el espacio de trabajo monta en su propia pestaña. */
export type VistaEdicion = 'usuario-plataforma' | 'inquilino' | 'sucursal' | 'inquilino-modulo-operativo' | 'rol-plataforma' | 'modulo-operativo' | 'sunat-unidad' | 'sunat-segmento' | 'sunat-familia' | 'sunat-clase' | 'sunat-producto' | 'sunat-moneda' | 'sunat-motivo-nota-credito' | 'sunat-motivo-nota-debito' | 'sunat-medio-pago-detraccion' | 'sunat-motivo-detraccion';

export interface RutaResuelta {
    titulo: string;
    rutaMenu: string;
    element?: ReactNode;
    vista?: VistaEdicion;
}

const ediciones: { patron: RegExp; titulo: string; rutaMenu: string; vista: VistaEdicion }[] = [
    { patron: /^\/usuario-plataforma\/([0-9a-fA-F-]{36})$/, titulo: 'Usuario de plataforma', rutaMenu: '/usuario-plataforma', vista: 'usuario-plataforma' },
    { patron: /^\/inquilino\/([0-9a-fA-F-]{36})$/, titulo: 'Inquilino', rutaMenu: '/inquilino', vista: 'inquilino' },
    { patron: /^\/modulo-operativo\/(\d+)$/, titulo: 'Módulo operativo', rutaMenu: '/modulo-operativo', vista: 'modulo-operativo' },
    { patron: /^\/inquilino\/([0-9a-fA-F-]{36})\/sucursal\/(\d+)$/, titulo: 'Sucursal', rutaMenu: '/inquilino', vista: 'sucursal' },
    { patron: /^\/inquilino\/([0-9a-fA-F-]{36})\/modulo-operativo\/(\d+)$/, titulo: 'Módulo operativo', rutaMenu: '/inquilino', vista: 'inquilino-modulo-operativo' },
    { patron: /^\/rol-plataforma\/(\d+)$/, titulo: 'Rol de plataforma', rutaMenu: '/rol-plataforma', vista: 'rol-plataforma' },
    { patron: /^\/sunat-unidad\/([^/]+)$/, titulo: 'Unidad SUNAT', rutaMenu: '/sunat-unidad', vista: 'sunat-unidad' },
    { patron: /^\/sunat-segmento\/([^/]+)$/, titulo: 'Segmento SUNAT', rutaMenu: '/sunat-segmento', vista: 'sunat-segmento' },
    { patron: /^\/sunat-familia\/([^/]+)$/, titulo: 'Familia SUNAT', rutaMenu: '/sunat-familia', vista: 'sunat-familia' },
    { patron: /^\/sunat-clase\/([^/]+)$/, titulo: 'Clase SUNAT', rutaMenu: '/sunat-clase', vista: 'sunat-clase' },
    { patron: /^\/sunat-producto\/([^/]+)$/, titulo: 'Producto SUNAT', rutaMenu: '/sunat-producto', vista: 'sunat-producto' },
    { patron: /^\/sunat-moneda\/([^/]+)$/, titulo: 'Moneda SUNAT', rutaMenu: '/sunat-moneda', vista: 'sunat-moneda' },
    { patron: /^\/sunat-motivo-nota-credito\/([^/]+)$/, titulo: 'Motivo de nota de crédito', rutaMenu: '/sunat-motivo-nota-credito', vista: 'sunat-motivo-nota-credito' },
    { patron: /^\/sunat-motivo-nota-debito\/([^/]+)$/, titulo: 'Motivo de nota de débito', rutaMenu: '/sunat-motivo-nota-debito', vista: 'sunat-motivo-nota-debito' },
    { patron: /^\/sunat-medio-pago-detraccion\/([^/]+)$/, titulo: 'Medio de pago de detracción', rutaMenu: '/sunat-medio-pago-detraccion', vista: 'sunat-medio-pago-detraccion' },
    { patron: /^\/sunat-motivo-detraccion\/([^/]+)$/, titulo: 'Motivo de detracción', rutaMenu: '/sunat-motivo-detraccion', vista: 'sunat-motivo-detraccion' },
];

export function buscarRuta(path: string): RutaResuelta | undefined {
    const fija = routes.find(route => route.path === path);
    if (fija) {
        return {
            titulo: fija.titulo,
            rutaMenu: fija.path,
            element: fija.element
        };
    }

    const edicion = ediciones.find(item => item.patron.test(path));
    if (edicion) {
        return {
            titulo: edicion.titulo,
            rutaMenu: edicion.rutaMenu,
            vista: edicion.vista
        };
    }

    return undefined;
}
