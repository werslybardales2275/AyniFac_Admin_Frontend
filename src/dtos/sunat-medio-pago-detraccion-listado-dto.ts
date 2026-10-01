import type { EsquemaDto } from './campo';

export interface SunatMedioPagoDetraccionListadoDto {
  codigo: string;
  nombre: string;
  vigente: boolean;
}

export const sunatMedioPagoDetraccionListadoEsquema = {
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
  vigente: {
    etiqueta: 'Vigente',
    control: 'booleano',
    requerido: false,
  },
} as const satisfies EsquemaDto<SunatMedioPagoDetraccionListadoDto>;
