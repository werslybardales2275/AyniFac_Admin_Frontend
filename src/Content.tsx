import appInfo from './app-info';
import EspacioTrabajo from './components/espacio-trabajo/EspacioTrabajo';
import { EspacioTrabajoProvider } from './contexts/espacio-trabajo';
import { MenusUsuarioProvider } from './contexts/menus-usuario';
import { PermisosUsuarioProvider } from './contexts/permisos-usuario';
import { SideNavOuterToolbar as SideNavBarLayout } from './layouts';

export default function Content() {
  return (
    <MenusUsuarioProvider>
    <PermisosUsuarioProvider>
    <EspacioTrabajoProvider>
    <SideNavBarLayout title={appInfo.title}>
      <EspacioTrabajo />
    </SideNavBarLayout>
    </EspacioTrabajoProvider>
    </PermisosUsuarioProvider>
    </MenusUsuarioProvider>
  );
}

