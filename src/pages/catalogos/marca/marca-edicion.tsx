import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarMarca, obtenerMarca } from '../../../api/marcas';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { CampoFormulario, FormularioCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { marcaDtoEsquema, type MarcaDto } from '../../../dtos/marca-dto';
import { camposDeFicha, textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_MARCA } from '../../../seguridad/objetos';
import './marca.scss';

const RUTA_LISTA = '/api/marcas';
const CAMPOS_FICHA = camposDeFicha(marcaDtoEsquema, 'marcaId');

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function marcaIdDe(path: string): number {
  const coincidencia = /\/marca\/(\d+)$/.exec(path);
  return coincidencia ? Number(coincidencia[1]) : 0;
}

export function MarcaEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_MARCA);
  const marcaId = marcaIdDe(ruta);
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const marca = await obtenerMarca(marcaId);
        if (!vigente)
          return;
        setNombre(marca.nombre);
        renombrarDocumento(ruta, textoValorPorDefecto(marca, marcaDtoEsquema));
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir la marca.';
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    }

    if (marcaId > 0)
      void cargar();
    else
      setCargando(false);

    return () => {
      vigente = false;
    };
  }, [marcaId, ruta, renombrarDocumento]);

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

    const marca: MarcaDto = { marcaId, nombre: nombreLimpio };
    setGuardando(true);
    try {
      const guardada = await modificarMarca(marca);
      setNombre(guardada.nombre);
      renombrarDocumento(ruta, textoValorPorDefecto(guardada, marcaDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Marca guardada.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la marca.';
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

  return (
    <div className="marca-edicion ficha-detalle">
      <h2>{textoValorPorDefecto({ marcaId, nombre }, marcaDtoEsquema) || 'Marca'}</h2>
      <div className="marca-edicion-acciones">
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
            disabled={cargando || guardando || !permiso.escritura}
            onButtonClick={() => { void guardar(false); }}
            onItemClick={alElegirAccion}
          />
        )}
        <Button text="Cerrar" stylingMode="outlined" disabled={guardando} onClick={cerrar} />
      </div>
      <FormularioCampos>
        {CAMPOS_FICHA.map((campo) => {
          const meta = marcaDtoEsquema[campo];
          if (meta.control !== 'texto' || campo !== 'nombre')
            return null;

          return (
            <CampoFormulario key={campo}>
              <TextBox
                label={meta.etiqueta}
                labelMode="floating"
                value={nombre}
                maxLength={meta.longitudMaxima}
                valueChangeEvent="input"
                readOnly={!editando}
                disabled={cargando || guardando}
                onValueChanged={(evento) => setNombre(evento.value ?? '')}
              />
            </CampoFormulario>
          );
        })}
      </FormularioCampos>
    </div>
  );
}
