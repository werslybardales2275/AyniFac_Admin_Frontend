export interface ResultadoOperacion<T> {
  exito: boolean;
  mensaje: string;
  datos: T | null;
}
