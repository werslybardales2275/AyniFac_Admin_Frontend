import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { opcionesDeModuloOperativo } from '../../../api/modulos-operativos';
import {
  modificarModuloInquilino,
  obtenerModuloInquilino,
  rutaModulosInquilino,
} from '../../../api/inquilinos-modulos-operativos';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { FormularioCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import {
  asignacionVacia,
  inquilinoModuloOperativoDtoEsquema,
  prepararAsignacion,
  type InquilinoModuloOperativoDto,
} from '../../../dtos/inquilino-modulo-operativo-dto';
import type { ObjetoReducido } from '../../../dtos/objeto-reducido';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_INQUILINO_MODULO_OPERATIVO } from '../../../seguridad/objetos';
import { camposModuloInquilino } from './inquilino-modulo-operativo-campos';
import './inquilino-modulo-operativo.scss';

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function idsDe(path: string): { inquilinoId: string; inquilinoModuloOperativoId: number } {
  const coincidencia = /\/inquilino\/([0-9a-fA-F-]{36})\/modulo-operativo\/(\d+)$/.exec(path);
  return {
    inquilinoId: coincidencia?.[1] ?? '',
    inquilinoModuloOperativoId: coincidencia ? Number(coincidencia[2]) : 0,
  };
}

export function InquilinoModuloOperativoEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_INQUILINO_MODULO_OPERATIVO);
  const { inquilinoId, inquilinoModuloOperativoId } = idsDe(ruta);
  const [asignacion, setAsignacion] = useState<InquilinoModuloOperativoDto>(() => asignacionVacia(inquilinoId));
  const [modulos, setModulos] = useState<ObjetoReducido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const cargada = await obtenerModuloInquilino(inquilinoId, inquilinoModuloOperativoId);
        if (!vigente)
          return;
        setAsignacion(cargada);
        renombrarDocumento(ruta, textoValorPorDefecto(cargada, inquilinoModuloOperativoDtoEsquema));
        const opciones = await opcionesDeModuloOperativo(cargada.moduloOperativoId);
        if (!vigente)
          return;
        setModulos(opciones);
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir el módulo operativo.';
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    }

    if (inquilinoId && inquilinoModuloOperativoId > 0)
      void cargar();
    else
      setCargando(false);

    return () => {
      vigente = false;
    };
  }, [inquilinoId, inquilinoModuloOperativoId, ruta, renombrarDocumento]);

  function cambiar(siguiente: InquilinoModuloOperativoDto) {
    setAsignacion(siguiente);
  }

  function cerrar() {
    cerrarDocumento(ruta);
  }

  async function guardar(cerrarAlTerminar: boolean) {
    if (!permiso.escritura || guardando)
      return;

    const preparada = prepararAsignacion(asignacion);
    if (preparada.error) {
      notify(preparada.error, 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      const guardada = await modificarModuloInquilino(inquilinoId, {
        ...preparada.asignacion,
        inquilinoModuloOperativoId,
        inquilinoId,
      });
      setAsignacion(guardada);
      renombrarDocumento(ruta, textoValorPorDefecto(guardada, inquilinoModuloOperativoDtoEsquema));
      recargarCatalogo(rutaModulosInquilino(inquilinoId));
      notify('Módulo operativo guardado.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el módulo operativo.';
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
  const titulo = textoValorPorDefecto(asignacion, inquilinoModuloOperativoDtoEsquema);

  return (
    <div className="inquilino-modulo-operativo-edicion ficha-detalle">
      <h2>{titulo || 'Módulo operativo'}</h2>
      <div className="inquilino-modulo-operativo-edicion-acciones">
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
      {cargando && <p>Cargando módulo operativo…</p>}
      <FormularioCampos>
        {camposModuloInquilino(asignacion, { soloLectura: !editando, bloqueado, modulos, alCambiar: cambiar })}
      </FormularioCampos>
    </div>
  );
}
