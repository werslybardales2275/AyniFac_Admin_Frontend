import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buscarRuta } from '../app-routes';
import { useNavigation } from './navigation-hooks';

export interface DocumentoTrabajo {
    path: string;
    titulo: string;
}

/** Vista que queda abierta al entrar. Una ruta ajena al espacio (por ejemplo /login) no genera pestaña. */
const RUTA_INICIO = '/inquilino';

export type EspacioTrabajoContextType = {
    documentos: DocumentoTrabajo[];
    rutaActiva: string;
    activarDocumento: (path: string) => void;
    cerrarDocumento: (path: string) => void;
    renombrarDocumento: (path: string, titulo: string) => void;
};

const EspacioTrabajoContext = createContext<EspacioTrabajoContextType>({} as EspacioTrabajoContextType);

function rutaDelEspacio(path: string) {
    if (path && path !== '/' && buscarRuta(path))
        return path;
    return RUTA_INICIO;
}

function documentoDe(path: string, titulo?: string): DocumentoTrabajo {
    const ruta = buscarRuta(path);
    return {
        path,
        titulo: titulo || ruta?.titulo || path
    };
}

function EspacioTrabajoProvider(props: React.PropsWithChildren) {
    const navigate = useNavigate();
    const { pathname, state } = useLocation();
    const { setNavigationData } = useNavigation();
    const rutaActiva = rutaDelEspacio(pathname);
    const tituloNavegacion = pathname === rutaActiva
        ? (state as { titulo?: string } | null)?.titulo
        : undefined;
    const [documentos, setDocumentos] = useState<DocumentoTrabajo[]>(() => [documentoDe(rutaActiva, tituloNavegacion)]);

    useEffect(() => {
        if (pathname !== rutaActiva) {
            navigate(rutaActiva, { replace: true });
            return;
        }

        const ruta = buscarRuta(rutaActiva);
        if (!ruta)
            return;

        setDocumentos(prev => (
            prev.some(documento => documento.path === rutaActiva)
                ? prev
                : [...prev, documentoDe(rutaActiva, tituloNavegacion)]
        ));
        setNavigationData?.({ currentPath: ruta.rutaMenu });
    }, [navigate, pathname, rutaActiva, setNavigationData, tituloNavegacion]);

    const activarDocumento = useCallback((path: string) => {
        if (path !== rutaActiva)
            navigate(path);
    }, [navigate, rutaActiva]);

    const cerrarDocumento = useCallback((path: string) => {
        const indice = documentos.findIndex(documento => documento.path === path);
        const restantes = documentos.filter(documento => documento.path !== path);
        if (restantes.length === 0 || indice < 0)
            return;

        setDocumentos(restantes);
        if (path === rutaActiva) {
            const vecino = restantes[Math.min(indice, restantes.length - 1)];
            navigate(vecino.path);
        }
    }, [documentos, navigate, rutaActiva]);

    const renombrarDocumento = useCallback((path: string, titulo: string) => {
        setDocumentos(prev => prev.map(documento => (
            documento.path === path ? { ...documento, titulo } : documento
        )));
    }, []);

    const value = useMemo(() => ({
        documentos,
        rutaActiva,
        activarDocumento,
        cerrarDocumento,
        renombrarDocumento
    }), [activarDocumento, cerrarDocumento, documentos, renombrarDocumento, rutaActiva]);

    return (
        <EspacioTrabajoContext.Provider value={value} {...props} />
    );
}

export {
    EspacioTrabajoContext,
    EspacioTrabajoProvider
};
