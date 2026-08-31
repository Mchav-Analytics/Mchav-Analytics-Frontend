import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminRolesSummary from '../AdminRolesSummary';
import { ManagementUser } from '../../hooks/useAdminUsers';

describe('AdminRolesSummary', () => {
  const mockAdminUsers: ManagementUser[] = [
    { id: '1', name: 'Admin 1', email: 'a1@t.com', role: 'ADMIN', status: 'ACTIVE', lastActive: '', joinedDate: '', activityScore: 100 }
  ];
  const mockManagerUsers: ManagementUser[] = [
    { id: '2', name: 'Manager 1', email: 'm1@t.com', role: 'MANAGER', status: 'ACTIVE', lastActive: '', joinedDate: '', activityScore: 100 }
  ];
  const mockDeveloperUsers: ManagementUser[] = [
    { id: '3', name: 'Developer 1', email: 'd1@t.com', role: 'DEVELOPER', status: 'ACTIVE', lastActive: '', joinedDate: '', activityScore: 100 }
  ];

  const defaultProps = {
    adminUsers: mockAdminUsers,
    managerUsers: mockManagerUsers,
    developerUsers: mockDeveloperUsers,
    roleFilter: 'ALL',
    setRoleFilter: vi.fn()
  };

  it('renders summary cards correctly', () => {
    render(<AdminRolesSummary {...defaultProps} />);
    
    expect(screen.getByText('Administrador')).toBeDefined();
    expect(screen.getByText('Planificador')).toBeDefined();
    expect(screen.getByText('Desarrollador')).toBeDefined();
    
    // Check if initials are rendered for the users
    expect(screen.getByTitle('Admin 1')).toBeDefined();
    expect(screen.getByTitle('Manager 1')).toBeDefined();
    expect(screen.getByTitle('Developer 1')).toBeDefined();
  });

  it('calls setRoleFilter when a card is clicked', () => {
    render(<AdminRolesSummary {...defaultProps} />);
    
    const adminCard = screen.getByText('Administrador').closest('div.group');
    if (adminCard) fireEvent.click(adminCard);
    expect(defaultProps.setRoleFilter).toHaveBeenCalledWith('ADMIN');

    const managerCard = screen.getByText('Planificador').closest('div.group');
    if (managerCard) fireEvent.click(managerCard);
    expect(defaultProps.setRoleFilter).toHaveBeenCalledWith('MANAGER');

    const developerCard = screen.getByText('Desarrollador').closest('div.group');
    if (developerCard) fireEvent.click(developerCard);
    expect(defaultProps.setRoleFilter).toHaveBeenCalledWith('DEVELOPER');
  });

  it('toggles role filter back to ALL if already selected', () => {
    render(<AdminRolesSummary {...defaultProps} roleFilter="ADMIN" />);
    
    const adminCard = screen.getByText('Administrador').closest('div.group');
    if (adminCard) fireEvent.click(adminCard);
    expect(defaultProps.setRoleFilter).toHaveBeenCalledWith('ALL');
  });
});
