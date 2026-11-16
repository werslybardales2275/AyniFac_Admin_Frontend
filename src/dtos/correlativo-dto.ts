import type { EsquemaDto } from './campo';

/** Fila del correlativo del inquilino: último número emitido por documento y serie. */
export interface CorrelativoDto {
  pk: string;
  entidad: number;
  entidadNombre: string;
  subtipo: number;
  subtipoNombre: string;
  serie: string;
  ultimoNumero: number;
}

export const correlativoEsquema = {
  pk: {
    etiqueta: 'Id',
    control: 'texto',
    requerido: true,
    soloLectura: true,
    oculto: true,
  },
  entidad: {
    etiqueta: 'Documento',
    control: 'entero',
    requerido: true,
    soloLectura: true,
    oculto: true,
  },
  entidadNombre: {
    etiqueta: 'Documento',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
  subtipo: {
    etiqueta: 'Subtipo',
    control: 'entero',
    requerido: true,
    soloLectura: true,
    oculto: true,
  },
  subtipoNombre: {
    etiqueta: 'Comprobante',
    control: 'texto',
    requerido: false,
    soloLectura: true,
  },
  serie: {
    etiqueta: 'Serie',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
  ultimoNumero: {
    etiqueta: 'Último número',
    control: 'entero',
    requerido: true,
  },
} as const satisfies EsquemaDto<CorrelativoDto>;
