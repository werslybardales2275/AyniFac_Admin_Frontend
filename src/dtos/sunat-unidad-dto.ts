import type { EsquemaDto } from './campo';

export interface SunatUnidadDto {
  codigo: string;
  nombre: string;
}

export const sunatUnidadDtoEsquema = {
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
    longitudMaxima: 50,
    valorPorDefecto: true,
    ordenValorPorDefecto: 1,
  },
} as const satisfies EsquemaDto<SunatUnidadDto>;
