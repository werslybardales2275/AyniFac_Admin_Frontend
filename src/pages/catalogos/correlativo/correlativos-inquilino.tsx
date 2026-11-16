import { memo, useState } from 'react';
import Button from 'devextreme-react/button';
import NumberBox from 'devextreme-react/number-box';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import { modificarCorrelativo, rutaCorrelativosInquilino } from '../../../api/correlativos-inquilino';
import { CampoEtiqueta } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { correlativoEsquema, type CorrelativoDto } from '../../../dtos/correlativo-dto';
import { OBJETO_INQUILINO } from '../../../seguridad/objetos';

interface CorrelativosInquilinoProps {
  inquilinoId: string;
}

/**
 * Correlativos del inquilino abierto: el último número emitido de cada
 * documento por serie. Solo se edita el número; las filas las crea la
 * numeración al emitir el primer documento, así que no hay alta ni baja.
 */
export const CorrelativosInquilino = memo(function CorrelativosInquilino({ inquilinoId }: CorrelativosInquilinoProps) {
  const permiso = usePermisoObjeto(OBJETO_INQUILINO);
  const ruta = rutaCorrelativosInquilino(inquilinoId);
  const [edicionVisible, setEdicionVisible] = useState(false);
  const [correlativo, setCorrelativo] = useState<CorrelativoDto | null>(null);
  const [guardando, setGuardando] = useState(false);

  function abrirEdicion(fila: CorrelativoDto) {
    if (!permiso.escritura)
      return;
    setCorrelativo({ ...fila });
    setEdicionVisible(true);
  }

  function cerrarEdicion() {
    if (guardando)
      return;
    setEdicionVisible(false);
    setCorrelativo(null);
  }

  async function guardarEdicion() {
    if (!permiso.escritura || guardando || !correlativo)
      return;

    if (correlativo.ultimoNumero < 0) {
      notify('El último número no puede ser negativo.', 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await modificarCorrelativo(inquilinoId, correlativo);
      setEdicionVisible(false);
      setCorrelativo(null);
      notify('Correlativo guardado.', 'success', 2000);
      recargarCatalogo(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el correlativo.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <div className="correlativos-inquilino">
      <ListaCatalogo<CorrelativoDto>
        titulo="Correlativos"
        ruta={ruta}
        clave="pk"
        esquema={correlativoEsquema}
        onAbrir={abrirEdicion}
        puedeCrear={false}
        puedeEliminar={false}
        iconoAbrir={permiso.escritura ? 'edit' : 'eyeopen'}
      />
      <PopupFormulario
        visible={edicionVisible}
        titulo="Editar correlativo"
        guardando={guardando}
        alCerrar={cerrarEdicion}
      >
        <CampoEtiqueta etiqueta="Documento">
          <TextBox labelMode="hidden" value={correlativo?.entidadNombre ?? ''} readOnly={true} />
        </CampoEtiqueta>
        <CampoEtiqueta etiqueta="Comprobante">
          <TextBox labelMode="hidden" value={correlativo?.subtipoNombre ?? ''} readOnly={true} />
        </CampoEtiqueta>
        <CampoEtiqueta etiqueta="Serie">
          <TextBox labelMode="hidden" value={correlativo?.serie ?? ''} readOnly={true} />
        </CampoEtiqueta>
        <CampoEtiqueta etiqueta={correlativoEsquema.ultimoNumero.etiqueta}>
          <NumberBox
            labelMode="hidden"
            value={correlativo?.ultimoNumero ?? 0}
            min={0}
            showSpinButtons={true}
            readOnly={guardando}
            disabled={guardando}
            onValueChanged={(evento) => setCorrelativo((actual) => actual ? { ...actual, ultimoNumero: evento.value ?? 0 } : actual)}
          />
        </CampoEtiqueta>
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarEdicion(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarEdicion} />
        </AccionesFormulario>
      </PopupFormulario>
    </div>
  );
});
