import { leerMensajeError, solicitarApi } from './cliente-http';
import type { SunatClaseDto } from '../dtos/sunat-clase-dto';
import type { ObjetoCodigoReducido } from '../dtos/objeto-reducido';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

const RUTA = '/api/administracion/sunat-clases';
const TAMANO_COMBO = 100;

function rutaDe(codigo: string): string {
  return `${RUTA}/${encodeURIComponent(codigo)}`;
}

async function leerFicha(respuesta: Response, respaldo: string): Promise<SunatClaseDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<SunatClaseDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerSunatClase(codigo: string): Promise<SunatClaseDto> {
  const respuesta = await solicitarApi(rutaDe(codigo));
  return leerFicha(respuesta, 'No se pudo abrir la clase SUNAT.');
}

export async function agregarSunatClase(ficha: SunatClaseDto): Promise<SunatClaseDto> {
  const respuesta = await solicitarApi(RUTA, {
    method: 'POST',
    body: JSON.stringify(ficha),
  });
  return leerFicha(respuesta, 'No se pudo guardar la clase SUNAT.');
}

export async function modificarSunatClase(ficha: SunatClaseDto): Promise<SunatClaseDto> {
  const respuesta = await solicitarApi(rutaDe(ficha.codigo), {
    method: 'PUT',
    body: JSON.stringify(ficha),
  });
  return leerFicha(respuesta, 'No se pudo guardar la clase SUNAT.');
}

export async function listaReducidaSunatClase(
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
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar las clases SUNAT.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar las clases SUNAT.');

  return cuerpo.datos;
}

export async function obtenerReducidoSunatClase(codigo: string): Promise<ObjetoCodigoReducido> {
  const respuesta = await solicitarApi(`${RUTA}/opciones/${encodeURIComponent(codigo)}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo abrir la clase SUNAT.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo abrir la clase SUNAT.');

  return cuerpo.datos;
}

/**
 * El catálogo de clases supera un lote de la unidad.
 * Se recorren más páginas para que el combo de productos alcance a mostrarlas.
 */

export async function opcionesDeSunatClase(codigo?: string | null): Promise<ObjetoCodigoReducido[]> {
  const opciones: ObjetoCodigoReducido[] = [];
  for (let pagina = 1; pagina <= 40; pagina++) {
    const lote = await listaReducidaSunatClase(pagina, TAMANO_COMBO);
    opciones.push(...lote);
    if (lote.length < TAMANO_COMBO)
      break;
  }

  const clave = codigo?.trim();
  if (clave && !opciones.some((opcion) => opcion.id === clave))
    opciones.unshift(await obtenerReducidoSunatClase(clave));

  return opciones;
}
