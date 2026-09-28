import type { EsquemaDto } from './campo';

export interface UsuarioDto {
  usuarioId: string;
  empleado: string;
  dni: string;
  correo: string;
  sucursalId: number;
  sucursalNombre: string;
  rolId: number;
  rolNombre: string;
  activo: boolean;
  esAdministrador: boolean;
  username: string;
  contrasena: string | null;
}

export const usuarioDtoEsquema = {
  usuarioId: {
    etiqueta: 'Id',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
  empleado: {
    etiqueta: 'Empleado',
    control: 'texto',
    requerido: true,
    longitudMaxima: 200,
    valorPorDefecto: true,
    ordenValorPorDefecto: 1,
  },
  dni: {
    etiqueta: 'DNI',
    control: 'texto',
    requerido: true,
    longitudMaxima: 8,
    valorPorDefecto: true,
    ordenValorPorDefecto: 0,
  },
  correo: {
    etiqueta: 'Correo',
    control: 'texto',
    requerido: true,
    longitudMaxima: 256,
  },
  username: {
    etiqueta: 'Usuario',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
  },
  sucursalId: {
    etiqueta: 'Sucursal',
    control: 'entero',
    requerido: true,
  },
  sucursalNombre: {
    etiqueta: 'Nombre de sucursal',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
  rolId: {
    etiqueta: 'Rol',
    control: 'entero',
    requerido: true,
  },
  rolNombre: {
    etiqueta: 'Nombre de rol',
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
  contrasena: {
    etiqueta: 'Contraseña',
    control: 'texto',
    requerido: false,
    longitudMaxima: 128,
    oculto: true,
  },
} as const satisfies EsquemaDto<UsuarioDto>;
