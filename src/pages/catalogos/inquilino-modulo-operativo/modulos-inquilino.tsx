import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { opcionesDeModuloOperativo } from '../../../api/modulos-operativos';
import { agregarModuloInquilino, rutaModulosInquilino } from '../../../api/inquilinos-modulos-operativos';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import {
  asignacionVacia,
  prepararAsignacion,
  type InquilinoModuloOperativoDto,
} from '../../../dtos/inquilino-modulo-operativo-dto';
import {
  inquilinoModuloOperativoListadoEsquema,
  type InquilinoModuloOperativoListadoDto,
} from '../../../dtos/inquilino-modulo-operativo-listado-dto';
import type { ObjetoReducido } from '../../../dtos/objeto-reducido';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_INQUILINO_MODULO_OPERATIVO } from '../../../seguridad/objetos';
import { camposModuloInquilino } from './inquilino-modulo-operativo-campos';

interface ModulosInquilinoProps {
  inquilinoId: string;
}

/**
 * Listado de módulos operativos del inquilino abierto.
 * Usa la misma barra que un catálogo del menú: Buscar, Nuevo, Abrir y Eliminar.
 * El inquilino llega por la ruta y no se elige en el formulario.
 */
export const ModulosInquilino = memo(function ModulosInquilino({ inquilinoId }: ModulosInquilinoProps) {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_INQUILINO_MODULO_OPERATIVO);
  const ruta = rutaModulosInquilino(inquilinoId);
  const [altaVisible, setAltaVisible] = useState(false);
  const [asignacion, setAsignacion] = useState<InquilinoModuloOperativoDto>(() => asignacionVacia(inquilinoId));
  const [modulos, setModulos] = useState<ObjetoReducido[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!altaVisible)
      return;

    let vigente = true;
    opcionesDeModuloOperativo()
      .then((cargados) => {
        if (vigente)
          setModulos(cargados);
      })
      .catch((error: unknown) => {
        if (!vigente)
          return;
        const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los módulos operativos.';
        notify(mensaje, 'error', 3000);
      });

    return () => {
      vigente = false;
    };
  }, [altaVisible]);

  function abrirAsignacion(fila: InquilinoModuloOperativoListadoDto) {
    navigate(`/inquilino/${inquilinoId}/modulo-operativo/${fila.inquilinoModuloOperativoId}`, {
      state: { titulo: textoValorPorDefecto(fila, inquilinoModuloOperativoListadoEsquema) },
    });
  }

  function cambiar(siguiente: InquilinoModuloOperativoDto) {
    setAsignacion(siguiente);
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setAsignacion(asignacionVacia(inquilinoId));
  }

  async function guardarAlta() {
    if (!permiso.escritura || guardando)
      return;

    const preparada = prepararAsignacion(asignacion);
    if (preparada.error) {
      notify(preparada.error, 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarModuloInquilino(inquilinoId, preparada.asignacion);
      setAltaVisible(false);
      setAsignacion(asignacionVacia(inquilinoId));
      notify('Módulo operativo guardado.', 'success', 2000);
      recargarCatalogo(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el módulo operativo.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <div className="inquilino-modulos-operativos">
      <ListaCatalogo<InquilinoModuloOperativoListadoDto>
        titulo="Módulos operativos"
        ruta={ruta}
        clave="inquilinoModuloOperativoId"
        esquema={inquilinoModuloOperativoListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirAsignacion}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nuevo módulo operativo"
        guardando={guardando}
        alCerrar={cerrarAlta}
      >
        {camposModuloInquilino(asignacion, { soloLectura: false, bloqueado: guardando, modulos, alCambiar: cambiar })}
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarAlta(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarAlta} />
        </AccionesFormulario>
      </PopupFormulario>
    </div>
  );
});
