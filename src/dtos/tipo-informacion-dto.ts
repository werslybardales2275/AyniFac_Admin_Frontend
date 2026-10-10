import type { EsquemaDto } from './campo';

export interface TipoInformacionDto {
  tipoInformacionId: number;
  nombre: string;
}

export const tipoInformacionDtoEsquema = {
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
} as const satisfies EsquemaDto<TipoInformacionDto>;
