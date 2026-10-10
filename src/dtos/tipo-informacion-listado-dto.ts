import type { EsquemaDto } from './campo';

export interface TipoInformacionListadoDto {
  tipoInformacionId: number;
  nombre: string;
}

export const tipoInformacionListadoEsquema = {
  tipoInformacionId: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
  },
  nombre: {
    etiqueta: 'Nombre',
    control: 'texto',
    requerido: true,
    longitudMaxima: 200,
    valorPorDefecto: true,
  },
} as const satisfies EsquemaDto<TipoInformacionListadoDto>;
