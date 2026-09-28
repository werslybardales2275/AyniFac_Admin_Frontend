import type { EsquemaDto } from './campo';

export interface ModuloOperativoDto {
  moduloOperativoId: number;
  nombre: string;
}

export const moduloOperativoDtoEsquema = {
  moduloOperativoId: {
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
} as const satisfies EsquemaDto<ModuloOperativoDto>;
