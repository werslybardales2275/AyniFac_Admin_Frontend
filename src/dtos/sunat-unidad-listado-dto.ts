import type { EsquemaDto } from './campo';

export interface SunatUnidadListadoDto {
  codigo: string;
  nombre: string;
}

export const sunatUnidadListadoEsquema = {
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
} as const satisfies EsquemaDto<SunatUnidadListadoDto>;
