import type { EsquemaDto } from './campo';

export interface InquilinoListadoDto {
  inquilinoId: string;
  codigo: string;
  razonSocial: string;
  ruc: string;
  subdominio: string;
  estadoNombre: string;
}

export const inquilinoListadoEsquema = {
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
  estadoNombre: {
    etiqueta: 'Estado',
    control: 'texto',
    requerido: true,
    soloLectura: true,
  },
} as const satisfies EsquemaDto<InquilinoListadoDto>;
