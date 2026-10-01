import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { agregarSunatMotivoNotaCredito } from '../../../api/sunat-motivos-nota-credito';
import { TextoCampo, BooleanoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatMotivoNotaCreditoDtoEsquema } from '../../../dtos/sunat-motivo-nota-credito-dto';
import {
  sunatMotivoNotaCreditoListadoEsquema,
  type SunatMotivoNotaCreditoListadoDto,
} from '../../../dtos/sunat-motivo-nota-credito-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_MOTIVO_NOTA_CREDITO } from '../../../seguridad/objetos';
import './sunat-motivo-nota-credito.scss';

const RUTA = '/api/administracion/sunat-motivos-nota-credito';

export function SunatMotivoNotaCredito() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_MOTIVO_NOTA_CREDITO);
  const [altaVisible, setAltaVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [afectaStock, setAfectaStock] = useState(false);
  const [guardando, setGuardando] = useState(false);

  function abrirFicha(fila: SunatMotivoNotaCreditoListadoDto) {
    navigate(`/sunat-motivo-nota-credito/${encodeURIComponent(fila.codigo)}`, {
      state: { titulo: textoValorPorDefecto(fila, sunatMotivoNotaCreditoListadoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setCodigo('');
    setNombre('');
    setAfectaStock(false);
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
      await agregarSunatMotivoNotaCredito({
      codigo: codigoLimpio,
      nombre: nombreLimpio,
      afectaStock: afectaStock,
    });
      setAltaVisible(false);
      setCodigo('');
      setNombre('');
      setAfectaStock(false);
      notify('Motivo de nota de crédito guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el motivo de nota de crédito.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<SunatMotivoNotaCreditoListadoDto>
        titulo="Motivos de nota de crédito"
        ruta={RUTA}
        clave="codigo"
        esquema={sunatMotivoNotaCreditoListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirFicha}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
        mostrarClave
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo motivo de nota de crédito"
        guardando={guardando}
        rejilla
        alCerrar={cerrarAlta}
      >
        <TextoCampo
            etiqueta={sunatMotivoNotaCreditoDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatMotivoNotaCreditoDtoEsquema.codigo.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setCodigo}
        />
        <TextoCampo
            etiqueta={sunatMotivoNotaCreditoDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatMotivoNotaCreditoDtoEsquema.nombre.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setNombre}
        />
        <BooleanoCampo
            etiqueta="Afecta stock"
            valor={afectaStock}
            deshabilitado={guardando}
            alCambiar={setAfectaStock}
        />
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarAlta(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarAlta} />
        </AccionesFormulario>
      </PopupFormulario>
    </>
  );
}
