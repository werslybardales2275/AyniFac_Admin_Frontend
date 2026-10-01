import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DataGrid, {
  Column,
  Sorting,
} from 'devextreme-react/data-grid';
import Pagination from 'devextreme-react/pagination';
import TextBox from 'devextreme-react/text-box';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import type { FocusedRowChangedEvent } from 'devextreme/ui/data_grid';
import { leerMensajeError, solicitarApi } from '../../api/cliente-http';
import type { EsquemaDto } from '../../dtos/campo';
import type { ResultadoOperacion } from '../../dtos/resultado-operacion';
import './lista-catalogo.scss';

const TAMANO_PAGINA = 20;
const TAMANO_MAXIMO = 100;
const EVENTO_RECARGA = 'catalogo-recargar';

export function recargarCatalogo(ruta: string) {
  window.dispatchEvent(new CustomEvent(EVENTO_RECARGA, { detail: ruta }));
}

export interface ListaCatalogoProps<T extends object> {
  titulo: string;
  ruta: string;
  clave: keyof T & string;
  esquema: EsquemaDto<T>;
  onNuevo?: () => void;
  onAbrir?: (fila: T) => void;
  /** Si es false, Nuevo no se muestra. Por defecto se muestra. */
  puedeCrear?: boolean;
  /** Si es false, Eliminar no se muestra. Por defecto se muestra. */
  puedeEliminar?: boolean;
  /** Icono del botón Abrir. Por defecto abre como edición. */
  iconoAbrir?: string;
  /**
   * Muestra la columna de la clave.
   * La clave sustituta queda oculta. Un código de negocio, como el de SUNAT, se muestra.
   */
  mostrarClave?: boolean;
}

/**
 * El listado del backend trae una página y no el total.
 * Si la página viene llena, se anuncia una fila más para poder pedir la siguiente.
 */
function totalDePagina(pagina: number, tamano: number, cantidad: number): number {
  const inicio = (pagina - 1) * tamano;
  const hayOtra = cantidad === tamano;
  return inicio + cantidad + (hayOtra ? 1 : 0);
}

function tipoColumna(control: string): 'string' | 'number' | 'boolean' | 'date' {
  if (control === 'entero' || control === 'decimal')
    return 'number';
  if (control === 'booleano')
    return 'boolean';
  if (control === 'fecha')
    return 'date';
  return 'string';
}

