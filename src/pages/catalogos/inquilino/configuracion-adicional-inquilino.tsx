import { memo, useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import SelectBox from 'devextreme-react/select-box';
import notify from 'devextreme/ui/notify';
import {
  agregarConfiguracionAdicionalInquilino,
  modificarConfiguracionAdicionalInquilino,
  obtenerConfiguracionAdicionalInquilino,
  opcionesDeMedioPagoInquilino,
} from '../../../api/inquilinos-configuracion-adicional';
import {
  BooleanoCampo,
  CampoEtiqueta,
  TextoAreaCampo,
  TextoCampo,
} from '../../../components/campo-etiqueta/CampoEtiqueta';
import { RejillaCampos } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import {
  configuracionAdicionalDtoEsquema,
  configuracionAdicionalVacia,
  type ConfiguracionAdicionalDto,
} from '../../../dtos/configuracion-adicional-dto';
import type { ObjetoReducido } from '../../../dtos/objeto-reducido';
import { OBJETO_INQUILINO } from '../../../seguridad/objetos';

interface ConfiguracionAdicionalInquilinoProps {
  inquilinoId: string;
}

/** Devuelve el primer texto de validación, o null si la configuración puede enviarse. */
function validarConfiguracion(configuracion: ConfiguracionAdicionalDto): string | null {
  if (!configuracion.mensajePieFactura.trim())
    return 'El mensaje al pie de la factura es obligatorio.';

  if (configuracion.medioPagoEfectivoDto.id <= 0)
    return 'El medio de pago efectivo es obligatorio.';

  if (!configuracion.cuentaDetraccion.trim())
    return 'La cuenta de detracción es obligatoria.';

  return null;
}

/**
 * Configuración adicional del inquilino: una sola fila por inquilino.
 * Vive en la base del inquilino; la API de plataforma la alcanza por alcance.
 * Sin fila todavía, el formulario nace en modo alta y Guardar hace POST.
 */
export const ConfiguracionAdicionalInquilino = memo(function ConfiguracionAdicionalInquilino(
  { inquilinoId }: ConfiguracionAdicionalInquilinoProps,
) {
  const permiso = usePermisoObjeto(OBJETO_INQUILINO);
  const [configuracion, setConfiguracion] = useState<ConfiguracionAdicionalDto>(configuracionAdicionalVacia);
  const [mediosPago, setMediosPago] = useState<ObjetoReducido[]>([]);
  const [existe, setExiste] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const cargada = await obtenerConfiguracionAdicionalInquilino(inquilinoId);
        if (!vigente)
          return;
        if (cargada) {
          setConfiguracion(cargada);
          setExiste(true);
        }
        else {
          setEditando(true);
        }
        const lista = await opcionesDeMedioPagoInquilino(inquilinoId, cargada?.medioPagoEfectivoDto.id);
        if (!vigente)
          return;
        setMediosPago(lista);
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir la configuración adicional del inquilino.';
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
  }, [inquilinoId]);

  function alCambiar(parcial: Partial<ConfiguracionAdicionalDto>) {
    setConfiguracion((actual) => ({ ...actual, ...parcial }));
  }

  async function guardar() {
    if (!permiso.escritura || guardando)
      return;

    const preparada: ConfiguracionAdicionalDto = {
      ...configuracion,
      mensajePieFactura: configuracion.mensajePieFactura.trim(),
      cuentaDetraccion: configuracion.cuentaDetraccion.trim(),
    };
    const error = validarConfiguracion(preparada);
    if (error) {
      notify(error, 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      const guardada = existe
        ? await modificarConfiguracionAdicionalInquilino(inquilinoId, preparada)
        : await agregarConfiguracionAdicionalInquilino(inquilinoId, preparada);
      setConfiguracion(guardada);
      setExiste(true);
      setEditando(false);
      notify('Configuración adicional guardada.', 'success', 2000);
    }
    catch (errorGuardado) {
      const mensaje = errorGuardado instanceof Error ? errorGuardado.message : 'No se pudo guardar la configuración adicional del inquilino.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  const esquema = configuracionAdicionalDtoEsquema;
  const bloqueado = cargando || guardando;
  const soloLectura = !editando;

  return (
    <div className="inquilino-configuracion ficha-detalle">
      <h2>Configuración adicional</h2>
      <div className="inquilino-configuracion-acciones">
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
          <Button
            text="Guardar"
            icon="save"
            type="default"
            stylingMode="contained"
            disabled={bloqueado || !permiso.escritura}
            onClick={() => { void guardar(); }}
          />
        )}
      </div>
      {cargando && <p>Cargando configuración adicional…</p>}
      {!cargando && (
        <RejillaCampos>
          <BooleanoCampo
            etiqueta={esquema.enviarCpeInmediatamente.etiqueta}
            valor={configuracion.enviarCpeInmediatamente}
            soloLectura={soloLectura}
            deshabilitado={bloqueado}
            alCambiar={(valor) => alCambiar({ enviarCpeInmediatamente: valor })}
          />
          <TextoAreaCampo
            etiqueta={esquema.mensajePieFactura.etiqueta}
            valor={configuracion.mensajePieFactura}
            soloLectura={soloLectura}
            deshabilitado={bloqueado}
            alCambiar={(valor) => alCambiar({ mensajePieFactura: valor })}
          />
          <CampoEtiqueta etiqueta={esquema.medioPagoEfectivoDto.etiqueta}>
            <SelectBox
              labelMode="hidden"
              dataSource={mediosPago}
              valueExpr="id"
              displayExpr="valor"
              value={configuracion.medioPagoEfectivoDto.id > 0 ? configuracion.medioPagoEfectivoDto.id : null}
              searchEnabled
              readOnly={soloLectura}
              disabled={bloqueado}
              onValueChanged={(evento) => {
                if (!evento.event)
                  return;
                const id = evento.value as number | null;
                const elegido = mediosPago.find((medioPago) => medioPago.id === id) ?? { id: 0, valor: '' };
                alCambiar({ medioPagoEfectivoDto: elegido });
              }}
            />
          </CampoEtiqueta>
          <TextoCampo
            etiqueta={esquema.cuentaDetraccion.etiqueta}
            valor={configuracion.cuentaDetraccion}
            longitudMaxima={esquema.cuentaDetraccion.longitudMaxima}
            soloLectura={soloLectura}
            deshabilitado={bloqueado}
            alCambiar={(valor) => alCambiar({ cuentaDetraccion: valor })}
          />
          <BooleanoCampo
            etiqueta={esquema.solicitarClaveAutorizacionParaVenderOtraSucursal.etiqueta}
            valor={configuracion.solicitarClaveAutorizacionParaVenderOtraSucursal}
            soloLectura={soloLectura}
            deshabilitado={bloqueado}
            alCambiar={(valor) => alCambiar({ solicitarClaveAutorizacionParaVenderOtraSucursal: valor })}
          />
        </RejillaCampos>
      )}
    </div>
  );
});
