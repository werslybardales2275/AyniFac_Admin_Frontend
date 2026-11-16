import type { EsquemaDto } from './campo';

export interface InquilinoTributoAdicionalListadoDto {
  inquilinoTributoAdicionalId: number;
  tributoAdicionalNombre: string;
}

export const inquilinoTributoAdicionalListadoEsquema = {
  inquilinoTributoAdicionalId: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
  },
  tributoAdicionalNombre: {
    etiqueta: 'Tributo adicional',
    control: 'texto',
    requerido: true,
    soloLectura: true,
    valorPorDefecto: true,
  },
} as const satisfies EsquemaDto<InquilinoTributoAdicionalListadoDto>;
