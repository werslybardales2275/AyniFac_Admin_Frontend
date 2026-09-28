import { useEffect, useRef } from 'react';
import DropDownBox from 'devextreme-react/drop-down-box';
import type { DropDownBoxRef } from 'devextreme-react/drop-down-box';
import TreeList, { Column, SearchPanel, Sorting } from 'devextreme-react/tree-list';
import type { KeyDownEvent, RowClickEvent } from 'devextreme/ui/tree_list';
import type { NodoMenu } from '../../api/menus';
import './combo-menu-arbol.scss';

interface PlanoMenu {
  menuId: number;
  nombre: string;
}

interface ComboMenuArbolProps {
  etiqueta: string;
  arbol: NodoMenu[];
  valor: number | null;
  alCambiar: (menuId: number | null) => void;
  deshabilitado?: boolean;
}

/**
 * El SelectBox no admite un TreeList en el desplegable.
 * DropDownBox sí: el campo muestra el nombre y el contenido es el árbol de menús.
 */
export function ComboMenuArbol({
  etiqueta,
  arbol,
  valor,
  alCambiar,
  deshabilitado = false,
}: ComboMenuArbolProps) {
  const caja = useRef<DropDownBoxRef>(null);
  const arbolRef = useRef(arbol);
  const valorRef = useRef(valor);
  const alCambiarRef = useRef(alCambiar);

  useEffect(() => {
    arbolRef.current = arbol;
    valorRef.current = valor;
    alCambiarRef.current = alCambiar;
  });

  function elegir(menuId: number) {
    alCambiarRef.current(menuId);
    caja.current?.instance().close();
  }

  function alClickFila(evento: RowClickEvent<NodoMenu, number>) {
    if (evento.data)
      elegir(evento.data.menuId);
  }

  function alTecla(evento: KeyDownEvent) {
    if (evento.event?.key !== 'Enter')
      return;
    const destino = evento.event.target as HTMLElement | null;
    if (destino?.tagName === 'INPUT')
      return;

    const clave = evento.component.option('focusedRowKey') as number | null | undefined;
    if (clave == null)
      return;

    evento.event.preventDefault();
    elegir(clave);
  }

  return (
    <div className="combo-menu-arbol">
      <DropDownBox
        ref={caja}
        label={etiqueta || undefined}
        labelMode={etiqueta ? 'floating' : 'hidden'}
        value={valor}
        valueExpr="menuId"
        displayExpr="nombre"
        dataSource={aplanar(arbol)}
        placeholder="Seleccione un menú"
        showClearButton={true}
        disabled={deshabilitado}
        dropDownOptions={{ width: 440 }}
        onValueChanged={(evento) => {
          const siguiente = (evento.value ?? null) as number | null;
          if (siguiente === valorRef.current)
            return;
          alCambiarRef.current(siguiente);
        }}
        contentRender={() => (
          <TreeList<NodoMenu, number>
            className="combo-menu-arbol-lista"
            dataSource={arbolRef.current}
            dataStructure="tree"
            itemsExpr="items"
            keyExpr="menuId"
            height={300}
            showBorders={false}
            focusedRowEnabled={true}
            focusedRowKey={valorRef.current ?? undefined}
            autoExpandAll={true}
            columnAutoWidth={true}
            wordWrapEnabled={false}
            hoverStateEnabled={true}
            noDataText="No hay menús."
            onRowClick={alClickFila}
            onKeyDown={alTecla}
          >
            <Sorting mode="none" />
            <SearchPanel visible={true} placeholder="Buscar menú" />
            <Column dataField="nombre" caption="Menú" />
          </TreeList>
        )}
      />
    </div>
  );
}

function aplanar(nodos: NodoMenu[]): PlanoMenu[] {
  const planos: PlanoMenu[] = [];

  function visitar(lista: NodoMenu[]) {
    for (const nodo of lista) {
      planos.push({ menuId: nodo.menuId, nombre: nodo.nombre });
      if (nodo.items?.length)
        visitar(nodo.items);
    }
  }

  visitar(nodos);
  return planos;
}
