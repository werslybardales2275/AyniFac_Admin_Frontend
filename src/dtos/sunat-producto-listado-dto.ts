import type { EsquemaDto } from './campo';

export interface SunatProductoListadoDto {
  codigo: string;
  nombre: string;
  claseNombre: string;
}

export const sunatProductoListadoEsquema = {
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 20,
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
  claseNombre: {
    etiqueta: 'Clase',
    control: 'texto',
    requerido: false,
  },
} as const satisfies EsquemaDto<SunatProductoListadoDto>;
