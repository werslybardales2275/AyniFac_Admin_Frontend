import { leerMensajeError, solicitarApi } from './cliente-http';
import type { CategoriaDto } from '../dtos/categoria-dto';
import type { EnumeracionDto } from '../dtos/enumeracion-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

export interface CategoriaAlta {
  nombre: string;
  vigente: boolean;
  tipo: EnumeracionDto;
}

async function leerCategoria(respuesta: Response, respaldo: string): Promise<CategoriaDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<CategoriaDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerCategoria(categoriaId: number): Promise<CategoriaDto> {
  const respuesta = await solicitarApi(`/api/categorias/${categoriaId}`);
  return leerCategoria(respuesta, 'No se pudo abrir la categoría.');
}

export async function agregarCategoria(categoria: CategoriaAlta): Promise<CategoriaDto> {
  const respuesta = await solicitarApi('/api/categorias', {
    method: 'POST',
    body: JSON.stringify({ categoriaId: 0, ...categoria }),
  });
  return leerCategoria(respuesta, 'No se pudo guardar la categoría.');
}

export async function modificarCategoria(categoria: CategoriaDto): Promise<CategoriaDto> {
  const respuesta = await solicitarApi(`/api/categorias/${categoria.categoriaId}`, {
    method: 'PUT',
    body: JSON.stringify(categoria),
  });
  return leerCategoria(respuesta, 'No se pudo guardar la categoría.');
}
