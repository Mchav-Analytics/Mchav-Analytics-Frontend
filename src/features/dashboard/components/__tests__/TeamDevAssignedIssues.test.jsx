import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TeamDevAssignedIssues from '../TeamDevAssignedIssues';

// Mocks simples para componentes internos
vi.mock('../ScorecardShared', () => ({
  MetricInfoTooltip: () => <div data-testid="tooltip" />,
  SparklineMini: () => <div data-testid="sparkline" />
}));

describe('TeamDevAssignedIssues Component', () => {
  const mockIssues = [
    { key_issue: 'ISS-1', summary: 'Tarea 1', status_actual: 'DONE', story_points: 5, cycle_time_days: 2 },
    { key_issue: 'ISS-2', summary: 'Tarea 2', status_actual: 'IN PROGRESS', story_points: 3, cycle_time_days: 8 },
    { key_issue: 'ISS-3', summary: 'Tarea 3', status_actual: 'IN REVIEW', story_points: 8, cycle_time_days: 15 },
    { key_issue: 'ISS-4', summary: 'Tarea 4', status_actual: 'BLOCKED', story_points: 1, cycle_time_days: 0 },
    { key_issue: 'ISS-5', summary: 'Tarea 5', status_actual: 'TO DO', story_points: 2, cycle_time_days: 4 }
  ];

  const defaultProps = {
    selectedDev: { nombre: 'Juan Perez' },
    assignedIssuesList: mockIssues,
    currentPage: 1,
    setCurrentPage: vi.fn(),
    itemsPerPage: 3
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with given issues (paginated)', () => {
    render(<TeamDevAssignedIssues {...defaultProps} />);
    
    // Debería mostrar el nombre del dev
    expect(screen.getByText('Incidencias Asignadas a Juan Perez')).toBeInTheDocument();
    
    // Debería mostrar el total
    expect(screen.getByText('5 Tareas Totales')).toBeInTheDocument();
    
    // Como mostramos 3 por página, deben aparecer ISS-1, ISS-2, ISS-3
    expect(screen.getByText('ISS-1')).toBeInTheDocument();
    expect(screen.getByText('ISS-2')).toBeInTheDocument();
    expect(screen.getByText('ISS-3')).toBeInTheDocument();
    
    // ISS-4 y ISS-5 no deben estar
    expect(screen.queryByText('ISS-4')).not.toBeInTheDocument();
  });

  it('renders all status colors correctly', () => {
    // Ponemos itemsPerPage a 5 para verlos todos
    render(<TeamDevAssignedIssues {...defaultProps} itemsPerPage={5} />);
    
    const doneStatus = screen.getByText('DONE');
    const inProgressStatus = screen.getByText('IN PROGRESS');
    const reviewStatus = screen.getByText('IN REVIEW');
    const blockedStatus = screen.getByText('BLOCKED');
    const todoStatus = screen.getByText('TO DO');

    // Verificar las clases aplicadas por estado (parte de la cadena)
    expect(doneStatus).toHaveClass('bg-emerald-50');
    expect(inProgressStatus).toHaveClass('bg-cyan-50');
    expect(reviewStatus).toHaveClass('bg-purple-50');
    expect(blockedStatus).toHaveClass('bg-rose-50');
    expect(todoStatus).toHaveClass('bg-slate-50');
  });

  it('handles pagination next and prev clicks', () => {
    const { rerender } = render(<TeamDevAssignedIssues {...defaultProps} />);
    
    const nextBtn = screen.getByText('Siguiente');
    const prevBtn = screen.getByText('Anterior');

    // Inicialmente prev btn disabled porque currentPage es 1
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Clic en Siguiente
    fireEvent.click(nextBtn);
    expect(defaultProps.setCurrentPage).toHaveBeenCalled();

    // Simulamos que la página cambió a 2
    rerender(<TeamDevAssignedIssues {...defaultProps} currentPage={2} />);
    
    // Ahora Prev debe estar habilitado, y Next deshabilitado (sólo hay 5 items)
    const newPrevBtn = screen.getByText('Anterior');
    const newNextBtn = screen.getByText('Siguiente');
    expect(newPrevBtn).not.toBeDisabled();
    expect(newNextBtn).toBeDisabled();
    
    fireEvent.click(newPrevBtn);
    expect(defaultProps.setCurrentPage).toHaveBeenCalledTimes(2);
  });
});
