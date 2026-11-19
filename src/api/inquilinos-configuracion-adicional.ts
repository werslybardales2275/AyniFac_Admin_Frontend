import { leerMensajeError, solicitarApi } from './cliente-http';
import { opcionesDeRuta } from './opciones';
import type { ConfiguracionAdicionalDto } from '../dtos/configuracion-adicional-dto';
import type { ObjetoReducido } from '../dtos/objeto-reducido';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

/** Configuración adicional anidada en el inquilino: una sola fila por inquilino. */
export function rutaConfiguracionesAdicionales(inquilinoId: string): string {
  return `/api/administracion/inquilinos/${inquilinoId}/configuraciones-adicionales`;
}

/** Combo de medios de pago del inquilino abierto. La sesión es de plataforma. */
export function opcionesDeMedioPagoInquilino(
  inquilinoId: string,
  medioPagoId?: number | null,
): Promise<ObjetoReducido[]> {
  return opcionesDeRuta<ObjetoReducido>(
    `/api/administracion/inquilinos/${inquilinoId}/medios-pago`,
    medioPagoId,
    'No se pudieron cargar los medios de pago.',
  );
}

async function leerConfiguracion(respuesta: Response, respaldo: string): Promise<ConfiguracionAdicionalDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ConfiguracionAdicionalDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

/** La configuración adicional del inquilino. `null` cuando todavía no existe. */
export async function obtenerConfiguracionAdicionalInquilino(inquilinoId: string): Promise<ConfiguracionAdicionalDto | null> {
  const respuesta = await solicitarApi(rutaConfiguracionesAdicionales(inquilinoId));
  if (respuesta.status === 404)
    return null;

  return leerConfiguracion(respuesta, 'No se pudo abrir la configuración adicional del inquilino.');
}

export async function agregarConfiguracionAdicionalInquilino(
  inquilinoId: string,
  configuracion: ConfiguracionAdicionalDto,
): Promise<ConfiguracionAdicionalDto> {
  const respuesta = await solicitarApi(rutaConfiguracionesAdicionales(inquilinoId), {
    method: 'POST',
    body: JSON.stringify({ ...configuracion, configuracionAdicionalId: 0 }),
  });
  return leerConfiguracion(respuesta, 'No se pudo guardar la configuración adicional del inquilino.');
}

export async function modificarConfiguracionAdicionalInquilino(
  inquilinoId: string,
  configuracion: ConfiguracionAdicionalDto,
): Promise<ConfiguracionAdicionalDto> {
  const respuesta = await solicitarApi(
    `${rutaConfiguracionesAdicionales(inquilinoId)}/${configuracion.configuracionAdicionalId}`,
    {
      method: 'PUT',
      body: JSON.stringify(configuracion),
    });
  return leerConfiguracion(respuesta, 'No se pudo guardar la configuración adicional del inquilino.');
}
