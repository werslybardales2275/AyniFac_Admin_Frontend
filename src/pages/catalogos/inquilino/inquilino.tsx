import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import SelectBox from 'devextreme-react/select-box';
import type { TextBoxRef } from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import { agregarInquilino, opcionesDeInquilino } from '../../../api/inquilinos';
import { CampoEtiqueta, TextoCampo, textoEscrito } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { inquilinoDtoEsquema, modosInquilino } from '../../../dtos/inquilino-dto';
import type { EnumeracionDto } from '../../../dtos/enumeracion-dto';
import {
  inquilinoListadoEsquema,
  type InquilinoListadoDto,
} from '../../../dtos/inquilino-listado-dto';
import type { ObjetoGuidReducido } from '../../../dtos/objeto-reducido';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_INQUILINO } from '../../../seguridad/objetos';
import './inquilino.scss';

const RUTA = '/api/administracion/inquilinos';
const codigoValido = /^[a-z][a-z0-9_]{0,49}$/;
const subdominioValido = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const vacio = '00000000-0000-0000-0000-000000000000';

function modoPorId(modoId: number | null): EnumeracionDto | undefined {
  return modosInquilino.find((modo) => modo.id === modoId);
}

export function Inquilino() {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_INQUILINO);
  const [altaVisible, setAltaVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [ruc, setRuc] = useState('');
  const [subdominio, setSubdominio] = useState('');
  const [modoId, setModoId] = useState<number | null>(null);
  const [anteriorId, setAnteriorId] = useState<string | null>(null);
  const [anteriores, setAnteriores] = useState<ObjetoGuidReducido[]>([]);
  const [cargandoAnteriores, setCargandoAnteriores] = useState(false);
  const [cadenaConexion, setCadenaConexion] = useState('');
  const [nombreAdministrador, setNombreAdministrador] = useState('');
  const [contrasenaAdministrador, setContrasenaAdministrador] = useState('');
  const [nombreCompletoAdministrador, setNombreCompletoAdministrador] = useState('');
  const [guardando, setGuardando] = useState(false);
  const campoCodigo = useRef<TextBoxRef>(null);
  const campoRazonSocial = useRef<TextBoxRef>(null);
  const campoRuc = useRef<TextBoxRef>(null);
  const campoSubdominio = useRef<TextBoxRef>(null);
  const campoCadenaConexion = useRef<TextBoxRef>(null);
  const campoNombreAdministrador = useRef<TextBoxRef>(null);
  const campoContrasena = useRef<TextBoxRef>(null);
  const campoNombreCompleto = useRef<TextBoxRef>(null);

  useEffect(() => {
    if (!altaVisible)
      return;

    let vigente = true;
    setCargandoAnteriores(true);
    opcionesDeInquilino()
      .then((datos) => {
        if (vigente)
          setAnteriores(datos);
      })
      .catch((error: unknown) => {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los inquilinos.';
        notify(mensaje, 'error', 3000);
      })
      .finally(() => {
        if (vigente)
          setCargandoAnteriores(false);
      });

    return () => {
      vigente = false;
    };
  }, [altaVisible]);

  function abrirInquilino(inquilino: InquilinoListadoDto) {
    navigate(`/inquilino/${inquilino.inquilinoId}`, {
      state: { titulo: textoValorPorDefecto(inquilino, inquilinoListadoEsquema) },
    });
  }

  function limpiarAlta() {
    setCodigo('');
    setRazonSocial('');
    setRuc('');
    setSubdominio('');
    setModoId(null);
    setAnteriorId(null);
    setCadenaConexion('');
    setNombreAdministrador('');
    setContrasenaAdministrador('');
    setNombreCompletoAdministrador('');
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    limpiarAlta();
  }

  async function guardarAlta() {
    const codigoLimpio = textoEscrito(campoCodigo, codigo).trim().toLowerCase();
    const razonLimpia = textoEscrito(campoRazonSocial, razonSocial).trim();
    const rucLimpio = textoEscrito(campoRuc, ruc).trim();
    const subdominioLimpio = textoEscrito(campoSubdominio, subdominio).trim().toLowerCase();
    const modo = modoPorId(modoId);
    const contrasenaLimpia = textoEscrito(campoContrasena, contrasenaAdministrador).trim();

    if (!codigoValido.test(codigoLimpio)) {
      notify('El código del inquilino no es válido.', 'warning', 2500);
      return;
    }
    if (!razonLimpia) {
      notify('La razón social es obligatoria.', 'warning', 2500);
      return;
    }
    if (!rucLimpio) {
      notify('El RUC es obligatorio.', 'warning', 2500);
      return;
    }
    if (!subdominioValido.test(subdominioLimpio)) {
      notify('El subdominio del inquilino no es válido.', 'warning', 2500);
      return;
    }
    if (!modo) {
      notify('El modo del inquilino no es válido.', 'warning', 2500);
      return;
    }
    if (contrasenaLimpia && contrasenaLimpia.length < 8) {
      notify('La contraseña del administrador debe tener al menos 8 caracteres.', 'warning', 2500);
      return;
    }

    const anterior = anteriores.find((item) => item.id === anteriorId)
      ?? { id: anteriorId && anteriorId !== vacio ? anteriorId : vacio, valor: '' };

    setGuardando(true);
    try {
      await agregarInquilino({
        codigo: codigoLimpio,
        razonSocial: razonLimpia,
        ruc: rucLimpio,
        subdominio: subdominioLimpio,
        modo,
        inquilinoAnterior: anterior,
        cadenaConexion: textoEscrito(campoCadenaConexion, cadenaConexion).trim(),
        nombreAdministrador: textoEscrito(campoNombreAdministrador, nombreAdministrador).trim(),
        contrasenaAdministrador: contrasenaLimpia,
        nombreCompletoAdministrador: textoEscrito(campoNombreCompleto, nombreCompletoAdministrador).trim(),
      });
      setAltaVisible(false);
      limpiarAlta();
      notify('Inquilino guardado.', 'success', 2000);
      recargarCatalogo(RUTA);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el inquilino.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <ListaCatalogo<InquilinoListadoDto>
        titulo="Inquilinos"
        ruta={RUTA}
        clave="inquilinoId"
        esquema={inquilinoListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirInquilino}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo inquilino"
        guardando={guardando}
        alCerrar={cerrarAlta}
      >
        <TextoCampo
          referencia={campoCodigo}
          etiqueta={inquilinoDtoEsquema.codigo.etiqueta}
          valor={codigo}
          longitudMaxima={inquilinoDtoEsquema.codigo.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setCodigo}
        />
        <TextoCampo
          referencia={campoRazonSocial}
          etiqueta={inquilinoDtoEsquema.razonSocial.etiqueta}
          valor={razonSocial}
          longitudMaxima={inquilinoDtoEsquema.razonSocial.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setRazonSocial}
        />
        <TextoCampo
          referencia={campoRuc}
          etiqueta={inquilinoDtoEsquema.ruc.etiqueta}
          valor={ruc}
          longitudMaxima={inquilinoDtoEsquema.ruc.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setRuc}
        />
        <TextoCampo
          referencia={campoSubdominio}
          etiqueta={inquilinoDtoEsquema.subdominio.etiqueta}
          valor={subdominio}
          longitudMaxima={inquilinoDtoEsquema.subdominio.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setSubdominio}
        />
        <CampoEtiqueta etiqueta={inquilinoDtoEsquema.modo.etiqueta}>
          <SelectBox
            labelMode="hidden"
            dataSource={modosInquilino}
            displayExpr="nombre"
            valueExpr="id"
            value={modoId}
            placeholder="Seleccione"
            disabled={guardando}
            onValueChanged={(evento) => setModoId(evento.value ?? null)}
          />
        </CampoEtiqueta>
        <CampoEtiqueta etiqueta={inquilinoDtoEsquema.inquilinoAnterior.etiqueta}>
          <ComboReducido
            etiqueta=""
            valor={anteriorId}
            opciones={anteriores}
            deshabilitado={guardando || cargandoAnteriores}
            alCambiar={setAnteriorId}
          />
        </CampoEtiqueta>
        <TextoCampo
          referencia={campoCadenaConexion}
          etiqueta={inquilinoDtoEsquema.cadenaConexion.etiqueta}
          valor={cadenaConexion}
          deshabilitado={guardando}
          alCambiar={setCadenaConexion}
        />
        <TextoCampo
          referencia={campoNombreAdministrador}
          etiqueta={inquilinoDtoEsquema.nombreAdministrador.etiqueta}
          valor={nombreAdministrador}
          longitudMaxima={inquilinoDtoEsquema.nombreAdministrador.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setNombreAdministrador}
        />
        <TextoCampo
          referencia={campoContrasena}
          etiqueta={inquilinoDtoEsquema.contrasenaAdministrador.etiqueta}
          mode="password"
          valor={contrasenaAdministrador}
          longitudMaxima={inquilinoDtoEsquema.contrasenaAdministrador.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setContrasenaAdministrador}
        />
        <TextoCampo
          referencia={campoNombreCompleto}
          etiqueta={inquilinoDtoEsquema.nombreCompletoAdministrador.etiqueta}
          valor={nombreCompletoAdministrador}
          longitudMaxima={inquilinoDtoEsquema.nombreCompletoAdministrador.longitudMaxima}
          deshabilitado={guardando}
          alCambiar={setNombreCompletoAdministrador}
        />
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarAlta(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarAlta} />
        </AccionesFormulario>
      </PopupFormulario>
    </>
  );
}
