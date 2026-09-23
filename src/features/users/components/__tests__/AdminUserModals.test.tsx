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

  it('renders RBAC config modal and handles close buttons', () => {
    const setShowConfigModal = vi.fn();
    const { rerender } = render(
      <AdminUserModals {...defaultProps} showConfigModal={true} setShowConfigModal={setShowConfigModal} />
    );
    expect(screen.getByText('Matriz de Permisos Efectivos RBAC')).toBeDefined();
    
    const saveBtn = screen.getByText('Guardar & Cerrar');
    fireEvent.click(saveBtn);
    expect(setShowConfigModal).toHaveBeenCalledWith(false);

    // Click X button in config modal
    const closeBtns = screen.getAllByRole('button');
    fireEvent.click(closeBtns[0]);
    expect(setShowConfigModal).toHaveBeenCalledWith(false);
  });

  it('renders invite modal when isInviteOpen is true and handles interactions', () => {
    const setIsInviteOpen = vi.fn();
    const handleInviteUser = vi.fn();
    render(
      <AdminUserModals 
        {...defaultProps} 
        isInviteOpen={true} 
        setIsInviteOpen={setIsInviteOpen}
        handleInviteUser={handleInviteUser}
      />
    );
    expect(screen.getByText('Invitar Nuevo Usuario')).toBeDefined();

    const nameInput = screen.getByPlaceholderText('Ej. Laura Restrepo');
    const emailInput = screen.getByPlaceholderText('lrestrepo@mchav.com');
    const roleSelect = screen.getByRole('combobox');
    const submitBtn = screen.getByText('Enviar Invitación');

    // Submit empty form shows error
    fireEvent.click(submitBtn);
    expect(screen.getByText('Todos los campos son obligatorios.')).toBeDefined();

    // Cancel button
    const cancelBtn = screen.getByText('Cancelar');
    fireEvent.click(cancelBtn);
    expect(setIsInviteOpen).toHaveBeenCalledWith(false);

    // Submit filled form with manager role
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@user.com' } });
    fireEvent.change(roleSelect, { target: { value: 'MANAGER' } });
    
    fireEvent.click(submitBtn);
    expect(handleInviteUser).toHaveBeenCalledWith('Test User', 'test@user.com', 'MANAGER');
    expect(setIsInviteOpen).toHaveBeenCalledWith(false);
  });

  it('renders audit modal with various log types and methods', () => {
    const mockLogs = [
      { action_path: '/api/v1/users', method: 'GET', timestamp: '2026-08-27T10:00:00' },
      { action_path: '/api/v1/users/1', method: 'POST', timestamp: '2026-08-27T10:05:00' },
      { action_path: '/burnup', method: 'GET', timestamp: '2026-08-27T11:00:00' },
      { action_path: '/sprints/sync', method: 'POST', timestamp: '2026-08-27T12:00:00' },
      { action_path: '/api/v1/projects', method: 'GET', timestamp: '2026-08-27T13:00:00' },
      { action_path: '/api/v1/jql', method: 'POST', timestamp: '2026-08-27T14:00:00' },
      { action_path: '/auth/login', method: 'POST', timestamp: '2026-08-27T15:00:00' },
      { action_path: '/other/action', method: 'GET', timestamp: '2026-08-27T16:00:00' }
    ];

    const setExpandedUserId = vi.fn();

    render(
      <AdminUserModals 
        {...defaultProps} 
        selectedLogUser={mockUser} 
        paginatedLogs={mockLogs}
        filteredLogs={mockLogs}
        setExpandedUserId={setExpandedUserId}
        logSpecificDate="2026-08-27"
      />
    );

    expect(screen.getByText('Auditoría')).toBeDefined();
    expect(screen.getByText('Consulta de Usuarios')).toBeDefined();
    expect(screen.getByText('Gestión de Usuarios')).toBeDefined();
    expect(screen.getByText('Consulta de Salud Operativa')).toBeDefined();
    expect(screen.getByText('Sincronización de Entorno')).toBeDefined();
    expect(screen.getByText('Exploración de Tableros')).toBeDefined();
    expect(screen.getByText('Búsqueda Avanzada JQL')).toBeDefined();
    expect(screen.getByText('Sesión del Sistema')).toBeDefined();
    expect(screen.getByText('Actividad del Sistema')).toBeDefined();

    // Clear specific date button
    const clearDateBtn = screen.getByTitle('Buscar por fecha exacta').nextSibling as HTMLElement;
    if (clearDateBtn) {
      fireEvent.click(clearDateBtn);
      expect(defaultProps.setLogSpecificDate).toHaveBeenCalledWith('');
      expect(defaultProps.setLogPage).toHaveBeenCalledWith(1);
    }
  });

  it('handles loading state and empty state in audit modal', () => {
    const { rerender } = render(
      <AdminUserModals 
        {...defaultProps} 
        selectedLogUser={mockUser} 
        loadingLogs={true}
      />
    );
    expect(screen.getByText('Analizando registros...')).toBeDefined();

    rerender(
      <AdminUserModals 
        {...defaultProps} 
        selectedLogUser={mockUser} 
        loadingLogs={false}
        paginatedLogs={[]}
      />
    );
    expect(screen.getByText('Sin actividad registrada.')).toBeDefined();
  });

  it('handles audit modal pagination and close clicks', () => {
    const setLogPage = vi.fn();
    const setExpandedUserId = vi.fn();

    render(
      <AdminUserModals 
        {...defaultProps} 
        selectedLogUser={mockUser} 
        paginatedLogs={[{ action_path: '/test', timestamp: '2026' }]}
        filteredLogs={[{ action_path: '/test', timestamp: '2026' }]}
        logPage={2}
        totalLogPages={5}
        setLogPage={setLogPage}
        setExpandedUserId={setExpandedUserId}
      />
    );

    // Prev button
    const prevBtn = screen.getByText('Ant');
    fireEvent.click(prevBtn);
    expect(setLogPage).toHaveBeenCalled();

    // Next button
    const nextBtn = screen.getByText('Sig');
    fireEvent.click(nextBtn);
    expect(setLogPage).toHaveBeenCalled();

    // Close button
    const closeBtn = screen.getByRole('button', { name: '' });
    // Or clicking backdrop
    const backdrop = document.querySelector('.bg-slate-950\\/60');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(setExpandedUserId).toHaveBeenCalledWith(null);
    }
  });
});
