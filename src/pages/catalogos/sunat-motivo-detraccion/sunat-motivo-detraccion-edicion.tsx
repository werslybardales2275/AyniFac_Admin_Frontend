import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarSunatMotivoDetraccion, obtenerSunatMotivoDetraccion } from '../../../api/sunat-motivos-detraccion';
import { TextoCampo, BooleanoCampo, DecimalCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { RejillaCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatMotivoDetraccionDtoEsquema, type SunatMotivoDetraccionDto } from '../../../dtos/sunat-motivo-detraccion-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_MOTIVO_DETRACCION } from '../../../seguridad/objetos';
import './sunat-motivo-detraccion.scss';

const RUTA_LISTA = '/api/administracion/sunat-motivos-detraccion';

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function codigoDe(path: string): string {
  const coincidencia = /\/sunat-motivo-detraccion\/([^/]+)$/.exec(path);
  if (!coincidencia)
    return '';

  try {
    return decodeURIComponent(coincidencia[1]);
  }
  catch {
    return coincidencia[1];
  }
}

export function SunatMotivoDetraccionEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_MOTIVO_DETRACCION);
  const codigoRuta = codigoDe(ruta);
  const [codigo, setCodigo] = useState(codigoRuta);
  const [nombre, setNombre] = useState('');
  const [tasa, setTasa] = useState(0);
  const [vigente, setVigente] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const cargada = await obtenerSunatMotivoDetraccion(codigoRuta);
        if (!activo)
          return;
        setCodigo(cargada.codigo);
        setNombre(cargada.nombre);
        setTasa(cargada.tasa);
        setVigente(cargada.vigente);
        renombrarDocumento(ruta, textoValorPorDefecto(cargada, sunatMotivoDetraccionDtoEsquema));
      }
      catch (error) {
        if (!activo)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir el motivo de detracción.';
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
    if (!Number.isFinite(tasa) || tasa < 0 || tasa > 999.99) {
      notify('La tasa admite cero y no puede pasar de 999.99.', 'warning', 2500);
      return;
    }
    const ficha: SunatMotivoDetraccionDto = {
      codigo: codigo,
      nombre: nombreLimpio,
      tasa: tasa,
      vigente: vigente,
    };
    setGuardando(true);
    try {
      const guardado = await modificarSunatMotivoDetraccion(ficha);
        setCodigo(guardado.codigo);
        setNombre(guardado.nombre);
        setTasa(guardado.tasa);
        setVigente(guardado.vigente);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, sunatMotivoDetraccionDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Motivo de detracción guardado.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el motivo de detracción.';
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
  const ficha: SunatMotivoDetraccionDto = {
      codigo: codigo,
      nombre: nombre,
      tasa: tasa,
      vigente: vigente,
    };

  return (
    <div className="sunat-motivo-detraccion-edicion ficha-detalle">
      <h2>{textoValorPorDefecto(ficha, sunatMotivoDetraccionDtoEsquema) || 'Motivo de detracción'}</h2>
      <div className="sunat-motivo-detraccion-edicion-acciones">
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
      {cargando && <p>Cargando motivo de detracción…</p>}
      {!cargando && (
        <RejillaCampos>
        <TextoCampo
            etiqueta={sunatMotivoDetraccionDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatMotivoDetraccionDtoEsquema.codigo.longitudMaxima}
            soloLectura
            deshabilitado={bloqueado}
            alCambiar={setCodigo}
        />
        <TextoCampo
            etiqueta={sunatMotivoDetraccionDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatMotivoDetraccionDtoEsquema.nombre.longitudMaxima}
            soloLectura={!editando}
            deshabilitado={bloqueado}
            alCambiar={setNombre}
        />
        <DecimalCampo
            etiqueta="Tasa"
            valor={tasa}
            precision={sunatMotivoDetraccionDtoEsquema.tasa.precision}
            escala={sunatMotivoDetraccionDtoEsquema.tasa.escala}
            soloLectura={!editando}
            deshabilitado={bloqueado}
            alCambiar={setTasa}
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
