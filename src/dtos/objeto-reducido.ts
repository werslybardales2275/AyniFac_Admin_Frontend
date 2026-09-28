/** Combo de un catálogo cuyo id es entero. */
export interface ObjetoReducido {
  id: number;
  valor: string;
}

/** Combo de un catálogo cuyo id es Guid. */
export interface ObjetoGuidReducido {
  id: string;
  valor: string;
}
