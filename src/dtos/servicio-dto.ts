import type { EsquemaDto } from './campo';

export interface ServicioDto {
  servicioId: number;
  codigo: string;
  nombre: string;
  vigente: boolean;
  codigoSunatUnidad: string;
  netoReferencial: number;
}

export const servicioDtoEsquema = {
  servicioId: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
  },
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 20,
  },
  nombre: {
    etiqueta: 'Nombre',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
  },
  vigente: {
    etiqueta: 'Vigente',
    control: 'booleano',
    requerido: true,
  },
  codigoSunatUnidad: {
    etiqueta: 'Código SUNAT de unidad',
    control: 'texto',
    requerido: true,
    longitudMaxima: 3,
  },
  netoReferencial: {
    etiqueta: 'Neto referencial',
    control: 'decimal',
    requerido: true,
    precision: 18,
    escala: 2,
    soloPositivo: true,
  },
} as const satisfies EsquemaDto<ServicioDto>;
