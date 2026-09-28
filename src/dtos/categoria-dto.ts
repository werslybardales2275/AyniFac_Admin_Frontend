import type { EsquemaDto } from './campo';
import type { EnumeracionDto } from './enumeracion-dto';

/**
 * Valores de TipoCategoria. El nombre sigue EnumExtension:
 * separa el identificador por guion bajo y deja legible cada parte.
 */
export const tiposCategoria: EnumeracionDto[] = [
  { id: 1, nombre: 'Compra Venta' },
  { id: 2, nombre: 'Insumos' },
  { id: 3, nombre: 'Produccion' },
  { id: 4, nombre: 'Otros' },
];

export interface CategoriaDto {
  categoriaId: number;
  nombre: string;
  vigente: boolean;
  tipo: EnumeracionDto;
}

export const categoriaDtoEsquema = {
  categoriaId: {
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
  },
  vigente: {
    etiqueta: 'Vigente',
    control: 'booleano',
    requerido: true,
  },
  tipo: {
    etiqueta: 'Tipo',
    control: 'enumeracion',
    requerido: true,
  },
} as const satisfies EsquemaDto<CategoriaDto>;
