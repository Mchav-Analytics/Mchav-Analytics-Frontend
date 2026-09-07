import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Topbar from '../Topbar';
import * as AuthContext from '../../../features/auth/context/AuthContext';

describe('Topbar Component', () => {
  const defaultProps = {
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    projects: [],
    selectedProjectId: '1',
    setSelectedProjectId: vi.fn(),
    syncLoading: false,
    handleSyncNow: vi.fn(),
    dateFilter: null,
    setDateFilter: vi.fn(),
    isDarkMode: true,
    setIsDarkMode: vi.fn(),
    setActiveTab: vi.fn(),
    alerts: [{}, {}]
  };

  const mockApproveUserPermission = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderTopbar = (role = 'ADMIN', authProps = {}, props = {}) => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: role, nombre: 'Test User', email: 'test@mchav.com', status: authProps.status || 'ACTIVE' },
      logout: vi.fn(),
      approveUserPermission: mockApproveUserPermission,
      approvedUsers: [],
      switchViewRole: vi.fn(),
      isRealAdmin: role === 'ADMIN',
      ...authProps
    });
    
    return render(<Topbar {...defaultProps} {...props} />);
  };

  it('renders title and subtitle correctly', () => {
    renderTopbar();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });
  
  it('renders correctly for a DEVELOPER', () => {
    renderTopbar('DEVELOPER');
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders correctly for a PENDING user', () => {
    renderTopbar('DEVELOPER', { status: 'PENDING' });
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('can open the role assignment modal and approve user', () => {
    renderTopbar('ADMIN');
    
    // Open modal via test button
    const openBtn = screen.getByTestId('test-open-modal');
    fireEvent.click(openBtn);
    
    expect(screen.getByText('Solicitud de Acceso Pendiente')).toBeInTheDocument();
    
    // Select DEVELOPER role
    const devRadio = screen.getByText(/Desarrollador \(DEVELOPER\)/i);
    fireEvent.click(devRadio);
    
    // Select MANAGER role
    const mgrRadio = screen.getByText(/Líder Técnico \(MANAGER\)/i);
    fireEvent.click(mgrRadio);

    // Approve
    const approveBtn = screen.getByRole('button', { name: /Aprobar y Guardar Rol/i });
    fireEvent.click(approveBtn);

    expect(mockApproveUserPermission).toHaveBeenCalled();
  });

  it('can close the role assignment modal via X and Cancel button', () => {
    renderTopbar('ADMIN');
    
    const openBtn = screen.getByTestId('test-open-modal');
    fireEvent.click(openBtn);
    expect(screen.getByText('Solicitud de Acceso Pendiente')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByText('Solicitud de Acceso Pendiente')).toBeNull();
  });
});
