import { leerMensajeError, solicitarApi } from './cliente-http';
import type { SunatProductoDto } from '../dtos/sunat-producto-dto';
import type { ObjetoCodigoReducido } from '../dtos/objeto-reducido';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

const RUTA = '/api/administracion/sunat-productos';
const TAMANO_COMBO = 100;

function rutaDe(codigo: string): string {
  return `${RUTA}/${encodeURIComponent(codigo)}`;
}

async function leerFicha(respuesta: Response, respaldo: string): Promise<SunatProductoDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<SunatProductoDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerSunatProducto(codigo: string): Promise<SunatProductoDto> {
  const respuesta = await solicitarApi(rutaDe(codigo));
  return leerFicha(respuesta, 'No se pudo abrir el producto SUNAT.');
}

export async function agregarSunatProducto(ficha: SunatProductoDto): Promise<SunatProductoDto> {
  const respuesta = await solicitarApi(RUTA, {
    method: 'POST',
    body: JSON.stringify(ficha),
  });
  return leerFicha(respuesta, 'No se pudo guardar el producto SUNAT.');
}

export async function modificarSunatProducto(ficha: SunatProductoDto): Promise<SunatProductoDto> {
  const respuesta = await solicitarApi(rutaDe(ficha.codigo), {
    method: 'PUT',
    body: JSON.stringify(ficha),
  });
  return leerFicha(respuesta, 'No se pudo guardar el producto SUNAT.');
}

export async function listaReducidaSunatProducto(
  pagina = 1,
  tamanoPagina = 20,
  criterio = '',
): Promise<ObjetoCodigoReducido[]> {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: String(tamanoPagina),
  });
  const texto = criterio.trim();
  if (texto)
    parametros.set('criterio', texto);

  const respuesta = await solicitarApi(`${RUTA}/opciones?${parametros.toString()}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los productos SUNAT.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los productos SUNAT.');

  return cuerpo.datos;
}

export async function obtenerReducidoSunatProducto(codigo: string): Promise<ObjetoCodigoReducido> {
  const respuesta = await solicitarApi(`${RUTA}/opciones/${encodeURIComponent(codigo)}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo abrir el producto SUNAT.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo abrir el producto SUNAT.');

  return cuerpo.datos;
}

export async function opcionesDeSunatProducto(codigo?: string | null): Promise<ObjetoCodigoReducido[]> {
  const opciones: ObjetoCodigoReducido[] = [];
  for (let pagina = 1; pagina <= 20; pagina++) {
    const lote = await listaReducidaSunatProducto(pagina, TAMANO_COMBO);
    opciones.push(...lote);
    if (lote.length < TAMANO_COMBO)
      break;
  }

  const clave = codigo?.trim();
  if (clave && !opciones.some((opcion) => opcion.id === clave))
    opciones.unshift(await obtenerReducidoSunatProducto(clave));

  return opciones;
}
