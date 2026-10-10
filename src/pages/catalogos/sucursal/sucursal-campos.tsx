import type { ReactNode } from 'react';
import { BooleanoCampo, TextoCampo } from '../../../components/campo-etiqueta/CampoEtiqueta';
import { sucursalDtoEsquema, type SucursalDto } from '../../../dtos/sucursal-dto';
import { camposDeFicha } from '../../../dtos/valor-por-defecto';

const CAMPOS_FICHA = camposDeFicha(sucursalDtoEsquema, 'sucursalId');

interface OpcionesCamposSucursal {
  soloLectura: boolean;
  bloqueado: boolean;
  alCambiar: (sucursal: SucursalDto) => void;
}

/**
 * Devuelve los campos de la ficha y del alta.
 * El inquilino llega por la ruta y no se elige en el formulario.
 */
export function camposSucursal(sucursal: SucursalDto, opciones: OpcionesCamposSucursal): ReactNode[] {
  const { soloLectura, bloqueado, alCambiar } = opciones;

  return CAMPOS_FICHA.map((campo) => {
    const meta = sucursalDtoEsquema[campo];

    if (meta.control === 'booleano' && campo === 'exoneradoIGV') {
      return (
        <BooleanoCampo
          key={campo}
          etiqueta={meta.etiqueta}
          valor={sucursal.exoneradoIGV}
          soloLectura={soloLectura}
          deshabilitado={bloqueado}
          alCambiar={(valor) => alCambiar({ ...sucursal, exoneradoIGV: valor })}
        />
      );
    }

    if (meta.control !== 'texto')
      return null;

    const valor = sucursal[campo];
    return (
      <TextoCampo
        key={campo}
        etiqueta={meta.etiqueta}
        valor={typeof valor === 'string' ? valor : ''}
        longitudMaxima={'longitudMaxima' in meta ? meta.longitudMaxima : undefined}
        soloLectura={soloLectura}
        deshabilitado={bloqueado}
        alCambiar={(texto) => alCambiar({ ...sucursal, [campo]: texto })}
      />
    );
  });
}
