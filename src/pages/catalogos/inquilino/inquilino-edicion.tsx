import { useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import SelectBox from 'devextreme-react/select-box';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import type { ItemClickEvent } from 'devextreme/ui/drop_down_button';
import { modificarInquilino, obtenerInquilino, opcionesDeInquilino } from '../../../api/inquilinos';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { CampoFormulario, FormularioCampos } from '../../../components/popup-formulario/PopupFormulario';
import { useEspacioTrabajo } from '../../../contexts/espacio-trabajo-hooks';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import {
  estadosInquilino,
  inquilinoDtoEsquema,
  modosInquilino,
  type InquilinoDto,
} from '../../../dtos/inquilino-dto';
import type { EnumeracionDto } from '../../../dtos/enumeracion-dto';
import type { ObjetoGuidReducido } from '../../../dtos/objeto-reducido';
import { camposDeFicha, textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_INQUILINO } from '../../../seguridad/objetos';
import { SucursalesInquilino } from '../sucursal/sucursales-inquilino';
import './inquilino.scss';

const RUTA_LISTA = '/api/administracion/inquilinos';
const CAMPOS_FICHA = camposDeFicha(inquilinoDtoEsquema, 'inquilinoId');
const vacio = '00000000-0000-0000-0000-000000000000';
const subdominioValido = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

interface AccionGuardar {
  id: 'guardar' | 'guardar-cerrar';
  text: string;
}

const accionesGuardar: AccionGuardar[] = [
  { id: 'guardar', text: 'Guardar' },
  { id: 'guardar-cerrar', text: 'Guardar y cerrar' },
];

function inquilinoIdDe(path: string): string {
  const coincidencia = /\/inquilino\/([0-9a-fA-F-]{36})$/.exec(path);
  return coincidencia?.[1] ?? '';
}

function textoFecha(valor: string): string {
  if (!valor)
    return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime()))
    return valor;
  return fecha.toLocaleString('es-PE');
}

function modoPorId(modoId: number | null): EnumeracionDto | undefined {
  return modosInquilino.find((modo) => modo.id === modoId);
}

function estadoPorId(estadoId: number | null): EnumeracionDto | undefined {
  return estadosInquilino.find((estado) => estado.id === estadoId);
}

