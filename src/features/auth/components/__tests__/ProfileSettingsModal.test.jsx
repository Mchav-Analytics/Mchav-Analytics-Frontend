import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileSettingsModal from '../ProfileSettingsModal';
import { authService } from '../../../../services/api';

const mockLogout = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    logout: mockLogout,
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' },
    token: 'mock-token' 
  }))
}));

vi.mock('../../../../services/api', () => ({
  authService: {
    getJiraCredentials: vi.fn(),
    saveJiraCredentials: vi.fn()
  }
}));

describe('ProfileSettingsModal', () => {
  const userProfile = {
    nombre: 'Juan Perez',
    email: 'juan@test.com',
    rol: 'MANAGER',
    onLogout: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authService.getJiraCredentials.mockResolvedValue(null);
  });

  it('renders correctly when open', async () => {
    authService.getJiraCredentials.mockResolvedValue({
      jira_domain: 'https://test.atlassian.net',
      jira_email: 'juan@test.com',
      api_token_vinculado: true
    });

    await act(async () => {
      render(<ProfileSettingsModal isOpen={true} onClose={() => {}} userProfile={userProfile} />);
    });
    
    expect(screen.getByText('Nombre Completo')).toBeInTheDocument();
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getAllByText('juan@test.com').length).toBeGreaterThan(0);
    expect(screen.getByText('LÍDER TÉCNICO')).toBeInTheDocument();
    expect(screen.getByText('Token Activo')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(<ProfileSettingsModal isOpen={false} onClose={() => {}} userProfile={userProfile} />);
    expect(container.firstChild).toBeNull();
  });

  it('submits jira credentials successfully', async () => {
    authService.getJiraCredentials.mockResolvedValue(null);
    authService.saveJiraCredentials.mockResolvedValue({ detail: 'Ok' });
    
    vi.useFakeTimers();

    await act(async () => {
      render(<ProfileSettingsModal isOpen={true} onClose={() => {}} userProfile={userProfile} />);
    });

    const domainInput = screen.getByPlaceholderText('https://tu-instancia.atlassian.net');
    const tokenInput = screen.getByPlaceholderText('ATATT3xFfGF0...');
    const emailInput = screen.getByPlaceholderText('usuario@empresa.com');
    
    fireEvent.change(domainInput, { target: { value: 'https://new.atlassian.net' } });
    fireEvent.change(emailInput, { target: { value: 'juan@test.com' } });
    fireEvent.change(tokenInput, { target: { value: 'newtoken' } });

    const saveBtn = screen.getByRole('button', { name: /Guardar y Vincular API/i });
    
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(authService.saveJiraCredentials).toHaveBeenCalledWith({
      jira_domain: 'https://new.atlassian.net',
      jira_email: 'juan@test.com',
      jira_api_token: 'newtoken'
    });

    expect(screen.getByText('¡Credenciales de Jira verificadas y vinculadas con éxito!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('¡Credenciales de Jira verificadas y vinculadas con éxito!')).toBeNull();
    vi.useRealTimers();
  });

  it('handles jira credentials error', async () => {
    authService.getJiraCredentials.mockResolvedValue(null);
    authService.saveJiraCredentials.mockRejectedValue({ response: { data: { detail: 'Token inválido' } } });
    
    await act(async () => {
      render(<ProfileSettingsModal isOpen={true} onClose={() => {}} userProfile={userProfile} />);
    });

    const saveBtn = screen.getByRole('button', { name: /Guardar y Vincular API/i });
    
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(screen.getByText('Token inválido')).toBeInTheDocument();
  });

  it('calls onLogout prop when logout button is clicked', async () => {
    const onCloseMock = vi.fn();
    
    await act(async () => {
      render(<ProfileSettingsModal isOpen={true} onClose={onCloseMock} userProfile={userProfile} />);
    });

    const logoutBtn = screen.getByRole('button', { name: /Cerrar Sesión de la Plataforma/i });
    
    await act(async () => {
      fireEvent.click(logoutBtn);
    });

    expect(onCloseMock).toHaveBeenCalled();
    expect(userProfile.onLogout).toHaveBeenCalled();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('calls global logout if no onLogout prop', async () => {
    const noLogoutProfile = { ...userProfile, onLogout: null };
    
    await act(async () => {
      render(<ProfileSettingsModal isOpen={true} onClose={() => {}} userProfile={noLogoutProfile} />);
    });

    const logoutBtn = screen.getByRole('button', { name: /Cerrar Sesión de la Plataforma/i });
    
    await act(async () => {
      fireEvent.click(logoutBtn);
    });

    expect(mockLogout).toHaveBeenCalled();
  });

  it('handles closing animation on next render', async () => {
    vi.useFakeTimers();
    const { rerender } = render(<ProfileSettingsModal isOpen={true} onClose={() => {}} userProfile={userProfile} />);
    
    expect(screen.getByText('Nombre Completo')).toBeInTheDocument();
    
    act(() => {
      rerender(<ProfileSettingsModal isOpen={false} onClose={() => {}} userProfile={userProfile} />);
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Nombre Completo')).toBeNull();
    vi.useRealTimers();
  });
});
