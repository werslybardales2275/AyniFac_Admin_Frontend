import { leerMensajeError, solicitarApi } from './cliente-http';
import { opcionesDeRuta } from './opciones';
import type { ModuloOperativoDto } from '../dtos/modulo-operativo-dto';
import type { ObjetoReducido } from '../dtos/objeto-reducido';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

const RUTA = '/api/administracion/modulos-operativos';
const TAMANO_COMBO = 100;

async function leerModulo(respuesta: Response, respaldo: string): Promise<ModuloOperativoDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ModuloOperativoDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerModuloOperativo(moduloOperativoId: number): Promise<ModuloOperativoDto> {
  const respuesta = await solicitarApi(`${RUTA}/${moduloOperativoId}`);
  return leerModulo(respuesta, 'No se pudo abrir el módulo operativo.');
}

export async function agregarModuloOperativo(nombre: string): Promise<ModuloOperativoDto> {
  const respuesta = await solicitarApi(RUTA, {
    method: 'POST',
    body: JSON.stringify({ moduloOperativoId: 0, nombre }),
  });
  return leerModulo(respuesta, 'No se pudo guardar el módulo operativo.');
}

export async function modificarModuloOperativo(modulo: ModuloOperativoDto): Promise<ModuloOperativoDto> {
  const respuesta = await solicitarApi(`${RUTA}/${modulo.moduloOperativoId}`, {
    method: 'PUT',
    body: JSON.stringify(modulo),
  });
  return leerModulo(respuesta, 'No se pudo guardar el módulo operativo.');
}

export async function listaReducidaModuloOperativo(
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
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los módulos operativos.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoReducido[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los módulos operativos.');

  return cuerpo.datos;
}

export async function obtenerReducidoModuloOperativo(moduloOperativoId: number): Promise<ObjetoReducido> {
  const respuesta = await solicitarApi(`${RUTA}/opciones/${moduloOperativoId}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo abrir el módulo operativo.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoReducido>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo abrir el módulo operativo.');

  return cuerpo.datos;
}

/**
 * Junta las páginas del combo. Si el módulo elegido no vino en esas páginas, lo pide aparte.
 */
export async function opcionesDeModuloOperativo(moduloOperativoId?: number | null): Promise<ObjetoReducido[]> {
  const elegido = moduloOperativoId && moduloOperativoId > 0 ? moduloOperativoId : undefined;
  return opcionesDeRuta<ObjetoReducido>(RUTA, elegido, 'No se pudieron cargar los módulos operativos.', TAMANO_COMBO);
}
