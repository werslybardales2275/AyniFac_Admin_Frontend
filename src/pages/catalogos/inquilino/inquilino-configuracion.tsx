import { memo, useEffect, useState } from 'react';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import {
  agregarConfiguracionInquilino,
  modificarConfiguracionInquilino,
  obtenerConfiguracionInquilino,
} from '../../../api/inquilinos-configuracion';
import { BooleanoCampo, TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { RejillaCampos } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import {
  configuracionVacia,
  inquilinoConfiguracionDtoEsquema,
  type InquilinoConfiguracionDto,
} from '../../../dtos/inquilino-configuracion-dto';
import { camposDeFicha } from '../../../dtos/valor-por-defecto';
import { OBJETO_CONFIGURACION_FACTURACION_INQUILINO } from '../../../seguridad/objetos';

const CAMPOS_FICHA = camposDeFicha(inquilinoConfiguracionDtoEsquema, 'inquilinoConfiguracionId');

interface ConfiguracionInquilinoProps {
  inquilinoId: string;
}

/**
 * Configuración de facturación del inquilino: una sola fila por inquilino.
 * Sin fila todavía, el formulario nace en modo alta y Guardar hace POST.
 */
export const ConfiguracionInquilino = memo(function ConfiguracionInquilino({ inquilinoId }: ConfiguracionInquilinoProps) {
  const permiso = usePermisoObjeto(OBJETO_CONFIGURACION_FACTURACION_INQUILINO);
  const [configuracion, setConfiguracion] = useState<InquilinoConfiguracionDto>(() => configuracionVacia(inquilinoId));
  const [existe, setExiste] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const cargada = await obtenerConfiguracionInquilino(inquilinoId);
        if (!vigente)
          return;
        if (cargada) {
          setConfiguracion(cargada);
          setExiste(true);
        }
        else {
          setConfiguracion(configuracionVacia(inquilinoId));
          setEditando(true);
        }
      }
      catch (error) {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudo abrir la configuración del inquilino.';
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

  function alCambiar(parcial: Partial<InquilinoConfiguracionDto>) {
    setConfiguracion((actual) => ({ ...actual, ...parcial }));
  }

  async function guardar() {
    if (!permiso.escritura || guardando)
      return;

    setGuardando(true);
    try {
      const guardada = existe
        ? await modificarConfiguracionInquilino(inquilinoId, configuracion)
        : await agregarConfiguracionInquilino(inquilinoId, configuracion);
      setConfiguracion(guardada);
      setExiste(true);
      setEditando(false);
      notify('Configuración guardada.', 'success', 2000);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la configuración del inquilino.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  const bloqueado = cargando || guardando;
  const soloLectura = !editando;

  return (
    <div className="inquilino-configuracion ficha-detalle">
      <h2>Configuración</h2>
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
      {cargando && <p>Cargando configuración…</p>}
      {!cargando && (
        <RejillaCampos>
          <TextoCampo
            etiqueta={inquilinoConfiguracionDtoEsquema.monedaPredeterminada.etiqueta}
            valor={configuracion.monedaPredeterminada}
            longitudMaxima={3}
            soloLectura={soloLectura}
            deshabilitado={bloqueado}
            alCambiar={(valor) => alCambiar({ monedaPredeterminada: valor.toUpperCase() })}
          />
          {CAMPOS_FICHA.map((campo) => {
            const meta = inquilinoConfiguracionDtoEsquema[campo];
            if (meta.control !== 'booleano')
              return null;

            return (
              <BooleanoCampo
                key={campo}
                etiqueta={meta.etiqueta}
                valor={configuracion[campo] === true}
                soloLectura={soloLectura}
                deshabilitado={bloqueado}
                alCambiar={(valor) => alCambiar({ [campo]: valor })}
              />
            );
          })}
        </RejillaCampos>
      )}
    </div>
  );
});
