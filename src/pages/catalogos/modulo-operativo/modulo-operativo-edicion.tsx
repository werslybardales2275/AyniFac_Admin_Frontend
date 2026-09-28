import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarModuloOperativo, obtenerModuloOperativo } from '../../../api/modulos-operativos';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { CampoFormulario, FormularioCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { moduloOperativoDtoEsquema, type ModuloOperativoDto } from '../../../dtos/modulo-operativo-dto';
import { camposDeFicha, textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_MODULO_OPERATIVO } from '../../../seguridad/objetos';
import { DetallesModuloOperativo } from '../modulo-operativo-detalle/detalles-modulo';
import './modulo-operativo.scss';

const RUTA_LISTA = '/api/administracion/modulos-operativos';
const CAMPOS_FICHA = camposDeFicha(moduloOperativoDtoEsquema, 'moduloOperativoId');

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function moduloOperativoIdDe(path: string): number {
  const coincidencia = /\/modulo-operativo\/(\d+)$/.exec(path);
  return coincidencia ? Number(coincidencia[1]) : 0;
}

export function ModuloOperativoEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_MODULO_OPERATIVO);
  const moduloOperativoId = moduloOperativoIdDe(ruta);
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const modulo = await obtenerModuloOperativo(moduloOperativoId);
        if (!vigente)
          return;
        setNombre(modulo.nombre);
        renombrarDocumento(ruta, textoValorPorDefecto(modulo, moduloOperativoDtoEsquema));
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

    if (moduloOperativoId > 0)
      void cargar();
    else
      setCargando(false);

    return () => {
      vigente = false;
    };
  }, [moduloOperativoId, ruta, renombrarDocumento]);

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

    const modulo: ModuloOperativoDto = { moduloOperativoId, nombre: nombreLimpio };
    setGuardando(true);
    try {
      const guardado = await modificarModuloOperativo(modulo);
      setNombre(guardado.nombre);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, moduloOperativoDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
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

  return (
    <div className="modulo-operativo-edicion ficha-detalle">
      <h2>{textoValorPorDefecto({ moduloOperativoId, nombre }, moduloOperativoDtoEsquema) || 'Módulo operativo'}</h2>
      <div className="modulo-operativo-edicion-acciones">
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
        {CAMPOS_FICHA.map((campo) => {
          const meta = moduloOperativoDtoEsquema[campo];
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
                disabled={bloqueado}
                onValueChanged={(evento) => setNombre(evento.value ?? '')}
              />
            </CampoFormulario>
          );
        })}
      </FormularioCampos>
      {moduloOperativoId > 0 && <DetallesModuloOperativo moduloOperativoId={moduloOperativoId} />}
    </div>
  );
}
