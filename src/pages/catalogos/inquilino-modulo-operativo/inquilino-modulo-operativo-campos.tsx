import type { ReactNode } from 'react';
import { CampoEtiqueta } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { ComboReducido } from '../../../components/combo-reducido/ComboReducido';
import { inquilinoModuloOperativoDtoEsquema, type InquilinoModuloOperativoDto } from '../../../dtos/inquilino-modulo-operativo-dto';
import type { ObjetoReducido } from '../../../dtos/objeto-reducido';
import { camposDeFicha } from '../../../dtos/valor-por-defecto';

const CAMPOS_FICHA = camposDeFicha(inquilinoModuloOperativoDtoEsquema, 'inquilinoModuloOperativoId');

interface OpcionesCamposModuloInquilino {
  soloLectura: boolean;
  bloqueado: boolean;
  modulos: ObjetoReducido[];
  alCambiar: (asignacion: InquilinoModuloOperativoDto) => void;
}

/**
 * Devuelve los campos de la ficha y del alta.
 * El inquilino no se elige: llega por la ruta del detalle.
 */
export function camposModuloInquilino(
  asignacion: InquilinoModuloOperativoDto,
  opciones: OpcionesCamposModuloInquilino,
): ReactNode[] {
  const { soloLectura, bloqueado, modulos, alCambiar } = opciones;

  return CAMPOS_FICHA.map((campo) => {
    const meta = inquilinoModuloOperativoDtoEsquema[campo];
    if (campo !== 'moduloOperativoId')
      return null;

    return (
      <CampoEtiqueta key={campo} etiqueta={meta.etiqueta}>
        <ComboReducido
          etiqueta=""
          valor={asignacion.moduloOperativoId > 0 ? asignacion.moduloOperativoId : null}
          opciones={modulos}
          deshabilitado={bloqueado || soloLectura}
          alCambiar={(id) => {
            if (id == null) {
              alCambiar({ ...asignacion, moduloOperativoId: 0, moduloOperativoNombre: '' });
              return;
            }
            const elegido = modulos.find((modulo) => modulo.id === id);
            alCambiar({
              ...asignacion,
              moduloOperativoId: id,
              moduloOperativoNombre: elegido?.valor ?? asignacion.moduloOperativoNombre,
            });
          }}
        />
      </CampoEtiqueta>
    );
  });
}
