import type { EsquemaDto } from './campo';
import type { ObjetoCodigoReducido } from './objeto-reducido';

export interface SunatProductoDto {
  codigo: string;
  claseDto: ObjetoCodigoReducido;
  nombre: string;
}

export const sunatProductoDtoEsquema = {
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 20,
    valorPorDefecto: true,
  },
  claseDto: {
    etiqueta: 'Clase',
    control: 'objetoReducido',
    requerido: true,
  },
  nombre: {
    etiqueta: 'Nombre',
    control: 'texto',
    requerido: true,
    longitudMaxima: 150,
    valorPorDefecto: true,
    ordenValorPorDefecto: 1,
  },
} as const satisfies EsquemaDto<SunatProductoDto>;
