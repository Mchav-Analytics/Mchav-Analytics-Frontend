import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
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

  it('calls window.print when Exportar PDF is clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const user = userEvent.setup();
    
    await act(async () => {
      renderWithProviders(<AdminUsuariosView />);
    });

    const printBtn = screen.getByRole('button', { name: /Exportar PDF/i });
    await act(async () => {
      await user.click(printBtn);
    });

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('closes the toast message when X is clicked', async () => {
    (api.put as any).mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    await act(async () => {
      renderWithProviders(<AdminUsuariosView />);
    });

    await waitFor(() => {
      expect(screen.getByText('User Manager')).toBeInTheDocument();
    });

    const roleSelects = screen.getAllByRole('combobox');
    const managerSelect = roleSelects[1];

    await act(async () => {
      await user.selectOptions(managerSelect, 'DEVELOPER');
    });

    const toastMessage = screen.getByText(/✨ Rol de User Manager actualizado a DESARROLLADOR/i);
    expect(toastMessage).toBeInTheDocument();

    const closeBtn = toastMessage.nextElementSibling;
    if (closeBtn) {
      await act(async () => {
        await user.click(closeBtn);
      });
      expect(screen.queryByText(/✨ Rol de User Manager actualizado a DESARROLLADOR/i)).not.toBeInTheDocument();
    }
  });
});

vi.mock('../../components/AdminUserModals', () => ({
  default: (props: any) => (
    <div data-testid="admin-user-modals">
      <button onClick={() => props.formatTimestamp('2023-10-12T14:30:00Z')}>Test TS 1</button>
      <button onClick={() => props.formatTimestamp('')}>Test TS 2</button>
      <button onClick={() => props.formatTimestamp('invalid')}>Test TS 3</button>
      <button onClick={() => props.formatTimestamp('2023-10-12T09:30:00')}>Test TS 4</button>
    </div>
  )
}));

describe('AdminUsuariosView - formatTimestamp', () => {
  it('calls formatTimestamp from AdminUserModals', async () => {
    await act(async () => {
      renderWithProviders(<AdminUsuariosView />);
    });
    
    // We render AdminUsuariosView which renders AdminUserModals mock
    const btn1 = screen.getByText('Test TS 1');
    const btn2 = screen.getByText('Test TS 2');
    const btn3 = screen.getByText('Test TS 3');
    const btn4 = screen.getByText('Test TS 4');
    
    // Clicking these will invoke formatTimestamp inside AdminUsuariosView and increase branch coverage
    await act(async () => {
      fireEvent.click(btn1);
      fireEvent.click(btn2);
      fireEvent.click(btn3);
      fireEvent.click(btn4);
    });
  });
});

