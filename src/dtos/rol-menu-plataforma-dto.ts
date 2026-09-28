import type { EsquemaDto } from './campo';

export interface RolMenuPlataformaDto {
  rolId: number;
  menuId: number;
  menuNombre: string;
}

export const rolMenuPlataformaDtoEsquema = {
  rolId: {
    etiqueta: 'Rol',
    control: 'entero',
    requerido: true,
    soloLectura: true,
    oculto: true,
  },
  menuId: {
    etiqueta: 'Id de menú',
    control: 'entero',
    requerido: true,
    oculto: true,
  },
  menuNombre: {
    etiqueta: 'Menú',
    control: 'texto',
    requerido: true,
    soloLectura: true,
    valorPorDefecto: true,
  },
} as const satisfies EsquemaDto<RolMenuPlataformaDto>;
