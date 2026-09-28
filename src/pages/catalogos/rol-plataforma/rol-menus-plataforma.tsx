import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import TreeList, { Column, SearchPanel, Sorting } from 'devextreme-react/tree-list';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import type { FocusedRowChangedEvent } from 'devextreme/ui/tree_list';
import { obtenerArbolMenus, type NodoMenu } from '../../../api/menus';
import {
  agregarMenuAlRol,
  listarMenusDelRol,
  quitarMenuDelRol,
} from '../../../api/roles-menu-plataforma';
import { ComboMenuArbol } from '../../../components/combo-menu-arbol/ComboMenuArbol';
import type { RolMenuPlataformaNodo } from '../../../dtos/rol-menu-plataforma-nodo';

interface RolMenusPlataformaProps {
  rolId: number;
  puedeAsignar: boolean;
  puedeQuitar: boolean;
}

export function RolMenusPlataforma({ rolId, puedeAsignar, puedeQuitar }: RolMenusPlataformaProps) {
  const [arbol, setArbol] = useState<NodoMenu[]>([]);
  const [asignados, setAsignados] = useState<RolMenuPlataformaNodo[]>([]);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [fila, setFila] = useState<RolMenuPlataformaNodo>();
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [asignando, setAsignando] = useState(false);
  const [quitando, setQuitando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      setCargando(true);
      setErrorCarga('');
      try {
        const [catalogo, delRol] = await Promise.all([
          obtenerArbolMenus(),
          listarMenusDelRol(rolId),
        ]);
        if (!vigente)
          return;
        setArbol(catalogo);
        setAsignados(delRol);
        setFila(undefined);
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los menús del rol.';
        setErrorCarga(mensaje);
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    }

    if (rolId > 0)
      void cargar();

    return () => {
      vigente = false;
    };
  }, [rolId]);

  async function recargarAsignados() {
    const delRol = await listarMenusDelRol(rolId);
    setAsignados(delRol);
    setFila(undefined);
  }

  async function asignar() {
    if (!puedeAsignar || asignando)
      return;
    if (!menuId) {
      notify('Seleccione un menú.', 'warning', 2500);
      return;
    }

    setAsignando(true);
    try {
      await agregarMenuAlRol(rolId, menuId);
      setMenuId(null);
      await recargarAsignados();
      notify('Menú asignado.', 'success', 2000);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo asignar el menú.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setAsignando(false);
    }
  }

  async function quitar() {
    if (!puedeQuitar || !fila?.asignado || quitando)
      return;

    const aceptado = await confirm(`¿Quitar «${fila.nombre}» del rol?`, 'Quitar menú');
    if (!aceptado)
      return;

    setQuitando(true);
    try {
      await quitarMenuDelRol(rolId, fila.menuId);
      await recargarAsignados();
      notify('Menú quitado del rol.', 'success', 2000);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo quitar el menú del rol.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setQuitando(false);
    }
  }

  function alEnfocar(evento: FocusedRowChangedEvent<RolMenuPlataformaNodo, number>) {
    setFila(evento.row?.data);
  }

  const ocupado = cargando || asignando || quitando;

  return (
    <section className="rol-menus-plataforma" aria-label="Menús del rol">
      {(puedeAsignar || puedeQuitar) && (
        <div className="rol-menus-plataforma-acciones">
          {puedeAsignar && (
            <ComboMenuArbol
              etiqueta="Menú"
              arbol={arbol}
              valor={menuId}
              alCambiar={setMenuId}
              deshabilitado={ocupado}
            />
          )}
          {puedeAsignar && (
            <Button
              text="Asignar"
              icon="plus"
              type="default"
              stylingMode="contained"
              disabled={ocupado || !menuId}
              onClick={() => { void asignar(); }}
            />
          )}
          {puedeQuitar && (
            <Button
              text="Quitar"
              icon="trash"
              stylingMode="outlined"
              disabled={ocupado || !fila?.asignado}
              onClick={() => { void quitar(); }}
            />
          )}
        </div>
      )}
      {cargando && <p>Cargando menús…</p>}
      {!cargando && errorCarga && <p>{errorCarga}</p>}
      {!cargando && !errorCarga && (
      <TreeList<RolMenuPlataformaNodo, number>
        className="dx-card content-block rol-menus-arbol"
        dataSource={asignados}
        dataStructure="tree"
        itemsExpr="items"
        keyExpr="menuId"
        height={360}
        showBorders={false}
        focusedRowEnabled={true}
        autoExpandAll={true}
        columnAutoWidth={true}
        columnHidingEnabled={true}
        wordWrapEnabled={true}
        hoverStateEnabled={true}
        filterMode="withAncestors"
        expandNodesOnFiltering={true}
        noDataText="Este rol no tiene menús asignados."
        onFocusedRowChanged={alEnfocar}
      >
        <Sorting mode="none" />
        <SearchPanel visible={true} placeholder="Buscar menú" />
        <Column
          dataField="nombre"
          caption="Menú"
          cellRender={(celda) => {
            const nodo = celda.data as RolMenuPlataformaNodo;
            if (nodo.asignado)
              return nodo.nombre;
            return (
              <span
                className="rol-menu-carpeta"
                title="Carpeta del catálogo. No está asignada; agrupa menús del rol."
              >
                {nodo.nombre}
              </span>
            );
          }}
        />
      </TreeList>
      )}
    </section>
  );
}
