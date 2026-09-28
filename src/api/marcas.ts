import { leerMensajeError, solicitarApi } from './cliente-http';
import type { MarcaDto } from '../dtos/marca-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

async function leerMarca(respuesta: Response, respaldo: string): Promise<MarcaDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<MarcaDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerMarca(marcaId: number): Promise<MarcaDto> {
  const respuesta = await solicitarApi(`/api/marcas/${marcaId}`);
  return leerMarca(respuesta, 'No se pudo abrir la marca.');
}

export async function agregarMarca(nombre: string): Promise<MarcaDto> {
  const respuesta = await solicitarApi('/api/marcas', {
    method: 'POST',
    body: JSON.stringify({ marcaId: 0, nombre }),
  });
  return leerMarca(respuesta, 'No se pudo guardar la marca.');
}

export async function modificarMarca(marca: MarcaDto): Promise<MarcaDto> {
  const respuesta = await solicitarApi(`/api/marcas/${marca.marcaId}`, {
    method: 'PUT',
    body: JSON.stringify(marca),
  });
  return leerMarca(respuesta, 'No se pudo guardar la marca.');
}
