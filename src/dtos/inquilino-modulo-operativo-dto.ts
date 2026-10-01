import type { EsquemaDto } from './campo';

export interface InquilinoModuloOperativoDto {
  inquilinoModuloOperativoId: number;
  inquilinoId: string;
  moduloOperativoId: number;
  moduloOperativoNombre: string;
}

export const inquilinoModuloOperativoDtoEsquema = {
  inquilinoModuloOperativoId: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
  },
  inquilinoId: {
    etiqueta: 'Inquilino',
    control: 'texto',
    requerido: true,
    soloLectura: true,
    oculto: true,
  },
  moduloOperativoId: {
    etiqueta: 'Módulo operativo',
    control: 'entero',
    requerido: true,
  },
  moduloOperativoNombre: {
    etiqueta: 'Módulo operativo',
    control: 'texto',
    requerido: true,
    soloLectura: true,
    oculto: true,
    valorPorDefecto: true,
  },
} as const satisfies EsquemaDto<InquilinoModuloOperativoDto>;

export function asignacionVacia(inquilinoId: string): InquilinoModuloOperativoDto {
  return {
    inquilinoModuloOperativoId: 0,
    inquilinoId,
    moduloOperativoId: 0,
    moduloOperativoNombre: '',
  };
}

/** El inquilino llega por la ruta. El formulario solo elige el módulo. */
export function prepararAsignacion(
  asignacion: InquilinoModuloOperativoDto,
): { asignacion: InquilinoModuloOperativoDto; error: string | null } {
  if (asignacion.moduloOperativoId <= 0)
    return { asignacion, error: 'El módulo operativo es obligatorio.' };

  return { asignacion, error: null };
}
