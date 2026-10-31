import type { EsquemaDto } from './campo';

/** Fila del listado de usuarios del inquilino abierto desde la plataforma. */
export interface UsuarioInquilinoListadoDto {
  usuarioId: string;
  dni: string;
  empleado: string;
  username: string;
  sucursalNombre: string;
  rolNombre: string;
  activo: boolean;
  esAdministrador: boolean;
}

export const usuarioInquilinoListadoEsquema = {
  usuarioId: {
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
    longitudMaxima: 200,
    valorPorDefecto: true,
    ordenValorPorDefecto: 1,
  },
  username: {
    etiqueta: 'Usuario',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
  },
  sucursalNombre: {
    etiqueta: 'Sucursal',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
  rolNombre: {
    etiqueta: 'Rol',
    control: 'texto',
    requerido: true,
    soloLectura: true,
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
} as const satisfies EsquemaDto<UsuarioInquilinoListadoDto>;
