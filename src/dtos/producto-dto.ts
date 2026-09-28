import type { EsquemaDto } from './campo';

export interface ProductoDto {
  productoId: number;
  nombre: string;
  categoriaId: number;
  categoriaNombre: string;
}

export const productoDtoEsquema = {
  productoId: {
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
  categoriaId: {
    etiqueta: 'Categoría',
    control: 'entero',
    requerido: true,
  },
  categoriaNombre: {
    etiqueta: 'Nombre de categoría',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
} as const satisfies EsquemaDto<ProductoDto>;
