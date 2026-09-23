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

  it('handles role parsing variations and user fallback names', async () => {
    const diverseUsers = [
      { id_usuario: 10, email: 'lead@test.com', rol: 'LIDER_TECNICO', activo: true },
      { id_usuario: 11, email: 'plan@test.com', rol: 'PLANIFICADOR', activo: false },
      { id_usuario: 12, rol: 'UNKNOWN', activo: true }, // no name, no email
    ];
    (api.get as any).mockResolvedValueOnce({ data: diverseUsers });

    const { result } = renderHook(() => useAdminUsers());

    await waitFor(() => {
      expect(result.current.users.length).toBe(3);
    });

    expect(result.current.users[0].role).toBe('MANAGER');
    expect(result.current.users[1].role).toBe('MANAGER');
    expect(result.current.users[2].role).toBe('DEVELOPER');
    expect(result.current.users[2].name).toBe('Usuario');
  });

  it('handles fetch users error gracefully', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (api.get as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAdminUsers());

    await waitFor(() => {
      expect(result.current.users).toEqual([]);
    });

    expect(errorSpy).toHaveBeenCalledWith('Error fetching real users', expect.any(Error));
    errorSpy.mockRestore();
  });

  it('handles role change API failure and saves role to localStorage', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    (api.get as any).mockResolvedValueOnce({ data: mockUsers });
    (api.put as any).mockRejectedValueOnce(new Error('Update failed'));

    const { result } = renderHook(() => useAdminUsers());
    await waitFor(() => expect(result.current.users.length).toBe(2));

    await act(async () => {
      await result.current.handleRoleChange('1', 'ADMIN');
    });

    expect(logSpy).toHaveBeenCalledWith('Actualizando estado local de rol:', expect.any(Error));
    expect(localStorage.getItem('mock_user_roles_map')).toContain('ADMIN');
    logSpy.mockRestore();
  });

  it('toggles inactive user to active and handles toggle error', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    (api.get as any).mockResolvedValueOnce({ data: mockUsers });
    (api.put as any).mockRejectedValueOnce(new Error('Status update error'));

    const { result } = renderHook(() => useAdminUsers());
    await waitFor(() => expect(result.current.users.length).toBe(2));

    await act(async () => {
      await result.current.toggleUserStatus('2'); // ID 2 is INACTIVE
    });

    const userDev = result.current.users.find(u => u.id === '2');
    expect(userDev?.status).toBe('ACTIVE');
    expect(result.current.toastMessage).toContain('activada exitosamente');
    expect(logSpy).toHaveBeenCalledWith('Actualizando estado local de activación:', expect.any(Error));
    logSpy.mockRestore();
  });

  it('fetches and filters user logs by 7D, 30D, and specific date', async () => {
    const now = new Date();
    const mockLogs = [
      { id: 1, action: 'LOGIN', timestamp: now.toISOString() },
      { id: 2, action: 'ROLE_UPDATE', timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }, // 3 days ago
      { id: 3, action: 'EXPORT', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString() }, // 15 days ago
      { id: 4, action: 'LOGOUT', timestamp: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString() }, // 40 days ago
    ];

    (api.get as any).mockImplementation((url: string) => {
      if (url.includes('/logs')) {
        return Promise.resolve({ data: mockLogs });
      }
      return Promise.resolve({ data: mockUsers });
    });

    const { result } = renderHook(() => useAdminUsers());
    await waitFor(() => expect(result.current.users.length).toBe(2));

    // Expand user
    act(() => {
      result.current.setExpandedUserId('1');
    });

    await waitFor(() => {
      expect(result.current.logs.length).toBe(4);
    });

    // Filter 7D
    act(() => {
      result.current.setLogFilterDate('7D');
    });
    expect(result.current.filteredLogs.length).toBe(2);

    // Filter 30D
    act(() => {
      result.current.setLogFilterDate('30D');
    });
    expect(result.current.filteredLogs.length).toBe(3);

    // Filter specific date
    const targetDateStr = now.toISOString().split('T')[0];
    act(() => {
      result.current.setLogFilterDate('ALL');
      result.current.setLogSpecificDate(targetDateStr);
    });
    expect(result.current.filteredLogs.length).toBeGreaterThan(0);

    // Collapse user
    act(() => {
      result.current.setExpandedUserId(null);
    });
    expect(result.current.logs).toEqual([]);
  });

  it('handles user logs fetch error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes('/logs')) {
        return Promise.reject(new Error('Logs failed'));
      }
      return Promise.resolve({ data: mockUsers });
    });

    const { result } = renderHook(() => useAdminUsers());
    await waitFor(() => expect(result.current.users.length).toBe(2));

    act(() => {
      result.current.setExpandedUserId('1');
    });

    await waitFor(() => {
      expect(result.current.loadingLogs).toBe(false);
    });

    expect(errorSpy).toHaveBeenCalledWith('Error logs', expect.any(Error));
    errorSpy.mockRestore();
  });
});

