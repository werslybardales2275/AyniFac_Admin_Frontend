import type { EsquemaDto } from './campo';

export interface EnumeracionDto {
  id: number;
  nombre: string;
}

export const enumeracionDtoEsquema = {
  id: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
  },
  nombre: {
    etiqueta: 'Nombre',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
} as const satisfies EsquemaDto<EnumeracionDto>;
