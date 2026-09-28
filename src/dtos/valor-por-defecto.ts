import type { EsquemaDto } from './campo';

/** Propiedades del DTO marcadas con valorPorDefecto, en el orden del título. */
export function camposValorPorDefecto<T extends object>(
  esquema: EsquemaDto<T>,
): (keyof T & string)[] {
  const campos = (Object.keys(esquema) as (keyof T & string)[])
    .filter((campo) => esquema[campo].valorPorDefecto === true);

  return campos.sort((a, b) => {
    const ordenA = esquema[a].ordenValorPorDefecto ?? 0;
    const ordenB = esquema[b].ordenValorPorDefecto ?? 0;
    return ordenA - ordenB;
  });
}

function textoDe(valor: unknown): string {
  if (typeof valor === 'string')
    return valor.trim();
  if (typeof valor === 'number' || typeof valor === 'boolean')
    return String(valor);
  return '';
}

/**
 * Texto visible de la fila: título de la pestaña y encabezado de la ficha.
 * Une las propiedades con valorPorDefecto. ToDto llena cada una,
 * también cuando el dato viene de otra tabla.
 */
export function textoValorPorDefecto<T extends object>(fila: T, esquema: EsquemaDto<T>): string {
  return camposValorPorDefecto(esquema)
    .map((campo) => textoDe(fila[campo]))
    .filter((texto) => texto.length > 0)
    .join(' ');
}

/** Campos de la ficha. La clave (el id) no se muestra ni se edita. */
export function camposDeFicha<T extends object>(
  esquema: EsquemaDto<T>,
  clave: keyof T & string,
): (keyof T & string)[] {
  return (Object.keys(esquema) as (keyof T & string)[])
    .filter((campo) => campo !== clave && esquema[campo].oculto !== true);
}
