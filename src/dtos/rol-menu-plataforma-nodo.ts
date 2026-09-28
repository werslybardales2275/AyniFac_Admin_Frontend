/**
 * Nodo del árbol de menús asignados a un rol.
 * `asignado` es falso cuando el nodo solo agrupa hijos que sí están en el rol.
 */
export interface RolMenuPlataformaNodo {
  menuId: number;
  nombre: string;
  menuPadreId: number | null;
  asignado: boolean;
  items?: RolMenuPlataformaNodo[] | null;
}
