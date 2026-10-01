import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarSunatFamilia, obtenerSunatFamilia } from '../../../api/sunat-familias';
import { TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { CampoEtiqueta } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { opcionesDeSunatSegmento } from '../../../api/sunat-segmentos';
import type { ObjetoCodigoReducido } from '../../../dtos/objeto-reducido';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { RejillaCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatFamiliaDtoEsquema, type SunatFamiliaDto } from '../../../dtos/sunat-familia-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_FAMILIA } from '../../../seguridad/objetos';
import './sunat-familia.scss';

const RUTA_LISTA = '/api/administracion/sunat-familias';

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function codigoDe(path: string): string {
  const coincidencia = /\/sunat-familia\/([^/]+)$/.exec(path);
  if (!coincidencia)
    return '';

  try {
    return decodeURIComponent(coincidencia[1]);
  }
  catch {
    return coincidencia[1];
  }
}

export function SunatFamiliaEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_FAMILIA);
  const codigoRuta = codigoDe(ruta);
  const [codigo, setCodigo] = useState(codigoRuta);
  const [nombre, setNombre] = useState('');
  const [segmentoCodigo, setSegmentoCodigo] = useState('');
  const [opciones, setOpciones] = useState<ObjetoCodigoReducido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const cargada = await obtenerSunatFamilia(codigoRuta);
        if (!vigente)
          return;
        setCodigo(cargada.codigo);
        setNombre(cargada.nombre);
        setSegmentoCodigo(cargada.segmentoDto.id);
        const opcionesCargadas = await opcionesDeSunatSegmento(cargada.segmentoDto.id);
        if (!vigente)
          return;
        setOpciones(opcionesCargadas);
        renombrarDocumento(ruta, textoValorPorDefecto(cargada, sunatFamiliaDtoEsquema));
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir la familia SUNAT.';
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
    if (!segmentoCodigo.trim()) {
      notify('El segmento es obligatorio.', 'warning', 2500);
      return;
    }
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }
    const ficha: SunatFamiliaDto = {
      codigo: codigo,
      segmentoDto: { id: segmentoCodigo.trim(), valor: '' },
      nombre: nombreLimpio,
    };
    setGuardando(true);
    try {
      const guardado = await modificarSunatFamilia(ficha);
        setCodigo(guardado.codigo);
        setNombre(guardado.nombre);
        setSegmentoCodigo(guardado.segmentoDto.id);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, sunatFamiliaDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Familia SUNAT guardada.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la familia SUNAT.';
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
  const ficha: SunatFamiliaDto = {
      codigo: codigo,
      segmentoDto: { id: segmentoCodigo.trim(), valor: '' },
      nombre: nombre,
    };

  return (
    <div className="sunat-familia-edicion ficha-detalle">
      <h2>{textoValorPorDefecto(ficha, sunatFamiliaDtoEsquema) || 'Familia SUNAT'}</h2>
      <div className="sunat-familia-edicion-acciones">
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
      {cargando && <p>Cargando familia SUNAT…</p>}
      {!cargando && (
        <RejillaCampos>
        <TextoCampo
            etiqueta={sunatFamiliaDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatFamiliaDtoEsquema.codigo.longitudMaxima}
            soloLectura
            deshabilitado={bloqueado}
            alCambiar={setCodigo}
        />
        <CampoEtiqueta etiqueta="Segmento">
          <ComboReducido
            etiqueta=""
            valor={ segmentoCodigo || null }
            opciones={opciones}
            alCambiar={(id) => setSegmentoCodigo(id ?? '')}
            deshabilitado={bloqueado || !editando}
          />
        </CampoEtiqueta>
        <TextoCampo
            etiqueta={sunatFamiliaDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatFamiliaDtoEsquema.nombre.longitudMaxima}
            soloLectura={!editando}
            deshabilitado={bloqueado}
            alCambiar={setNombre}
        />
        </RejillaCampos>
      )}
    </div>
  );
}
