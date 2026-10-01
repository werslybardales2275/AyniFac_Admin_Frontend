import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { agregarSunatMedioPagoDetraccion } from '../../../api/sunat-medios-pago-detraccion';
import { TextoCampo, BooleanoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatMedioPagoDetraccionDtoEsquema } from '../../../dtos/sunat-medio-pago-detraccion-dto';
import {
  sunatMedioPagoDetraccionListadoEsquema,
  type SunatMedioPagoDetraccionListadoDto,
} from '../../../dtos/sunat-medio-pago-detraccion-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_MEDIO_PAGO_DETRACCION } from '../../../seguridad/objetos';
import './sunat-medio-pago-detraccion.scss';

const RUTA = '/api/administracion/sunat-medios-pago-detraccion';

export function SunatMedioPagoDetraccion() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_MEDIO_PAGO_DETRACCION);
  const [altaVisible, setAltaVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [vigente, setVigente] = useState(false);
  const [guardando, setGuardando] = useState(false);

  function abrirFicha(fila: SunatMedioPagoDetraccionListadoDto) {
    navigate(`/sunat-medio-pago-detraccion/${encodeURIComponent(fila.codigo)}`, {
      state: { titulo: textoValorPorDefecto(fila, sunatMedioPagoDetraccionListadoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setCodigo('');
    setNombre('');
    setVigente(false);
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
      await agregarSunatMedioPagoDetraccion({
      codigo: codigoLimpio,
      nombre: nombreLimpio,
      vigente: vigente,
    });
      setAltaVisible(false);
      setCodigo('');
      setNombre('');
      setVigente(false);
      notify('Medio de pago de detracción guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el medio de pago de detracción.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<SunatMedioPagoDetraccionListadoDto>
        titulo="Medios de pago de detracción"
        ruta={RUTA}
        clave="codigo"
        esquema={sunatMedioPagoDetraccionListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirFicha}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
        mostrarClave
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo medio de pago de detracción"
        guardando={guardando}
        rejilla
        alCerrar={cerrarAlta}
      >
        <TextoCampo
            etiqueta={sunatMedioPagoDetraccionDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatMedioPagoDetraccionDtoEsquema.codigo.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setCodigo}
        />
        <TextoCampo
            etiqueta={sunatMedioPagoDetraccionDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatMedioPagoDetraccionDtoEsquema.nombre.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setNombre}
        />
        <BooleanoCampo
            etiqueta="Vigente"
            valor={vigente}
            deshabilitado={guardando}
            alCambiar={setVigente}
        />
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarAlta(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarAlta} />
        </AccionesFormulario>
      </PopupFormulario>
    </>
  );
}
