import type { ReactNode } from 'react';
import { CampoFormulario } from '../../../components/popup-formulario/PopupFormulario';
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
 * Devuelve los controles como hijos directos del Form.
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
      <CampoFormulario key={campo}>
        <ComboReducido
          etiqueta={meta.etiqueta}
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
      </CampoFormulario>
    );
  });
}
