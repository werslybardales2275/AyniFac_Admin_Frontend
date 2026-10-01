import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarSunatClase, obtenerSunatClase } from '../../../api/sunat-clases';
import { TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { CampoEtiqueta } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { opcionesDeSunatFamilia } from '../../../api/sunat-familias';
import type { ObjetoCodigoReducido } from '../../../dtos/objeto-reducido';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { RejillaCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatClaseDtoEsquema, type SunatClaseDto } from '../../../dtos/sunat-clase-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_CLASE } from '../../../seguridad/objetos';
import './sunat-clase.scss';

const RUTA_LISTA = '/api/administracion/sunat-clases';

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function codigoDe(path: string): string {
  const coincidencia = /\/sunat-clase\/([^/]+)$/.exec(path);
  if (!coincidencia)
    return '';

  try {
    return decodeURIComponent(coincidencia[1]);
  }
  catch {
    return coincidencia[1];
  }
}

export function SunatClaseEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_CLASE);
  const codigoRuta = codigoDe(ruta);
  const [codigo, setCodigo] = useState(codigoRuta);
  const [nombre, setNombre] = useState('');
  const [familiaCodigo, setFamiliaCodigo] = useState('');
  const [opciones, setOpciones] = useState<ObjetoCodigoReducido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const cargada = await obtenerSunatClase(codigoRuta);
        if (!vigente)
          return;
        setCodigo(cargada.codigo);
        setNombre(cargada.nombre);
        setFamiliaCodigo(cargada.familiaDto.id);
        const opcionesCargadas = await opcionesDeSunatFamilia(cargada.familiaDto.id);
        if (!vigente)
          return;
        setOpciones(opcionesCargadas);
        renombrarDocumento(ruta, textoValorPorDefecto(cargada, sunatClaseDtoEsquema));
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir la clase SUNAT.';
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
    if (!familiaCodigo.trim()) {
      notify('La familia es obligatoria.', 'warning', 2500);
      return;
    }
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }
    const ficha: SunatClaseDto = {
      codigo: codigo,
      familiaDto: { id: familiaCodigo.trim(), valor: '' },
      nombre: nombreLimpio,
    };
    setGuardando(true);
    try {
      const guardado = await modificarSunatClase(ficha);
        setCodigo(guardado.codigo);
        setNombre(guardado.nombre);
        setFamiliaCodigo(guardado.familiaDto.id);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, sunatClaseDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Clase SUNAT guardada.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la clase SUNAT.';
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
  const ficha: SunatClaseDto = {
      codigo: codigo,
      familiaDto: { id: familiaCodigo.trim(), valor: '' },
      nombre: nombre,
    };

  return (
    <div className="sunat-clase-edicion ficha-detalle">
      <h2>{textoValorPorDefecto(ficha, sunatClaseDtoEsquema) || 'Clase SUNAT'}</h2>
      <div className="sunat-clase-edicion-acciones">
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
      {cargando && <p>Cargando clase SUNAT…</p>}
      {!cargando && (
        <RejillaCampos>
        <TextoCampo
            etiqueta={sunatClaseDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatClaseDtoEsquema.codigo.longitudMaxima}
            soloLectura
            deshabilitado={bloqueado}
            alCambiar={setCodigo}
        />
        <CampoEtiqueta etiqueta="Familia">
          <ComboReducido
            etiqueta=""
            valor={ familiaCodigo || null }
            opciones={opciones}
            alCambiar={(id) => setFamiliaCodigo(id ?? '')}
            deshabilitado={bloqueado || !editando}
          />
        </CampoEtiqueta>
        <TextoCampo
            etiqueta={sunatClaseDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatClaseDtoEsquema.nombre.longitudMaxima}
            soloLectura={!editando}
            deshabilitado={bloqueado}
            alCambiar={setNombre}
        />
        </RejillaCampos>
      )}
    </div>
  );
}
