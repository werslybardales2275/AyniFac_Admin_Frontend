import { useEffect, type ComponentType } from 'react';
import { buscarRuta, type VistaEdicion } from '../../app-routes';
import { useEspacioTrabajo } from '../../contexts/espacio-trabajo-hooks';
import { UsuarioPlataformaEdicion } from '../../pages/catalogos/usuario-plataforma/usuario-plataforma-edicion';
import { InquilinoEdicion } from '../../pages/catalogos/inquilino/inquilino-edicion';
import { ModuloOperativoEdicion } from '../../pages/catalogos/modulo-operativo/modulo-operativo-edicion';
import { InquilinoModuloOperativoEdicion } from '../../pages/catalogos/inquilino-modulo-operativo/inquilino-modulo-operativo-edicion';
import { SucursalEdicion } from '../../pages/catalogos/sucursal/sucursal-edicion';
import { RolPlataformaEdicion } from '../../pages/catalogos/rol-plataforma/rol-plataforma-edicion';
import { SunatUnidadEdicion } from '../../pages/catalogos/sunat-unidad/sunat-unidad-edicion';
import { SunatSegmentoEdicion } from '../../pages/catalogos/sunat-segmento/sunat-segmento-edicion';
import { SunatFamiliaEdicion } from '../../pages/catalogos/sunat-familia/sunat-familia-edicion';
import { SunatClaseEdicion } from '../../pages/catalogos/sunat-clase/sunat-clase-edicion';
import { SunatProductoEdicion } from '../../pages/catalogos/sunat-producto/sunat-producto-edicion';
import { SunatMonedaEdicion } from '../../pages/catalogos/sunat-moneda/sunat-moneda-edicion';
import { SunatMotivoNotaCreditoEdicion } from '../../pages/catalogos/sunat-motivo-nota-credito/sunat-motivo-nota-credito-edicion';
import { SunatMotivoNotaDebitoEdicion } from '../../pages/catalogos/sunat-motivo-nota-debito/sunat-motivo-nota-debito-edicion';
import { SunatMedioPagoDetraccionEdicion } from '../../pages/catalogos/sunat-medio-pago-detraccion/sunat-medio-pago-detraccion-edicion';
import { SunatMotivoDetraccionEdicion } from '../../pages/catalogos/sunat-motivo-detraccion/sunat-motivo-detraccion-edicion';
import './espacio-trabajo.scss';

const vistasEdicion: Record<VistaEdicion, ComponentType<{ ruta: string }>> = {
    'usuario-plataforma': UsuarioPlataformaEdicion,
    inquilino: InquilinoEdicion,
    'modulo-operativo': ModuloOperativoEdicion,
    sucursal: SucursalEdicion,
    'inquilino-modulo-operativo': InquilinoModuloOperativoEdicion,
    'rol-plataforma': RolPlataformaEdicion,
    'sunat-unidad': SunatUnidadEdicion,
    'sunat-segmento': SunatSegmentoEdicion,
    'sunat-familia': SunatFamiliaEdicion,
    'sunat-clase': SunatClaseEdicion,
    'sunat-producto': SunatProductoEdicion,
    'sunat-moneda': SunatMonedaEdicion,
    'sunat-motivo-nota-credito': SunatMotivoNotaCreditoEdicion,
    'sunat-motivo-nota-debito': SunatMotivoNotaDebitoEdicion,
    'sunat-medio-pago-detraccion': SunatMedioPagoDetraccionEdicion,
    'sunat-motivo-detraccion': SunatMotivoDetraccionEdicion,
};

/**
 * Mantiene montada cada vista abierta.
 * La pestaña inactiva sigue en el DOM (oculta) para conservar filtros, fila y scroll.
 */
export default function EspacioTrabajo() {
    const { documentos, rutaActiva, activarDocumento, cerrarDocumento } = useEspacioTrabajo();
    const puedeCerrar = documentos.length > 1;

    useEffect(() => {
        const marco = requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'));
        });
        return () => cancelAnimationFrame(marco);
    }, [rutaActiva, documentos.length]);

    return (
        <div className={'espacio-trabajo'}>
            <div className={'espacio-pestanas'} role={'tablist'} aria-label={'Documentos abiertos'}>
                {documentos.map(documento => {
                    const activa = documento.path === rutaActiva;
                    return (
                        <button
                            key={documento.path}
                            type={'button'}
                            role={'tab'}
                            className={activa ? 'espacio-pestana activa' : 'espacio-pestana'}
                            aria-selected={activa}
                            onClick={() => activarDocumento(documento.path)}
                        >
                            <span className={'dx-icon dx-icon-doc'} aria-hidden={'true'} />
                            <span className={'espacio-tab-texto'}>{documento.titulo}</span>
                            {puedeCerrar && (
                                <span
                                    className={'dx-icon dx-icon-close espacio-tab-cerrar'}
                                    title={`Cerrar ${documento.titulo}`}
                                    onClick={(evento) => {
                                        evento.preventDefault();
                                        evento.stopPropagation();
                                        cerrarDocumento(documento.path);
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
            <div className={'espacio-paginas'}>
                {documentos.map(documento => {
                    const ruta = buscarRuta(documento.path);
                    const Vista = ruta?.vista ? vistasEdicion[ruta.vista] : undefined;
                    const activa = documento.path === rutaActiva;
                    return (
                        <div
                            key={documento.path}
                            className={'content espacio-pagina'}
                            data-activa={activa}
                            aria-hidden={!activa}
                            inert={!activa}
                        >
                            {Vista ? <Vista ruta={documento.path} /> : ruta?.element}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
