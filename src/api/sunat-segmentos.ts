import { leerMensajeError, solicitarApi } from './cliente-http';
import { opcionesDeRuta } from './opciones';
import type { SunatSegmentoDto } from '../dtos/sunat-segmento-dto';
import type { ObjetoCodigoReducido } from '../dtos/objeto-reducido';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

const RUTA = '/api/administracion/sunat-segmentos';
const TAMANO_COMBO = 100;

function rutaDe(codigo: string): string {
  return `${RUTA}/${encodeURIComponent(codigo)}`;
}

async function leerFicha(respuesta: Response, respaldo: string): Promise<SunatSegmentoDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<SunatSegmentoDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerSunatSegmento(codigo: string): Promise<SunatSegmentoDto> {
  const respuesta = await solicitarApi(rutaDe(codigo));
  return leerFicha(respuesta, 'No se pudo abrir el segmento SUNAT.');
}

export async function agregarSunatSegmento(ficha: SunatSegmentoDto): Promise<SunatSegmentoDto> {
  const respuesta = await solicitarApi(RUTA, {
    method: 'POST',
    body: JSON.stringify(ficha),
  });
  return leerFicha(respuesta, 'No se pudo guardar el segmento SUNAT.');
}

export async function modificarSunatSegmento(ficha: SunatSegmentoDto): Promise<SunatSegmentoDto> {
  const respuesta = await solicitarApi(rutaDe(ficha.codigo), {
    method: 'PUT',
    body: JSON.stringify(ficha),
  });
  return leerFicha(respuesta, 'No se pudo guardar el segmento SUNAT.');
}

export async function listaReducidaSunatSegmento(
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
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los segmentos SUNAT.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los segmentos SUNAT.');

  return cuerpo.datos;
}

export async function obtenerReducidoSunatSegmento(codigo: string): Promise<ObjetoCodigoReducido> {
  const respuesta = await solicitarApi(`${RUTA}/opciones/${encodeURIComponent(codigo)}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo abrir el segmento SUNAT.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo abrir el segmento SUNAT.');

  return cuerpo.datos;
}

export async function opcionesDeSunatSegmento(codigo?: string | null): Promise<ObjetoCodigoReducido[]> {
  return opcionesDeRuta<ObjetoCodigoReducido>(RUTA, codigo, 'No se pudieron cargar los segmentos SUNAT.', TAMANO_COMBO);
}
