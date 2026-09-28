import React, { createContext, useContext, useEffect, useState } from 'react';
import notify from 'devextreme/ui/notify';
import { obtenerMenusUsuario, type NodoMenu } from '../api/menus';

type MenusUsuarioContextType = {
  menus: NodoMenu[];
  cargando: boolean;
};

const MenusUsuarioContext = createContext<MenusUsuarioContextType>({
  menus: [],
  cargando: true,
});

function MenusUsuarioProvider(props: React.PropsWithChildren) {
  const [menus, setMenus] = useState<NodoMenu[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;

    (async function cargar() {
      try {
        const arbol = await obtenerMenusUsuario();
        if (vigente)
          setMenus(arbol);
      }
      catch (error) {
        if (vigente) {
          setMenus([]);
          const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los menús.';
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

  return (
    <MenusUsuarioContext.Provider value={{ menus, cargando }} {...props} />
  );
}

function useMenusUsuario() {
  return useContext(MenusUsuarioContext);
}

export {
  MenusUsuarioProvider,
  useMenusUsuario,
};
