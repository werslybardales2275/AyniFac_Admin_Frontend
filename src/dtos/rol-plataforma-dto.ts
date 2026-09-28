import type { EsquemaDto } from './campo';

export interface RolPlataformaDto {
  rolId: number;
  nombre: string;
}

export const rolPlataformaDtoEsquema = {
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
} as const satisfies EsquemaDto<RolPlataformaDto>;
