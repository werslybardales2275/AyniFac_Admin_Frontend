/**
 * Nodo del árbol de menús asignados a un módulo operativo.
 * `asignado` es falso cuando el nodo solo agrupa hijos que sí están en el módulo.
 */
export interface ModuloOperativoDetalleNodo {
  menuId: number;
  nombre: string;
  menuPadreId: number | null;
  asignado: boolean;
  items?: ModuloOperativoDetalleNodo[] | null;
}
