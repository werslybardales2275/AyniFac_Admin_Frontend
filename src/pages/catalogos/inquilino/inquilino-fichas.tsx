import { memo, useCallback } from 'react';
import TabPanel, { Item } from 'devextreme-react/tab-panel';
import { ModulosInquilino } from '../inquilino-modulo-operativo/modulos-inquilino';
import { SucursalesInquilino } from '../sucursal/sucursales-inquilino';

interface InquilinoFichasProps {
  inquilinoId: string;
}

/**
 * Debajo de la ficha del inquilino: sucursales y módulos operativos.
 * El render de cada lista queda estable mientras no cambie el inquilino,
 * para que editar la ficha no recargue las grillas.
 */
export const InquilinoFichas = memo(function InquilinoFichas({ inquilinoId }: InquilinoFichasProps) {
  const renderSucursales = useCallback(() => (
    <SucursalesInquilino inquilinoId={inquilinoId} />
  ), [inquilinoId]);

  const renderModulos = useCallback(() => (
    <ModulosInquilino inquilinoId={inquilinoId} />
  ), [inquilinoId]);

  return (
    <TabPanel
      className="inquilino-fichas"
      deferRendering={true}
      animationEnabled={true}
      swipeEnabled={false}
      focusStateEnabled={true}
      loop={false}
    >
      <Item title="Sucursales" render={renderSucursales} />
      <Item title="Módulos operativos" render={renderModulos} />
    </TabPanel>
  );
});
