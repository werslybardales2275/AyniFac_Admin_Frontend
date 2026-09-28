import type { TreeViewTypes } from 'devextreme-react/tree-view';
import type { ButtonTypes } from 'devextreme-react/button';

export interface HeaderProps {
    menuToggleEnabled: boolean;
    title?: string;
    toggleMenu: (e: ButtonTypes.ClickEvent) => void;
}

export interface SideNavigationMenuProps {
    selectedItemChanged: (e: TreeViewTypes.ItemClickEvent) => void;
    openMenu: (e: React.PointerEvent) => void;
    compactMode: boolean;
    onMenuReady: (e: TreeViewTypes.ContentReadyEvent) => void;
}

export interface UserPanelProps {
    menuMode: 'context' | 'list';
}

export interface User {
    nombre: string;
    nombreUsuario: string;
    rol: string;
    esAdministrador: boolean;
}

export type AuthContextType = {
    user?: User;
    signIn: (nombreUsuario: string, contrasena: string) => Promise<{isOk: boolean, data?: User, message?: string}>;
    signOut: () => void;
    loading: boolean;
}

export interface SideNavToolbarProps {
    title: string;
}

export interface SingleCardProps {
    title?: string;
    description?: string;
}

export type Handle = () => void;

interface NavigationData {
    currentPath: string;
}

export type NavigationContextType = {
    setNavigationData?: ({ currentPath }: NavigationData) => void;
    navigationData: NavigationData;
}

export type ValidationType = {
    value: string;
}
