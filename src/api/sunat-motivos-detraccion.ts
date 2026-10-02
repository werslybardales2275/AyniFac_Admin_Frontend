import { leerMensajeError, solicitarApi } from './cliente-http';
import { opcionesDeRuta } from './opciones';
import type { SunatMotivoDetraccionDto } from '../dtos/sunat-motivo-detraccion-dto';
import type { ObjetoCodigoReducido } from '../dtos/objeto-reducido';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

const RUTA = '/api/administracion/sunat-motivos-detraccion';
const TAMANO_COMBO = 100;

function rutaDe(codigo: string): string {
  return `${RUTA}/${encodeURIComponent(codigo)}`;
}

async function leerFicha(respuesta: Response, respaldo: string): Promise<SunatMotivoDetraccionDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<SunatMotivoDetraccionDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerSunatMotivoDetraccion(codigo: string): Promise<SunatMotivoDetraccionDto> {
  const respuesta = await solicitarApi(rutaDe(codigo));
  return leerFicha(respuesta, 'No se pudo abrir el motivo de detracción.');
}

export async function agregarSunatMotivoDetraccion(ficha: SunatMotivoDetraccionDto): Promise<SunatMotivoDetraccionDto> {
  const respuesta = await solicitarApi(RUTA, {
    method: 'POST',
    body: JSON.stringify(ficha),
  });
  return leerFicha(respuesta, 'No se pudo guardar el motivo de detracción.');
}

export async function modificarSunatMotivoDetraccion(ficha: SunatMotivoDetraccionDto): Promise<SunatMotivoDetraccionDto> {
  const respuesta = await solicitarApi(rutaDe(ficha.codigo), {
    method: 'PUT',
    body: JSON.stringify(ficha),
  });
  return leerFicha(respuesta, 'No se pudo guardar el motivo de detracción.');
}

export async function listaReducidaSunatMotivoDetraccion(
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
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los motivos de detracción.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los motivos de detracción.');

  return cuerpo.datos;
}

export async function obtenerReducidoSunatMotivoDetraccion(codigo: string): Promise<ObjetoCodigoReducido> {
  const respuesta = await solicitarApi(`${RUTA}/opciones/${encodeURIComponent(codigo)}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo abrir el motivo de detracción.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo abrir el motivo de detracción.');

  return cuerpo.datos;
}

export async function opcionesDeSunatMotivoDetraccion(codigo?: string | null): Promise<ObjetoCodigoReducido[]> {
  return opcionesDeRuta<ObjetoCodigoReducido>(RUTA, codigo, 'No se pudieron cargar los motivos de detracción.', TAMANO_COMBO);
}
