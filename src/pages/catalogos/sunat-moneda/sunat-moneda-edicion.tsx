import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarSunatMoneda, obtenerSunatMoneda } from '../../../api/sunat-monedas';
import { TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { RejillaCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatMonedaDtoEsquema, type SunatMonedaDto } from '../../../dtos/sunat-moneda-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_MONEDA } from '../../../seguridad/objetos';
import './sunat-moneda.scss';

const RUTA_LISTA = '/api/administracion/sunat-monedas';

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function codigoDe(path: string): string {
  const coincidencia = /\/sunat-moneda\/([^/]+)$/.exec(path);
  if (!coincidencia)
    return '';

  try {
    return decodeURIComponent(coincidencia[1]);
  }
  catch {
    return coincidencia[1];
  }
}

export function SunatMonedaEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_MONEDA);
  const codigoRuta = codigoDe(ruta);
  const [codigo, setCodigo] = useState(codigoRuta);
  const [nombre, setNombre] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const cargada = await obtenerSunatMoneda(codigoRuta);
        if (!vigente)
          return;
        setCodigo(cargada.codigo);
        setNombre(cargada.nombre);
        renombrarDocumento(ruta, textoValorPorDefecto(cargada, sunatMonedaDtoEsquema));
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir la moneda SUNAT.';
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
    const ficha: SunatMonedaDto = {
      codigo: codigo,
      nombre: nombreLimpio,
    };
    setGuardando(true);
    try {
      const guardado = await modificarSunatMoneda(ficha);
        setCodigo(guardado.codigo);
        setNombre(guardado.nombre);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, sunatMonedaDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Moneda SUNAT guardada.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la moneda SUNAT.';
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
  const ficha: SunatMonedaDto = {
      codigo: codigo,
      nombre: nombre,
    };

  return (
    <div className="sunat-moneda-edicion ficha-detalle">
      <h2>{textoValorPorDefecto(ficha, sunatMonedaDtoEsquema) || 'Moneda SUNAT'}</h2>
      <div className="sunat-moneda-edicion-acciones">
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
      {cargando && <p>Cargando moneda SUNAT…</p>}
      {!cargando && (
        <RejillaCampos>
        <TextoCampo
            etiqueta={sunatMonedaDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatMonedaDtoEsquema.codigo.longitudMaxima}
            soloLectura
            deshabilitado={bloqueado}
            alCambiar={setCodigo}
        />
        <TextoCampo
            etiqueta={sunatMonedaDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatMonedaDtoEsquema.nombre.longitudMaxima}
            soloLectura={!editando}
            deshabilitado={bloqueado}
            alCambiar={setNombre}
        />
        </RejillaCampos>
      )}
    </div>
  );
}
