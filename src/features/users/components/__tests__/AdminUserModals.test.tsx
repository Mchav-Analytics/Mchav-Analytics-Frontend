import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminUserModals from '../AdminUserModals';
import { ManagementUser } from '../../hooks/useAdminUsers';

describe('AdminUserModals', () => {
  const mockUser: ManagementUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastActive: '2026-08-27T10:00',
    joinedDate: '2025-01-01',
    activityScore: 90
  };

  const defaultProps = {
    showConfigModal: false,
    setShowConfigModal: vi.fn(),
    isInviteOpen: false,
    setIsInviteOpen: vi.fn(),
    handleInviteUser: vi.fn(),
    selectedLogUser: undefined,
    setExpandedUserId: vi.fn(),
    logSpecificDate: '',
    setLogSpecificDate: vi.fn(),
    logFilterDate: 'ALL',
    setLogFilterDate: vi.fn(),
    setLogPage: vi.fn(),
    loadingLogs: false,
    paginatedLogs: [],
    logPage: 1,
    totalLogPages: 1,
    filteredLogs: [],
    formatTimestamp: (ts: string) => ts
  };

  it('renders nothing when all modals are closed', () => {
    const { container } = render(<AdminUserModals {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders RBAC config modal when showConfigModal is true', () => {
    render(<AdminUserModals {...defaultProps} showConfigModal={true} />);
    expect(screen.getByText('Matriz de Permisos Efectivos RBAC')).toBeDefined();
    
    const closeBtn = screen.getByText('Guardar & Cerrar');
    fireEvent.click(closeBtn);
    expect(defaultProps.setShowConfigModal).toHaveBeenCalledWith(false);
  });

  it('renders invite modal when isInviteOpen is true and submits form', () => {
    render(<AdminUserModals {...defaultProps} isInviteOpen={true} />);
    expect(screen.getByText('Invitar Nuevo Usuario')).toBeDefined();

    const nameInput = screen.getByPlaceholderText('Ej. Laura Restrepo');
    const emailInput = screen.getByPlaceholderText('lrestrepo@mchav.com');
    const roleSelect = screen.getByRole('combobox');
    const submitBtn = screen.getByText('Enviar Invitación');

    // Submit empty form shows error
    fireEvent.click(submitBtn);
    expect(screen.getByText('Todos los campos son obligatorios.')).toBeDefined();

    // Submit filled form
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@user.com' } });
    fireEvent.change(roleSelect, { target: { value: 'ADMIN' } });
    
    fireEvent.click(submitBtn);
    expect(defaultProps.handleInviteUser).toHaveBeenCalledWith('Test User', 'test@user.com', 'ADMIN');
  });

  it('renders audit modal when selectedLogUser is provided', () => {
    const mockLogs = [
      { action_path: '/api/v1/users', method: 'GET', timestamp: '2026-08-27T10:00:00' },
      { action_path: '/burnup', method: 'GET', timestamp: '2026-08-27T11:00:00' }
    ];

    render(
      <AdminUserModals 
        {...defaultProps} 
        selectedLogUser={mockUser} 
        paginatedLogs={mockLogs}
        filteredLogs={mockLogs}
      />
    );

    expect(screen.getByText('Auditoría')).toBeDefined();
    expect(screen.getByText('Consulta de Usuarios')).toBeDefined();
    expect(screen.getByText('Consulta de Salud Operativa')).toBeDefined();
  });

  it('handles audit modal filters and pagination', () => {
    render(
      <AdminUserModals 
        {...defaultProps} 
        selectedLogUser={mockUser} 
        paginatedLogs={[]}
        filteredLogs={[]}
      />
    );

    const dateInput = screen.getByTitle('Buscar por fecha exacta');
    fireEvent.change(dateInput, { target: { value: '2026-08-27' } });
    expect(defaultProps.setLogSpecificDate).toHaveBeenCalledWith('2026-08-27');
    expect(defaultProps.setLogPage).toHaveBeenCalledWith(1);

    const filterSelect = screen.getByRole('combobox');
    fireEvent.change(filterSelect, { target: { value: '7D' } });
    expect(defaultProps.setLogFilterDate).toHaveBeenCalledWith('7D');
  });
});
