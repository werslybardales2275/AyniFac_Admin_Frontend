import type { EsquemaDto } from './campo';

export interface SunatMotivoDetraccionDto {
  codigo: string;
  nombre: string;
  tasa: number;
  vigente: boolean;
}

export const sunatMotivoDetraccionDtoEsquema = {
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 3,
    valorPorDefecto: true,
  },
  nombre: {
    etiqueta: 'Nombre',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
    valorPorDefecto: true,
    ordenValorPorDefecto: 1,
  },
  tasa: {
    etiqueta: 'Tasa',
    control: 'decimal',
    requerido: true,
    precision: 5,
    escala: 2,
    soloPositivo: true,
  },
  vigente: {
    etiqueta: 'Vigente',
    control: 'booleano',
    requerido: false,
  },
} as const satisfies EsquemaDto<SunatMotivoDetraccionDto>;
