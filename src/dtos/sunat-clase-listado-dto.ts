import type { EsquemaDto } from './campo';

export interface SunatClaseListadoDto {
  codigo: string;
  nombre: string;
  familiaNombre: string;
}

export const sunatClaseListadoEsquema = {
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 6,
    valorPorDefecto: true,
  },
  nombre: {
    etiqueta: 'Nombre',
    control: 'texto',
    requerido: true,
    longitudMaxima: 150,
    valorPorDefecto: true,
    ordenValorPorDefecto: 1,
  },
  familiaNombre: {
    etiqueta: 'Familia',
    control: 'texto',
    requerido: false,
  },
} as const satisfies EsquemaDto<SunatClaseListadoDto>;
