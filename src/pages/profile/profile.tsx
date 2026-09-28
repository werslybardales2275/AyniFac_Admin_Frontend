import { useCallback, useEffect, useState } from 'react';
import Form, {
  Item,
  Label,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  StringLengthRule,
  CustomRule,
  type FormTypes,
} from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import notify from 'devextreme/ui/notify';
import { cambiarContrasena, obtenerPerfil, type PerfilUsuario } from '../../api/auth';
import { useAuth } from '../../contexts/auth-hooks';
import './profile.scss';

const vacio: PerfilUsuario = {
  nombre: '',
  nombreUsuario: '',
  rol: '',
  esAdministrador: false,
};

export function Profile() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario>(vacio);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [formulario, setFormulario] = useState(0);
  const [clave, setClave] = useState({
    contrasenaActual: '',
    contrasenaNueva: '',
    confirmacion: '',
  });

  useEffect(() => {
    let activo = true;
    (async () => {
      const resultado = await obtenerPerfil();
      if (!activo)
        return;
      if (resultado.isOk && resultado.data)
        setPerfil(resultado.data);
      else if (user)
        setPerfil({
          nombre: user.nombre,
          nombreUsuario: user.nombreUsuario,
          rol: user.rol,
          esAdministrador: user.esAdministrador,
        });
      setCargandoPerfil(false);
    })();
    return () => {
      activo = false;
    };
  }, [user]);

  const onFieldDataChanged = useCallback((e: FormTypes.FieldDataChangedEvent) => {
    if (e.dataField)
      setClave(actual => ({ ...actual, [e.dataField as string]: e.value }));
  }, []);

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (clave.contrasenaNueva !== clave.confirmacion) {
      notify('La confirmación no coincide con la nueva contraseña.', 'error', 3000);
      return;
    }

    setGuardando(true);
    const resultado = await cambiarContrasena(clave.contrasenaActual, clave.contrasenaNueva);
    setGuardando(false);
    if (!resultado.isOk) {
      notify(resultado.message, 'error', 3000);
      return;
    }

    setClave({ contrasenaActual: '', contrasenaNueva: '', confirmacion: '' });
    setFormulario(actual => actual + 1);
    notify('Contraseña actualizada.', 'success', 3000);
  }, [clave]);

  const datos = [
    ['Nombre', perfil.nombre],
    ['Usuario', perfil.nombreUsuario],
    ['Rol', perfil.rol],
    ['Administrador', perfil.esAdministrador ? 'Sí' : 'No'],
  ];

  return (
    <>
      <h2>Perfil</h2>

      <div className={'content-block dx-card responsive-paddings perfil-datos'}>
        {cargandoPerfil
          ? <LoadIndicator visible={true} />
          : (
            <dl>
              {datos.map(([etiqueta, valor]) => (
                <div key={etiqueta}>
                  <dt>{etiqueta}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
            </dl>
          )}
      </div>

      <div className={'content-block dx-card responsive-paddings perfil-clave'}>
        <h3>Cambiar contraseña</h3>
        <form onSubmit={onSubmit}>
          <Form
            key={formulario}
            formData={clave}
            disabled={guardando}
            onFieldDataChanged={onFieldDataChanged}
            labelLocation={'top'}
            colCountByScreen={colCountByScreen}
          >
            <Item dataField={'contrasenaActual'} editorType={'dxTextBox'} editorOptions={opcionesClave}>
              <RequiredRule message="La contraseña actual es obligatoria" />
              <Label text="Contraseña actual" />
            </Item>
            <Item dataField={'contrasenaNueva'} editorType={'dxTextBox'} editorOptions={opcionesClave}>
              <RequiredRule message="La nueva contraseña es obligatoria" />
              <StringLengthRule min={8} message="Debe tener al menos 8 caracteres" />
              <Label text="Nueva contraseña" />
            </Item>
            <Item dataField={'confirmacion'} editorType={'dxTextBox'} editorOptions={opcionesClave}>
              <RequiredRule message="Confirme la nueva contraseña" />
              <CustomRule
                message="La confirmación no coincide"
                validationCallback={e => e.value === clave.contrasenaNueva}
              />
              <Label text="Confirmar contraseña" />
            </Item>
            <ButtonItem>
              <ButtonOptions width={'100%'} type={'default'} useSubmitBehavior={true}>
                <span className="dx-button-text">
                  {guardando
                    ? <LoadIndicator width={'24px'} height={'24px'} visible={true} />
                    : 'Guardar contraseña'}
                </span>
              </ButtonOptions>
            </ButtonItem>
          </Form>
        </form>
      </div>
    </>
  );
}

const colCountByScreen = { xs: 1, sm: 1, md: 1, lg: 1 };
const opcionesClave = { stylingMode: 'filled', mode: 'password' };