export function InquilinoEdicion({ ruta }: { ruta: string }) {
  const { cerrarDocumento, renombrarDocumento } = useEspacioTrabajo();
  const permiso = usePermisoObjeto(OBJETO_INQUILINO);
  const inquilinoId = inquilinoIdDe(ruta);
  const [codigo, setCodigo] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [ruc, setRuc] = useState('');
  const [subdominio, setSubdominio] = useState('');
  const [modo, setModo] = useState<EnumeracionDto>({ id: 0, nombre: '' });
  const [nombreEsquema, setNombreEsquema] = useState('');
  const [estado, setEstado] = useState<EnumeracionDto>({ id: 0, nombre: '' });
  const [fechaCreacion, setFechaCreacion] = useState('');
  const [fechaDeshabilitacion, setFechaDeshabilitacion] = useState('');
  const [anterior, setAnterior] = useState<ObjetoGuidReducido | null>(null);
  const [anteriores, setAnteriores] = useState<ObjetoGuidReducido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const inquilino = await obtenerInquilino(inquilinoId);
        if (!vigente)
          return;
        aplicar(inquilino);
        renombrarDocumento(ruta, textoValorPorDefecto(inquilino, inquilinoDtoEsquema));
        const anteriorId = inquilino.inquilinoAnterior.id === vacio ? null : inquilino.inquilinoAnterior.id;
        const cargados = await opcionesDeInquilino(anteriorId);
        if (!vigente)
          return;
        setAnteriores(cargados.filter((opcion) => opcion.id !== inquilinoId));
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir el inquilino.';
        notify(mensaje, 'error', 3000);
      }
      finally {
        if (vigente)
          setCargando(false);
      }
    }

    if (inquilinoId)
      void cargar();
    else
      setCargando(false);

    return () => {
      vigente = false;
    };
  }, [inquilinoId, ruta, renombrarDocumento]);

  function aplicar(inquilino: InquilinoDto) {
    setCodigo(inquilino.codigo);
    setRazonSocial(inquilino.razonSocial);
    setRuc(inquilino.ruc);
    setSubdominio(inquilino.subdominio);
    setModo(inquilino.modo);
    setNombreEsquema(inquilino.nombreEsquema ?? '');
    setEstado(inquilino.estado);
    setFechaCreacion(inquilino.fechaCreacion);
    setFechaDeshabilitacion(inquilino.fechaDeshabilitacion ?? '');
    setAnterior(inquilino.inquilinoAnterior.id === vacio ? null : inquilino.inquilinoAnterior);
  }

  function cerrar() {
    cerrarDocumento(ruta);
  }

  async function guardar(cerrarAlTerminar: boolean) {
    if (!permiso.escritura)
      return;

    const razonLimpia = razonSocial.trim();
    const rucLimpio = ruc.trim();
    const subdominioLimpio = subdominio.trim().toLowerCase();
    const modoActual = modoPorId(modo.id) ?? modo;
    const estadoActual = estadoPorId(estado.id);

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
    if (!estadoActual) {
      notify('El estado del inquilino no es válido.', 'warning', 2500);
      return;
    }

    const inquilino: InquilinoDto = {
      inquilinoId,
      codigo,
      razonSocial: razonLimpia,
      ruc: rucLimpio,
      subdominio: subdominioLimpio,
      modo: modoActual,
      nombreEsquema: nombreEsquema || null,
      estado: estadoActual,
      fechaCreacion,
      fechaDeshabilitacion: fechaDeshabilitacion || null,
      inquilinoAnterior: anterior ?? { id: vacio, valor: '' },
      cadenaConexion: null,
      nombreAdministrador: null,
      contrasenaAdministrador: null,
      nombreCompletoAdministrador: null,
    };

    setGuardando(true);
    try {
      const guardado = await modificarInquilino(inquilino);
      aplicar(guardado);
      renombrarDocumento(ruta, textoValorPorDefecto(guardado, inquilinoDtoEsquema));
      recargarCatalogo(RUTA_LISTA);
      notify('Inquilino guardado.', 'success', 2000);
      if (cerrarAlTerminar)
        cerrarDocumento(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el inquilino.';
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

  const bloqueado = cargando || guardando;
  const soloLectura = !editando;
  const estadosEditables = estado.id === 1
    ? estadosInquilino.filter((item) => item.id === 1 || item.id === 4)
    : estadosInquilino.filter((item) => item.id !== 1);

  function valorTextoDe(campo: (typeof CAMPOS_FICHA)[number]): string {
    if (campo === 'codigo')
      return codigo;
    if (campo === 'razonSocial')
      return razonSocial;
    if (campo === 'ruc')
      return ruc;
    if (campo === 'subdominio')
      return subdominio;
    if (campo === 'nombreEsquema')
      return nombreEsquema;
    if (campo === 'fechaCreacion')
      return textoFecha(fechaCreacion);
    if (campo === 'fechaDeshabilitacion')
      return textoFecha(fechaDeshabilitacion);
    return '';
  }

  function cambiarTexto(campo: (typeof CAMPOS_FICHA)[number], valor: string) {
    if (campo === 'razonSocial')
      setRazonSocial(valor);
    else if (campo === 'ruc')
      setRuc(valor);
    else if (campo === 'subdominio')
      setSubdominio(valor);
  }

  const titulo = textoValorPorDefecto({
    inquilinoId,
    codigo,
    razonSocial,
    ruc,
    subdominio,
    modo,
    nombreEsquema,
    estado,
    fechaCreacion,
    fechaDeshabilitacion,
    inquilinoAnterior: anterior ?? { id: vacio, valor: '' },
    cadenaConexion: null,
    nombreAdministrador: null,
    contrasenaAdministrador: null,
    nombreCompletoAdministrador: null,
  }, inquilinoDtoEsquema);

  return (
    <div className="inquilino-edicion ficha-detalle">
      <h2>{titulo || 'Inquilino'}</h2>
      <div className="inquilino-edicion-acciones">
        {!editando && permiso.escritura && (
          <Button
            text="Editar"
            icon="edit"
            type="default"
            stylingMode="contained"
            disabled={cargando}
            onClick={() => setEditando(true)}
          />
        )}
        {editando && (
          <DropDownButton
            text="Guardar"
            icon="save"
            type="default"
            stylingMode="contained"
            splitButton={true}
            displayExpr="text"
            keyExpr="id"
            items={accionesGuardar}
            disabled={bloqueado || !permiso.escritura}
            onButtonClick={() => { void guardar(false); }}
            onItemClick={alElegirAccion}
          />
        )}
        <Button text="Cerrar" stylingMode="outlined" disabled={guardando} onClick={cerrar} />
      </div>
      {cargando && <p>Cargando inquilino…</p>}
      <FormularioCampos>
      {CAMPOS_FICHA.map((campo) => {
        const meta = inquilinoDtoEsquema[campo];
        const lectura = soloLectura || ('soloLectura' in meta && meta.soloLectura) || campo === 'codigo' || campo === 'modo';

        if (campo === 'modo' || campo === 'estado') {
          const actual = campo === 'modo' ? modo : estado;
          const origen = campo === 'modo' ? modosInquilino : estadosEditables;
          return (
            <CampoFormulario key={campo}>
              <SelectBox
                label={meta.etiqueta}
                labelMode="floating"
                dataSource={origen}
                displayExpr="nombre"
                valueExpr="id"
                value={actual.id > 0 ? actual.id : null}
                readOnly={lectura}
                disabled={bloqueado || lectura}
                onValueChanged={(evento) => {
                  if (campo !== 'estado')
                    return;
                  const elegido = estadoPorId(evento.value ?? null);
                  if (elegido)
                    setEstado(elegido);
                }}
              />
            </CampoFormulario>
          );
        }

        if (campo === 'inquilinoAnterior') {
          return (
            <CampoFormulario key={campo}>
              <ComboReducido
                etiqueta={meta.etiqueta}
                valor={anterior?.id ?? null}
                opciones={anteriores}
                deshabilitado={bloqueado || soloLectura}
                alCambiar={(id) => {
                  if (id == null) {
                    setAnterior(null);
                    return;
                  }
                  const opcion = anteriores.find((item) => item.id === id);
                  setAnterior(opcion ?? { id, valor: anterior?.id === id ? anterior.valor : '' });
                }}
              />
            </CampoFormulario>
          );
        }

        if (meta.control !== 'texto')
          return null;

        return (
          <CampoFormulario key={campo}>
            <TextBox
              label={meta.etiqueta}
              labelMode="floating"
              value={valorTextoDe(campo)}
              maxLength={'longitudMaxima' in meta ? meta.longitudMaxima : undefined}
              valueChangeEvent="input"
              readOnly={lectura}
              disabled={bloqueado}
              onValueChanged={(evento) => cambiarTexto(campo, evento.value ?? '')}
            />
          </CampoFormulario>
        );
      })}
      </FormularioCampos>
      {inquilinoId && <SucursalesInquilino inquilinoId={inquilinoId} />}
    </div>
  );
}
