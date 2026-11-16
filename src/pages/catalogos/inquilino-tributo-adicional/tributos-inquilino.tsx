import { memo, useState } from 'react';
import Button from 'devextreme-react/button';
import SelectBox from 'devextreme-react/select-box';
import notify from 'devextreme/ui/notify';
import { agregarTributoInquilino, rutaTributosInquilino } from '../../../api/inquilinos-tributos-adicionales';
import { CampoEtiqueta } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import {
  inquilinoTributoAdicionalDtoEsquema,
  prepararTributo,
  tributosAdicionales,
  tributoVacio,
  type InquilinoTributoAdicionalDto,
} from '../../../dtos/inquilino-tributo-adicional-dto';
import {
  inquilinoTributoAdicionalListadoEsquema,
  type InquilinoTributoAdicionalListadoDto,
} from '../../../dtos/inquilino-tributo-adicional-listado-dto';
import { OBJETO_INQUILINO_TRIBUTO_ADICIONAL } from '../../../seguridad/objetos';

interface TributosInquilinoProps {
  inquilinoId: string;
}

/**
 * Tributos adicionales de línea del inquilino abierto (ISC, ICBPER y GRATUITO).
 * Solo alta y borrado: la fila no se edita y Abrir no tiene acción.
 * El inquilino llega por la ruta y no se elige en el formulario.
 */
export const TributosInquilino = memo(function TributosInquilino({ inquilinoId }: TributosInquilinoProps) {
  const permiso = usePermisoObjeto(OBJETO_INQUILINO_TRIBUTO_ADICIONAL);
  const ruta = rutaTributosInquilino(inquilinoId);
  const [altaVisible, setAltaVisible] = useState(false);
  const [tributo, setTributo] = useState<InquilinoTributoAdicionalDto>(() => tributoVacio(inquilinoId));
  const [guardando, setGuardando] = useState(false);

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setTributo(tributoVacio(inquilinoId));
  }

  async function guardarAlta() {
    if (!permiso.escritura || guardando)
      return;

    const preparado = prepararTributo(tributo);
    if (preparado.error) {
      notify(preparado.error, 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarTributoInquilino(inquilinoId, preparado.tributo);
      setAltaVisible(false);
      setTributo(tributoVacio(inquilinoId));
      notify('Tributo adicional guardado.', 'success', 2000);
      recargarCatalogo(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el tributo adicional.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <div className="inquilino-tributos-adicionales">
      <ListaCatalogo<InquilinoTributoAdicionalListadoDto>
        titulo="Tributos adicionales"
        ruta={ruta}
        clave="inquilinoTributoAdicionalId"
        esquema={inquilinoTributoAdicionalListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={() => { /* Solo alta y borrado: la fila no se abre. */ }}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo tributo adicional"
        guardando={guardando}
        alCerrar={cerrarAlta}
      >
        <CampoEtiqueta etiqueta={inquilinoTributoAdicionalDtoEsquema.tributoAdicional.etiqueta}>
          <SelectBox
            labelMode="hidden"
            dataSource={tributosAdicionales}
            displayExpr="nombre"
            valueExpr="id"
            value={tributo.tributoAdicional?.id ?? null}
            readOnly={guardando}
            disabled={guardando}
            onValueChanged={(evento) => {
              const elegido = tributosAdicionales.find((t) => t.id === evento.value) ?? null;
              setTributo((actual) => ({ ...actual, tributoAdicional: elegido }));
            }}
          />
        </CampoEtiqueta>
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarAlta(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarAlta} />
        </AccionesFormulario>
      </PopupFormulario>
    </div>
  );
});
