import type { EsquemaDto } from './campo';

export interface RolObjetoPlataformaListadoDto {
  rolObjetoId: string;
  objetoId: number;
  objetoNombre: string;
  permisoLectura: boolean;
  permisoEscritura: boolean;
  permisoEliminacion: boolean;
}

export const rolObjetoPlataformaListadoEsquema = {
  rolObjetoId: {
    etiqueta: 'Id',
    control: 'texto',
    requerido: true,
    soloLectura: true,
    oculto: true,
  },
  objetoId: {
    etiqueta: 'Id de objeto',
    control: 'entero',
    requerido: true,
    oculto: true,
  },
  objetoNombre: {
    etiqueta: 'Objeto',
    control: 'texto',
    requerido: true,
    soloLectura: true,
    valorPorDefecto: true,
  },
  permisoLectura: {
    etiqueta: 'Lectura',
    control: 'booleano',
    requerido: true,
  },
  permisoEscritura: {
    etiqueta: 'Escritura',
    control: 'booleano',
    requerido: true,
  },
  permisoEliminacion: {
    etiqueta: 'Eliminación',
    control: 'booleano',
    requerido: true,
  },
} as const satisfies EsquemaDto<RolObjetoPlataformaListadoDto>;
