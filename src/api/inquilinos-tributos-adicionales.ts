import { leerMensajeError, solicitarApi } from './cliente-http';
import type { InquilinoTributoAdicionalDto } from '../dtos/inquilino-tributo-adicional-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

/** Listado anidado en el inquilino. ListaCatalogo pagina y elimina sobre esta ruta. */
export function rutaTributosInquilino(inquilinoId: string): string {
  return `/api/administracion/inquilinos/${inquilinoId}/tributos-adicionales`;
}

export async function agregarTributoInquilino(
  inquilinoId: string,
  tributo: InquilinoTributoAdicionalDto,
): Promise<InquilinoTributoAdicionalDto> {
  const respuesta = await solicitarApi(rutaTributosInquilino(inquilinoId), {
    method: 'POST',
    body: JSON.stringify({ ...tributo, inquilinoTributoAdicionalId: 0, inquilinoId }),
  });
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo guardar el tributo adicional.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<InquilinoTributoAdicionalDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo guardar el tributo adicional.');

  return cuerpo.datos;
}
