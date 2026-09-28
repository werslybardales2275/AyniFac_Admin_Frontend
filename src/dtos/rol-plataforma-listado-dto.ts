import type { EsquemaDto } from './campo';

export interface RolPlataformaListadoDto {
  rolId: number;
  nombre: string;
}

export const rolPlataformaListadoEsquema = {
  rolId: {
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
} as const satisfies EsquemaDto<RolPlataformaListadoDto>;
