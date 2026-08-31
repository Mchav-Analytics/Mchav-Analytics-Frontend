import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminUsuariosView from '../AdminUsuariosView';
import api from '../../../../services/api';
import { AuthProvider } from '../../../auth/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  }
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AdminUsuariosView - Integration', () => {
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
      nombre: 'User Manager',
      email: 'manager@test.com',
      rol: 'MANAGER',
      activo: true
    },
    {
      id_usuario: 3,
      nombre: 'User Dev',
      email: 'dev@test.com',
      rol: 'DEVELOPER',
      activo: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({ data: mockUsers });
  });

  it('renders users table properly', async () => {
    await act(async () => {
      renderWithProviders(<AdminUsuariosView />);
    });

    await waitFor(() => {
      expect(screen.getByText('User Admin')).toBeInTheDocument();
      expect(screen.getByText('User Dev')).toBeInTheDocument();
    });
  });

  it('filters users by search text', async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderWithProviders(<AdminUsuariosView />);
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por nombre o correo/i);
    await act(async () => {
      await user.type(searchInput, 'Dev');
    });

    expect(screen.getByText('User Dev')).toBeInTheDocument();
    expect(screen.queryByText('User Admin')).not.toBeInTheDocument();
  });

  it('filters users by inactive status', async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderWithProviders(<AdminUsuariosView />);
    });

    const inactiveBtn = screen.getByRole('button', { name: /Inactivos/i });
    await act(async () => {
      await user.click(inactiveBtn);
    });

    expect(screen.getByText('User Dev')).toBeInTheDocument();
    expect(screen.queryByText('User Admin')).not.toBeInTheDocument();
  });

  it('changes a user role through the select', async () => {
    (api.put as any).mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    await act(async () => {
      renderWithProviders(<AdminUsuariosView />);
    });

    await waitFor(() => {
      expect(screen.getByText('User Manager')).toBeInTheDocument();
    });

    const roleSelects = screen.getAllByRole('combobox');
    const managerSelect = roleSelects[1]; // Index 1 belongs to User Manager

    await act(async () => {
      await user.selectOptions(managerSelect, 'DEVELOPER');
    });

    expect(api.put).toHaveBeenCalledWith('/api/v1/users/2/role', { role: 'DEVELOPER' });
    expect(screen.getByText(/✨ Rol de User Manager actualizado a DESARROLLADOR/i)).toBeInTheDocument();
  });

});
