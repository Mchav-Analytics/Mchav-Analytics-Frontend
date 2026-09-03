import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminUserFilters from '../AdminUserFilters';

describe('AdminUserFilters', () => {
  const defaultProps = {
    usersCount: 50,
    pendingRequestsCount: 5,
    roleFilter: 'ALL',
    setRoleFilter: vi.fn(),
    statusFilter: 'ALL',
    setStatusFilter: vi.fn(),
    searchTerm: '',
    setSearchTerm: vi.fn()
  };

  it('renders correctly with counts', () => {
    render(<AdminUserFilters {...defaultProps} />);
    
    expect(screen.getByText('Todos (50)')).toBeDefined();
    expect(screen.getByText('Inactivos (5)')).toBeDefined();
    expect(screen.getByPlaceholderText('Buscar por nombre o correo...')).toBeDefined();
  });

  it('handles clicking Todos button', () => {
    render(<AdminUserFilters {...defaultProps} statusFilter="INACTIVE" />);
    
    const todosBtn = screen.getByText('Todos (50)');
    fireEvent.click(todosBtn);
    
    expect(defaultProps.setRoleFilter).toHaveBeenCalledWith('ALL');
    expect(defaultProps.setStatusFilter).toHaveBeenCalledWith('ALL');
  });

  it('handles clicking Inactivos button', () => {
    render(<AdminUserFilters {...defaultProps} />);
    
    const inactivosBtn = screen.getByText('Inactivos (5)');
    fireEvent.click(inactivosBtn);
    
    expect(defaultProps.setStatusFilter).toHaveBeenCalledWith('INACTIVE');
  });

  it('handles search input change', () => {
    render(<AdminUserFilters {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Buscar por nombre o correo...');
    fireEvent.change(searchInput, { target: { value: 'admin' } });
    
    expect(defaultProps.setSearchTerm).toHaveBeenCalledWith('admin');
  });

  it('handles clearing search input', () => {
    render(<AdminUserFilters {...defaultProps} searchTerm="admin" />);
    
    // Using querySelector to find the button since it only contains the X icon
    const clearBtn = screen.getAllByRole('button').find(btn => 
      btn.innerHTML.includes('lucide-x') || btn.innerHTML.includes('svg')
    );
    
    // More robust way: Get by role and grab the last button (the X button)
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons[buttons.length - 1];
    
    fireEvent.click(closeBtn);
    expect(defaultProps.setSearchTerm).toHaveBeenCalledWith('');
  });
});
