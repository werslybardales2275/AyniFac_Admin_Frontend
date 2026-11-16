import type { EsquemaDto } from './campo';
import type { ObjetoReducido } from './objeto-reducido';

/**
 * Ficha del usuario del inquilino abierto desde la plataforma.
 * La sucursal y el rol no se eligen en el formulario: el alta toma el rol
 * "Administrador" y la primera sucursal del inquilino, y la edición conserva los suyos.
 * La persona sí se elige: el usuario ya no guarda documento ni nombre.
 */
export interface UsuarioInquilinoDto {
  usuarioId: string;
  sucursalDto: ObjetoReducido;
  personaDto: ObjetoReducido;
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
  sucursalDto: {
    etiqueta: 'Sucursal',
    control: 'objetoReducido',
    requerido: true,
    oculto: true,
  },
  personaDto: {
    etiqueta: 'Persona',
    control: 'objetoReducido',
    requerido: true,
    valorPorDefecto: true,
  },
  rolDto: {
    etiqueta: 'Rol',
    control: 'objetoReducido',
    requerido: true,
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
  username: {
    etiqueta: 'Usuario',
    control: 'texto',
    requerido: true,
    longitudMaxima: 20,
  },
  contrasena: {
    etiqueta: 'Contraseña',
    control: 'texto',
    requerido: false,
    longitudMaxima: 128,
    oculto: true,
  },
} as const satisfies EsquemaDto<UsuarioInquilinoDto>;

const usuarioVacio = '00000000-0000-0000-0000-000000000000';
const reducidoVacio: ObjetoReducido = { id: 0, valor: '' };

/** Alta de un administrador: sin id, activo y con el flag de administrador marcado. */
export function usuarioInquilinoVacio(): UsuarioInquilinoDto {
  return {
    usuarioId: usuarioVacio,
    sucursalDto: reducidoVacio,
    personaDto: reducidoVacio,
    rolDto: reducidoVacio,
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
