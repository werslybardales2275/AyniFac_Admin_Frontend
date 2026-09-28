import { memo, useCallback } from 'react';
import TabPanel, { Item } from 'devextreme-react/tab-panel';
import { RolMenusPlataforma } from './rol-menus-plataforma';
import { RolObjetosPlataforma } from './rol-objetos-plataforma';

interface RolPlataformaFichasProps {
  rolId: number;
  puedeAsignar: boolean;
  puedeQuitar: boolean;
}

/**
 * Debajo del nombre del rol: menús en árbol y objetos en grilla.
 * El render de cada ficha queda estable mientras no cambien el rol ni los permisos,
 * para que escribir el nombre no recargue las listas.
 */
export const RolPlataformaFichas = memo(function RolPlataformaFichas({
  rolId,
  puedeAsignar,
  puedeQuitar,
}: RolPlataformaFichasProps) {
  const renderMenus = useCallback(() => (
    <RolMenusPlataforma
      rolId={rolId}
      puedeAsignar={puedeAsignar}
      puedeQuitar={puedeQuitar}
    />
  ), [rolId, puedeAsignar, puedeQuitar]);

  const renderObjetos = useCallback(() => (
    <RolObjetosPlataforma
      rolId={rolId}
      puedeAsignar={puedeAsignar}
      puedeQuitar={puedeQuitar}
    />
  ), [rolId, puedeAsignar, puedeQuitar]);

  return (
    <TabPanel
      className="rol-plataforma-fichas"
      deferRendering={true}
      animationEnabled={true}
      swipeEnabled={false}
      focusStateEnabled={true}
      loop={false}
    >
      <Item title="Menús" render={renderMenus} />
      <Item title="Objetos" render={renderObjetos} />
    </TabPanel>
  );
});
