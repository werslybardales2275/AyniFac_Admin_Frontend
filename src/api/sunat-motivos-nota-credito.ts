import { leerMensajeError, solicitarApi } from './cliente-http';
import { opcionesDeRuta } from './opciones';
import type { SunatMotivoNotaCreditoDto } from '../dtos/sunat-motivo-nota-credito-dto';
import type { ObjetoCodigoReducido } from '../dtos/objeto-reducido';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

const RUTA = '/api/administracion/sunat-motivos-nota-credito';
const TAMANO_COMBO = 100;

function rutaDe(codigo: string): string {
  return `${RUTA}/${encodeURIComponent(codigo)}`;
}

async function leerFicha(respuesta: Response, respaldo: string): Promise<SunatMotivoNotaCreditoDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<SunatMotivoNotaCreditoDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerSunatMotivoNotaCredito(codigo: string): Promise<SunatMotivoNotaCreditoDto> {
  const respuesta = await solicitarApi(rutaDe(codigo));
  return leerFicha(respuesta, 'No se pudo abrir el motivo de nota de crédito.');
}

export async function agregarSunatMotivoNotaCredito(ficha: SunatMotivoNotaCreditoDto): Promise<SunatMotivoNotaCreditoDto> {
  const respuesta = await solicitarApi(RUTA, {
    method: 'POST',
    body: JSON.stringify(ficha),
  });
  return leerFicha(respuesta, 'No se pudo guardar el motivo de nota de crédito.');
}

export async function modificarSunatMotivoNotaCredito(ficha: SunatMotivoNotaCreditoDto): Promise<SunatMotivoNotaCreditoDto> {
  const respuesta = await solicitarApi(rutaDe(ficha.codigo), {
    method: 'PUT',
    body: JSON.stringify(ficha),
  });
  return leerFicha(respuesta, 'No se pudo guardar el motivo de nota de crédito.');
}

export async function listaReducidaSunatMotivoNotaCredito(
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
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los motivos de nota de crédito.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los motivos de nota de crédito.');

  return cuerpo.datos;
}

export async function obtenerReducidoSunatMotivoNotaCredito(codigo: string): Promise<ObjetoCodigoReducido> {
  const respuesta = await solicitarApi(`${RUTA}/opciones/${encodeURIComponent(codigo)}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo abrir el motivo de nota de crédito.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoCodigoReducido>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo abrir el motivo de nota de crédito.');

  return cuerpo.datos;
}

export async function opcionesDeSunatMotivoNotaCredito(codigo?: string | null): Promise<ObjetoCodigoReducido[]> {
  return opcionesDeRuta<ObjetoCodigoReducido>(RUTA, codigo, 'No se pudieron cargar los motivos de nota de crédito.', TAMANO_COMBO);
}
