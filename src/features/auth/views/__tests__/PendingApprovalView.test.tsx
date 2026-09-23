import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PendingApprovalView from '../PendingApprovalView';
import * as AuthContext from '../../context/AuthContext';

vi.mock('../../../components/layout/Logo', () => ({
  default: () => <div data-testid="mock-logo">Logo Mock</div>
}));

describe('PendingApprovalView', () => {
  const mockLogout = vi.fn();
  const mockCheckAuthSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { name: 'Juan Pérez', email: 'juan@test.com', rol: 'USER' },
      isAuthenticated: true,
      loading: false,
      error: null,
      login: vi.fn(),
      loginWithJira: vi.fn(),
      logout: mockLogout,
      checkAuthSession: mockCheckAuthSession,
      approvedUsers: [],
      approveUserPermission: vi.fn(),
      switchViewRole: vi.fn(),
      isRealAdmin: false,
      resetDemoState: vi.fn()
    });
  });

  it('renders pending approval message and user details', () => {
    render(<PendingApprovalView />);

    expect(screen.getByText('Pendiente de Autorización')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan@test.com')).toBeInTheDocument();
    expect(screen.getByText(/Usuario \(Sin permisos asignados\)/i)).toBeInTheDocument();
  });

  it('calls logout when Cerrar Sesión button is clicked', () => {
    render(<PendingApprovalView />);

    const logoutButtons = screen.getAllByRole('button', { name: /Cerrar Sesión/i });
    fireEvent.click(logoutButtons[0]);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('calls checkAuthSession when Comprobar Estado button is clicked', async () => {
    mockCheckAuthSession.mockResolvedValueOnce(undefined);
    render(<PendingApprovalView />);

    const refreshBtn = screen.getByRole('button', { name: /Comprobar Estado de Aprobación/i });
    await act(async () => {
      fireEvent.click(refreshBtn);
    });

    expect(mockCheckAuthSession).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/Estado verificado/i)).toBeInTheDocument();
  });
});
