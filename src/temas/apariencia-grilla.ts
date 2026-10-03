import DataGrid from 'devextreme/ui/data_grid';
import TreeList from 'devextreme/ui/tree_list';

/**
 * Apariencia del demo Compact de DataGrid (tema claro):
 * borde exterior, líneas de fila, color alterno y sin líneas de columna.
 * La densidad la aporta el tema Generic Compact (claro u oscuro).
 */
export const aparienciaGrillaCompacta = {
  showColumnLines: false,
  showRowLines: true,
  showBorders: true,
  rowAlternationEnabled: true,
  hoverStateEnabled: true,
} as const;

DataGrid.defaultOptions({ options: aparienciaGrillaCompacta });
TreeList.defaultOptions({ options: aparienciaGrillaCompacta });
