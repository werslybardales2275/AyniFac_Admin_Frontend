/**
 * DevExtreme re-renderiza la fila al enfocarla con el puntero (focusedRowEnabled):
 * el elemento que recibió pointerdown queda desconectado del documento y el
 * navegador no dispara el click del pointerup. Por eso el primer clic en una
 * fila no abría el registro y hacía falta pulsar una segunda vez.
 *
 * Este parche re-emite el click perdido: solo cuando el objetivo del
 * pointerdown ya no está en el DOM, solo dentro de una fila de datos de la
 * grilla y con el recorrido corto de un clic (arrastrar para seleccionar
 * texto sigue sin abrir el registro).
 */
const DISTANCIA_CLIC = 6;

interface Presion {
  elemento: Element;
  indice: number;
  x: number;
  y: number;
}

let presion: Presion | null = null;

function filaDe(elemento: EventTarget | null): HTMLElement | null {
  return (elemento as Element | null)?.closest?.('tr.dx-data-row') ?? null;
}

function indiceDe(fila: HTMLElement): number {
  const cuerpo = fila.parentElement;
  if (!cuerpo)
    return -1;
  return Array.prototype.indexOf.call(cuerpo.querySelectorAll(':scope > tr.dx-data-row'), fila);
}

document.addEventListener('pointerdown', (evento) => {
  if (evento.button !== 0) {
    presion = null;
    return;
  }
  const elemento = evento.target as Element | null;
  const fila = filaDe(elemento);
  presion = elemento && fila
    ? { elemento, indice: indiceDe(fila), x: evento.clientX, y: evento.clientY }
    : null;
}, true);

document.addEventListener('pointerup', (evento) => {
  const origen = presion;
  presion = null;
  if (!origen || evento.button !== 0 || origen.elemento.isConnected)
    return;

  const destino = evento.target as Element | null;
  const fila = filaDe(destino);
  if (!fila || indiceDe(fila) !== origen.indice)
    return;
  if (Math.hypot(evento.clientX - origen.x, evento.clientY - origen.y) > DISTANCIA_CLIC)
    return;

  destino?.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window,
    clientX: evento.clientX,
    clientY: evento.clientY,
    ctrlKey: evento.ctrlKey,
    shiftKey: evento.shiftKey,
    altKey: evento.altKey,
    metaKey: evento.metaKey,
    detail: 1,
  }));
}, true);

document.addEventListener('pointercancel', () => {
  presion = null;
}, true);
