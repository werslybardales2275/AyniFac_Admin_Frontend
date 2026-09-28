import type { EsquemaDto } from './campo';

export interface SucursalListadoDto {
  sucursalId: number;
  codigo: string;
  nombre: string;
  exoneradoIGV: boolean;
  ubigeoEmisor: string;
  codigoLocalSUNAT: string;
}

export const sucursalListadoEsquema = {
  sucursalId: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
  },
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 8,
    valorPorDefecto: true,
    ordenValorPorDefecto: 1,
  },
  nombre: {
    etiqueta: 'Nombre',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
    valorPorDefecto: true,
    ordenValorPorDefecto: 2,
  },
  exoneradoIGV: {
    etiqueta: 'Exonerado de IGV',
    control: 'booleano',
    requerido: true,
  },
  ubigeoEmisor: {
    etiqueta: 'Ubigeo emisor',
    control: 'texto',
    requerido: true,
    longitudMaxima: 6,
  },
  codigoLocalSUNAT: {
    etiqueta: 'Código local SUNAT',
    control: 'texto',
    requerido: true,
    longitudMaxima: 4,
  },
} as const satisfies EsquemaDto<SucursalListadoDto>;
