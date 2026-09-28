import { leerMensajeError, solicitarApi } from './cliente-http';
import type { InquilinoDto } from '../dtos/inquilino-dto';
import type { ObjetoGuidReducido } from '../dtos/objeto-reducido';
import type { ResultadoOperacion } from '../dtos/resultado-operacion';

export interface InquilinoAlta {
  codigo: string;
  razonSocial: string;
  ruc: string;
  subdominio: string;
  modo: InquilinoDto['modo'];
  inquilinoAnterior: ObjetoGuidReducido;
  cadenaConexion: string;
  nombreAdministrador: string;
  contrasenaAdministrador: string;
  nombreCompletoAdministrador: string;
}

const RUTA = '/api/administracion/inquilinos';
const TAMANO_COMBO = 100;
const inquilinoVacio = '00000000-0000-0000-0000-000000000000';

async function leerInquilino(respuesta: Response, respaldo: string): Promise<InquilinoDto> {
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, respaldo));

  const cuerpo = await respuesta.json() as ResultadoOperacion<InquilinoDto>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || respaldo);

  return cuerpo.datos;
}

export async function obtenerInquilino(inquilinoId: string): Promise<InquilinoDto> {
  const respuesta = await solicitarApi(`${RUTA}/${inquilinoId}`);
  return leerInquilino(respuesta, 'No se pudo abrir el inquilino.');
}

export async function agregarInquilino(inquilino: InquilinoAlta): Promise<InquilinoDto> {
  const respuesta = await solicitarApi(RUTA, {
    method: 'POST',
    body: JSON.stringify({
      inquilinoId: inquilinoVacio,
      codigo: inquilino.codigo,
      razonSocial: inquilino.razonSocial,
      ruc: inquilino.ruc,
      subdominio: inquilino.subdominio,
      modo: inquilino.modo,
      inquilinoAnterior: inquilino.inquilinoAnterior,
      cadenaConexion: inquilino.cadenaConexion,
      nombreAdministrador: inquilino.nombreAdministrador,
      contrasenaAdministrador: inquilino.contrasenaAdministrador,
      nombreCompletoAdministrador: inquilino.nombreCompletoAdministrador,
      estado: { id: 2, nombre: 'Activo' },
      nombreEsquema: null,
      fechaCreacion: new Date().toISOString(),
      fechaDeshabilitacion: null,
    }),
  });
  return leerInquilino(respuesta, 'No se pudo guardar el inquilino.');
}

export async function modificarInquilino(inquilino: InquilinoDto): Promise<InquilinoDto> {
  const respuesta = await solicitarApi(`${RUTA}/${inquilino.inquilinoId}`, {
    method: 'PUT',
    body: JSON.stringify(inquilino),
  });
  return leerInquilino(respuesta, 'No se pudo guardar el inquilino.');
}

export async function listaReducidaInquilino(
  pagina = 1,
  tamanoPagina = 20,
  criterio = '',
): Promise<ObjetoGuidReducido[]> {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: String(tamanoPagina),
  });
  const texto = criterio.trim();
  if (texto)
    parametros.set('criterio', texto);

  const respuesta = await solicitarApi(`${RUTA}/opciones?${parametros.toString()}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudieron cargar los inquilinos.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoGuidReducido[]>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudieron cargar los inquilinos.');

  return cuerpo.datos;
}

export async function obtenerReducidoInquilino(inquilinoId: string): Promise<ObjetoGuidReducido> {
  const respuesta = await solicitarApi(`${RUTA}/opciones/${inquilinoId}`);
  if (!respuesta.ok)
    throw new Error(await leerMensajeError(respuesta, 'No se pudo abrir el inquilino.'));

  const cuerpo = await respuesta.json() as ResultadoOperacion<ObjetoGuidReducido>;
  if (!cuerpo.exito || !cuerpo.datos)
    throw new Error(cuerpo.mensaje || 'No se pudo abrir el inquilino.');

  return cuerpo.datos;
}

/**
 * Junta las páginas del combo. Si el inquilino elegido no vino en esas páginas, lo pide aparte.
 */
export async function opcionesDeInquilino(inquilinoId?: string | null): Promise<ObjetoGuidReducido[]> {
  const opciones: ObjetoGuidReducido[] = [];
  for (let pagina = 1; pagina <= 20; pagina++) {
    const lote = await listaReducidaInquilino(pagina, TAMANO_COMBO);
    opciones.push(...lote);
    if (lote.length < TAMANO_COMBO)
      break;
  }

  if (inquilinoId && inquilinoId !== inquilinoVacio && !opciones.some((opcion) => opcion.id === inquilinoId))
    opciones.unshift(await obtenerReducidoInquilino(inquilinoId));

  return opciones;
}