export function ListaCatalogo<T extends object>({
  titulo,
  ruta,
  clave,
  esquema,
  onNuevo,
  onAbrir,
  puedeCrear = true,
  puedeEliminar = true,
  iconoAbrir = 'edit',
  mostrarClave = false,
}: ListaCatalogoProps<T>) {
  const [texto, setTexto] = useState('');
  const [criterio, setCriterio] = useState('');
  const [pagina, setPagina] = useState(1);
  const [tamano, setTamano] = useState(TAMANO_PAGINA);
  const [registros, setRegistros] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [fila, setFila] = useState<T>();
  const [eliminando, setEliminando] = useState(false);
  const [recarga, setRecarga] = useState(0);

  const columnas = (Object.keys(esquema) as (keyof T & string)[])
    .filter((campo) => (mostrarClave || campo !== clave) && esquema[campo].oculto !== true);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      const consulta = new URLSearchParams({
        pagina: String(pagina),
        tamanoPagina: String(tamano),
      });
      if (criterio)
        consulta.set('criterio', criterio);

      const respuesta = await solicitarApi(`${ruta}?${consulta.toString()}`);
      if (!vigente)
        return;
      if (!respuesta.ok) {
        notify(await leerMensajeError(respuesta, 'No se pudo cargar el listado.'), 'error', 3000);
        return;
      }

      const cuerpo = await respuesta.json() as ResultadoOperacion<T[]>;
      if (!vigente)
        return;
      if (!cuerpo.exito) {
        notify(cuerpo.mensaje || 'No se pudo cargar el listado.', 'error', 3000);
        return;
      }

      const datos = cuerpo.datos ?? [];
      setRegistros(datos);
      setTotal(totalDePagina(pagina, tamano, datos.length));
    }

    void cargar();
    return () => {
      vigente = false;
    };
  }, [ruta, criterio, pagina, tamano, recarga]);

  useEffect(() => {
    function alRecargar(evento: Event) {
      const detalle = (evento as CustomEvent<string>).detail;
      if (detalle === ruta)
        setRecarga((valor) => valor + 1);
    }

    window.addEventListener(EVENTO_RECARGA, alRecargar);
    return () => window.removeEventListener(EVENTO_RECARGA, alRecargar);
  }, [ruta]);

  function buscar() {
    const siguiente = texto.trim();
    setFila(undefined);
    setPagina(1);
    if (siguiente === criterio && pagina === 1)
      setRecarga((valor) => valor + 1);
    else
      setCriterio(siguiente);
  }

  function abrir() {
    if (!fila)
      return;
    if (onAbrir) {
      onAbrir(fila);
      return;
    }
    notify('El formulario de edición se conectará en el siguiente paso.', 'info', 2500);
  }

  function nuevo() {
    if (onNuevo) {
      onNuevo();
      return;
    }
    notify('El formulario de alta se conectará en el siguiente paso.', 'info', 2500);
  }

  async function eliminar() {
    if (!fila || eliminando)
      return;

    const id = fila[clave];
    const aceptado = await confirm('¿Eliminar el registro seleccionado?', 'Eliminar');
    if (!aceptado)
      return;

    setEliminando(true);
    try {
      const respuesta = await solicitarApi(`${ruta}/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
      if (!respuesta.ok) {
        notify(await leerMensajeError(respuesta, 'No se pudo eliminar el registro.'), 'error', 3000);
        return;
      }
      setFila(undefined);
      notify('Registro eliminado.', 'success', 2000);
      setRecarga((valor) => valor + 1);
    }
    finally {
      setEliminando(false);
    }
  }

  function alEnfocarFila(evento: FocusedRowChangedEvent) {
    setFila(evento.row?.data as T | undefined);
  }

  function alCambiarPagina(indice: number) {
    setFila(undefined);
    setPagina(indice + 1);
  }

  function alCambiarTamano(nuevoTamano: number) {
    setFila(undefined);
    setTamano(nuevoTamano);
    setPagina(1);
  }

  return (
    <>
      <h2>{titulo}</h2>
      <div className="lista-catalogo-barra">
        <TextBox
          className="lista-catalogo-busqueda"
          value={texto}
          placeholder="Buscar"
          valueChangeEvent="input"
          showClearButton={true}
          onValueChanged={(evento) => setTexto(evento.value ?? '')}
          onEnterKey={buscar}
        />
        <Button text="Buscar" icon="search" type="default" stylingMode="contained" onClick={buscar} />
        {puedeCrear && (
          <Button text="Nuevo" icon="plus" stylingMode="outlined" onClick={nuevo} />
        )}
        <Button text="Abrir" icon={iconoAbrir} stylingMode="outlined" disabled={!fila} onClick={abrir} />
        {puedeEliminar && (
          <Button text="Eliminar" icon="trash" stylingMode="outlined" disabled={!fila || eliminando} onClick={() => { void eliminar(); }} />
        )}
      </div>
      <DataGrid
        className="lista-catalogo-grilla dx-card"
        dataSource={registros}
        keyExpr={clave}
        showBorders={false}
        focusedRowEnabled={true}
        autoNavigateToFocusedRow={false}
        columnAutoWidth={true}
        columnHidingEnabled={true}
        onFocusedRowChanged={alEnfocarFila}
      >
        <Sorting mode="none" />
        {columnas.map((campo) => {
          const enumeracion = esquema[campo].control === 'enumeracion';
          return (
            <Column
              key={campo}
              dataField={enumeracion ? `${campo}.nombre` : campo}
              caption={esquema[campo].etiqueta}
              dataType={tipoColumna(esquema[campo].control)}
            />
          );
        })}
      </DataGrid>
      <Pagination
        className="lista-catalogo-paginacion"
        showPageSizeSelector={true}
        allowedPageSizes={[10, 20, 50, TAMANO_MAXIMO]}
        showInfo={true}
        showNavigationButtons={true}
        pageIndex={pagina - 1}
        pageSize={tamano}
        itemCount={total}
        onPageIndexChange={alCambiarPagina}
        onPageSizeChange={alCambiarTamano}
      />
    </>
  );
}
