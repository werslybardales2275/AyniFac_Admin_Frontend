import type { EsquemaDto } from './campo';
import type { ObjetoCodigoReducido } from './objeto-reducido';

export interface SunatFamiliaDto {
  codigo: string;
  segmentoDto: ObjetoCodigoReducido;
  nombre: string;
}

export const sunatFamiliaDtoEsquema = {
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 4,
    valorPorDefecto: true,
  },
  segmentoDto: {
    etiqueta: 'Segmento',
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
} as const satisfies EsquemaDto<SunatFamiliaDto>;
