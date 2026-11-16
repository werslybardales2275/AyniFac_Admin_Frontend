import { memo, useCallback } from 'react';
import TabPanel, { Item } from 'devextreme-react/tab-panel';
import { CorrelativosInquilino } from '../correlativo/correlativos-inquilino';
import { ModulosInquilino } from '../inquilino-modulo-operativo/modulos-inquilino';
import { TributosInquilino } from '../inquilino-tributo-adicional/tributos-inquilino';
import { SucursalesInquilino } from '../sucursal/sucursales-inquilino';
import { UsuariosInquilino } from '../usuario/usuarios-inquilino';
import { ConfiguracionInquilino } from './inquilino-configuracion';

interface InquilinoFichasProps {
  inquilinoId: string;
}

/**
 * Debajo de la ficha del inquilino: sucursales, módulos operativos, usuarios
 * y la configuración de facturación.
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

  const renderTributos = useCallback(() => (
    <TributosInquilino inquilinoId={inquilinoId} />
  ), [inquilinoId]);

  const renderUsuarios = useCallback(() => (
    <UsuariosInquilino inquilinoId={inquilinoId} />
  ), [inquilinoId]);

  const renderConfiguracion = useCallback(() => (
    <ConfiguracionInquilino inquilinoId={inquilinoId} />
  ), [inquilinoId]);

  const renderCorrelativos = useCallback(() => (
    <CorrelativosInquilino inquilinoId={inquilinoId} />
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
      <Item title="Tributos adicionales" render={renderTributos} />
      <Item title="Usuarios" render={renderUsuarios} />
      <Item title="Configuración" render={renderConfiguracion} />
      <Item title="Correlativos" render={renderCorrelativos} />
    </TabPanel>
  );
});
