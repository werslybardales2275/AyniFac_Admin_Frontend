import React, { useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { TreeView, type TreeViewRef } from 'devextreme-react/tree-view';
import * as events from 'devextreme-react/common/core/events';
import { useNavigation } from '../../contexts/navigation-hooks';
import { useMenusUsuario } from '../../contexts/menus-usuario';
import { aItemsMenu, clavesDeRuta } from '../../navegacion/menu-usuario';
import { useScreenSize } from '../../utils/media-query';
import './SideNavigationMenu.scss';
import type { SideNavigationMenuProps } from '../../types';

import { ThemeContext } from '../../theme';
import appInfo from '../../app-info';

export default function SideNavigationMenu(props: React.PropsWithChildren<SideNavigationMenuProps>) {
  const {
    children,
    selectedItemChanged,
    openMenu,
    compactMode,
    onMenuReady
  } = props;

  const theme = useContext(ThemeContext);
  const { isLarge } = useScreenSize();
  const { menus, cargando } = useMenusUsuario();
  const items = useMemo(
    () => aItemsMenu(menus, isLarge),
    [menus, isLarge]
  );

  const { navigationData: { currentPath } } = useNavigation();

  const treeViewRef = useRef<TreeViewRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const getWrapperRef = useCallback((element: HTMLDivElement) => {
    const prevElement = wrapperRef.current;
    if (prevElement) {
      events.off(prevElement, 'dxclick');
    }

    wrapperRef.current = element;
    events.on(element, 'dxclick', (e: React.PointerEvent) => {
      openMenu(e);
    });
  }, [openMenu]);

  useEffect(() => {
    const treeView = treeViewRef.current && treeViewRef.current.instance();
    if (!treeView) {
      return;
    }

    if (currentPath) {
      const claves = clavesDeRuta(items, currentPath);
      claves?.forEach(clave => {
        treeView.expandItem(clave);
      });
      const hoja = claves?.at(-1);
      if (hoja !== undefined)
        treeView.selectItem(hoja);
    }

    if (compactMode) {
      treeView.collapseAll();
    }
  }, [currentPath, compactMode, items]);

  return (
    <div
      className={`dx-swatch-additional${theme?.isDark() ? '-dark' : ''} side-navigation-menu${compactMode ? ' compact' : ''}`}
      ref={getWrapperRef}
    >
      {children}
      <div className={'menu-container'} aria-busy={cargando}>
        {cargando && (
          <p className={'menu-estado'}>Cargando menús…</p>
        )}
        {!cargando && items.length === 0 && (
          <p className={'menu-estado'}>No hay menús asignados.</p>
        )}
        <TreeView
          ref={treeViewRef}
          items={items}
          keyExpr={'id'}
          selectionMode={'single'}
          focusStateEnabled={false}
          expandEvent={'click'}
          onItemClick={selectedItemChanged}
          onContentReady={onMenuReady}
          width={'100%'}
        />
      </div>
      <footer className={'menu-copyright'}>
        Copyright © 2011-{new Date().getFullYear()} {appInfo.title} Inc.
        <br />
        All trademarks or registered trademarks are property of their
        respective owners.
      </footer>
    </div>
  );
}
