import NumberBox from 'devextreme/ui/number_box';

const MARCA_RUEDA = 'data-rueda-importe';

/**
 * El NumberBox suma o resta el paso cuando la rueda gira sobre el campo
 * enfocado. No hay opción pública para apagarlo: el listener nativo va en
 * burbuja, y este, en captura, lo corta antes de que cambie el valor.
 * Sin preventDefault la página sigue desplazándose.
 */
function desactivarRueda(raiz: HTMLElement) {
  const entrada = raiz.querySelector('input.dx-texteditor-input');
  if (!(entrada instanceof HTMLInputElement) || entrada.hasAttribute(MARCA_RUEDA))
    return;

  entrada.setAttribute(MARCA_RUEDA, '');
  entrada.addEventListener('wheel', (evento) => {
    evento.stopImmediatePropagation();
  }, true);
}

NumberBox.defaultOptions({
  options: {
    onContentReady(evento) {
      if (evento.element instanceof HTMLElement)
        desactivarRueda(evento.element);
    },
  },
});
