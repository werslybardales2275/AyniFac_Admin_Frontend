import { leerMensajeError, solicitarApi } from './cliente-http';
import { opcionesDeRuta } from './opciones';
import type { TipoInformacionDto } from '../dtos/tipo-informacion-dto';
import type { ObjetoReducido } from '../dtos/objeto-reducido';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

const RUTA = '/api/administracion/tipos-informacion';
const TAMANO_COMBO = 100;

async function leerTipoInformacion(respuesta: Response, respaldo: string): Promise<TipoInformacionDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<TipoInformacionDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerTipoInformacion(tipoInformacionId: number): Promise<TipoInformacionDto> {
  const respuesta = await solicitarApi(`${RUTA}/${tipoInformacionId}`);
  return leerTipoInformacion(respuesta, 'No se pudo abrir el tipo de información.');
}

export async function agregarTipoInformacion(nombre: string): Promise<TipoInformacionDto> {
  const respuesta = await solicitarApi(RUTA, {
    method: 'POST',
    body: JSON.stringify({ tipoInformacionId: 0, nombre }),
  });
  return leerTipoInformacion(respuesta, 'No se pudo guardar el tipo de información.');
}

export async function modificarTipoInformacion(tipo: TipoInformacionDto): Promise<TipoInformacionDto> {
  const respuesta = await solicitarApi(`${RUTA}/${tipo.tipoInformacionId}`, {
    method: 'PUT',
    body: JSON.stringify(tipo),
  });
  return leerTipoInformacion(respuesta, 'No se pudo guardar el tipo de información.');
}

export async function listaReducidaTipoInformacion(
  pagina = 1,
  tamanoPagina = 20,
  criterio = '',
): Promise<ObjetoReducido[]> {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: String(tamanoPagina),
  });
  const texto = criterio.trim();
  if (texto)
    parametros.set('criterio', texto);

  const respuesta = await solicitarApi(`${RUTA}/opciones?${parametros.toString()}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los tipos de información.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoReducido[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los tipos de información.');

  return cuerpo.datos;
}

export async function obtenerReducidoTipoInformacion(tipoInformacionId: number): Promise<ObjetoReducido> {
  const respuesta = await solicitarApi(`${RUTA}/opciones/${tipoInformacionId}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo abrir el tipo de información.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoReducido>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo abrir el tipo de información.');

  return cuerpo.datos;
}

/**
 * Junta las páginas del combo. Si el tipo elegido no vino en esas páginas, lo pide aparte.
 */
export async function opcionesDeTipoInformacion(tipoInformacionId?: number | null): Promise<ObjetoReducido[]> {
  const elegido = tipoInformacionId && tipoInformacionId > 0 ? tipoInformacionId : undefined;
  return opcionesDeRuta<ObjetoReducido>(RUTA, elegido, 'No se pudieron cargar los tipos de información.', TAMANO_COMBO);
}
