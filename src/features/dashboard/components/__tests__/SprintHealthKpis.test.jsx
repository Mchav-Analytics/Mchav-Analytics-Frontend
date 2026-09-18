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

  it('renders KPIs correctly', () => {
    render(<SprintHealthKpis metrics={mockMetrics} />);

    // KPI 1: Predictibilidad del Sprint
    expect(screen.getByText('Predictibilidad del Sprint')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();

    // KPI 2: Scope Creep / Variación del Alcance
    expect(screen.getByText('Variación del Alcance')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();

    // KPI 3: Carryover / Tasa de Incompletos
    expect(screen.getByText('Tasa de Incompletos')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText(/7 SP Incompletos que pasan a otro sprint/i)).toBeInTheDocument();
    
    // Verifica que el warning no está si no se le pasa
    expect(screen.queryByText('Warning Title')).not.toBeInTheDocument();
  });

  it('renders default values if metrics are missing', () => {
    render(<SprintHealthKpis metrics={{}} />);
    
    // 0% for values
    const zeros = screen.getAllByText('0%');
    expect(zeros.length).toBeGreaterThanOrEqual(3);
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
