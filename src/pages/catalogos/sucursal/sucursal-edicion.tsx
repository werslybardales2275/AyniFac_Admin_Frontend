import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarSucursal, obtenerSucursal, rutaSucursales } from '../../../api/sucursales';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { FormularioCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { prepararSucursal, sucursalDtoEsquema, sucursalVacia, type SucursalDto } from '../../../dtos/sucursal-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUCURSAL } from '../../../seguridad/objetos';
import { camposSucursal } from './sucursal-campos';
import './sucursal.scss';

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function idsDe(path: string): { inquilinoId: string; sucursalId: number } {
  const coincidencia = /\/inquilino\/([0-9a-fA-F-]{36})\/sucursal\/(\d+)$/.exec(path);
  return {
    inquilinoId: coincidencia?.[1] ?? '',
    sucursalId: coincidencia ? Number(coincidencia[2]) : 0,
  };
}

export function SucursalEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_SUCURSAL);
  const { inquilinoId, sucursalId } = idsDe(ruta);
  const [sucursal, setSucursal] = useState<SucursalDto>(() => sucursalVacia(inquilinoId));
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const cargada = await obtenerSucursal(inquilinoId, sucursalId);
        if (!vigente)
          return;
        setSucursal(cargada);
        renombrarDocumento(ruta, textoValorPorDefecto(cargada, sucursalDtoEsquema));
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir la sucursal.';
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    }

    if (inquilinoId && sucursalId > 0)
      void cargar();
    else
      setCargando(false);

    return () => {
      vigente = false;
    };
  }, [inquilinoId, sucursalId, ruta, renombrarDocumento]);

  function cambiar(siguiente: SucursalDto) {
    setSucursal(siguiente);
  }

  function cerrar() {
    cerrarDocumento(ruta);
  }

  async function guardar(cerrarAlTerminar: boolean) {
    if (!permiso.escritura || guardando)
      return;

    const preparada = prepararSucursal(sucursal);
    if (preparada.error) {
      notify(preparada.error, 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      const guardada = await modificarSucursal(inquilinoId, { ...preparada.sucursal, sucursalId, inquilinoId });
      setSucursal(guardada);
      renombrarDocumento(ruta, textoValorPorDefecto(guardada, sucursalDtoEsquema));
      recargarCatalogo(rutaSucursales(inquilinoId));
      notify('Sucursal guardada.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la sucursal.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  function alElegirAccion(evento: ItemClickEvent) {
    const accion = evento.itemData as AccionGuardar | undefined;
    void guardar(accion?.id === 'guardar-cerrar');
  }

  const bloqueado = cargando || guardando;
  const titulo = textoValorPorDefecto(sucursal, sucursalDtoEsquema);

  return (
    <div className="sucursal-edicion ficha-detalle">
      <h2>{titulo || 'Sucursal'}</h2>
      <div className="sucursal-edicion-acciones">
        {!editando && permiso.escritura && (
          <Button
            text="Editar"
            icon="edit"
            type="default"
            stylingMode="contained"
            disabled={cargando}
            onClick={() => setEditando(true)}
          />
        )}
        {editando && (
          <DropDownButton
            text="Guardar"
            icon="save"
            type="default"
            stylingMode="contained"
            splitButton={true}
            displayExpr="text"
            keyExpr="id"
            items={accionesGuardar}
            disabled={bloqueado || !permiso.escritura}
            onButtonClick={() => { void guardar(false); }}
            onItemClick={alElegirAccion}
          />
        )}
        <Button text="Cerrar" stylingMode="outlined" disabled={guardando} onClick={cerrar} />
      </div>
      {cargando && <p>Cargando sucursal…</p>}
      <FormularioCampos>
        {camposSucursal(sucursal, { soloLectura: !editando, bloqueado, alCambiar: cambiar })}
      </FormularioCampos>
    </div>
  );
}
