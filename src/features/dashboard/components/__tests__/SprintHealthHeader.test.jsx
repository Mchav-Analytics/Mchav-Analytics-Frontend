import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SprintHealthHeader from '../SprintHealthHeader';

// Mock del componente de Notificaciones para aislar la prueba
vi.mock('../LiderNotificationBell', () => {
  return {
    default: () => <div data-testid="notification-bell-mock" />
  };
});

describe('SprintHealthHeader Component', () => {
  const defaultProps = {
    selectedProjectId: 'PROJ-123',
    onNavigateToMatrix: vi.fn(),
    healthScore: 85
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with healthy score (>=80)', () => {
    render(<SprintHealthHeader {...defaultProps} />);
    
    // Verifica elementos estáticos y propiedades básicas
    expect(screen.getAllByText('Salud del Sprint')[0]).toBeInTheDocument();
    expect(screen.getByText('PROJ-123')).toBeInTheDocument();
    
    // El texto 'Saludable' debe aparecer por el puntaje de 85
    expect(screen.getByText('Saludable')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    
    // Verifica que el componente mockeado está
    expect(screen.getByTestId('notification-bell-mock')).toBeInTheDocument();
  });

  it('renders correctly with warning score (60-79)', () => {
    render(<SprintHealthHeader {...defaultProps} healthScore={70} />);
    expect(screen.getByText('Atención')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
  });

  it('renders correctly with risk score (<60)', () => {
    render(<SprintHealthHeader {...defaultProps} healthScore={45} />);
    expect(screen.getByText('Riesgo Alto')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('calls onNavigateToMatrix when matrix link is clicked', () => {
    render(<SprintHealthHeader {...defaultProps} />);
    
    const link = screen.getByText('Matriz de Rendimiento');
    fireEvent.click(link);
    
    expect(defaultProps.onNavigateToMatrix).toHaveBeenCalledTimes(1);
  });
});
