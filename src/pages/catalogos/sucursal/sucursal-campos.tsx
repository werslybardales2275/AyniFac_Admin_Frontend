import type { ReactNode } from 'react';
import CheckBox from 'devextreme-react/check-box';
import TextBox from 'devextreme-react/text-box';
import { CampoFormulario } from '../../../components/popup-formulario/PopupFormulario';
import { sucursalDtoEsquema, type SucursalDto } from '../../../dtos/sucursal-dto';
import { camposDeFicha } from '../../../dtos/valor-por-defecto';

const CAMPOS_FICHA = camposDeFicha(sucursalDtoEsquema, 'sucursalId');

interface OpcionesCamposSucursal {
  soloLectura: boolean;
  bloqueado: boolean;
  alCambiar: (sucursal: SucursalDto) => void;
}

/**
 * Devuelve los controles como hijos directos del Form.
 * DevExtreme no reconoce un Item envuelto en otro componente.
 */
export function camposSucursal(sucursal: SucursalDto, opciones: OpcionesCamposSucursal): ReactNode[] {
  const { soloLectura, bloqueado, alCambiar } = opciones;

  return CAMPOS_FICHA.map((campo) => {
    const meta = sucursalDtoEsquema[campo];

    if (meta.control === 'booleano' && campo === 'exoneradoIGV') {
      return (
        <CampoFormulario key={campo}>
          <CheckBox
            text={meta.etiqueta}
            value={sucursal.exoneradoIGV}
            readOnly={soloLectura}
            disabled={bloqueado}
            onValueChanged={(evento) => alCambiar({ ...sucursal, exoneradoIGV: evento.value === true })}
          />
        </CampoFormulario>
      );
    }

    if (meta.control !== 'texto')
      return null;

    const valor = sucursal[campo];
    return (
      <CampoFormulario key={campo}>
        <TextBox
          label={meta.etiqueta}
          labelMode="floating"
          value={typeof valor === 'string' ? valor : ''}
          maxLength={'longitudMaxima' in meta ? meta.longitudMaxima : undefined}
          valueChangeEvent="input"
          readOnly={soloLectura}
          disabled={bloqueado}
          onValueChanged={(evento) => alCambiar({ ...sucursal, [campo]: evento.value ?? '' })}
        />
      </CampoFormulario>
    );
  });
}
