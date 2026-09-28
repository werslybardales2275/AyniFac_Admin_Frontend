import { useEffect, useRef, useState } from 'react';
import Button from 'devextreme-react/button';
import TreeList, { Column, SearchPanel, Sorting } from 'devextreme-react/tree-list';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import type { ContentReadyEvent, FocusedRowChangedEvent } from 'devextreme/ui/tree_list';
import type { NodoMenu } from '../../../api/menus';
import {
  agregarMenuAlModulo,
  listarMenusDelModulo,
  obtenerArbolMenusOperativos,
  quitarMenuDelModulo,
} from '../../../api/modulos-operativos-detalle';
import { ComboMenuArbol } from '../../../components/combo-menu-arbol/ComboMenuArbol';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import type { ModuloOperativoDetalleNodo } from '../../../dtos/modulo-operativo-detalle-nodo';
import { OBJETO_MODULO_OPERATIVO_DETALLE } from '../../../seguridad/objetos';
import './modulo-menus.scss';

interface DetallesModuloOperativoProps {
  moduloOperativoId: number;
}

/** El árbol a veces entrega el texto en value y el nodo en data. */
function textoMenu(nodo: ModuloOperativoDetalleNodo | undefined, valor: unknown): string {
  if (nodo?.nombre)
    return nodo.nombre;
  return typeof valor === 'string' ? valor : '';
}

/**
 * Menús del módulo, con la misma barra que el rol: combo, Asignar y Quitar.
 * El árbol muestra las carpetas que agrupan lo asignado. No hay edición.
 */
export function DetallesModuloOperativo({ moduloOperativoId }: DetallesModuloOperativoProps) {
  const permiso = usePermisoObjeto(OBJETO_MODULO_OPERATIVO_DETALLE);
  const puedeAsignar = permiso.escritura;
  const puedeQuitar = permiso.eliminacion;
  const [arbol, setArbol] = useState<NodoMenu[]>([]);
  const [asignados, setAsignados] = useState<ModuloOperativoDetalleNodo[]>([]);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [fila, setFila] = useState<ModuloOperativoDetalleNodo>();
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [asignando, setAsignando] = useState(false);
  const [quitando, setQuitando] = useState(false);
  const dimensionesListas = useRef(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      setCargando(true);
      setErrorCarga('');
      try {
        const [catalogo, delModulo] = await Promise.all([
          obtenerArbolMenusOperativos(moduloOperativoId),
          listarMenusDelModulo(moduloOperativoId),
        ]);
        if (!vigente)
          return;
        setArbol(catalogo);
        setAsignados(delModulo);
        setFila(undefined);
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los menús del módulo.';
        setErrorCarga(mensaje);
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    }

    if (moduloOperativoId > 0)
      void cargar();

    return () => {
      vigente = false;
    };
  }, [moduloOperativoId]);

  async function recargarAsignados() {
    const delModulo = await listarMenusDelModulo(moduloOperativoId);
    setAsignados(delModulo);
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
      await agregarMenuAlModulo(moduloOperativoId, menuId);
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

    const aceptado = await confirm(`¿Quitar «${fila.nombre}» del módulo?`, 'Quitar menú');
    if (!aceptado)
      return;

    setQuitando(true);
    try {
      await quitarMenuDelModulo(moduloOperativoId, fila.menuId);
      await recargarAsignados();
      notify('Menú quitado del módulo.', 'success', 2000);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo quitar el menú del módulo.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setQuitando(false);
    }
  }

  function alEnfocar(evento: FocusedRowChangedEvent<ModuloOperativoDetalleNodo, number>) {
    setFila(evento.row?.data);
  }

  function alListo(evento: ContentReadyEvent) {
    if (dimensionesListas.current)
      return;
    dimensionesListas.current = true;
    const componente = evento.component;
    requestAnimationFrame(() => componente.updateDimensions());
  }

  const ocupado = cargando || asignando || quitando;

  return (
    <section className="modulo-menus" aria-label="Menús del módulo">
      <h2>Menús del módulo</h2>
      {(puedeAsignar || puedeQuitar) && (
        <div className="modulo-menus-acciones">
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
        <TreeList<ModuloOperativoDetalleNodo, number>
          className="dx-card content-block modulo-menus-arbol"
          dataSource={asignados}
          dataStructure="tree"
          itemsExpr="items"
          keyExpr="menuId"
          height={360}
          width="100%"
          showBorders={false}
          focusedRowEnabled={true}
          autoExpandAll={true}
          wordWrapEnabled={false}
          hoverStateEnabled={true}
          filterMode="withAncestors"
          expandNodesOnFiltering={true}
          noDataText="Este módulo no tiene menús asignados."
          onContentReady={alListo}
          onFocusedRowChanged={alEnfocar}
        >
          <Sorting mode="none" />
          <SearchPanel visible={true} placeholder="Buscar menú" />
          <Column
            dataField="nombre"
            caption="Menú"
            width="100%"
            cellRender={(celda) => {
              const nodo = celda.data as ModuloOperativoDetalleNodo | undefined;
              const nombre = textoMenu(nodo, celda.value);
              if (nodo?.asignado === false) {
                return (
                  <span
                    className="modulo-menu-carpeta"
                    title="Carpeta del catálogo. No está asignada; agrupa menús del módulo."
                  >
                    {nombre}
                  </span>
                );
              }
              return <span>{nombre}</span>;
            }}
          />
        </TreeList>
      )}
    </section>
  );
}
