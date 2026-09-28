import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import CheckBox from 'devextreme-react/check-box';
import SelectBox from 'devextreme-react/select-box';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import { agregarCategoria } from '../../../api/categorias';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, CampoFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { categoriaDtoEsquema, tiposCategoria, type CategoriaDto } from '../../../dtos/categoria-dto';
import type { EnumeracionDto } from '../../../dtos/enumeracion-dto';
import './categoria.scss';

const RUTA = '/api/categorias';

function tipoPorId(tipoId: number | null): EnumeracionDto | undefined {
  return tiposCategoria.find((tipo) => tipo.id === tipoId);
}

export function Categoria() {
  const navigate = useNavigate();
  const [altaVisible, setAltaVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [vigente, setVigente] = useState(true);
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  function abrirCategoria(categoria: CategoriaDto) {
    navigate(`/categoria/${categoria.categoriaId}`, { state: { titulo: categoria.nombre } });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setNombre('');
    setVigente(true);
    setTipoId(null);
  }

  async function guardarAlta() {
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

    setGuardando(true);
    try {
      await agregarCategoria({ nombre: nombreLimpio, vigente, tipo });
      setAltaVisible(false);
      setNombre('');
      setVigente(true);
      setTipoId(null);
      notify('Categoría guardada.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la categoría.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<CategoriaDto>
        titulo="Categorías"
        ruta={RUTA}
        clave="categoriaId"
        esquema={categoriaDtoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirCategoria}
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nueva categoría"
        guardando={guardando}
        alCerrar={cerrarAlta}
      >
        <CampoFormulario>
          <TextBox
            label="Nombre"
            labelMode="floating"
            value={nombre}
            maxLength={categoriaDtoEsquema.nombre.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setNombre(evento.value ?? '')}
            onEnterKey={() => { void guardarAlta(); }}
          />
        </CampoFormulario>
        <CampoFormulario>
          <CheckBox
            text="Vigente"
            value={vigente}
            disabled={guardando}
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
            disabled={guardando}
            onValueChanged={(evento) => setTipoId(evento.value ?? null)}
          />
        </CampoFormulario>
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarAlta(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarAlta} />
        </AccionesFormulario>
      </PopupFormulario>
    </>
  );
}
