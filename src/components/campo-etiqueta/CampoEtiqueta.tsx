import type { ReactNode } from 'react';
import CheckBox from 'devextreme-react/check-box';
import NumberBox from 'devextreme-react/number-box';
import TextBox from 'devextreme-react/text-box';
import './campo-etiqueta.scss';

/** Etiqueta encima del editor, fuera del control, para que escribir no la mueva. */
export function CampoEtiqueta({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="rejilla-campo">
      <span className="rejilla-etiqueta">{etiqueta}</span>
      {children}
    </div>
  );
}

export function TextoCampo({
  etiqueta,
  valor,
  longitudMaxima,
  deshabilitado,
  soloLectura,
  alCambiar,
}: {
  etiqueta: string;
  valor: string;
  longitudMaxima?: number;
  deshabilitado?: boolean;
  soloLectura?: boolean;
  alCambiar: (valor: string) => void;
}) {
  return (
    <CampoEtiqueta etiqueta={etiqueta}>
      <TextBox
        labelMode="hidden"
        value={valor}
        maxLength={longitudMaxima}
        valueChangeEvent="input"
        readOnly={soloLectura}
        disabled={deshabilitado}
        onValueChanged={(evento) => {
          if (!soloLectura)
            alCambiar(evento.value ?? '');
        }}
      />
    </CampoEtiqueta>
  );
}

export function BooleanoCampo({
  etiqueta,
  valor,
  deshabilitado,
  soloLectura,
  alCambiar,
}: {
  etiqueta: string;
  valor: boolean;
  deshabilitado?: boolean;
  soloLectura?: boolean;
  alCambiar: (valor: boolean) => void;
}) {
  return (
    <CampoEtiqueta etiqueta={etiqueta}>
      <CheckBox
        value={valor}
        readOnly={soloLectura}
        disabled={deshabilitado}
        elementAttr={{ 'aria-label': etiqueta }}
        onValueChanged={(evento) => {
          if (!soloLectura)
            alCambiar(evento.value === true);
        }}
      />
    </CampoEtiqueta>
  );
}

/** Decimal acotado: admite cero y rechaza negativos, con la escala de la columna. */
export function DecimalCampo({
  etiqueta,
  valor,
  precision,
  escala,
  deshabilitado,
  soloLectura,
  alCambiar,
}: {
  etiqueta: string;
  valor: number;
  precision: number;
  escala: number;
  deshabilitado?: boolean;
  soloLectura?: boolean;
  alCambiar: (valor: number) => void;
}) {
  const enteros = Math.max(precision - escala, 1);
  const maximo = Number(`${'9'.repeat(enteros)}.${escala > 0 ? '9'.repeat(escala) : '0'}`);
  const formato = escala > 0 ? `#,##0.${'0'.repeat(escala)}` : '#,##0';
  const paso = escala > 0 ? Number(`0.${'0'.repeat(escala - 1)}1`) : 1;

  return (
    <CampoEtiqueta etiqueta={etiqueta}>
      <NumberBox
        labelMode="hidden"
        value={valor}
        min={0}
        max={maximo}
        format={formato}
        step={paso}
        readOnly={soloLectura}
        disabled={deshabilitado}
        onValueChanged={(evento) => {
          if (!soloLectura)
            alCambiar(typeof evento.value === 'number' ? evento.value : 0);
        }}
      />
    </CampoEtiqueta>
  );
}
