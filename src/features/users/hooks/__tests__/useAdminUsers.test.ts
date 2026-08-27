import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdminUsers } from '../useAdminUsers';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('useAdminUsers', () => {
  const mockUsers = [
    {
      id_usuario: 1,
      nombre: 'User Admin',
      email: 'admin@test.com',
      rol: 'ADMIN',
      activo: true
    },
    {
      id_usuario: 2,
      nombre: 'User Dev',
      email: 'dev@test.com',
      rol: 'DEVELOPER',
      activo: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetch initial users on mount and mapped correctly', async () => {
    (api.get as any).mockResolvedValueOnce({ data: mockUsers });
    
    const { result } = renderHook(() => useAdminUsers());

    await waitFor(() => {
      expect(result.current.users.length).toBe(2);
    });

    expect(result.current.users[0].role).toBe('ADMIN');
    expect(result.current.users[0].status).toBe('ACTIVE');
    expect(result.current.users[1].role).toBe('DEVELOPER');
    expect(result.current.users[1].status).toBe('INACTIVE');
  });

  it('filters users by search term', async () => {
    (api.get as any).mockResolvedValueOnce({ data: mockUsers });
    const { result } = renderHook(() => useAdminUsers());

    await waitFor(() => {
      expect(result.current.users.length).toBe(2);
    });

    act(() => {
      result.current.setSearchTerm('admin');
    });

    expect(result.current.filteredUsers.length).toBe(1);
    expect(result.current.filteredUsers[0].name).toBe('User Admin');
  });

  it('filters users by role and status', async () => {
    (api.get as any).mockResolvedValueOnce({ data: mockUsers });
    const { result } = renderHook(() => useAdminUsers());

    await waitFor(() => {
      expect(result.current.users.length).toBe(2);
    });

    act(() => {
      result.current.setRoleFilter('DEVELOPER');
    });

    expect(result.current.filteredUsers.length).toBe(1);
    expect(result.current.filteredUsers[0].name).toBe('User Dev');

    act(() => {
      result.current.setRoleFilter('ALL');
      result.current.setStatusFilter('INACTIVE');
    });

    expect(result.current.filteredUsers.length).toBe(1);
    expect(result.current.filteredUsers[0].status).toBe('INACTIVE');
  });

  it('invites a new user successfully', async () => {
    (api.get as any).mockResolvedValueOnce({ data: mockUsers });
    const mockApprove = vi.fn();
    const { result } = renderHook(() => useAdminUsers(mockApprove));

    await waitFor(() => {
      expect(result.current.users.length).toBe(2);
    });

    act(() => {
      result.current.handleInviteUser('New User', 'new@test.com', 'MANAGER');
    });

    expect(result.current.users.length).toBe(3);
    expect(result.current.users[0].name).toBe('New User');
    expect(result.current.users[0].role).toBe('MANAGER');
    expect(mockApprove).toHaveBeenCalledWith('new@test.com', 'MANAGER');
  });

  it('toggles user status', async () => {
    (api.get as any).mockResolvedValueOnce({ data: mockUsers });
    (api.put as any).mockResolvedValueOnce({ data: {} });
    const { result } = renderHook(() => useAdminUsers());

    await waitFor(() => {
      expect(result.current.users.length).toBe(2);
    });

    await act(async () => {
      await result.current.toggleUserStatus('1');
    });

    const userAdmin = result.current.users.find(u => u.id === '1');
    expect(userAdmin?.status).toBe('INACTIVE');
    expect(api.put).toHaveBeenCalledWith('/api/v1/users/1/status', { activo: false });
  });

  it('changes user role', async () => {
    (api.get as any).mockResolvedValueOnce({ data: mockUsers });
    (api.put as any).mockResolvedValueOnce({ data: {} });
    const mockApprove = vi.fn();
    const { result } = renderHook(() => useAdminUsers(mockApprove));

    await waitFor(() => {
      expect(result.current.users.length).toBe(2);
    });

    await act(async () => {
      await result.current.handleRoleChange('2', 'MANAGER');
    });

    const userDev = result.current.users.find(u => u.id === '2');
    expect(userDev?.role).toBe('MANAGER');
    expect(api.put).toHaveBeenCalledWith('/api/v1/users/2/role', { role: 'MANAGER' });
    expect(mockApprove).toHaveBeenCalledWith('dev@test.com', 'MANAGER');
  });
});
