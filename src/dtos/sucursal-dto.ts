import type { EsquemaDto } from './campo';

export interface SucursalDto {
  sucursalId: number;
  inquilinoId: string;
  codigo: string;
  nombre: string;
  exoneradoIGV: boolean;
  direccion: string;
  telefono: string;
  correo: string;
  ubigeoEmisor: string;
  departamento: string;
  provincia: string;
  distrito: string;
  codigoLocalSUNAT: string;
}

export const sucursalDtoEsquema = {
  sucursalId: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
  },
  inquilinoId: {
    etiqueta: 'Inquilino',
    control: 'texto',
    requerido: true,
    soloLectura: true,
    oculto: true,
  },
  codigo: {
    etiqueta: 'Código',
    control: 'texto',
    requerido: true,
    longitudMaxima: 8,
    valorPorDefecto: true,
    ordenValorPorDefecto: 1,
  },
  nombre: {
    etiqueta: 'Nombre',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
    valorPorDefecto: true,
    ordenValorPorDefecto: 2,
  },
  exoneradoIGV: {
    etiqueta: 'Exonerado de IGV',
    control: 'booleano',
    requerido: true,
  },
  direccion: {
    etiqueta: 'Dirección',
    control: 'texto',
    requerido: true,
    longitudMaxima: 200,
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
  ubigeoEmisor: {
    etiqueta: 'Ubigeo emisor',
    control: 'texto',
    requerido: true,
    longitudMaxima: 6,
  },
  departamento: {
    etiqueta: 'Departamento',
    control: 'texto',
    requerido: true,
    longitudMaxima: 50,
  },
  provincia: {
    etiqueta: 'Provincia',
    control: 'texto',
    requerido: true,
    longitudMaxima: 50,
  },
  distrito: {
    etiqueta: 'Distrito',
    control: 'texto',
    requerido: true,
    longitudMaxima: 50,
  },
  codigoLocalSUNAT: {
    etiqueta: 'Código local SUNAT',
    control: 'texto',
    requerido: true,
    longitudMaxima: 4,
  },
} as const satisfies EsquemaDto<SucursalDto>;

export function sucursalVacia(inquilinoId: string): SucursalDto {
  return {
    sucursalId: 0,
    inquilinoId,
    codigo: '',
    nombre: '',
    exoneradoIGV: false,
    direccion: '',
    telefono: '',
    correo: '',
    ubigeoEmisor: '',
    departamento: '',
    provincia: '',
    distrito: '',
    codigoLocalSUNAT: '',
  };
}

const mensajesObligatorios: Partial<Record<keyof SucursalDto, string>> = {
  codigo: 'El código es obligatorio.',
  nombre: 'El nombre es obligatorio.',
  direccion: 'La dirección es obligatoria.',
  telefono: 'El teléfono es obligatorio.',
  correo: 'El correo es obligatorio.',
  ubigeoEmisor: 'El ubigeo emisor es obligatorio.',
  departamento: 'El departamento es obligatorio.',
  provincia: 'La provincia es obligatoria.',
  distrito: 'El distrito es obligatorio.',
  codigoLocalSUNAT: 'El código local SUNAT es obligatorio.',
};

/** Recorta los textos. Devuelve el primer campo obligatorio que quedó vacío. */
export function prepararSucursal(sucursal: SucursalDto): { sucursal: SucursalDto; error: string | null } {
  const preparada: SucursalDto = {
    ...sucursal,
    codigo: sucursal.codigo.trim(),
    nombre: sucursal.nombre.trim(),
    direccion: sucursal.direccion.trim(),
    telefono: sucursal.telefono.trim(),
    correo: sucursal.correo.trim(),
    ubigeoEmisor: sucursal.ubigeoEmisor.trim(),
    departamento: sucursal.departamento.trim(),
    provincia: sucursal.provincia.trim(),
    distrito: sucursal.distrito.trim(),
    codigoLocalSUNAT: sucursal.codigoLocalSUNAT.trim(),
  };

  for (const campo of Object.keys(mensajesObligatorios) as (keyof SucursalDto)[]) {
    const valor = preparada[campo];
    if (typeof valor === 'string' && !valor)
      return { sucursal: preparada, error: mensajesObligatorios[campo] ?? 'Complete los datos de la sucursal.' };
  }

  return { sucursal: preparada, error: null };
}
