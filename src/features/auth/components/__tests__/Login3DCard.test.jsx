import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login3DCard from '../Login3DCard';

describe('Login3DCard', () => {
  const defaultProps = {
    cardRef: { current: null },
    isFlipped: false,
    setIsFlipped: vi.fn(),
    errorMessage: '',
    authError: '',
    isSubmitting: false,
    authLoading: false,
    handleJiraAuth: vi.fn(),
    handleLocalDevLogin: vi.fn()
  };

  it('renders front card by default and flips on container click', () => {
    const setIsFlipped = vi.fn();
    render(<Login3DCard {...defaultProps} setIsFlipped={setIsFlipped} />);

    expect(screen.getByText('MCHAV Analytics')).toBeDefined();
    expect(screen.getByText('Girar para iniciar sesión')).toBeDefined();

    // Click container to flip
    const flipContainer = screen.getByText('Girar para iniciar sesión').closest('.flip-card-container');
    if (flipContainer) {
      fireEvent.click(flipContainer);
      expect(setIsFlipped).toHaveBeenCalledWith(true);
    }
  });

  it('renders back card when isFlipped is true, displays errors and handles Jira auth and flip back', () => {
    const setIsFlipped = vi.fn();
    const handleJiraAuth = vi.fn();

    render(
      <Login3DCard 
        {...defaultProps} 
        isFlipped={true} 
        setIsFlipped={setIsFlipped}
        errorMessage="Credenciales inválidas"
        handleJiraAuth={handleJiraAuth}
      />
    );

    expect(screen.getByText('Bienvenido a MCHAV')).toBeDefined();
    expect(screen.getByText(/Credenciales inválidas/i)).toBeDefined();

    // Click Jira auth button
    const authBtn = screen.getByText('Continuar con Atlassian (Jira)');
    fireEvent.click(authBtn);
    expect(handleJiraAuth).toHaveBeenCalled();

    // Click return to front
    const returnBtn = screen.getByText('Volver a la vista principal ↩');
    fireEvent.click(returnBtn);
    expect(setIsFlipped).toHaveBeenCalledWith(false);
  });
});
