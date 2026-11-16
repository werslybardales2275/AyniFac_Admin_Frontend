import { leerMensajeError, solicitarApi } from './cliente-http';
import type { CorrelativoDto } from '../dtos/correlativo-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

/** Listado anidado en el inquilino. ListaCatalogo lo consume con paginación. */
export function rutaCorrelativosInquilino(inquilinoId: string): string {
  return `/api/administracion/inquilinos/${inquilinoId}/correlativos`;
}

/** Edita el último número emitido de la serie. */
export async function modificarCorrelativo(
  inquilinoId: string,
  correlativo: CorrelativoDto,
): Promise<CorrelativoDto> {
  const ruta = `${rutaCorrelativosInquilino(inquilinoId)}/${correlativo.entidad}/${correlativo.subtipo}/${encodeURIComponent(correlativo.serie)}`;
  const respuesta = await solicitarApi(ruta, {
    method: 'PUT',
    body: JSON.stringify({ ultimoNumero: correlativo.ultimoNumero }),
  });
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo guardar el correlativo.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<CorrelativoDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo guardar el correlativo.');

  return cuerpo.datos;
}
