import type { EsquemaDto } from './campo';
import type { ObjetoReducido } from './objeto-reducido';

export interface ConfiguracionAdicionalDto {
  configuracionAdicionalId: number;
  enviarCpeInmediatamente: boolean;
  mensajePieFactura: string;
  medioPagoEfectivoDto: ObjetoReducido;
  cuentaDetraccion: string;
  solicitarClaveAutorizacionParaVenderOtraSucursal: boolean;
}

export const configuracionAdicionalDtoEsquema = {
  configuracionAdicionalId: {
    etiqueta: 'Id',
    control: 'entero',
    requerido: true,
    soloLectura: true,
    oculto: true,
  },
  enviarCpeInmediatamente: {
    etiqueta: 'Enviar CPE inmediatamente',
    control: 'booleano',
    requerido: true,
  },
  mensajePieFactura: {
    etiqueta: 'Mensaje al pie de la factura',
    control: 'area',
    requerido: true,
  },
  medioPagoEfectivoDto: {
    etiqueta: 'Medio de pago efectivo',
    control: 'objetoReducido',
    requerido: true,
  },
  cuentaDetraccion: {
    etiqueta: 'Cuenta de detracción',
    control: 'texto',
    requerido: true,
    longitudMaxima: 100,
  },
  solicitarClaveAutorizacionParaVenderOtraSucursal: {
    etiqueta: 'Solicitar clave de autorización para vender de otra sucursal',
    control: 'booleano',
    requerido: true,
  },
} as const satisfies EsquemaDto<ConfiguracionAdicionalDto>;

export function configuracionAdicionalVacia(): ConfiguracionAdicionalDto {
  return {
    configuracionAdicionalId: 0,
    enviarCpeInmediatamente: false,
    mensajePieFactura: '',
    medioPagoEfectivoDto: { id: 0, valor: '' },
    cuentaDetraccion: '',
    solicitarClaveAutorizacionParaVenderOtraSucursal: false,
  };
}
