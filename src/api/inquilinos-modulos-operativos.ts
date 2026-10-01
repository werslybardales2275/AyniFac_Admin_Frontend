import { leerMensajeError, solicitarApi } from './cliente-http';
import type { InquilinoModuloOperativoDto } from '../dtos/inquilino-modulo-operativo-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

/** Listado anidado en el inquilino. ListaCatalogo pagina y elimina sobre esta ruta. */
export function rutaModulosInquilino(inquilinoId: string): string {
  return `/api/administracion/inquilinos/${inquilinoId}/modulos-operativos`;
}

async function leerAsignacion(respuesta: Response, respaldo: string): Promise<InquilinoModuloOperativoDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<InquilinoModuloOperativoDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerModuloInquilino(
  inquilinoId: string,
  inquilinoModuloOperativoId: number,
): Promise<InquilinoModuloOperativoDto> {
  const respuesta = await solicitarApi(`${rutaModulosInquilino(inquilinoId)}/${inquilinoModuloOperativoId}`);
  return leerAsignacion(respuesta, 'No se pudo abrir el módulo operativo.');
}

export async function agregarModuloInquilino(
  inquilinoId: string,
  asignacion: InquilinoModuloOperativoDto,
): Promise<InquilinoModuloOperativoDto> {
  const respuesta = await solicitarApi(rutaModulosInquilino(inquilinoId), {
    method: 'POST',
    body: JSON.stringify({ ...asignacion, inquilinoModuloOperativoId: 0, inquilinoId }),
  });
  return leerAsignacion(respuesta, 'No se pudo guardar el módulo operativo.');
}

export async function modificarModuloInquilino(
  inquilinoId: string,
  asignacion: InquilinoModuloOperativoDto,
): Promise<InquilinoModuloOperativoDto> {
  const respuesta = await solicitarApi(
    `${rutaModulosInquilino(inquilinoId)}/${asignacion.inquilinoModuloOperativoId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ ...asignacion, inquilinoId }),
    },
  );
  return leerAsignacion(respuesta, 'No se pudo guardar el módulo operativo.');
}
