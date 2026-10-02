import type { User } from '../types';
import { solicitarApi, leerMensajeError } from './cliente-http';
import {
  cerrarSesion,
  guardarNombreUsuarioRecordado,
  guardarSesion,
  leerSesion,
} from './sesion';

interface SesionApi {
  tokenAcceso: string;
  expira: string;
  nombre: string;
  rol: string;
  esAdministrador: boolean;
}

/** Inicia sesión contra UsuarioPlataforma en AdminDbContext. */
export async function signIn(nombreUsuario: string, contrasena: string) {
  try {
    const usuarioLimpio = nombreUsuario.trim();
    guardarNombreUsuarioRecordado(usuarioLimpio);

    const respuesta = await solicitarApi('/api/administracion/autenticacion/iniciar-sesion', {
      method: 'POST',
      body: JSON.stringify({
        userName: usuarioLimpio,
        contrasena,
      }),
    }, false);

    if (!respuesta.ok) {
      return {
        isOk: false,
        message: await leerMensajeError(respuesta, 'No se pudo iniciar sesión.'),
      };
    }

    const sesion = await respuesta.json() as SesionApi;
    const usuario = aUsuario(sesion, usuarioLimpio);
    guardarSesion({
      tokenAcceso: sesion.tokenAcceso,
      expira: sesion.expira,
      usuario,
    });

    return { isOk: true, data: usuario };
  }
  catch {
    return {
      isOk: false,
      message: 'No hay conexión con el servidor.',
    };
  }
}

export async function getUser() {
  const sesion = leerSesion();
  if (!sesion?.tokenAcceso)
    return { isOk: false as const };

  if (sesionVencida(sesion.expira)) {
    cerrarSesion();
    return { isOk: false as const };
  }

  return { isOk: true as const, data: sesion.usuario };
}

export function signOut() {
  // Vacía la caché de permisos en el servidor. No se espera la respuesta:
  // la sesión local se cierra de inmediato.
  solicitarApi('/api/administracion/autenticacion/cerrar-sesion', { method: 'POST' }).catch(() => { });
  cerrarSesion();
}

export interface PerfilUsuario {
  nombre: string;
  nombreUsuario: string;
  rol: string;
  esAdministrador: boolean;
}

/** El perfil de plataforma sale de la sesión: no hay endpoint de perfil en AdminDbContext. */
export async function obtenerPerfil(): Promise<{ isOk: boolean; data?: PerfilUsuario; message?: string }> {
  const sesion = leerSesion();
  if (!sesion)
    return { isOk: false, message: 'No hay sesión.' };

  return {
    isOk: true,
    data: {
      nombre: sesion.usuario.nombre,
      nombreUsuario: sesion.usuario.nombreUsuario,
      rol: sesion.usuario.rol,
      esAdministrador: sesion.usuario.esAdministrador,
    },
  };
}

export async function cambiarContrasena(_contrasenaActual: string, _contrasenaNueva: string) {
  return {
    isOk: false,
    message: 'El cambio de contraseña de la plataforma todavía no está disponible.',
  };
}

function aUsuario(sesion: SesionApi, nombreUsuario: string): User {
  return {
    nombre: sesion.nombre,
    nombreUsuario,
    rol: sesion.rol,
    esAdministrador: sesion.esAdministrador,
  };
}

function sesionVencida(expira: string): boolean {
  const momento = Date.parse(expira);
  if (Number.isNaN(momento))
    return true;
  return momento <= Date.now();
}

export async function createAccount(email: string, password: string) {
  console.log(email, password);
  return { isOk: false, message: 'El alta de usuarios la realiza el administrador de la plataforma.' };
}

export async function changePassword(email: string, recoveryCode?: string) {
  console.log(email, recoveryCode);
  return { isOk: false, message: 'El cambio de contraseña todavía no está disponible.' };
}

export async function resetPassword(email: string) {
  console.log(email);
  return { isOk: false, message: 'La recuperación de contraseña todavía no está disponible.' };
}
