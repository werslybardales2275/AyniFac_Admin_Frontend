import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarSunatMotivoNotaDebito, obtenerSunatMotivoNotaDebito } from '../../../api/sunat-motivos-nota-debito';
import { TextoCampo, BooleanoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { RejillaCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatMotivoNotaDebitoDtoEsquema, type SunatMotivoNotaDebitoDto } from '../../../dtos/sunat-motivo-nota-debito-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_MOTIVO_NOTA_DEBITO } from '../../../seguridad/objetos';
import './sunat-motivo-nota-debito.scss';

const RUTA_LISTA = '/api/administracion/sunat-motivos-nota-debito';

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function codigoDe(path: string): string {
  const coincidencia = /\/sunat-motivo-nota-debito\/([^/]+)$/.exec(path);
  if (!coincidencia)
    return '';

  try {
    return decodeURIComponent(coincidencia[1]);
  }
  catch {
    return coincidencia[1];
  }
}

export function SunatMotivoNotaDebitoEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_MOTIVO_NOTA_DEBITO);
  const codigoRuta = codigoDe(ruta);
  const [codigo, setCodigo] = useState(codigoRuta);
  const [nombre, setNombre] = useState('');
  const [afectaStock, setAfectaStock] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const cargada = await obtenerSunatMotivoNotaDebito(codigoRuta);
        if (!vigente)
          return;
        setCodigo(cargada.codigo);
        setNombre(cargada.nombre);
        setAfectaStock(cargada.afectaStock);
        renombrarDocumento(ruta, textoValorPorDefecto(cargada, sunatMotivoNotaDebitoDtoEsquema));
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir el motivo de nota de débito.';
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    }

    if (codigoRuta)
      void cargar();
    else
      setCargando(false);

    return () => {
      vigente = false;
    };
  }, [codigoRuta, ruta, renombrarDocumento]);

  function cerrar() {
    cerrarDocumento(ruta);
  }

  async function guardar(cerrarAlTerminar: boolean) {
    if (!permiso.escritura)
      return;

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }
    const ficha: SunatMotivoNotaDebitoDto = {
      codigo: codigo,
      nombre: nombreLimpio,
      afectaStock: afectaStock,
    };
    setGuardando(true);
    try {
      const guardado = await modificarSunatMotivoNotaDebito(ficha);
        setCodigo(guardado.codigo);
        setNombre(guardado.nombre);
        setAfectaStock(guardado.afectaStock);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, sunatMotivoNotaDebitoDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Motivo de nota de débito guardado.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el motivo de nota de débito.';
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
  const ficha: SunatMotivoNotaDebitoDto = {
      codigo: codigo,
      nombre: nombre,
      afectaStock: afectaStock,
    };

  return (
    <div className="sunat-motivo-nota-debito-edicion ficha-detalle">
      <h2>{textoValorPorDefecto(ficha, sunatMotivoNotaDebitoDtoEsquema) || 'Motivo de nota de débito'}</h2>
      <div className="sunat-motivo-nota-debito-edicion-acciones">
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
      {cargando && <p>Cargando motivo de nota de débito…</p>}
      {!cargando && (
        <RejillaCampos>
        <TextoCampo
            etiqueta={sunatMotivoNotaDebitoDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatMotivoNotaDebitoDtoEsquema.codigo.longitudMaxima}
            soloLectura
            deshabilitado={bloqueado}
            alCambiar={setCodigo}
        />
        <TextoCampo
            etiqueta={sunatMotivoNotaDebitoDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatMotivoNotaDebitoDtoEsquema.nombre.longitudMaxima}
            soloLectura={!editando}
            deshabilitado={bloqueado}
            alCambiar={setNombre}
        />
        <BooleanoCampo
            etiqueta="Afecta stock"
            valor={afectaStock}
            soloLectura={!editando}
            deshabilitado={bloqueado}
            alCambiar={setAfectaStock}
        />
        </RejillaCampos>
      )}
    </div>
  );
}
