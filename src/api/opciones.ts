import { leerMensajeError, solicitarApi } from './cliente-http';
import type { ObjetoCodigoReducido, ObjetoGuidReducido, ObjetoReducido } from '../dtos/objeto-reducido';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

const TAMANO_PAGINA = 20;
const MAX_PAGINAS = 20;

type Opcion = ObjetoReducido | ObjetoGuidReducido | ObjetoCodigoReducido;

async function paginaDeOpciones<T extends Opcion>(
  ruta: string,
  pagina: number,
  tamanoPagina: number,
  respaldo: string,
): Promise<T[]> {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: String(tamanoPagina),
  });

  const respuesta = await solicitarApi(`${ruta}/opciones?${parametros.toString()}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<T[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

async function unoReducido<T extends Opcion>(ruta: string, id: string | number, respaldo: string): Promise<T> {
  const respuesta = await solicitarApi(`${ruta}/opciones/${encodeURIComponent(String(id))}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<T>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

/** Junta las páginas del combo y, si hace falta, pide aparte la fila ya elegida. */
export async function opcionesDeRuta<T extends Opcion>(
  ruta: string,
  idElegido?: T['id'] | null,
  respaldo = 'No se pudieron cargar las opciones.',
  tamanoPagina = TAMANO_PAGINA,
  maxPaginas = MAX_PAGINAS,
): Promise<T[]> {
  const opciones: T[] = [];
  for (let pagina = 1; pagina <= maxPaginas; pagina++) {
    const lote = await paginaDeOpciones<T>(ruta, pagina, tamanoPagina, respaldo);
    opciones.push(...lote);
    if (lote.length < tamanoPagina)
      break;
  }

  const clave = typeof idElegido === 'string' ? idElegido.trim() : idElegido;
  if (clave && !opciones.some((opcion) => opcion.id === clave))
    opciones.unshift(await unoReducido<T>(ruta, clave, respaldo));

  return opciones;
}
