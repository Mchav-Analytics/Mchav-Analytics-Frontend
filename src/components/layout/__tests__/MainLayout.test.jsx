import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MainLayout from '../MainLayout';
import { userService } from '../../../services/api';
import * as AuthContext from '../../features/auth/context/AuthContext';

vi.mock('../Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar Mock</div>,
}));

vi.mock('../Topbar', () => ({
  default: () => <div data-testid="topbar">Topbar Mock</div>,
}));

vi.mock('../../services/api', () => ({
  authService: {
    getCurrentUser: vi.fn(),
  }
}));

describe('MainLayout', () => {
  const mockSetActiveTab = vi.fn();
  const mockSwitchViewRole = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    authService.getCurrentUser.mockResolvedValue({ name: 'Test User' });
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      switchViewRole: mockSwitchViewRole,
      isRealAdmin: false
    });
    vi.spyOn(AuthContext, 'normalizeRole').mockReturnValue('DEVELOPER');
  });

  it('renders Sidebar and children', async () => {
    await act(async () => {
      render(
        <MainLayout
          activeTab="dashboard"
          setActiveTab={mockSetActiveTab}
          isDarkMode={false}
          setIsDarkMode={vi.fn()}
        >
          <div data-testid="child-content">Child Content</div>
        </MainLayout>
      );
    });
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('applies dark theme class when isDarkMode is true', async () => {
    let containerElement;
    await act(async () => {
      const { container } = render(
        <MainLayout
          activeTab="dashboard"
          setActiveTab={mockSetActiveTab}
          isDarkMode={true}
          setIsDarkMode={vi.fn()}
        >
          <div>Content</div>
        </MainLayout>
      );
      containerElement = container;
    });
    
    const layoutDiv = containerElement.firstChild;
    expect(layoutDiv).toHaveClass('dark-theme');
    expect(layoutDiv).toHaveClass('dark');
  });

  it('handles authService.getCurrentUser error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    authService.getCurrentUser.mockRejectedValueOnce(new Error('Network Error'));

    await act(async () => {
      render(
        <MainLayout activeTab="dashboard" setActiveTab={mockSetActiveTab}>
          <div>Content</div>
        </MainLayout>
      );
    });

    expect(consoleSpy).toHaveBeenCalledWith("Perfil cargado mediante AuthContext");
    consoleSpy.mockRestore();
  });

  it('renders topbar view switcher when user is logged in and handles clicks', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 1, rol: 'ADMIN' },
      switchViewRole: mockSwitchViewRole,
      isRealAdmin: true
    });
    vi.spyOn(AuthContext, 'normalizeRole').mockReturnValue('ADMIN');

    await act(async () => {
      render(
        <MainLayout activeTab="dashboard" setActiveTab={mockSetActiveTab}>
          <div>Content</div>
        </MainLayout>
      );
    });

    expect(screen.getByText('Modo de Vista:')).toBeInTheDocument();

    // Click Vista Admin
    const adminBtn = screen.getByTitle('Ir a la Vista de Administrador');
    fireEvent.click(adminBtn);
    expect(mockSwitchViewRole).toHaveBeenCalledWith('ADMIN');
    expect(mockSetActiveTab).toHaveBeenCalledWith('proyectos');

    // Click Vista Líder Técnico
    const liderBtn = screen.getByTitle('Ir a la Vista de Líder Técnico');
    fireEvent.click(liderBtn);
    expect(mockSwitchViewRole).toHaveBeenCalledWith('MANAGER');
    expect(mockSetActiveTab).toHaveBeenCalledWith('proyectos');

    // Click Vista Desarrollador
    const devBtn = screen.getByTitle('Ir a la Vista de Desarrollador');
    fireEvent.click(devBtn);
    expect(mockSwitchViewRole).toHaveBeenCalledWith('DEVELOPER');
    expect(mockSetActiveTab).toHaveBeenCalledWith('developer');
  });
});
