import type { EsquemaDto } from './campo';
import type { ObjetoReducido } from './objeto-reducido';

export interface UsuarioPlataformaDto {
  usuarioPlataformaId: string;
  dni: string;
  empleado: string;
  telefono: string;
  correo: string;
  userName: string;
  activo: boolean;
  rolDto: ObjetoReducido;
  esAdministrador: boolean;
  contrasena: string | null;
}

export const usuarioPlataformaDtoEsquema = {
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
  telefono: {
    etiqueta: 'Teléfono',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
  },
  correo: {
    etiqueta: 'Correo',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
  },
  userName: {
    etiqueta: 'Usuario',
    control: 'texto',
    requerido: true,
    longitudMaxima: 20,
  },
  rolDto: {
    etiqueta: 'Rol',
    control: 'objetoReducido',
    requerido: true,
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
} as const satisfies EsquemaDto<UsuarioPlataformaDto>;
