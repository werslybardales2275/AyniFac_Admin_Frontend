/**
 * Metadatos de un campo para armar el control de DevExtreme.
 * La interface del DTO solo existe al compilar; este esquema sí llega al navegador.
 */
export type ControlCampo =
  | 'texto'
  | 'entero'
  | 'decimal'
  | 'booleano'
  | 'fecha'
  | 'enumeracion'
  /** Combo de catálogo. El JSON es { id, valor }. */
  | 'objetoReducido';

export interface CampoDto {
  etiqueta: string;
  control: ControlCampo;
  requerido: boolean;
  /** Equivale a [MaxLength] del backend. */
  longitudMaxima?: number;
  /** Equivale a [DecimalAcotado(precision, escala)], por ejemplo decimal(18, 2). */
  precision?: number;
  escala?: number;
  /** Cero permitido; negativos no. */
  soloPositivo?: boolean;
  soloLectura?: boolean;
  /** El sistema calcula el valor. Implica solo lectura. */
  autocalculado?: boolean;
  /** DateOnly: dxDateBox con type "date", sin hora. */
  soloFecha?: boolean;
  /** No se muestra en la grilla. La contraseña entra en el formulario y no vuelve en el listado. */
  oculto?: boolean;
  /**
   * Equivale a [ValorPorDefecto] del DTO.
   * Estas propiedades arman el título de la pestaña y el encabezado de la ficha.
   * Puede haber varias: se unen en el orden de ordenValorPorDefecto.
   */
  valorPorDefecto?: boolean;
  /** Posición al unir varias propiedades con valorPorDefecto. La primera es 0. */
  ordenValorPorDefecto?: number;
}

/** Obliga a declarar un campo por cada propiedad del DTO. */
export type EsquemaDto<T> = {
  readonly [K in keyof T]-?: CampoDto;
};
