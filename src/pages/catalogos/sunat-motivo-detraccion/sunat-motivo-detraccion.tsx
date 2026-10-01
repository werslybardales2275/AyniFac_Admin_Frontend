import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { agregarSunatMotivoDetraccion } from '../../../api/sunat-motivos-detraccion';
import { TextoCampo, BooleanoCampo, DecimalCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { sunatMotivoDetraccionDtoEsquema } from '../../../dtos/sunat-motivo-detraccion-dto';
import {
  sunatMotivoDetraccionListadoEsquema,
  type SunatMotivoDetraccionListadoDto,
} from '../../../dtos/sunat-motivo-detraccion-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUNAT_MOTIVO_DETRACCION } from '../../../seguridad/objetos';
import './sunat-motivo-detraccion.scss';

const RUTA = '/api/administracion/sunat-motivos-detraccion';

export function SunatMotivoDetraccion() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_SUNAT_MOTIVO_DETRACCION);
  const [altaVisible, setAltaVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [tasa, setTasa] = useState(0);
  const [vigente, setVigente] = useState(false);
  const [guardando, setGuardando] = useState(false);

  function abrirFicha(fila: SunatMotivoDetraccionListadoDto) {
    navigate(`/sunat-motivo-detraccion/${encodeURIComponent(fila.codigo)}`, {
      state: { titulo: textoValorPorDefecto(fila, sunatMotivoDetraccionListadoEsquema) },
    });
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setCodigo('');
    setNombre('');
    setTasa(0);
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
    if (!Number.isFinite(tasa) || tasa < 0 || tasa > 999.99) {
      notify('La tasa admite cero y no puede pasar de 999.99.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarSunatMotivoDetraccion({
      codigo: codigoLimpio,
      nombre: nombreLimpio,
      tasa: tasa,
      vigente: vigente,
    });
      setAltaVisible(false);
      setCodigo('');
      setNombre('');
      setTasa(0);
      setVigente(false);
      notify('Motivo de detracción guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el motivo de detracción.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<SunatMotivoDetraccionListadoDto>
        titulo="Motivos de detracción"
        ruta={RUTA}
        clave="codigo"
        esquema={sunatMotivoDetraccionListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirFicha}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
        mostrarClave
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo motivo de detracción"
        guardando={guardando}
        rejilla
        alCerrar={cerrarAlta}
      >
        <TextoCampo
            etiqueta={sunatMotivoDetraccionDtoEsquema.codigo.etiqueta}
            valor={codigo}
            longitudMaxima={sunatMotivoDetraccionDtoEsquema.codigo.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setCodigo}
        />
        <TextoCampo
            etiqueta={sunatMotivoDetraccionDtoEsquema.nombre.etiqueta}
            valor={nombre}
            longitudMaxima={sunatMotivoDetraccionDtoEsquema.nombre.longitudMaxima}
            deshabilitado={guardando}
            alCambiar={setNombre}
        />
        <DecimalCampo
            etiqueta="Tasa"
            valor={tasa}
            precision={sunatMotivoDetraccionDtoEsquema.tasa.precision}
            escala={sunatMotivoDetraccionDtoEsquema.tasa.escala}
            deshabilitado={guardando}
            alCambiar={setTasa}
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
