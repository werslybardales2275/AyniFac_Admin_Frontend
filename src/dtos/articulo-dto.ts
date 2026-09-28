import type { EsquemaDto } from './campo';

export interface ArticuloDto {
  articuloId: number;
  codigoSunatProducto: string;
  codigoBarra: string;
  productoId: number;
  productoNombre: string;
  marcaId: number;
  marcaNombre: string;
  descripcion: string;
  nombre: string;
  nombreComun: string;
  unidad: string;
  stockMinimo: number;
  ultimoCosto: number;
  netoUnidadBasica: number;
  vigente: boolean;
  urlFoto: string;
  aplicarIcbp: boolean;
  sePuedeFraccionar: boolean;
  tieneComponentes: boolean;
}

export const articuloDtoEsquema = {
  articuloId: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
  },
  codigoSunatProducto: {
    etiqueta: 'Código SUNAT de producto',
    control: 'texto',
    requerido: true,
    longitudMaxima: 20,
  },
  codigoBarra: {
    etiqueta: 'Código de barra',
    control: 'texto',
    requerido: true,
    longitudMaxima: 30,
  },
  productoId: {
    etiqueta: 'Producto',
    control: 'entero',
    requerido: true,
  },
  productoNombre: {
    etiqueta: 'Nombre de producto',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
  marcaId: {
    etiqueta: 'Marca',
    control: 'entero',
    requerido: true,
  },
  marcaNombre: {
    etiqueta: 'Nombre de marca',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
  descripcion: {
    etiqueta: 'Descripción',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
  },
  nombre: {
    etiqueta: 'Nombre',
    control: 'texto',
    requerido: true,
    longitudMaxima: 150,
  },
  nombreComun: {
    etiqueta: 'Nombre común',
    control: 'texto',
    requerido: true,
    longitudMaxima: 150,
  },
  unidad: {
    etiqueta: 'Unidad',
    control: 'texto',
    requerido: true,
    longitudMaxima: 50,
  },
  stockMinimo: {
    etiqueta: 'Stock mínimo',
    control: 'decimal',
    requerido: true,
    precision: 18,
    escala: 2,
    soloPositivo: true,
  },
  ultimoCosto: {
    etiqueta: 'Último costo',
    control: 'decimal',
    requerido: true,
    precision: 18,
    escala: 2,
    soloPositivo: true,
  },
  netoUnidadBasica: {
    etiqueta: 'Neto de unidad básica',
    control: 'decimal',
    requerido: true,
    precision: 18,
    escala: 2,
    soloPositivo: true,
  },
  vigente: {
    etiqueta: 'Vigente',
    control: 'booleano',
    requerido: true,
  },
  urlFoto: {
    etiqueta: 'URL de foto',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
  },
  aplicarIcbp: {
    etiqueta: 'Aplicar ICBP',
    control: 'booleano',
    requerido: true,
  },
  sePuedeFraccionar: {
    etiqueta: 'Se puede fraccionar',
    control: 'booleano',
    requerido: true,
  },
  tieneComponentes: {
    etiqueta: 'Tiene componentes',
    control: 'booleano',
    requerido: true,
  },
} as const satisfies EsquemaDto<ArticuloDto>;
