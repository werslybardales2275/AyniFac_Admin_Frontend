import { useEffect, useRef, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import type { TextBoxRef } from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarTipoInformacion, obtenerTipoInformacion } from '../../../api/tipos-informacion';
import { TextoCampo, textoEscrito } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { RejillaCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { tipoInformacionDtoEsquema, type TipoInformacionDto } from '../../../dtos/tipo-informacion-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_TIPO_INFORMACION } from '../../../seguridad/objetos';
import './tipo-informacion.scss';

const RUTA_LISTA = '/api/administracion/tipos-informacion';

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function tipoInformacionIdDe(path: string): number {
  const coincidencia = /\/tipo-informacion\/(\d+)$/.exec(path);
  return coincidencia ? Number(coincidencia[1]) : 0;
}

export function TipoInformacionEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_TIPO_INFORMACION);
  const tipoInformacionId = tipoInformacionIdDe(ruta);
  const [nombre, setNombre] = useState('');
  const campoNombre = useRef<TextBoxRef>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const tipo = await obtenerTipoInformacion(tipoInformacionId);
        if (!vigente)
          return;
        setNombre(tipo.nombre);
        renombrarDocumento(ruta, textoValorPorDefecto(tipo, tipoInformacionDtoEsquema));
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir el tipo de información.';
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    }

    if (tipoInformacionId > 0)
      void cargar();
    else
      setCargando(false);

    return () => {
      vigente = false;
    };
  }, [tipoInformacionId, ruta, renombrarDocumento]);

  function cerrar() {
    cerrarDocumento(ruta);
  }

  async function guardar(cerrarAlTerminar: boolean) {
    if (!permiso.escritura)
      return;

    const nombreLimpio = textoEscrito(campoNombre, nombre).trim();
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }

    const tipo: TipoInformacionDto = { tipoInformacionId, nombre: nombreLimpio };
    setGuardando(true);
    try {
      const guardado = await modificarTipoInformacion(tipo);
      setNombre(guardado.nombre);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, tipoInformacionDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Tipo de información guardado.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el tipo de información.';
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

  return (
    <div className="tipo-informacion-edicion ficha-detalle">
      <h2>{textoValorPorDefecto({ tipoInformacionId, nombre }, tipoInformacionDtoEsquema) || 'Tipo de información'}</h2>
      <div className="tipo-informacion-edicion-acciones">
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
      {cargando && <p>Cargando tipo de información…</p>}
      {!cargando && (
        <RejillaCampos>
          <TextoCampo
            referencia={campoNombre}
            etiqueta={tipoInformacionDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={tipoInformacionDtoEsquema.nombre.longitudMaxima}
            soloLectura={!editando}
            deshabilitado={bloqueado}
            alCambiar={setNombre}
          />
        </RejillaCampos>
      )}
    </div>
  );
}
