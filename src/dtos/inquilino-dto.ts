import type { EsquemaDto } from './campo';
import type { EnumeracionDto } from './enumeracion-dto';
import type { ObjetoGuidReducido } from './objeto-reducido';

/** Valores de ModoInquilino. El nombre es el identificador del enumerado. */
export const modosInquilino: EnumeracionDto[] = [
  { id: 1, nombre: 'Compartido' },
  { id: 2, nombre: 'Esquema' },
  { id: 3, nombre: 'Dedicado' },
];

/** Valores de EstadoInquilino. Aprovisionando lo asigna el sistema. */
export const estadosInquilino: EnumeracionDto[] = [
  { id: 1, nombre: 'Aprovisionando' },
  { id: 2, nombre: 'Activo' },
  { id: 3, nombre: 'Suspendido' },
  { id: 4, nombre: 'Deshabilitado' },
];

export interface InquilinoDto {
  inquilinoId: string;
  codigo: string;
  razonSocial: string;
  ruc: string;
  subdominio: string;
  modo: EnumeracionDto;
  nombreEsquema: string | null;
  estado: EnumeracionDto;
  fechaCreacion: string;
  fechaDeshabilitacion: string | null;
  inquilinoAnterior: ObjetoGuidReducido;
  cadenaConexion: string | null;
  nombreAdministrador: string | null;
  contrasenaAdministrador: string | null;
  nombreCompletoAdministrador: string | null;
}

export const inquilinoDtoEsquema = {
  inquilinoId: {
    etiqueta: 'Id',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 50,
    valorPorDefecto: true,
    ordenValorPorDefecto: 0,
  },
  razonSocial: {
    etiqueta: 'Razón social',
    control: 'texto',
    requerido: true,
    longitudMaxima: 250,
    valorPorDefecto: true,
    ordenValorPorDefecto: 1,
  },
  ruc: {
    etiqueta: 'RUC',
    control: 'texto',
    requerido: true,
    longitudMaxima: 11,
  },
  subdominio: {
    etiqueta: 'Subdominio',
    control: 'texto',
    requerido: true,
    longitudMaxima: 63,
  },
  modo: {
    etiqueta: 'Modo',
    control: 'enumeracion',
    requerido: true,
  },
  nombreEsquema: {
    etiqueta: 'Esquema',
    control: 'texto',
    requerido: false,
    soloLectura: true,
    autocalculado: true,
  },
  estado: {
    etiqueta: 'Estado',
    control: 'enumeracion',
    requerido: true,
  },
  fechaCreacion: {
    etiqueta: 'Fecha de creación',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
  fechaDeshabilitacion: {
    etiqueta: 'Fecha de deshabilitación',
    control: 'texto',
    requerido: false,
    soloLectura: true,
  },
  inquilinoAnterior: {
    etiqueta: 'Inquilino anterior',
    control: 'objetoReducido',
    requerido: false,
  },
  cadenaConexion: {
    etiqueta: 'Cadena de conexión',
    control: 'texto',
    requerido: false,
    oculto: true,
  },
  nombreAdministrador: {
    etiqueta: 'Usuario administrador',
    control: 'texto',
    requerido: false,
    longitudMaxima: 20,
    oculto: true,
  },
  contrasenaAdministrador: {
    etiqueta: 'Contraseña del administrador',
    control: 'texto',
    requerido: false,
    longitudMaxima: 128,
    oculto: true,
  },
  nombreCompletoAdministrador: {
    etiqueta: 'Nombre del administrador',
    control: 'texto',
    requerido: false,
    longitudMaxima: 100,
    oculto: true,
  },
} as const satisfies EsquemaDto<InquilinoDto>;
