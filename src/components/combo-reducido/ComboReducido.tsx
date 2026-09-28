import SelectBox from 'devextreme-react/select-box';
import type { ObjetoGuidReducido, ObjetoReducido } from '../../dtos/objeto-reducido';

type Opcion = ObjetoReducido | ObjetoGuidReducido;

interface ComboReducidoProps<T extends Opcion> {
  etiqueta: string;
  valor: T['id'] | null;
  opciones: T[];
  alCambiar: (id: T['id'] | null) => void;
  deshabilitado?: boolean;
}

/**
 * Lista desplegable común de los combos.
 * Muestra valor y devuelve id, sea entero o Guid.
 */
export function ComboReducido<T extends Opcion>({
  etiqueta,
  valor,
  opciones,
  alCambiar,
  deshabilitado = false,
}: ComboReducidoProps<T>) {
  return (
    <SelectBox
      label={etiqueta || undefined}
      labelMode={etiqueta ? 'floating' : 'hidden'}
      dataSource={opciones}
      valueExpr="id"
      displayExpr="valor"
      value={valor}
      searchEnabled
      showClearButton
      disabled={deshabilitado}
      onValueChanged={(evento) => alCambiar(evento.value ?? null)}
    />
  );
}
