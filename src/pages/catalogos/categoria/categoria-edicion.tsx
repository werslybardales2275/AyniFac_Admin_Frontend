import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import CheckBox from 'devextreme-react/check-box';
import DropDownButton from 'devextreme-react/drop-down-button';
import SelectBox from 'devextreme-react/select-box';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarCategoria, obtenerCategoria } from '../../../api/categorias';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { CampoFormulario, FormularioCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { categoriaDtoEsquema, tiposCategoria, type CategoriaDto } from '../../../dtos/categoria-dto';
import type { EnumeracionDto } from '../../../dtos/enumeracion-dto';
import './categoria.scss';

const RUTA_LISTA = '/api/categorias';

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function categoriaIdDe(path: string): number {
  const coincidencia = /\/categoria\/(\d+)$/.exec(path);
  return coincidencia ? Number(coincidencia[1]) : 0;
}

function tipoPorId(tipoId: number | null): EnumeracionDto | undefined {
  return tiposCategoria.find((tipo) => tipo.id === tipoId);
}

export function CategoriaEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const categoriaId = categoriaIdDe(ruta);
  const [nombre, setNombre] = useState('');
  const [vigente, setVigente] = useState(true);
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vigenteCarga = true;

    async function cargar() {
      try {
        const categoria = await obtenerCategoria(categoriaId);
        if (!vigenteCarga)
          return;
        setNombre(categoria.nombre);
        setVigente(categoria.vigente);
        setTipoId(categoria.tipo?.id ?? null);
        renombrarDocumento(ruta, categoria.nombre);
      }
      catch (error) {
        if (!vigenteCarga)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir la categoría.';
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigenteCarga)
          setCargando(false);
      }
    }

    if (categoriaId > 0)
      void cargar();
    else
      setCargando(false);

    return () => {
      vigenteCarga = false;
    };
  }, [categoriaId, ruta, renombrarDocumento]);

  function cerrar() {
    cerrarDocumento(ruta);
  }

  async function guardar(cerrarAlTerminar: boolean) {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }

    const tipo = tipoPorId(tipoId);
    if (!tipo) {
      notify('El tipo de categoría no es válido.', 'warning', 2500);
      return;
    }

    const categoria: CategoriaDto = {
      categoriaId,
      nombre: nombreLimpio,
      vigente,
      tipo,
    };
    setGuardando(true);
    try {
      const guardada = await modificarCategoria(categoria);
      setNombre(guardada.nombre);
      setVigente(guardada.vigente);
      setTipoId(guardada.tipo?.id ?? null);
      renombrarDocumento(ruta, guardada.nombre);
      recargarCatalogo(RUTA_LISTA);
      notify('Categoría guardada.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la categoría.';
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
    <div className="categoria-edicion ficha-detalle">
      <h2>{nombre || 'Categoría'}</h2>
      <div className="categoria-edicion-acciones">
        <DropDownButton
          text="Guardar"
          icon="save"
          type="default"
          stylingMode="contained"
          splitButton={true}
          displayExpr="text"
          keyExpr="id"
          items={accionesGuardar}
          disabled={cargando || guardando}
          onButtonClick={() => { void guardar(false); }}
          onItemClick={alElegirAccion}
        />
        <Button text="Cerrar" stylingMode="outlined" disabled={guardando} onClick={cerrar} />
      </div>
      <FormularioCampos>
        <CampoFormulario>
          <TextBox
            label="Nombre"
            labelMode="floating"
            value={nombre}
            maxLength={categoriaDtoEsquema.nombre.longitudMaxima}
            valueChangeEvent="input"
            disabled={cargando || guardando}
            onValueChanged={(evento) => setNombre(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <CheckBox
            text="Vigente"
            value={vigente}
            disabled={cargando || guardando}
            onValueChanged={(evento) => setVigente(evento.value === true)}
          />
        </CampoFormulario>
        <CampoFormulario>
          <SelectBox
            label="Tipo"
            labelMode="floating"
            dataSource={tiposCategoria}
            displayExpr="nombre"
            valueExpr="id"
            value={tipoId}
            placeholder="Seleccione"
            disabled={cargando || guardando}
            onValueChanged={(evento) => setTipoId(evento.value ?? null)}
          />
        </CampoFormulario>
      </FormularioCampos>
    </div>
  );
}
