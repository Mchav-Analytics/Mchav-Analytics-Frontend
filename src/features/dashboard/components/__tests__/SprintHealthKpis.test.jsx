import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SprintHealthKpis from '../SprintHealthKpis';

// Mock para Tooltip compartido
vi.mock('../ScorecardShared', () => ({
  MetricInfoTooltip: ({ text }) => <div data-testid="tooltip" data-text={text} />
}));

describe('SprintHealthKpis Component', () => {
  const mockMetrics = {
    commitment_reliability_pct: 85,
    sp_completed: 40,
    sp_planned: 47,
    scope_creep_pct: 12,
    sp_added_mid_sprint: 5,
    carryover_pct: 15,
    sp_carryover: 7,
    flow_efficiency_pct: 70,
    active_dev_days: 10,
    waiting_queue_days: 4
  };

  it('renders all 4 KPIs correctly', () => {
    render(<SprintHealthKpis metrics={mockMetrics} />);

    // KPI 1: Confiabilidad
    expect(screen.getByText('Confiabilidad del Compromiso')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText(/40 SP entregados de 47 SP planificados/i)).toBeInTheDocument();

    // KPI 2: Scope Creep
    expect(screen.getByText('Variación del Alcance')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
    expect(screen.getByText(/\+5 SP añadidos a mitad del sprint/i)).toBeInTheDocument();

    // KPI 3: Carryover
    expect(screen.getByText('Tasa de Incompletos (Carryover)')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText(/7 SP incompletos que pasan a otro sprint/i)).toBeInTheDocument();

    // KPI 4: Flujo
    expect(screen.getByText('Eficiencia del Flujo')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText(/10d activos vs 4d en colas/i)).toBeInTheDocument();
    
    // Verifica que el warning no está si no se le pasa
    expect(screen.queryByText('Warning Title')).not.toBeInTheDocument();
  });

  it('renders default values if metrics are missing', () => {
    render(<SprintHealthKpis metrics={{}} />);
    
    // 0% for all values
    const zeros = screen.getAllByText('0%');
    expect(zeros).toHaveLength(4);
    
    expect(screen.getByText(/0 SP entregados de 0 SP planificados/i)).toBeInTheDocument();
    expect(screen.getByText(/\+0 SP añadidos a mitad del sprint/i)).toBeInTheDocument();
  });

  it('renders warning banner when warning prop is provided', () => {
    const warning = {
      title: 'Warning Title',
      message: 'This is a warning message'
    };
    
    render(<SprintHealthKpis metrics={mockMetrics} warning={warning} />);
    
    expect(screen.getByText('Warning Title')).toBeInTheDocument();
    expect(screen.getByText('This is a warning message')).toBeInTheDocument();
  });
});
