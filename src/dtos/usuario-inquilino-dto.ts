import type { EsquemaDto } from './campo';
import type { ObjetoReducido } from './objeto-reducido';

/**
 * Ficha del usuario del inquilino abierto desde la plataforma.
 * La sucursal y el rol no se eligen en el formulario: el alta toma el rol
 * "Administrador" y la primera sucursal del inquilino, y la edición conserva los suyos.
 */
export interface UsuarioInquilinoDto {
  usuarioId: string;
  empleado: string;
  dni: string;
  correo: string;
  sucursalDto: ObjetoReducido;
  rolDto: ObjetoReducido;
  activo: boolean;
  esAdministrador: boolean;
  puedeVenderDeOtrosAlmacenes: boolean;
  haceDescuentos: boolean;
  forzarDescuento: boolean;
  rentabilidadMinima: boolean;
  autorizaVenderDeOtroAlmacen: boolean;
  puedeModificarPreciosDeTodosLosAmacenes: boolean;
  puedeAbrirArticuloDesdeVenta: boolean;
  username: string;
  contrasena: string | null;
}

export const usuarioInquilinoDtoEsquema = {
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
  contrasena: {
    etiqueta: 'Contraseña',
    control: 'texto',
    requerido: false,
    longitudMaxima: 128,
    oculto: true,
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
  sucursalDto: {
    etiqueta: 'Sucursal',
    control: 'objetoReducido',
    requerido: true,
    oculto: true,
  },
  rolDto: {
    etiqueta: 'Rol',
    control: 'objetoReducido',
    requerido: true,
    oculto: true,
  },
  puedeVenderDeOtrosAlmacenes: {
    etiqueta: 'Puede vender de otros almacenes',
    control: 'booleano',
    requerido: true,
    oculto: true,
  },
  haceDescuentos: {
    etiqueta: 'Hace descuentos',
    control: 'booleano',
    requerido: true,
    oculto: true,
  },
  forzarDescuento: {
    etiqueta: 'Forzar descuento',
    control: 'booleano',
    requerido: true,
    oculto: true,
  },
  rentabilidadMinima: {
    etiqueta: 'Rentabilidad mínima',
    control: 'booleano',
    requerido: true,
    oculto: true,
  },
  autorizaVenderDeOtroAlmacen: {
    etiqueta: 'Autoriza vender de otro almacén',
    control: 'booleano',
    requerido: true,
    oculto: true,
  },
  puedeModificarPreciosDeTodosLosAmacenes: {
    etiqueta: 'Puede modificar precios de todos los almacenes',
    control: 'booleano',
    requerido: true,
    oculto: true,
  },
  puedeAbrirArticuloDesdeVenta: {
    etiqueta: 'Puede abrir artículo desde venta',
    control: 'booleano',
    requerido: true,
    oculto: true,
  },
} as const satisfies EsquemaDto<UsuarioInquilinoDto>;

const usuarioVacio = '00000000-0000-0000-0000-000000000000';

/** Alta de un administrador: sin id, activo y con el flag de administrador marcado. */
export function usuarioInquilinoVacio(): UsuarioInquilinoDto {
  return {
    usuarioId: usuarioVacio,
    empleado: '',
    dni: '',
    correo: '',
    sucursalDto: { id: 0, valor: '' },
    rolDto: { id: 0, valor: '' },
    activo: true,
    esAdministrador: true,
    puedeVenderDeOtrosAlmacenes: false,
    haceDescuentos: false,
    forzarDescuento: false,
    rentabilidadMinima: false,
    autorizaVenderDeOtroAlmacen: false,
    puedeModificarPreciosDeTodosLosAmacenes: false,
    puedeAbrirArticuloDesdeVenta: false,
    username: '',
    contrasena: '',
  };
}
