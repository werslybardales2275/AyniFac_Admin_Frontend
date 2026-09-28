import { leerMensajeError, solicitarApi } from './cliente-http';
import type { SucursalDto } from '../dtos/sucursal-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

/** Listado anidado en el inquilino. ListaCatalogo pagina y elimina sobre esta ruta. */
export function rutaSucursales(inquilinoId: string): string {
  return `/api/administracion/inquilinos/${inquilinoId}/sucursales`;
}

async function leerSucursal(respuesta: Response, respaldo: string): Promise<SucursalDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<SucursalDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerSucursal(inquilinoId: string, sucursalId: number): Promise<SucursalDto> {
  const respuesta = await solicitarApi(`${rutaSucursales(inquilinoId)}/${sucursalId}`);
  return leerSucursal(respuesta, 'No se pudo abrir la sucursal.');
}

export async function agregarSucursal(inquilinoId: string, sucursal: SucursalDto): Promise<SucursalDto> {
  const respuesta = await solicitarApi(rutaSucursales(inquilinoId), {
    method: 'POST',
    body: JSON.stringify({ ...sucursal, sucursalId: 0, inquilinoId }),
  });
  return leerSucursal(respuesta, 'No se pudo guardar la sucursal.');
}

export async function modificarSucursal(inquilinoId: string, sucursal: SucursalDto): Promise<SucursalDto> {
  const respuesta = await solicitarApi(`${rutaSucursales(inquilinoId)}/${sucursal.sucursalId}`, {
    method: 'PUT',
    body: JSON.stringify({ ...sucursal, inquilinoId }),
  });
  return leerSucursal(respuesta, 'No se pudo guardar la sucursal.');
}
