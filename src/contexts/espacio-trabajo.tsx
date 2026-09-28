import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buscarRuta } from '../app-routes';
import { useNavigation } from './navigation-hooks';

export interface DocumentoTrabajo {
    path: string;
    titulo: string;
}

const RUTA_INICIO = '/home';

export type EspacioTrabajoContextType = {
    documentos: DocumentoTrabajo[];
    rutaActiva: string;
    activarDocumento: (path: string) => void;
    cerrarDocumento: (path: string) => void;
    renombrarDocumento: (path: string, titulo: string) => void;
};

const EspacioTrabajoContext = createContext<EspacioTrabajoContextType>({} as EspacioTrabajoContextType);

function normalizarRuta(path: string) {
    if (!path || path === '/')
        return RUTA_INICIO;
    return path;
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
    const rutaActiva = normalizarRuta(pathname);
    const tituloNavegacion = (state as { titulo?: string } | null)?.titulo;
    const [documentos, setDocumentos] = useState<DocumentoTrabajo[]>(() => [documentoDe(rutaActiva, tituloNavegacion)]);

    useEffect(() => {
        const ruta = buscarRuta(rutaActiva);
        if (!ruta) {
            navigate(RUTA_INICIO, { replace: true });
            return;
        }

        setDocumentos(prev => (
            prev.some(documento => documento.path === rutaActiva)
                ? prev
                : [...prev, documentoDe(rutaActiva, tituloNavegacion)]
        ));
        setNavigationData?.({ currentPath: ruta.rutaMenu });
    }, [navigate, rutaActiva, setNavigationData, tituloNavegacion]);

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
