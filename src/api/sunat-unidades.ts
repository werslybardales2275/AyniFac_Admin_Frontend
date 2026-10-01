import { leerMensajeError, solicitarApi } from './cliente-http';
import type { SunatUnidadDto } from '../dtos/sunat-unidad-dto';
import type { ObjetoCodigoReducido } from '../dtos/objeto-reducido';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

const RUTA = '/api/administracion/sunat-unidades';
const TAMANO_COMBO = 100;

function rutaDe(codigo: string): string {
  return `${RUTA}/${encodeURIComponent(codigo)}`;
}

async function leerUnidad(respuesta: Response, respaldo: string): Promise<SunatUnidadDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<SunatUnidadDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerSunatUnidad(codigo: string): Promise<SunatUnidadDto> {
  const respuesta = await solicitarApi(rutaDe(codigo));
  return leerUnidad(respuesta, 'No se pudo abrir la unidad SUNAT.');
}

export async function agregarSunatUnidad(unidad: SunatUnidadDto): Promise<SunatUnidadDto> {
  const respuesta = await solicitarApi(RUTA, {
    method: 'POST',
    body: JSON.stringify(unidad),
  });
  return leerUnidad(respuesta, 'No se pudo guardar la unidad SUNAT.');
}

export async function modificarSunatUnidad(unidad: SunatUnidadDto): Promise<SunatUnidadDto> {
  const respuesta = await solicitarApi(rutaDe(unidad.codigo), {
    method: 'PUT',
    body: JSON.stringify(unidad),
  });
  return leerUnidad(respuesta, 'No se pudo guardar la unidad SUNAT.');
}

export async function listaReducidaSunatUnidad(
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
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar las unidades SUNAT.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar las unidades SUNAT.');

  return cuerpo.datos;
}

export async function obtenerReducidoSunatUnidad(codigo: string): Promise<ObjetoCodigoReducido> {
  const respuesta = await solicitarApi(`${RUTA}/opciones/${encodeURIComponent(codigo)}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo abrir la unidad SUNAT.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo abrir la unidad SUNAT.');

  return cuerpo.datos;
}

/**
 * Junta las páginas del combo. Si la unidad elegida no vino en esas páginas, la pide aparte.
 */
export async function opcionesDeSunatUnidad(codigo?: string | null): Promise<ObjetoCodigoReducido[]> {
  const opciones: ObjetoCodigoReducido[] = [];
  for (let pagina = 1; pagina <= 20; pagina++) {
    const lote = await listaReducidaSunatUnidad(pagina, TAMANO_COMBO);
    opciones.push(...lote);
    if (lote.length < TAMANO_COMBO)
      break;
  }

  const clave = codigo?.trim();
  if (clave && !opciones.some((opcion) => opcion.id === clave))
    opciones.unshift(await obtenerReducidoSunatUnidad(clave));

  return opciones;
}
