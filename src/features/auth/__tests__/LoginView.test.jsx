import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginView from '../views/LoginView';
import { useLogin } from '../hooks/useLogin';

// Mock del hook useLogin
vi.mock('../hooks/useLogin', () => ({
  useLogin: vi.fn()
}));

// Mocks de los componentes hijos para aislar el test de integración superficial
vi.mock('../components/LoginStyles', () => ({
  default: () => <div data-testid="login-styles" />
}));
vi.mock('../components/Login3DCard', () => ({
  default: ({ isFlipped }) => <div data-testid="login-3d-card">{isFlipped ? 'Flipped' : 'Front'}</div>
}));
vi.mock('../components/LoginStreetlamps', () => ({
  default: () => <div data-testid="login-streetlamps" />
}));
vi.mock('../components/LoginMascot', () => ({
  default: () => <div data-testid="login-mascot" />
}));

describe('Vista: LoginView (Fase 4.4)', () => {
  it('debe renderizar todos los componentes hijos orquestados', () => {
    useLogin.mockReturnValue({
      isFlipped: false,
      setIsFlipped: vi.fn(),
      isSubmitting: false,
      errorMessage: '',
      authLoading: false,
      authError: null,
      containerRef: { current: null },
      cardRef: { current: null },
      handleMouseMove: vi.fn(),
      handleMouseLeave: vi.fn(),
      handleJiraAuth: vi.fn(),
      handleLocalDevLogin: vi.fn()
    });

    render(<LoginView />);

    expect(screen.getByTestId('login-styles')).toBeInTheDocument();
    expect(screen.getByTestId('login-3d-card')).toBeInTheDocument();
    expect(screen.getByTestId('login-streetlamps')).toBeInTheDocument();
    expect(screen.getByTestId('login-mascot')).toBeInTheDocument();
    
    // Verifica que le pasa props correctamente al componente hijo
    expect(screen.getByText('Front')).toBeInTheDocument();
  });

  it('debe propagar los props correctamente al Login3DCard', () => {
    useLogin.mockReturnValue({
      isFlipped: true,
      setIsFlipped: vi.fn(),
      isSubmitting: false,
      errorMessage: '',
      authLoading: false,
      authError: null,
      containerRef: { current: null },
      cardRef: { current: null },
      handleMouseMove: vi.fn(),
      handleMouseLeave: vi.fn(),
      handleJiraAuth: vi.fn(),
      handleLocalDevLogin: vi.fn()
    });

    render(<LoginView />);

    expect(screen.getByText('Flipped')).toBeInTheDocument();
  });
});
