import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SprintHealthKpis from '../SprintHealthKpis';

vi.mock('../ScopeCreepModal', () => ({
  default: ({ isOpen, onClose }) => isOpen ? (
    <div data-testid="scope-modal">
      Scope Creep Modal
      <button onClick={onClose}>Cerrar Modal</button>
    </div>
  ) : null
}));

describe('SprintHealthKpis Component', () => {
  const mockMetrics = {
    commitment_reliability_pct: 85,
    sp_completed: 40,
    sp_planned: 47,
    sp_initial_commitment: 45,
    sp_adjusted_commitment: 47,
    scope_creep_pct: 12,
    sp_added_mid_sprint: 5,
    sp_removed_mid_sprint: 2,
    carryover_pct: 15,
    sp_carryover: 7,
    flow_efficiency_pct: 70,
    active_dev_days: 10,
    waiting_queue_days: 4,
    blocked_issues_count: 2,
    total_issues: 15,
    completed_issues: 12
  };

  const mockSprints = [
    { id_sprint: 's1', nombre: 'Sprint 1' },
    { id_sprint: 's2', nombre: 'Sprint 2' }
  ];

  it('renders KPIs correctly and handles sprint selector', () => {
    const setSelectedSprintId = vi.fn();
    render(
      <SprintHealthKpis 
        metrics={mockMetrics} 
        sprints={mockSprints}
        selectedSprintId="s1"
        setSelectedSprintId={setSelectedSprintId}
      />
    );

    // KPI 1: Predictibilidad del Sprint
    expect(screen.getByText('Predictibilidad del Sprint')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('PLAN ALTERADO')).toBeInTheDocument();

    // KPI 2: Scope Creep / Variación del Alcance
    expect(screen.getByText('Variación del Alcance')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();

    // KPI 3: Carryover / Tasa de Incompletos
    expect(screen.getByText('Tasa de Incompletos')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();

    // Change sprint selector
    const sprintSelect = screen.getByRole('combobox');
    fireEvent.change(sprintSelect, { target: { value: 's2' } });
    expect(setSelectedSprintId).toHaveBeenCalledWith('s2');

    // Click scope creep card to open modal
    const scopeCard = screen.getByText('Variación del Alcance').closest('div[class*="cursor-pointer"]');
    if (scopeCard) {
      fireEvent.click(scopeCard);
      expect(screen.getByTestId('scope-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cerrar Modal'));
      expect(screen.queryByTestId('scope-modal')).toBeNull();
    }
  });

  it('renders default values if metrics are missing', () => {
    render(<SprintHealthKpis metrics={{}} />);
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
