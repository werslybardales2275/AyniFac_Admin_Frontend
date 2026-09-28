import React, { useState, useCallback } from 'react';
import Form, {
  Item,
  Label,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  type FormTypes,
} from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import notify from 'devextreme/ui/notify';
import { useAuth } from '../../contexts/auth-hooks';
import { leerNombreUsuarioRecordado } from '../../api/sesion';

import './LoginForm.scss';

export default function LoginForm() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombreUsuario: leerNombreUsuarioRecordado(),
    contrasena: '',
  });

  const onFieldDataChanged = useCallback((e: FormTypes.FieldDataChangedEvent) => {
    const { dataField, value } = e;

    if (dataField) {
      setFormData(formData => ({
        ...formData,
        [dataField]: value,
      }));
    }
  }, []);

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { nombreUsuario, contrasena } = formData;
    setLoading(true);

    const result = await signIn(nombreUsuario, contrasena);
    if (!result.isOk) {
      setLoading(false);
      notify(result.message, 'error', 3000);
    }
  }, [signIn, formData]);

  return (
    <form className={'login-form'} onSubmit={onSubmit}>
      <Form formData={formData} disabled={loading} onFieldDataChanged={onFieldDataChanged}>
        <Item
          dataField={'nombreUsuario'}
          editorType={'dxTextBox'}
          editorOptions={usuarioEditorOptions}
        >
          <RequiredRule message="El usuario es obligatorio" />
          <Label visible={false} />
        </Item>
        <Item
          dataField={'contrasena'}
          editorType={'dxTextBox'}
          editorOptions={contrasenaEditorOptions}
        >
          <RequiredRule message="La contraseña es obligatoria" />
          <Label visible={false} />
        </Item>
        <ButtonItem>
          <ButtonOptions
            width={'100%'}
            type={'default'}
            useSubmitBehavior={true}
          >
            <span className="dx-button-text">
              {
                loading
                  ? <LoadIndicator width={'24px'} height={'24px'} visible={true} />
                  : 'Ingresar'
              }
            </span>
          </ButtonOptions>
        </ButtonItem>
      </Form>
    </form>
  );
}

const usuarioEditorOptions = { stylingMode: 'filled', placeholder: 'Usuario', mode: 'text', maxLength: 20 };
const contrasenaEditorOptions = { stylingMode: 'filled', placeholder: 'Contraseña', mode: 'password' };
