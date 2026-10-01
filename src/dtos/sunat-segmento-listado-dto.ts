import type { EsquemaDto } from './campo';

export interface SunatSegmentoListadoDto {
  codigo: string;
  nombre: string;
}

export const sunatSegmentoListadoEsquema = {
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 2,
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
} as const satisfies EsquemaDto<SunatSegmentoListadoDto>;
