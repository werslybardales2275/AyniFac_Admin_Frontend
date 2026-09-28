import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import notify from 'devextreme/ui/notify';
import { obtenerPermisosUsuario, type PermisoObjetoApi } from '../api/permisos';

export interface PermisoObjeto {
  lectura: boolean;
  escritura: boolean;
  eliminacion: boolean;
  ejecucion: boolean;
}

const denegado: PermisoObjeto = {
  lectura: false,
  escritura: false,
  eliminacion: false,
  ejecucion: false,
};

const total: PermisoObjeto = {
  lectura: true,
  escritura: true,
  eliminacion: true,
  ejecucion: true,
};

type PermisosUsuarioContextType = {
  esAdministrador: boolean;
  cargando: boolean;
  permisoDe: (objetoId: number) => PermisoObjeto;
};

const PermisosUsuarioContext = createContext<PermisosUsuarioContextType>({
  esAdministrador: false,
  cargando: true,
  permisoDe: () => denegado,
});

function aPermiso(fila: PermisoObjetoApi): PermisoObjeto {
  return {
    lectura: fila.permisoLectura,
    escritura: fila.permisoEscritura,
    eliminacion: fila.permisoEliminacion,
    ejecucion: fila.permisoEjecucion,
  };
}

/**
 * Carga los permisos al entrar a la sesión.
 * El administrador tiene permiso total. El resto usa las filas de RolObjetoPlataforma.
 * Mientras carga, o si no hay fila, el permiso queda denegado.
 */
function PermisosUsuarioProvider(props: React.PropsWithChildren) {
  const [esAdministrador, setEsAdministrador] = useState(false);
  const [porObjeto, setPorObjeto] = useState<ReadonlyMap<number, PermisoObjeto>>(new Map());
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;

    (async function cargar() {
      try {
        const datos = await obtenerPermisosUsuario();
        if (!vigente)
          return;
        setEsAdministrador(datos.esAdministrador);
        setPorObjeto(new Map(datos.permisos.map((fila) => [fila.objetoId, aPermiso(fila)])));
      }
      catch (error) {
        if (vigente) {
          setEsAdministrador(false);
          setPorObjeto(new Map());
          const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los permisos.';
          notify(mensaje, 'error', 3000);
        }
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    })();

    return () => {
      vigente = false;
    };
  }, []);

  const valor = useMemo<PermisosUsuarioContextType>(() => ({
    esAdministrador,
    cargando,
    permisoDe(objetoId: number) {
      if (cargando)
        return denegado;
      if (esAdministrador)
        return total;
      return porObjeto.get(objetoId) ?? denegado;
    },
  }), [cargando, esAdministrador, porObjeto]);

  return (
    <PermisosUsuarioContext.Provider value={valor} {...props} />
  );
}

function usePermisoObjeto(objetoId: number): PermisoObjeto {
  return useContext(PermisosUsuarioContext).permisoDe(objetoId);
}

export {
  PermisosUsuarioProvider,
  usePermisoObjeto,
};
