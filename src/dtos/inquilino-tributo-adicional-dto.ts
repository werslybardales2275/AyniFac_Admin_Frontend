import type { EsquemaDto } from './campo';
import type { EnumeracionDto } from './enumeracion-dto';

/** TipoTributoSunat que solo vive en la línea (Item menos Cabecera del catálogo 05). */
export const tributosAdicionales: EnumeracionDto[] = [
  { id: 2000, nombre: 'ISC Impuesto Selectivo al Consumo' },
  { id: 7152, nombre: 'Impuesto a la bolsa plástica' },
  { id: 9996, nombre: 'Gratuito' },
];

export interface InquilinoTributoAdicionalDto {
  inquilinoTributoAdicionalId: number;
  inquilinoId: string;
  tributoAdicional: EnumeracionDto | null;
}

export const inquilinoTributoAdicionalDtoEsquema = {
  inquilinoTributoAdicionalId: {
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
  tributoAdicional: {
    etiqueta: 'Tributo adicional',
    control: 'enumeracion',
    requerido: true,
  },
} as const satisfies EsquemaDto<InquilinoTributoAdicionalDto>;

export function tributoVacio(inquilinoId: string): InquilinoTributoAdicionalDto {
  return {
    inquilinoTributoAdicionalId: 0,
    inquilinoId,
    tributoAdicional: null,
  };
}

/** El inquilino llega por la ruta. El formulario solo elige el tributo. */
export function prepararTributo(
  tributo: InquilinoTributoAdicionalDto,
): { tributo: InquilinoTributoAdicionalDto; error: string | null } {
  if (!tributo.tributoAdicional || tributo.tributoAdicional.id <= 0)
    return { tributo, error: 'El tributo adicional es obligatorio.' };

  return { tributo, error: null };
}
