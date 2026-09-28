import type { User } from '../types';

const CLAVE_USUARIO_RECORDADO = 'aynifac_admin.nombreUsuario';
const CLAVE_SESION = 'aynifac_admin.sesion';

export interface SesionGuardada {
  tokenAcceso: string;
  expira: string;
  usuario: User;
}

export function leerNombreUsuarioRecordado(): string {
  return localStorage.getItem(CLAVE_USUARIO_RECORDADO) ?? '';
}

export function guardarNombreUsuarioRecordado(nombreUsuario: string): void {
  const valor = nombreUsuario.trim();
  if (valor)
    localStorage.setItem(CLAVE_USUARIO_RECORDADO, valor);
}

export function leerSesion(): SesionGuardada | undefined {
  const crudo = localStorage.getItem(CLAVE_SESION);
  if (!crudo)
    return undefined;

  try {
    const sesion = JSON.parse(crudo) as SesionGuardada;
    if (!sesion.tokenAcceso || !sesion.usuario?.nombreUsuario) {
      localStorage.removeItem(CLAVE_SESION);
      return undefined;
    }
    return sesion;
  }
  catch {
    localStorage.removeItem(CLAVE_SESION);
    return undefined;
  }
}

export function guardarSesion(sesion: SesionGuardada): void {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

/** Cierra la sesión y conserva el usuario para el próximo ingreso. */
export function cerrarSesion(): void {
  localStorage.removeItem(CLAVE_SESION);
}
