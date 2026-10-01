import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarSunatMedioPagoDetraccion, obtenerSunatMedioPagoDetraccion } from '../../../api/sunat-medios-pago-detraccion';
import { TextoCampo, BooleanoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { RejillaCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatMedioPagoDetraccionDtoEsquema, type SunatMedioPagoDetraccionDto } from '../../../dtos/sunat-medio-pago-detraccion-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_MEDIO_PAGO_DETRACCION } from '../../../seguridad/objetos';
import './sunat-medio-pago-detraccion.scss';

const RUTA_LISTA = '/api/administracion/sunat-medios-pago-detraccion';

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function codigoDe(path: string): string {
  const coincidencia = /\/sunat-medio-pago-detraccion\/([^/]+)$/.exec(path);
  if (!coincidencia)
    return '';

  try {
    return decodeURIComponent(coincidencia[1]);
  }
  catch {
    return coincidencia[1];
  }
}

export function SunatMedioPagoDetraccionEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_MEDIO_PAGO_DETRACCION);
  const codigoRuta = codigoDe(ruta);
  const [codigo, setCodigo] = useState(codigoRuta);
  const [nombre, setNombre] = useState('');
  const [vigente, setVigente] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const cargada = await obtenerSunatMedioPagoDetraccion(codigoRuta);
        if (!activo)
          return;
        setCodigo(cargada.codigo);
        setNombre(cargada.nombre);
        setVigente(cargada.vigente);
        renombrarDocumento(ruta, textoValorPorDefecto(cargada, sunatMedioPagoDetraccionDtoEsquema));
      }
      catch (error) {
        if (!activo)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir el medio de pago de detracción.';
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (activo)
          setCargando(false);
      }
    }

    if (codigoRuta)
      void cargar();
    else
      setCargando(false);

    return () => {
      activo = false;
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
    const ficha: SunatMedioPagoDetraccionDto = {
      codigo: codigo,
      nombre: nombreLimpio,
      vigente: vigente,
    };
    setGuardando(true);
    try {
      const guardado = await modificarSunatMedioPagoDetraccion(ficha);
        setCodigo(guardado.codigo);
        setNombre(guardado.nombre);
        setVigente(guardado.vigente);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, sunatMedioPagoDetraccionDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Medio de pago de detracción guardado.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el medio de pago de detracción.';
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
  const ficha: SunatMedioPagoDetraccionDto = {
      codigo: codigo,
      nombre: nombre,
      vigente: vigente,
    };

  return (
    <div className="sunat-medio-pago-detraccion-edicion ficha-detalle">
      <h2>{textoValorPorDefecto(ficha, sunatMedioPagoDetraccionDtoEsquema) || 'Medio de pago de detracción'}</h2>
      <div className="sunat-medio-pago-detraccion-edicion-acciones">
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
      {cargando && <p>Cargando medio de pago de detracción…</p>}
      {!cargando && (
        <RejillaCampos>
        <TextoCampo
            etiqueta={sunatMedioPagoDetraccionDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatMedioPagoDetraccionDtoEsquema.codigo.longitudMaxima}
            soloLectura
            deshabilitado={bloqueado}
            alCambiar={setCodigo}
        />
        <TextoCampo
            etiqueta={sunatMedioPagoDetraccionDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatMedioPagoDetraccionDtoEsquema.nombre.longitudMaxima}
            soloLectura={!editando}
            deshabilitado={bloqueado}
            alCambiar={setNombre}
        />
        <BooleanoCampo
            etiqueta="Vigente"
            valor={vigente}
            soloLectura={!editando}
            deshabilitado={bloqueado}
            alCambiar={setVigente}
        />
        </RejillaCampos>
      )}
    </div>
  );
}
