import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarSunatProducto, obtenerSunatProducto } from '../../../api/sunat-productos';
import { TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { CampoEtiqueta } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { opcionesDeSunatClase } from '../../../api/sunat-clases';
import type { ObjetoCodigoReducido } from '../../../dtos/objeto-reducido';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { RejillaCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatProductoDtoEsquema, type SunatProductoDto } from '../../../dtos/sunat-producto-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_PRODUCTO } from '../../../seguridad/objetos';
import './sunat-producto.scss';

const RUTA_LISTA = '/api/administracion/sunat-productos';

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function codigoDe(path: string): string {
  const coincidencia = /\/sunat-producto\/([^/]+)$/.exec(path);
  if (!coincidencia)
    return '';

  try {
    return decodeURIComponent(coincidencia[1]);
  }
  catch {
    return coincidencia[1];
  }
}

export function SunatProductoEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_PRODUCTO);
  const codigoRuta = codigoDe(ruta);
  const [codigo, setCodigo] = useState(codigoRuta);
  const [nombre, setNombre] = useState('');
  const [claseCodigo, setClaseCodigo] = useState('');
  const [opciones, setOpciones] = useState<ObjetoCodigoReducido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const cargada = await obtenerSunatProducto(codigoRuta);
        if (!vigente)
          return;
        setCodigo(cargada.codigo);
        setNombre(cargada.nombre);
        setClaseCodigo(cargada.claseDto.id);
        const opcionesCargadas = await opcionesDeSunatClase(cargada.claseDto.id);
        if (!vigente)
          return;
        setOpciones(opcionesCargadas);
        renombrarDocumento(ruta, textoValorPorDefecto(cargada, sunatProductoDtoEsquema));
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir el producto SUNAT.';
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
    if (!claseCodigo.trim()) {
      notify('La clase es obligatoria.', 'warning', 2500);
      return;
    }
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }
    const ficha: SunatProductoDto = {
      codigo: codigo,
      claseDto: { id: claseCodigo.trim(), valor: '' },
      nombre: nombreLimpio,
    };
    setGuardando(true);
    try {
      const guardado = await modificarSunatProducto(ficha);
        setCodigo(guardado.codigo);
        setNombre(guardado.nombre);
        setClaseCodigo(guardado.claseDto.id);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, sunatProductoDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Producto SUNAT guardado.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el producto SUNAT.';
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
  const ficha: SunatProductoDto = {
      codigo: codigo,
      claseDto: { id: claseCodigo.trim(), valor: '' },
      nombre: nombre,
    };

  return (
    <div className="sunat-producto-edicion ficha-detalle">
      <h2>{textoValorPorDefecto(ficha, sunatProductoDtoEsquema) || 'Producto SUNAT'}</h2>
      <div className="sunat-producto-edicion-acciones">
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
      {cargando && <p>Cargando producto SUNAT…</p>}
      {!cargando && (
        <RejillaCampos>
        <TextoCampo
            etiqueta={sunatProductoDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatProductoDtoEsquema.codigo.longitudMaxima}
            soloLectura
            deshabilitado={bloqueado}
            alCambiar={setCodigo}
        />
        <CampoEtiqueta etiqueta="Clase">
          <ComboReducido
            etiqueta=""
            valor={ claseCodigo || null }
            opciones={opciones}
            alCambiar={(id) => setClaseCodigo(id ?? '')}
            deshabilitado={bloqueado || !editando}
          />
        </CampoEtiqueta>
        <TextoCampo
            etiqueta={sunatProductoDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatProductoDtoEsquema.nombre.longitudMaxima}
            soloLectura={!editando}
            deshabilitado={bloqueado}
            alCambiar={setNombre}
        />
        </RejillaCampos>
      )}
    </div>
  );
}
