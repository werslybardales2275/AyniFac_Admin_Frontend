import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import SelectBox from 'devextreme-react/select-box';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import { agregarInquilino, opcionesDeInquilino } from '../../../api/inquilinos';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, CampoFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
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
    const codigoLimpio = codigo.trim().toLowerCase();
    const razonLimpia = razonSocial.trim();
    const rucLimpio = ruc.trim();
    const subdominioLimpio = subdominio.trim().toLowerCase();
    const modo = modoPorId(modoId);
    const contrasenaLimpia = contrasenaAdministrador.trim();

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
        cadenaConexion: cadenaConexion.trim(),
        nombreAdministrador: nombreAdministrador.trim(),
        contrasenaAdministrador: contrasenaLimpia,
        nombreCompletoAdministrador: nombreCompletoAdministrador.trim(),
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
        <CampoFormulario>
          <TextBox
            label="Código"
            labelMode="floating"
            value={codigo}
            maxLength={inquilinoDtoEsquema.codigo.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setCodigo(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <TextBox
            label="Razón social"
            labelMode="floating"
            value={razonSocial}
            maxLength={inquilinoDtoEsquema.razonSocial.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setRazonSocial(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <TextBox
            label="RUC"
            labelMode="floating"
            value={ruc}
            maxLength={inquilinoDtoEsquema.ruc.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setRuc(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <TextBox
            label="Subdominio"
            labelMode="floating"
            value={subdominio}
            maxLength={inquilinoDtoEsquema.subdominio.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setSubdominio(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <SelectBox
            label="Modo"
            labelMode="floating"
            dataSource={modosInquilino}
            displayExpr="nombre"
            valueExpr="id"
            value={modoId}
            placeholder="Seleccione"
            disabled={guardando}
            onValueChanged={(evento) => setModoId(evento.value ?? null)}
          />
        </CampoFormulario>
        <CampoFormulario>
          <ComboReducido
            etiqueta="Inquilino anterior"
            valor={anteriorId}
            opciones={anteriores}
            deshabilitado={guardando || cargandoAnteriores}
            alCambiar={setAnteriorId}
          />
        </CampoFormulario>
        <CampoFormulario>
          <TextBox
            label="Cadena de conexión"
            labelMode="floating"
            value={cadenaConexion}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setCadenaConexion(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <TextBox
            label="Usuario administrador"
            labelMode="floating"
            value={nombreAdministrador}
            maxLength={inquilinoDtoEsquema.nombreAdministrador.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setNombreAdministrador(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <TextBox
            label="Contraseña del administrador"
            labelMode="floating"
            mode="password"
            value={contrasenaAdministrador}
            maxLength={inquilinoDtoEsquema.contrasenaAdministrador.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setContrasenaAdministrador(evento.value ?? '')}
          />
        </CampoFormulario>
        <CampoFormulario>
          <TextBox
            label="Nombre del administrador"
            labelMode="floating"
            value={nombreCompletoAdministrador}
            maxLength={inquilinoDtoEsquema.nombreCompletoAdministrador.longitudMaxima}
            valueChangeEvent="input"
            disabled={guardando}
            onValueChanged={(evento) => setNombreCompletoAdministrador(evento.value ?? '')}
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
