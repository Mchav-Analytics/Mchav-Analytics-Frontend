import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DevAlertCard from '../components/DevAlertCard';

describe('Componente: DevAlertCard (Fase 4.4)', () => {
  const mockAlert = {
    id: '123',
    issue_id: '100',
    key_issue: 'MCH-100',
    title: 'Test Alert',
    description: 'This is a test alert description',
    level: 'CRITICAL',
    type: 'INACTIVITY'
  };

  it('debe renderizar la información de la alerta correctamente', () => {
    render(<DevAlertCard alert={mockAlert} executingAction={false} handleAlertAction={vi.fn()} />);
    
    // Verifica textos
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
    expect(screen.getByText('This is a test alert description')).toBeInTheDocument();
  });

  it('debe aplicar estilos visuales críticos si el nivel es CRITICAL', () => {
    const { container } = render(<DevAlertCard alert={mockAlert} executingAction={false} handleAlertAction={vi.fn()} />);
    
    // El badge de crítico debería tener texto 'CRITICAL'
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    
    // Verifica que exista un elemento con el gradiente de texto/ícono esperado para CRITICAL
    const iconContainer = container.querySelector('.bg-gradient-to-br');
    expect(iconContainer).toHaveClass('from-rose-500');
  });

  it('debe deshabilitar botones cuando executingAction es true', () => {
    render(<DevAlertCard alert={mockAlert} executingAction={true} handleAlertAction={vi.fn()} />);
    
    // Busca los botones
    const btnAtender = screen.getByRole('button', { name: /Marcar Bloqueado/i });
    const btnAyuda = screen.getByRole('button', { name: /Pedir Ayuda al Planificador/i });
    
    expect(btnAtender).toBeDisabled();
    expect(btnAyuda).toBeDisabled();
  });

  it('debe llamar a handleAlertAction con los parámetros correctos al hacer click en los botones', () => {
    const mockOnAction = vi.fn();
    render(<DevAlertCard alert={mockAlert} executingAction={false} handleAlertAction={mockOnAction} />);
    
    const btnAtender = screen.getByRole('button', { name: /Marcar Bloqueado/i });
    fireEvent.click(btnAtender);
    
    expect(mockOnAction).toHaveBeenCalledWith('100', 'mark_blocked');
    
    const btnAyuda = screen.getByRole('button', { name: /Pedir Ayuda al Planificador/i });
    fireEvent.click(btnAyuda);
    
    expect(mockOnAction).toHaveBeenCalledWith('100', 'request_help');
  });
});
