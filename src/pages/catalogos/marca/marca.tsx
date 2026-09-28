import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import { agregarMarca } from '../../../api/marcas';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, CampoFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { marcaDtoEsquema, type MarcaDto } from '../../../dtos/marca-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_MARCA } from '../../../seguridad/objetos';
import './marca.scss';

const RUTA = '/api/marcas';

export function Marca() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_MARCA);
  const [altaVisible, setAltaVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  function abrirMarca(marca: MarcaDto) {
    navigate(`/marca/${marca.marcaId}`, {
      state: { titulo: textoValorPorDefecto(marca, marcaDtoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setNombre('');
  }

  async function guardarAlta() {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarMarca(nombreLimpio);
      setAltaVisible(false);
      setNombre('');
      notify('Marca guardada.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la marca.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<MarcaDto>
        titulo="Marcas"
        ruta={RUTA}
        clave="marcaId"
        esquema={marcaDtoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirMarca}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nueva marca"
        guardando={guardando}
        alCerrar={cerrarAlta}
      >
        <CampoFormulario>
          <TextBox
            label="Nombre"
            labelMode="floating"
            value={nombre}
            maxLength={marcaDtoEsquema.nombre.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setNombre(evento.value ?? '')}
            onEnterKey={() => { void guardarAlta(); }}
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
