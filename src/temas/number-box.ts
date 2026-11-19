const CLASE_ENTRADA = 'dx-texteditor-input';
const CLASE_NUMBERBOX = 'dx-numberbox';

/**
 * El NumberBox suma o resta el paso cuando la rueda gira sobre el campo
 * enfocado. No hay opción pública para apagarlo: DevExtreme escucha 'wheel'
 * sobre el propio input, y en el destino del evento los listeners corren en
 * orden de registro — ni siquiera en captura se le puede ganar. Por eso el
 * corte va en captura desde un ancestro (document): el evento nunca baja al
 * input y 'dxmousewheel' no se dispara. Sin preventDefault la página sigue
 * desplazándose.
 */
document.addEventListener('wheel', (evento) => {
  const destino = evento.target;
  if (destino instanceof HTMLInputElement
    && destino.classList.contains(CLASE_ENTRADA)
    && destino.closest(`.${CLASE_NUMBERBOX}`))
    evento.stopPropagation();
}, true);
