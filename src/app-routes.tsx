import type { ReactNode } from 'react';
import {
    HomePage,
    ProfilePage,
    UsuarioPlataformaPage,
    InquilinoPage,
    ModuloOperativoPage,
    RolPlataformaPage
} from './pages';
import { withNavigationWatcher } from './contexts/navigation-hooks';

const routeData = [
    {
        path: '/profile',
        titulo: 'Perfil',
        element: ProfilePage
    },
    {
        path: '/home',
        titulo: 'Inicio',
        element: HomePage
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
    }
];

export const routes = routeData.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
});

/** Vista de edición que el espacio de trabajo monta en su propia pestaña. */
export type VistaEdicion = 'usuario-plataforma' | 'inquilino' | 'sucursal' | 'rol-plataforma' | 'modulo-operativo';

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
    { patron: /^\/rol-plataforma\/(\d+)$/, titulo: 'Rol de plataforma', rutaMenu: '/rol-plataforma', vista: 'rol-plataforma' },
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
