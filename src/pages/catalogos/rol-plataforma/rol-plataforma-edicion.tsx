import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarRolPlataforma, obtenerRolPlataforma } from '../../../api/roles-plataforma';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { CampoFormulario, FormularioCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { rolPlataformaDtoEsquema, type RolPlataformaDto } from '../../../dtos/rol-plataforma-dto';
import { camposDeFicha, textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_ROL_PLATAFORMA } from '../../../seguridad/objetos';
import { RolPlataformaFichas } from './rol-plataforma-fichas';
import './rol-plataforma.scss';

const RUTA_LISTA = '/api/administracion/roles-plataforma';
const CAMPOS_FICHA = camposDeFicha(rolPlataformaDtoEsquema, 'rolId');

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function rolIdDe(path: string): number {
  const coincidencia = /\/rol-plataforma\/(\d+)$/.exec(path);
  return coincidencia ? Number(coincidencia[1]) : 0;
}

export function RolPlataformaEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_ROL_PLATAFORMA);
  const rolId = rolIdDe(ruta);
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const rol = await obtenerRolPlataforma(rolId);
        if (!vigente)
          return;
        setNombre(rol.nombre);
        renombrarDocumento(ruta, textoValorPorDefecto(rol, rolPlataformaDtoEsquema));
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir el rol de plataforma.';
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    }

    if (rolId > 0)
      void cargar();
    else
      setCargando(false);

    return () => {
      vigente = false;
    };
  }, [rolId, ruta, renombrarDocumento]);

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

    const rol: RolPlataformaDto = { rolId, nombre: nombreLimpio };
    setGuardando(true);
    try {
      const guardado = await modificarRolPlataforma(rol);
      setNombre(guardado.nombre);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, rolPlataformaDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Rol de plataforma guardado.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el rol de plataforma.';
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
    <div className="rol-plataforma-edicion ficha-detalle">
      <h2>{textoValorPorDefecto({ rolId, nombre }, rolPlataformaDtoEsquema) || 'Rol de plataforma'}</h2>
      <div className="rol-plataforma-edicion-acciones">
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
      {cargando && <p>Cargando rol…</p>}
      <FormularioCampos>
        {CAMPOS_FICHA.map((campo) => {
          const meta = rolPlataformaDtoEsquema[campo];
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
      {rolId > 0 && (
        <RolPlataformaFichas
          rolId={rolId}
          puedeAsignar={permiso.escritura}
          puedeQuitar={permiso.eliminacion}
        />
      )}
    </div>
  );
}
