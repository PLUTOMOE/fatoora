import { create } from 'zustand';

interface Entity {
  name: string;
  short: string;
}

interface AppState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeEntity: Entity;
  setActiveEntity: (entity: Entity) => void;
  showEntitySwitcher: boolean;
  setShowEntitySwitcher: (show: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (show: boolean) => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
}

export const useStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  activeEntity: { name: '', short: '' },
  setActiveEntity: (entity) => set({ activeEntity: entity }),
  
  showEntitySwitcher: false,
  setShowEntitySwitcher: (show) => set({ showEntitySwitcher: show }),
  
  showCommandPalette: false,
  setShowCommandPalette: (show) => set({ showCommandPalette: show }),
  
  showUserMenu: false,
  setShowUserMenu: (show) => set({ showUserMenu: show }),
  
  showNotifications: false,
  setShowNotifications: (show) => set({ showNotifications: show }),

  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (show) => set({ isMobileMenuOpen: show }),
  
  language: 'ar',
  setLanguage: (lang) => set({ language: lang }),
}));
