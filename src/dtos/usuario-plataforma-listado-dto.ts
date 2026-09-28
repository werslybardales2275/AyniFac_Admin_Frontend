import type { EsquemaDto } from './campo';

export interface UsuarioPlataformaListadoDto {
  usuarioPlataformaId: string;
  dni: string;
  empleado: string;
  activo: boolean;
  esAdministrador: boolean;
  rolNombre: string;
}

export const usuarioPlataformaListadoEsquema = {
  usuarioPlataformaId: {
    etiqueta: 'Id',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
  dni: {
    etiqueta: 'DNI',
    control: 'texto',
    requerido: true,
    longitudMaxima: 8,
    valorPorDefecto: true,
    ordenValorPorDefecto: 0,
  },
  empleado: {
    etiqueta: 'Empleado',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
    valorPorDefecto: true,
    ordenValorPorDefecto: 1,
  },
  activo: {
    etiqueta: 'Activo',
    control: 'booleano',
    requerido: true,
  },
  esAdministrador: {
    etiqueta: 'Es administrador',
    control: 'booleano',
    requerido: true,
  },
  rolNombre: {
    etiqueta: 'Rol',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
} as const satisfies EsquemaDto<UsuarioPlataformaListadoDto>;
