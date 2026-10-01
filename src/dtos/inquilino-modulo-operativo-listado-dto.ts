import type { EsquemaDto } from './campo';

export interface InquilinoModuloOperativoListadoDto {
  inquilinoModuloOperativoId: number;
  moduloOperativoNombre: string;
}

export const inquilinoModuloOperativoListadoEsquema = {
  inquilinoModuloOperativoId: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
  },
  moduloOperativoNombre: {
    etiqueta: 'Módulo operativo',
    control: 'texto',
    requerido: true,
    soloLectura: true,
    valorPorDefecto: true,
  },
} as const satisfies EsquemaDto<InquilinoModuloOperativoListadoDto>;
