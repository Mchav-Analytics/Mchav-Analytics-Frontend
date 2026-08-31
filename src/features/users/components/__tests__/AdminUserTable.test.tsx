import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminUserTable from '../AdminUserTable';
import { ManagementUser } from '../../hooks/useAdminUsers';

describe('AdminUserTable', () => {
  const mockUsers: ManagementUser[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      lastActive: '2026-08-27T10:00',
      joinedDate: '2025-01-01',
      activityScore: 90
    },
    {
      id: '2',
      name: 'Dev User',
      email: 'dev@test.com',
      role: 'DEVELOPER',
      status: 'INACTIVE',
      lastActive: '2026-08-26T10:00',
      joinedDate: '2026-01-01',
      activityScore: 50
    }
  ];

  const defaultProps = {
    paginatedUsers: mockUsers,
    filteredUsers: mockUsers,
    expandedUserId: null,
    setExpandedUserId: vi.fn(),
    currentPage: 1,
    setCurrentPage: vi.fn(),
    totalPages: 2,
    itemsPerPage: 10,
    handleRoleChange: vi.fn(),
    toggleUserStatus: vi.fn()
  };

  it('renders users correctly', () => {
    render(<AdminUserTable {...defaultProps} />);
    
    expect(screen.getByText('Admin User')).toBeDefined();
    expect(screen.getByText('admin@test.com')).toBeDefined();
    expect(screen.getByText('Dev User')).toBeDefined();
    
    // Status badges
    expect(screen.getByText('Activo')).toBeDefined();
    expect(screen.getByText('Inactivo')).toBeDefined();
  });

  it('handles empty state', () => {
    render(<AdminUserTable {...defaultProps} paginatedUsers={[]} filteredUsers={[]} />);
    expect(screen.getByText('No hay usuarios con esos filtros.')).toBeDefined();
  });

  it('calls toggleUserStatus when status button clicked', () => {
    render(<AdminUserTable {...defaultProps} />);
    
    const disableButton = screen.getByText('Desactivar');
    fireEvent.click(disableButton);
    expect(defaultProps.toggleUserStatus).toHaveBeenCalledWith('1');

    const enableButton = screen.getByText('Activar');
    fireEvent.click(enableButton);
    expect(defaultProps.toggleUserStatus).toHaveBeenCalledWith('2');
  });

  it('calls handleRoleChange when select changes', () => {
    render(<AdminUserTable {...defaultProps} />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'MANAGER' } });
    
    expect(defaultProps.handleRoleChange).toHaveBeenCalledWith('2', 'MANAGER');
  });

  it('calls setExpandedUserId when audit button is clicked', () => {
    render(<AdminUserTable {...defaultProps} />);
    
    const auditButtons = screen.getAllByText('Ver Log');
    fireEvent.click(auditButtons[0]);
    
    expect(defaultProps.setExpandedUserId).toHaveBeenCalledWith('1');
  });

  it('handles pagination clicks', () => {
    render(<AdminUserTable {...defaultProps} />);
    
    const nextButton = screen.getByRole('button', { name: 'Siguiente' });
    fireEvent.click(nextButton);
    expect(defaultProps.setCurrentPage).toHaveBeenCalled();

    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);
    expect(defaultProps.setCurrentPage).toHaveBeenCalled();
  });
});
