import { Children, cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Form, { Item } from 'devextreme-react/form';
import Popup from 'devextreme-react/popup';
import type { ToolbarItem as ElementoBarra } from 'devextreme/ui/popup';
import './popup-formulario.scss';

/** DevExtreme trata como móvil el ancho menor a 768 px (xs). */
const columnasPorPantalla = { xs: 1, sm: 2, md: 2, lg: 2 };
const consultaMovil = '(max-width: 767.98px)';

function anchoDelPopup(): '95%' | '70%' {
  return window.matchMedia(consultaMovil).matches ? '95%' : '70%';
}

function esAcciones(nodo: ReactNode): nodo is ReactElement<{ children: ReactNode }> {
  return isValidElement(nodo) && nodo.type === AccionesFormulario;
}


/**
 * Ficha de la entidad con el Form de DevExtreme.
 * La etiqueta va encima del editor (`labelLocation="top"`), como en el formulario del tema Fluent.
 * Reparte los campos en dos columnas. Por debajo de 768 px queda una sola.
 */
export function FormularioCampos({ children }: { children: ReactNode }) {
  return (
    <div className="formulario-campos">
      <Form
        colCount={2}
        colCountByScreen={columnasPorPantalla}
        labelLocation="top"
        labelMode="outside"
      >
        {children}
      </Form>
    </div>
  );
}

/**
 * Popup de alta del catálogo.
 * Ocupa el 70 % del ancho en escritorio y el 95 % en móvil.
 * Se puede arrastrar y reparte los campos con Form.
 */
export function PopupFormulario({
  visible,
  titulo,
  guardando = false,
  rejilla = false,
  alCerrar,
  children,
}: {
  visible: boolean;
  titulo: string;
  guardando?: boolean;
  /** Rejilla de React. El Form de DevExtreme recrea el editor y suelta el enfoque al escribir. */
  rejilla?: boolean;
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
  accionesRef.current = acciones;

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
      {rejilla ? <RejillaCampos>{campos}</RejillaCampos> : <FormularioCampos>{campos}</FormularioCampos>}
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

function textoEtiqueta(props: Record<string, unknown>): string {
  if (typeof props.etiqueta === 'string' && props.etiqueta)
    return props.etiqueta;
  if (typeof props.label === 'string' && props.label)
    return props.label;
  if (typeof props.text === 'string' && props.text)
    return props.text;
  return '';
}

/**
 * Un ítem del Form. La etiqueta la pinta DevExtreme encima del editor.
 * El control hijo no lleva la suya, para no duplicarla.
 */
export function CampoFormulario({ children }: { children: ReactNode }) {
  const hijo = Children.toArray(children).find(isValidElement);
  if (!hijo)
    return <Item render={() => children} />;

  const props = hijo.props as Record<string, unknown>;
  const etiqueta = textoEtiqueta(props);
  const editor = cloneElement(hijo as ReactElement<Record<string, unknown>>, {
    ...('label' in props || 'labelMode' in props ? { label: '', labelMode: 'hidden' } : {}),
    ...('etiqueta' in props ? { etiqueta: '' } : {}),
    ...('text' in props && !('label' in props) && !('etiqueta' in props) ? { text: '' } : {}),
  });

  return (
    <Item
      label={{ text: etiqueta }}
      render={() => editor}
    />
  );
}

/**
 * Marca los botones del alta.
 * El popup los coloca en la barra inferior, fuera de la grilla de campos.
 */
export function AccionesFormulario({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
