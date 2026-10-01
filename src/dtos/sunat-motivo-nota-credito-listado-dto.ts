import type { EsquemaDto } from './campo';

export interface SunatMotivoNotaCreditoListadoDto {
  codigo: string;
  nombre: string;
  afectaStock: boolean;
}

export const sunatMotivoNotaCreditoListadoEsquema = {
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
    longitudMaxima: 100,
    valorPorDefecto: true,
    ordenValorPorDefecto: 1,
  },
  afectaStock: {
    etiqueta: 'Afecta stock',
    control: 'booleano',
    requerido: false,
  },
} as const satisfies EsquemaDto<SunatMotivoNotaCreditoListadoDto>;
