import type { EsquemaDto } from './campo';

export interface SunatFamiliaListadoDto {
  codigo: string;
  nombre: string;
  segmentoNombre: string;
}

export const sunatFamiliaListadoEsquema = {
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 4,
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
  segmentoNombre: {
    etiqueta: 'Segmento',
    control: 'texto',
    requerido: false,
  },
} as const satisfies EsquemaDto<SunatFamiliaListadoDto>;
