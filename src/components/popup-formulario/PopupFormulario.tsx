import { Children, isValidElement, useCallback, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Popup from 'devextreme-react/popup';
import type { ToolbarItem as ElementoBarra } from 'devextreme/ui/popup';
import './popup-formulario.scss';

/** DevExtreme trata como móvil el ancho menor a 768 px (xs). */
const consultaMovil = '(max-width: 767.98px)';

function anchoDelPopup(): '95%' | '70%' {
  return window.matchMedia(consultaMovil).matches ? '95%' : '70%';
}

function esAcciones(nodo: ReactNode): nodo is ReactElement<{ children: ReactNode }> {
  return isValidElement(nodo) && nodo.type === AccionesFormulario;
}

/**
 * Popup de alta del catálogo.
 * Ocupa el 70 % del ancho en escritorio y el 95 % en móvil.
 * Se puede arrastrar y reparte los campos en dos columnas.
 */
export function PopupFormulario({
  visible,
  titulo,
  guardando = false,
  alCerrar,
  children,
}: {
  visible: boolean;
  titulo: string;
  guardando?: boolean;
  alCerrar: () => void;
  children: ReactNode;
}) {
  const [ancho, setAncho] = useState(anchoDelPopup);
  const nodos = Children.toArray(children);
  const acciones = nodos.filter(esAcciones);
  const campos = nodos.filter((nodo) => !esAcciones(nodo));
  const accionesRef = useRef(acciones);
  const raizRef = useRef<Root | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const pintarAcciones = useCallback(() => {
    raizRef.current?.render(
      <>
        {accionesRef.current.map((accion) => accion.props.children)}
      </>,
    );
  }, []);

  const plantillaPie = useCallback(() => {
    let host = hostRef.current;
    if (!host) {
      host = document.createElement('div');
      host.className = 'popup-formulario-acciones';
      hostRef.current = host;
      raizRef.current = createRoot(host);
    }

    pintarAcciones();
    return host;
  }, [pintarAcciones]);

  const barraInferior = useMemo<ElementoBarra[]>(() => (
    acciones.length === 0
      ? []
      : [{ toolbar: 'bottom', location: 'after', template: plantillaPie }]
  ), [acciones.length, plantillaPie]);

  useEffect(() => {
    accionesRef.current = acciones;
    pintarAcciones();
  });

  useEffect(() => () => {
    raizRef.current?.unmount();
    raizRef.current = null;
    hostRef.current = null;
  }, []);

  useEffect(() => {
    const media = window.matchMedia(consultaMovil);
    const alCambiar = () => setAncho(media.matches ? '95%' : '70%');
    media.addEventListener('change', alCambiar);
    return () => media.removeEventListener('change', alCambiar);
  }, []);

  return (
    <Popup
      visible={visible}
      title={titulo}
      width={ancho}
      height="auto"
      maxHeight="90vh"
      showCloseButton={!guardando}
      dragEnabled
      hideOnOutsideClick={false}
      wrapperAttr={{ class: 'popup-formulario' }}
      toolbarItems={barraInferior}
      onHiding={alCerrar}
    >
      <RejillaCampos>{campos}</RejillaCampos>
    </Popup>
  );
}

/**
 * Dos columnas en escritorio y una en móvil, sin el Form de DevExtreme.
 * Así el editor sigue montado mientras se escribe.
 */
export function RejillaCampos({ children }: { children: ReactNode }) {
  return <div className="rejilla-campos">{children}</div>;
}

/**
 * Marca los botones del alta.
 * El popup los coloca en la barra inferior, fuera de la grilla de campos.
 */
export function AccionesFormulario({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
