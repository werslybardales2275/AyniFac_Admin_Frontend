import { leerMensajeError, solicitarApi } from './cliente-http';
import type { ObjetoReducido } from '../dtos/objeto-reducido';
import type { RolPlataformaDto } from '../dtos/rol-plataforma-dto';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

const RUTA = '/api/administracion/roles-plataforma';
const TAMANO_COMBO = 100;

async function leerRol(respuesta: Response, respaldo: string): Promise<RolPlataformaDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<RolPlataformaDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerRolPlataforma(rolId: number): Promise<RolPlataformaDto> {
  const respuesta = await solicitarApi(`${RUTA}/${rolId}`);
  return leerRol(respuesta, 'No se pudo abrir el rol de plataforma.');
}

export async function agregarRolPlataforma(nombre: string): Promise<RolPlataformaDto> {
  const respuesta = await solicitarApi(RUTA, {
    method: 'POST',
    body: JSON.stringify({ rolId: 0, nombre }),
  });
  return leerRol(respuesta, 'No se pudo guardar el rol de plataforma.');
}

export async function modificarRolPlataforma(rol: RolPlataformaDto): Promise<RolPlataformaDto> {
  const respuesta = await solicitarApi(`${RUTA}/${rol.rolId}`, {
    method: 'PUT',
    body: JSON.stringify(rol),
  });
  return leerRol(respuesta, 'No se pudo guardar el rol de plataforma.');
}

export async function listaReducidaRolPlataforma(
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
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los roles de plataforma.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoReducido[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los roles de plataforma.');

  return cuerpo.datos;
}

export async function obtenerReducidoRolPlataforma(rolId: number): Promise<ObjetoReducido> {
  const respuesta = await solicitarApi(`${RUTA}/opciones/${rolId}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo abrir el rol de plataforma.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoReducido>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo abrir el rol de plataforma.');

  return cuerpo.datos;
}

/**
 * Junta las páginas del combo. Si el rol elegido no vino en esas páginas, lo pide aparte.
 */
export async function opcionesDeRolPlataforma(rolId?: number | null): Promise<ObjetoReducido[]> {
  const opciones: ObjetoReducido[] = [];
  for (let pagina = 1; pagina <= 20; pagina++) {
    const lote = await listaReducidaRolPlataforma(pagina, TAMANO_COMBO);
    opciones.push(...lote);
    if (lote.length < TAMANO_COMBO)
      break;
  }

  if (rolId && rolId > 0 && !opciones.some((opcion) => opcion.id === rolId)) {
    opciones.unshift(await obtenerReducidoRolPlataforma(rolId));
  }

  return opciones;
}
