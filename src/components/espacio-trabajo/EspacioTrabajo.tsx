import { useEffect, type ComponentType } from 'react';
import { buscarRuta, type VistaEdicion } from '../../app-routes';
import { useEspacioTrabajo } from '../../contexts/espacio-trabajo-hooks';
import { UsuarioPlataformaEdicion } from '../../pages/catalogos/usuario-plataforma/usuario-plataforma-edicion';
import { InquilinoEdicion } from '../../pages/catalogos/inquilino/inquilino-edicion';
import { ModuloOperativoEdicion } from '../../pages/catalogos/modulo-operativo/modulo-operativo-edicion';
import { SucursalEdicion } from '../../pages/catalogos/sucursal/sucursal-edicion';
import { RolPlataformaEdicion } from '../../pages/catalogos/rol-plataforma/rol-plataforma-edicion';
import './espacio-trabajo.scss';

const vistasEdicion: Record<VistaEdicion, ComponentType<{ ruta: string }>> = {
    'usuario-plataforma': UsuarioPlataformaEdicion,
    inquilino: InquilinoEdicion,
    'modulo-operativo': ModuloOperativoEdicion,
    sucursal: SucursalEdicion,
    'rol-plataforma': RolPlataformaEdicion,
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
