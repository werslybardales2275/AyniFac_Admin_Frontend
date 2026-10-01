import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { agregarSunatMotivoNotaDebito } from '../../../api/sunat-motivos-nota-debito';
import { TextoCampo, BooleanoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatMotivoNotaDebitoDtoEsquema } from '../../../dtos/sunat-motivo-nota-debito-dto';
import {
  sunatMotivoNotaDebitoListadoEsquema,
  type SunatMotivoNotaDebitoListadoDto,
} from '../../../dtos/sunat-motivo-nota-debito-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_MOTIVO_NOTA_DEBITO } from '../../../seguridad/objetos';
import './sunat-motivo-nota-debito.scss';

const RUTA = '/api/administracion/sunat-motivos-nota-debito';

export function SunatMotivoNotaDebito() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_MOTIVO_NOTA_DEBITO);
  const [altaVisible, setAltaVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [afectaStock, setAfectaStock] = useState(false);
  const [guardando, setGuardando] = useState(false);

  function abrirFicha(fila: SunatMotivoNotaDebitoListadoDto) {
    navigate(`/sunat-motivo-nota-debito/${encodeURIComponent(fila.codigo)}`, {
      state: { titulo: textoValorPorDefecto(fila, sunatMotivoNotaDebitoListadoEsquema) },
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
      await agregarSunatMotivoNotaDebito({
      codigo: codigoLimpio,
      nombre: nombreLimpio,
      afectaStock: afectaStock,
    });
      setAltaVisible(false);
      setCodigo('');
      setNombre('');
      setAfectaStock(false);
      notify('Motivo de nota de débito guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el motivo de nota de débito.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<SunatMotivoNotaDebitoListadoDto>
        titulo="Motivos de nota de débito"
        ruta={RUTA}
        clave="codigo"
        esquema={sunatMotivoNotaDebitoListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirFicha}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
        mostrarClave
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo motivo de nota de débito"
        guardando={guardando}
        rejilla
        alCerrar={cerrarAlta}
      >
        <TextoCampo
            etiqueta={sunatMotivoNotaDebitoDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatMotivoNotaDebitoDtoEsquema.codigo.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setCodigo}
        />
        <TextoCampo
            etiqueta={sunatMotivoNotaDebitoDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatMotivoNotaDebitoDtoEsquema.nombre.longitudMaxima}
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
