import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from '../Sidebar';
import * as AuthContext from '../../../features/auth/context/AuthContext';

// Mock child components
vi.mock('../../ui/ThemeToggleSwitch', () => ({ default: () => <div data-testid="theme-toggle">ThemeToggle</div> }));
vi.mock('../../../features/auth/components/ProfileSettingsModal', () => ({ default: ({ isOpen }) => isOpen ? <div data-testid="profile-modal">Profile Settings</div> : null }));
vi.mock('../../ui/AiChatModal', () => ({ default: ({ isOpen }) => isOpen ? <div data-testid="ai-chat-modal">AI Chat</div> : null }));

describe('Sidebar Component', () => {
  const defaultProps = {
    activeTab: 'dashboard',
    setActiveTab: vi.fn(),
    isDarkMode: true,
    setIsDarkMode: vi.fn(),
    isCollapsed: false,
    setIsCollapsed: vi.fn(),
    projects: [{ id_proyecto: 'PROJ-01', nombre: 'Test Project' }],
    selectedProjectId: 'PROJ-01',
    setSelectedProjectId: vi.fn()
  };

  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSidebar = (role = 'ADMIN', props = {}) => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: role, nombre: 'John Doe', email: 'admin@test.com' },
      logout: mockLogout,
      switchViewRole: vi.fn(),
      isRealAdmin: role === 'ADMIN'
    });
    vi.spyOn(AuthContext, 'normalizeRole').mockReturnValue(role);

    return render(<Sidebar {...defaultProps} {...props} />);
  };

  it('renders correct navigation items for ADMIN role', () => {
    renderSidebar('ADMIN');
    expect(screen.queryByText(/Resumen/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Usuarios y Roles/i)).toBeInTheDocument();
    expect(screen.getByText(/Proyectos/i)).toBeInTheDocument();
  });

  it('renders correct navigation items for DEVELOPER role', () => {
    renderSidebar('DEVELOPER');
    expect(screen.getByText(/Mi Trabajo/i)).toBeInTheDocument();
    expect(screen.getByText(/Mi Agenda/i)).toBeInTheDocument();
    expect(screen.queryByText(/Usuarios y Roles/i)).not.toBeInTheDocument();
  });

  it('renders correct navigation items for MANAGER role', () => {
    renderSidebar('MANAGER');
    expect(screen.getByText(/Proyectos/i)).toBeInTheDocument();
    expect(screen.getByText(/Matriz de Rendimiento/i)).toBeInTheDocument();
    expect(screen.queryByText(/Consultas JQL/i)).not.toBeInTheDocument();
  });

  it('calls setActiveTab when a navigation item is clicked', async () => {
    const user = userEvent.setup();
    renderSidebar('ADMIN');
    
    const proyectosTab = screen.getByText(/Proyectos/i).closest('button');
    await act(async () => {
      await user.click(proyectosTab);
    });

    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('proyectos');
  });

  it('calls logout when the logout button is clicked', async () => {
    const user = userEvent.setup();
    renderSidebar('ADMIN');
    
    const logoutButton = screen.getAllByTitle(/Cerrar/i)[0];
    await act(async () => {
      await user.click(logoutButton);
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('toggles collapse state when burger button is clicked', async () => {
    const user = userEvent.setup();
    renderSidebar('ADMIN');
    
    const burgerToggle = screen.getByRole('checkbox');
    await act(async () => {
      await user.click(burgerToggle);
    });

    expect(defaultProps.setIsCollapsed).toHaveBeenCalledWith(true);
  });

  it('does not crash if AI assistant button is removed', async () => {
    renderSidebar('ADMIN');
    // AI Chat button was removed, we just ensure it doesn't crash
    expect(screen.queryByTestId('ai-chat-modal')).not.toBeInTheDocument();
  });

  it('opens ProfileSettingsModal when the settings button is clicked', async () => {
    const user = userEvent.setup();
    renderSidebar('ADMIN');
    
    const profileButton = screen.getAllByTitle(/Configuración/i)[0];
    await act(async () => {
      await user.click(profileButton);
    });

    expect(screen.getByTestId('profile-modal')).toBeInTheDocument();
  });

  it('opens ProfileSettingsModal when clicking the user profile container', async () => {
    const user = userEvent.setup();
    renderSidebar('ADMIN');
    
    const profileContainer = screen.getByTitle('Ver Ajustes de Perfil');
    await act(async () => {
      await user.click(profileContainer);
    });

    expect(screen.getByTestId('profile-modal')).toBeInTheDocument();
  });

  it('opens ProfileSettingsModal and logs out from collapsed view', async () => {
    const user = userEvent.setup();
    renderSidebar('ADMIN', { isCollapsed: true });
    
    const settingsBtn = screen.getByTitle('Configuración de Perfil');
    await act(async () => {
      await user.click(settingsBtn);
    });
    expect(screen.getByTestId('profile-modal')).toBeInTheDocument();

    const logoutBtn = screen.getByTitle('Cerrar Sesión');
    await act(async () => {
      await user.click(logoutBtn);
    });
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('calls switchViewRole for all three roles', async () => {
    const user = userEvent.setup();
    const switchRoleMock = vi.fn();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'ADMIN', nombre: 'John Doe', email: 'admin@test.com' },
      logout: mockLogout,
      switchViewRole: switchRoleMock,
      isRealAdmin: true
    });
    render(<Sidebar {...defaultProps} />);
    
    const adminBtn = screen.getByTitle('Cambiar a Vista Administrador');
    const leaderBtn = screen.getByTitle('Cambiar a Vista Líder Técnico');
    const devBtn = screen.getByTitle('Cambiar a Vista Desarrollador');

    await act(async () => {
      await user.click(adminBtn);
    });
    expect(switchRoleMock).toHaveBeenCalledWith('ADMIN');

    await act(async () => {
      await user.click(leaderBtn);
    });
    expect(switchRoleMock).toHaveBeenCalledWith('MANAGER');

    await act(async () => {
      await user.click(devBtn);
    });
    expect(switchRoleMock).toHaveBeenCalledWith('DEVELOPER');
  });

  it('opens AI Chat Modal when clicking Nubi IA', async () => {
    const user = userEvent.setup();
    renderSidebar('ADMIN');
    
    const aiBtn = screen.getByTitle('Consultar a Nubi IA');
    await act(async () => {
      await user.click(aiBtn);
    });

    expect(screen.getByTestId('ai-chat-modal')).toBeInTheDocument();
  });
});
