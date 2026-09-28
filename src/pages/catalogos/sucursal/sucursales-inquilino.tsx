import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { agregarSucursal, rutaSucursales } from '../../../api/sucursales';
import { ListaCatalogo, recargarCatalogo } from '../../../components/lista-catalogo/ListaCatalogo';
import { AccionesFormulario, PopupFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { usePermisoObjeto } from '../../../contexts/permisos-usuario';
import { prepararSucursal, sucursalVacia, type SucursalDto } from '../../../dtos/sucursal-dto';
import {
  sucursalListadoEsquema,
  type SucursalListadoDto,
} from '../../../dtos/sucursal-listado-dto';
import { textoValorPorDefecto } from '../../../dtos/valor-por-defecto';
import { OBJETO_SUCURSAL } from '../../../seguridad/objetos';
import { camposSucursal } from './sucursal-campos';

interface SucursalesInquilinoProps {
  inquilinoId: string;
}

/**
 * Listado de sucursales del inquilino abierto.
 * Usa la misma barra que un catálogo del menú: Buscar, Nuevo, Abrir y Eliminar.
 * El inquilino llega por la ruta y no se elige en el formulario.
 */
export const SucursalesInquilino = memo(function SucursalesInquilino({ inquilinoId }: SucursalesInquilinoProps) {
  const navigate = useNavigate();
  const permiso = usePermisoObjeto(OBJETO_SUCURSAL);
  const ruta = rutaSucursales(inquilinoId);
  const [altaVisible, setAltaVisible] = useState(false);
  const [sucursal, setSucursal] = useState<SucursalDto>(() => sucursalVacia(inquilinoId));
  const [guardando, setGuardando] = useState(false);

  function abrirSucursal(fila: SucursalListadoDto) {
    navigate(`/inquilino/${inquilinoId}/sucursal/${fila.sucursalId}`, {
      state: { titulo: textoValorPorDefecto(fila, sucursalListadoEsquema) },
    });
  }

  function cambiar(siguiente: SucursalDto) {
    setSucursal(siguiente);
  }

  function cerrarAlta() {
    if (guardando)
      return;
    setAltaVisible(false);
    setSucursal(sucursalVacia(inquilinoId));
  }

  async function guardarAlta() {
    if (!permiso.escritura || guardando)
      return;

    const preparada = prepararSucursal(sucursal);
    if (preparada.error) {
      notify(preparada.error, 'warning', 2500);
      return;
    }

    setGuardando(true);
    try {
      await agregarSucursal(inquilinoId, preparada.sucursal);
      setAltaVisible(false);
      setSucursal(sucursalVacia(inquilinoId));
      notify('Sucursal guardada.', 'success', 2000);
      recargarCatalogo(ruta);
    }
    catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la sucursal.';
      notify(mensaje, 'error', 3000);
    }
    finally {
      setGuardando(false);
    }
  }

  return (
    <div className="inquilino-sucursales">
      <ListaCatalogo<SucursalListadoDto>
        titulo="Sucursales"
        ruta={ruta}
        clave="sucursalId"
        esquema={sucursalListadoEsquema}
        onNuevo={() => setAltaVisible(true)}
        onAbrir={abrirSucursal}
        puedeCrear={permiso.escritura}
        puedeEliminar={permiso.eliminacion}
        iconoAbrir="eyeopen"
      />
      <PopupFormulario
        visible={altaVisible}
        titulo="Nueva sucursal"
        guardando={guardando}
        alCerrar={cerrarAlta}
      >
        {camposSucursal(sucursal, { soloLectura: false, bloqueado: guardando, alCambiar: cambiar })}
        <AccionesFormulario>
          <Button text="Guardar" type="default" stylingMode="contained" disabled={guardando} onClick={() => { void guardarAlta(); }} />
          <Button text="Cancelar" stylingMode="outlined" disabled={guardando} onClick={cerrarAlta} />
        </AccionesFormulario>
      </PopupFormulario>
    </div>
  );
});
