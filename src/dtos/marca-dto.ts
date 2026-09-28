import type { EsquemaDto } from './campo';

export interface MarcaDto {
  marcaId: number;
  nombre: string;
}

export const marcaDtoEsquema = {
  marcaId: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
  },
  nombre: {
    etiqueta: 'Nombre',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
    valorPorDefecto: true,
  },
} as const satisfies EsquemaDto<MarcaDto>;
