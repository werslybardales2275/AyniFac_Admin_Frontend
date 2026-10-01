import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { agregarSunatMoneda } from '../../../api/sunat-monedas';
import { TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatMonedaDtoEsquema } from '../../../dtos/sunat-moneda-dto';
import {
  sunatMonedaListadoEsquema,
  type SunatMonedaListadoDto,
} from '../../../dtos/sunat-moneda-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_MONEDA } from '../../../seguridad/objetos';
import './sunat-moneda.scss';

const RUTA = '/api/administracion/sunat-monedas';

export function SunatMoneda() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_MONEDA);
  const [altaVisible, setAltaVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  function abrirFicha(fila: SunatMonedaListadoDto) {
    navigate(`/sunat-moneda/${encodeURIComponent(fila.codigo)}`, {
      state: { titulo: textoValorPorDefecto(fila, sunatMonedaListadoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setCodigo('');
    setNombre('');
  }

  async function guardarAlta() {
    const codigoLimpio = codigo.trim();
    const nombreLimpio = nombre.trim();
    if (!codigoLimpio) {
      notify('El código es obligatorio.', 'warning', 2500);
      return;
    }
    if (!nombreLimpio) {
      notify('El nombre es obligatorio.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarSunatMoneda({
      codigo: codigoLimpio,
      nombre: nombreLimpio,
    });
      setAltaVisible(false);
      setCodigo('');
      setNombre('');
      notify('Moneda SUNAT guardada.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la moneda SUNAT.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<SunatMonedaListadoDto>
        titulo="Monedas SUNAT"
        ruta={RUTA}
        clave="codigo"
        esquema={sunatMonedaListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirFicha}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
        mostrarClave
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nueva moneda SUNAT"
        guardando={guardando}
        rejilla
        alCerrar={cerrarAlta}
      >
        <TextoCampo
            etiqueta={sunatMonedaDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatMonedaDtoEsquema.codigo.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setCodigo}
        />
        <TextoCampo
            etiqueta={sunatMonedaDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatMonedaDtoEsquema.nombre.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setNombre}
        />
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarAlta(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarAlta} />
        </AccionesFormulario>
      </PopupFormulario>
    </>
  );
}
