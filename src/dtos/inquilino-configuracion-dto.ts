import type { EsquemaDto } from './campo';

export interface InquilinoConfiguracionDto {
  inquilinoConfiguracionId: number;
  inquilinoId: string;
  listarArticulosConAtributosSeparados: boolean;
  enVentaListarArticulosConAtributosSeparados: boolean;
  mostrarOpcionImpuestoAdicionalEnNuevaVentaDetalle: boolean;
  aplicaPorcentajesDescuentoEnNuevaVentaDetalle: boolean;
  usaPrecioVentaMinimo: boolean;
  usaPrecioVentaPorMayor: boolean;
  requiereIndicarVendedorEnNuevaVenta: boolean;
  mostrarBotonRentabilidadMinima: boolean;
  /** Código SUNAT de la moneda con la que se registran las órdenes de venta. */
  monedaPredeterminada: string;
}

export const inquilinoConfiguracionDtoEsquema = {
  inquilinoConfiguracionId: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
  },
  inquilinoId: {
    etiqueta: 'Inquilino',
    control: 'texto',
    requerido: true,
    soloLectura: true,
    oculto: true,
  },
  listarArticulosConAtributosSeparados: {
    etiqueta: 'Listar artículos con atributos separados',
    control: 'booleano',
    requerido: true,
  },
  enVentaListarArticulosConAtributosSeparados: {
    etiqueta: 'En venta, listar artículos con atributos separados',
    control: 'booleano',
    requerido: true,
  },
  mostrarOpcionImpuestoAdicionalEnNuevaVentaDetalle: {
    etiqueta: 'Mostrar opción de impuesto adicional en el detalle de nueva venta',
    control: 'booleano',
    requerido: true,
  },
  aplicaPorcentajesDescuentoEnNuevaVentaDetalle: {
    etiqueta: 'Aplica porcentajes de descuento en el detalle de nueva venta',
    control: 'booleano',
    requerido: true,
  },
  usaPrecioVentaMinimo: {
    etiqueta: 'Usa precio de venta mínimo',
    control: 'booleano',
    requerido: true,
  },
  usaPrecioVentaPorMayor: {
    etiqueta: 'Usa precio de venta por mayor',
    control: 'booleano',
    requerido: true,
  },
  requiereIndicarVendedorEnNuevaVenta: {
    etiqueta: 'Requiere indicar vendedor en nueva venta',
    control: 'booleano',
    requerido: true,
  },
  mostrarBotonRentabilidadMinima: {
    etiqueta: 'Mostrar botón de rentabilidad mínima',
    control: 'booleano',
    requerido: true,
  },
  monedaPredeterminada: {
    etiqueta: 'Moneda predeterminada',
    control: 'texto',
    requerido: true,
    longitudMaxima: 3,
  },
} as const satisfies EsquemaDto<InquilinoConfiguracionDto>;

export function configuracionVacia(inquilinoId: string): InquilinoConfiguracionDto {
  return {
    inquilinoConfiguracionId: 0,
    inquilinoId,
    listarArticulosConAtributosSeparados: false,
    enVentaListarArticulosConAtributosSeparados: false,
    mostrarOpcionImpuestoAdicionalEnNuevaVentaDetalle: false,
    aplicaPorcentajesDescuentoEnNuevaVentaDetalle: false,
    usaPrecioVentaMinimo: false,
    usaPrecioVentaPorMayor: false,
    requiereIndicarVendedorEnNuevaVenta: false,
    mostrarBotonRentabilidadMinima: false,
    monedaPredeterminada: 'PEN',
  };
}
