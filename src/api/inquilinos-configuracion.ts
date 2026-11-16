import { leerMensajeError, solicitarApi } from './cliente-http';
import type { InquilinoConfiguracionDto } from '../dtos/inquilino-configuracion-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

/** Configuración anidada en el inquilino: una sola fila por inquilino. */
export function rutaConfiguraciones(inquilinoId: string): string {
  return `/api/administracion/inquilinos/${inquilinoId}/configuraciones`;
}

async function leerConfiguracion(respuesta: Response, respaldo: string): Promise<InquilinoConfiguracionDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<InquilinoConfiguracionDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

/** La configuración del inquilino. `null` cuando todavía no existe. */
export async function obtenerConfiguracionInquilino(inquilinoId: string): Promise<InquilinoConfiguracionDto | null> {
  const respuesta = await solicitarApi(rutaConfiguraciones(inquilinoId));
  if (respuesta.status === 404)
    return null;

  return leerConfiguracion(respuesta, 'No se pudo abrir la configuración del inquilino.');
}

export async function agregarConfiguracionInquilino(
  inquilinoId: string,
  configuracion: InquilinoConfiguracionDto,
): Promise<InquilinoConfiguracionDto> {
  const respuesta = await solicitarApi(rutaConfiguraciones(inquilinoId), {
    method: 'POST',
    body: JSON.stringify({ ...configuracion, inquilinoConfiguracionId: 0, inquilinoId }),
  });
  return leerConfiguracion(respuesta, 'No se pudo guardar la configuración del inquilino.');
}

export async function modificarConfiguracionInquilino(
  inquilinoId: string,
  configuracion: InquilinoConfiguracionDto,
): Promise<InquilinoConfiguracionDto> {
  const respuesta = await solicitarApi(
    `${rutaConfiguraciones(inquilinoId)}/${configuracion.inquilinoConfiguracionId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ ...configuracion, inquilinoId }),
    });
  return leerConfiguracion(respuesta, 'No se pudo guardar la configuración del inquilino.');
}
