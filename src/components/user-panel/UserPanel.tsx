import { useMemo, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import DropDownButton from 'devextreme-react/drop-down-button';
import List from 'devextreme-react/list';
import { useAuth } from '../../contexts/auth-hooks';
import './UserPanel.scss';
import type { UserPanelProps } from '../../types';

export default function UserPanel({ menuMode }: UserPanelProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navigateToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const menuItems = useMemo(() => ([
    {
      text: 'Perfil',
      icon: 'user',
      onClick: navigateToProfile
    },
    {
      text: 'Cerrar sesión',
      icon: 'runner',
      onClick: signOut
    }
  ]), [navigateToProfile, signOut]);

  const dropDownButtonAttributes = {
    class: 'user-button'
  };

  const buttonDropDownOptions = {
    width: '150px'
  };

  return (
    <div className='user-panel'>
      {menuMode === 'context' && (
        <DropDownButton
            stylingMode='text'
            text={user?.nombre}
            icon='user'
            showArrowIcon={false}
            elementAttr={dropDownButtonAttributes}
            dropDownOptions={buttonDropDownOptions}
            items={menuItems}>
        </DropDownButton>
      )}
      {menuMode === 'list' && (
        <List items={menuItems} />
      )}
    </div>
  );
}
