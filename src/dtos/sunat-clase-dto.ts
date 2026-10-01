import type { EsquemaDto } from './campo';
import type { ObjetoCodigoReducido } from './objeto-reducido';

export interface SunatClaseDto {
  codigo: string;
  familiaDto: ObjetoCodigoReducido;
  nombre: string;
}

export const sunatClaseDtoEsquema = {
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 6,
    valorPorDefecto: true,
  },
  familiaDto: {
    etiqueta: 'Familia',
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
} as const satisfies EsquemaDto<SunatClaseDto>;
