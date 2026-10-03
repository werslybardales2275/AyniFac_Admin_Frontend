import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import CheckBox from 'devextreme-react/check-box';
import DataGrid, { Column, Pager, Paging, SearchPanel, Sorting } from 'devextreme-react/data-grid';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import type { FocusedRowChangedEvent, RowClickEvent } from 'devextreme/ui/data_grid';
import {
  agregarObjetoAlRol,
  listarObjetosAdmin,
  listarObjetosDelRol,
  modificarObjetoDelRol,
  quitarObjetoDelRol,
} from '../../../api/roles-objeto-plataforma';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import type { ObjetoReducido } from '../../../dtos/objeto-reducido';
import type { RolObjetoPlataformaListadoDto } from '../../../dtos/rol-objeto-plataforma-listado-dto';

interface RolObjetosPlataformaProps {
  rolId: number;
  puedeAsignar: boolean;
  puedeQuitar: boolean;
}

const permisosVacios = {
  permisoLectura: true,
  permisoEscritura: false,
  permisoEliminacion: false,
};

export function RolObjetosPlataforma({ rolId, puedeAsignar, puedeQuitar }: RolObjetosPlataformaProps) {
  const [catalogo, setCatalogo] = useState<ObjetoReducido[]>([]);
  const [filas, setFilas] = useState<RolObjetoPlataformaListadoDto[]>([]);
  const [fila, setFila] = useState<RolObjetoPlataformaListadoDto>();
  const [objetoId, setObjetoId] = useState<number | null>(null);
  const [permisos, setPermisos] = useState(permisosVacios);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [quitando, setQuitando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      setCargando(true);
      setErrorCarga('');
      try {
        const [tipos, delRol] = await Promise.all([
          listarObjetosAdmin(),
          listarObjetosDelRol(rolId),
        ]);
        if (!vigente)
          return;
        setCatalogo(tipos);
        setFilas(delRol);
        setFila(undefined);
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los objetos del rol.';
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

  async function recargar() {
    const delRol = await listarObjetosDelRol(rolId);
    setFilas(delRol);
    setFila(undefined);
  }

  function limpiarFormulario() {
    setEditandoId(null);
    setObjetoId(null);
    setPermisos(permisosVacios);
  }

  function cargarEdicion(registro: RolObjetoPlataformaListadoDto) {
    if (!puedeAsignar)
      return;
    setEditandoId(registro.rolObjetoId);
    setObjetoId(registro.objetoId);
    setPermisos({
      permisoLectura: registro.permisoLectura,
      permisoEscritura: registro.permisoEscritura,
      permisoEliminacion: registro.permisoEliminacion,
    });
  }

  function editar() {
    if (fila)
      cargarEdicion(fila);
  }

  async function asignar() {
    if (!puedeAsignar || guardando || editandoId)
      return;
    if (!objetoId) {
      notify('Seleccione un objeto.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarObjetoAlRol(rolId, { objetoId, ...permisos, permisoLectura: true });
      limpiarFormulario();
      await recargar();
      notify('Objeto asignado.', 'success', 2000);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo asignar el objeto.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  async function guardar() {
    if (!puedeAsignar || guardando || !editandoId || !objetoId)
      return;

    const actual = filas.find((item) => item.rolObjetoId === editandoId);
    if (!actual)
      return;

    setGuardando(true);
    try {
      await modificarObjetoDelRol(rolId, actual, { objetoId: actual.objetoId, ...permisos });
      limpiarFormulario();
      await recargar();
      notify('Permisos guardados.', 'success', 2000);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el objeto del rol.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  async function quitar() {
    if (!puedeQuitar || !fila || quitando)
      return;

    const aceptado = await confirm(`¿Quitar «${fila.objetoNombre}» del rol?`, 'Quitar objeto');
    if (!aceptado)
      return;

    setQuitando(true);
    try {
      await quitarObjetoDelRol(rolId, fila.rolObjetoId);
      if (editandoId === fila.rolObjetoId)
        limpiarFormulario();
      await recargar();
      notify('Objeto quitado del rol.', 'success', 2000);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo quitar el objeto del rol.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setQuitando(false);
    }
  }

  function alEnfocar(evento: FocusedRowChangedEvent<RolObjetoPlataformaListadoDto, string>) {
    setFila(evento.row?.data);
  }

  function alClicFila(evento: RowClickEvent<RolObjetoPlataformaListadoDto, string>) {
    if (evento.data)
      cargarEdicion(evento.data);
  }

  function marcar(campo: keyof typeof permisosVacios, valor: boolean | null | undefined) {
    const activo = valor ?? false;
    setPermisos((actual) => {
      const siguiente = { ...actual, [campo]: activo };
      if ((campo === 'permisoEscritura' || campo === 'permisoEliminacion') && activo)
        siguiente.permisoLectura = true;
      if (campo === 'permisoLectura' && !activo) {
        siguiente.permisoEscritura = false;
        siguiente.permisoEliminacion = false;
      }
      return siguiente;
    });
  }

  const ocupado = cargando || guardando || quitando;
  const enEdicion = editandoId !== null;
  const opciones = enEdicion
    ? catalogo
    : catalogo.filter((opcion) => !filas.some((item) => item.objetoId === opcion.id));

  return (
    <section className="rol-objetos-plataforma" aria-label="Objetos del rol">
      {(puedeAsignar || puedeQuitar) && (
        <>
          {puedeAsignar && (
            <div className="rol-objetos-plataforma-datos">
              <div className="rol-objetos-combo">
                <ComboReducido
                  etiqueta="Objeto"
                  valor={objetoId}
                  opciones={opciones}
                  alCambiar={setObjetoId}
                  deshabilitado={ocupado || enEdicion}
                />
              </div>
              <div className="rol-objetos-permisos">
                <CheckBox
                  text="Lectura"
                  value={enEdicion ? permisos.permisoLectura : true}
                  disabled={ocupado || !enEdicion}
                  hint={enEdicion
                    ? 'Quitar la lectura también quita escritura y eliminación.'
                    : 'Asignar el objeto concede la lectura.'}
                  onValueChanged={(evento) => marcar('permisoLectura', evento.value)}
                />
                <CheckBox
                  text="Escritura"
                  value={permisos.permisoEscritura}
                  disabled={ocupado}
                  onValueChanged={(evento) => marcar('permisoEscritura', evento.value)}
                />
                <CheckBox
                  text="Eliminación"
                  value={permisos.permisoEliminacion}
                  disabled={ocupado}
                  onValueChanged={(evento) => marcar('permisoEliminacion', evento.value)}
                />
              </div>
            </div>
          )}
          <div className="rol-objetos-plataforma-acciones">
            {puedeAsignar && !enEdicion && (
              <Button
                text="Asignar"
                icon="plus"
                type="default"
                stylingMode="contained"
                disabled={ocupado || !objetoId}
                onClick={() => { void asignar(); }}
              />
            )}
            {puedeAsignar && !enEdicion && (
              <Button
                text="Editar"
                icon="edit"
                stylingMode="outlined"
                disabled={ocupado || !fila}
                onClick={editar}
              />
            )}
            {puedeAsignar && enEdicion && (
              <Button
                text="Guardar"
                icon="save"
                type="default"
                stylingMode="contained"
                disabled={ocupado}
                onClick={() => { void guardar(); }}
              />
            )}
            {puedeAsignar && enEdicion && (
              <Button
                text="Cancelar"
                stylingMode="outlined"
                disabled={ocupado}
                onClick={limpiarFormulario}
              />
            )}
            {puedeQuitar && (
              <Button
                text="Quitar"
                icon="trash"
                stylingMode="outlined"
                disabled={ocupado || !fila}
                onClick={() => { void quitar(); }}
              />
            )}
          </div>
        </>
      )}
      {cargando && <p>Cargando objetos…</p>}
      {!cargando && errorCarga && <p>{errorCarga}</p>}
      {!cargando && !errorCarga && (
        <DataGrid
          className="dx-card content-block"
          dataSource={filas}
          keyExpr="rolObjetoId"
          height={360}
          showBorders={false}
          focusedRowEnabled={true}
          columnAutoWidth={true}
          columnHidingEnabled={true}
          wordWrapEnabled={true}
          hoverStateEnabled={true}
          noDataText="Este rol no tiene objetos asignados."
          onFocusedRowChanged={alEnfocar}
          onRowClick={alClicFila}
        >
          <Sorting mode="single" />
          <Paging defaultPageSize={20} />
          <Pager
            visible={true}
            showInfo={true}
            showPageSizeSelector={true}
            allowedPageSizes={[10, 20, 50, 100]}
          />
          <SearchPanel visible={true} placeholder="Buscar objeto" />
          <Column dataField="objetoNombre" caption="Objeto" />
          <Column dataField="permisoLectura" caption="Lectura" dataType="boolean" />
          <Column dataField="permisoEscritura" caption="Escritura" dataType="boolean" />
          <Column dataField="permisoEliminacion" caption="Eliminación" dataType="boolean" />
        </DataGrid>
      )}
    </section>
  );
}
