import type { ReactNode } from 'react';
import {
    HomePage,
    TasksPage,
    ProfilePage,
    CategoriaPage,
    ProductoPage,
    MarcaPage,
    UsuarioPage,
    UsuarioPlataformaPage,
    InquilinoPage,
    ModuloOperativoPage,
    RolPlataformaPage,
    ArticuloPage,
    ServicioPage,
    ResumenVentaMensualPage,
    ResumenVentasPorVendedorPage,
    ResumenFacturacionPorCajeroPage
} from './pages';
import { withNavigationWatcher } from './contexts/navigation-hooks';

const routeData = [
    {
        path: '/tasks',
        titulo: 'Tareas',
        element: TasksPage
    },
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
        path: '/categoria',
        titulo: 'Categorias',
        element: CategoriaPage
    },
    {
        path: '/producto',
        titulo: 'Productos',
        element: ProductoPage
    },
    {
        path: '/marca',
        titulo: 'Marcas',
        element: MarcaPage
    },
    {
        path: '/usuario',
        titulo: 'Usuarios',
        element: UsuarioPage
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
        path: '/articulo',
        titulo: 'Articulos',
        element: ArticuloPage
    },
    {
        path: '/servicio',
        titulo: 'Servicios',
        element: ServicioPage
    },
    {
        path: '/resumen-venta-mensual',
        titulo: 'Resumen de ventas mensuales',
        element: ResumenVentaMensualPage
    },
    {
        path: '/resumen-ventas-por-vendedor',
        titulo: 'Resumen de ventas por vendedor',
        element: ResumenVentasPorVendedorPage
    },
    {
        path: '/resumen-facturacion-por-cajero',
        titulo: 'Resumen de facturacion por cajero',
        element: ResumenFacturacionPorCajeroPage
    }
];

export const routes = routeData.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
});

/** Vista de edición que el espacio de trabajo monta en su propia pestaña. */
export type VistaEdicion = 'marca' | 'categoria' | 'usuario' | 'usuario-plataforma' | 'inquilino' | 'sucursal' | 'rol-plataforma' | 'modulo-operativo';

export interface RutaResuelta {
    titulo: string;
    rutaMenu: string;
    element?: ReactNode;
    vista?: VistaEdicion;
}

const ediciones: { patron: RegExp; titulo: string; rutaMenu: string; vista: VistaEdicion }[] = [
    { patron: /^\/marca\/(\d+)$/, titulo: 'Marca', rutaMenu: '/marca', vista: 'marca' },
    { patron: /^\/categoria\/(\d+)$/, titulo: 'Categoría', rutaMenu: '/categoria', vista: 'categoria' },
    { patron: /^\/usuario\/([0-9a-fA-F-]{36})$/, titulo: 'Usuario', rutaMenu: '/usuario', vista: 'usuario' },
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
