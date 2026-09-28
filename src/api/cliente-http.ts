import { leerSesion } from './sesion';

const API_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * Llama a AyniBackend. Las rutas de administración no resuelven inquilino:
 * la identidad viaja solo en el token de plataforma.
 */
export async function solicitarApi(
  ruta: string,
  opciones: RequestInit = {},
  autenticar = true,
): Promise<Response> {
  const headers = new Headers(opciones.headers);
  if (opciones.body && !headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json');

  if (autenticar) {
    const token = leerSesion()?.tokenAcceso;
    if (token)
      headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${API_URL}${ruta}`, { ...opciones, headers });
}

export async function leerMensajeError(respuesta: Response, respaldo: string): Promise<string> {
  try {
    const cuerpo = await respuesta.json() as { mensaje?: string };
    return cuerpo.mensaje || respaldo;
  }
  catch {
    return respaldo;
  }
}
