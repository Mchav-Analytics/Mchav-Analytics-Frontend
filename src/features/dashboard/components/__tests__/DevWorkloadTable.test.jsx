import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { DevWorkloadTable } from '../DevWorkloadTable';

describe('DevWorkloadTable', () => {
  const defaultProps = {
    paginatedTasks: [
      { id: 1, key: 'TASK-1', summary: 'Fix bug', type: 'Bug', priority: 'Crítica', status: 'FINALIZADO', sprint: 'S1', date: '2026', sp: 5 },
      { id: 2, key: 'TASK-2', summary: 'Epic auth', type: 'Epic', priority: 'Alta', status: 'EN CURSO', sprint: 'S1', date: '2026', sp: 8 },
      { id: 3, key: 'TASK-3', summary: 'Story UI', type: 'Story', priority: 'Media', status: 'EN REVISIÓN', sprint: 'S1', date: '2026', sp: 3 },
      { id: 4, key: 'TASK-4', summary: 'Task XYZ', type: 'Task', priority: 'Baja', status: 'BLOQUEADA', sprint: 'S1', date: '2026', sp: 2 },
      { id: 5, key: 'TASK-5', summary: 'Unknown', type: null, priority: null, status: 'UNKNOWN', sprint: 'S1', date: '2026', sp: 1 },
    ],
    setSelectedTaskModal: vi.fn(),
    hasActiveFilters: true,
    clearFilters: vi.fn(),
    totalItems: 15,
    totalPages: 3,
    currentPage: 1,
    setCurrentPage: vi.fn(),
    startItem: 1,
    endItem: 5
  };

  it('renders all tasks with their respective badges', () => {
    render(<DevWorkloadTable {...defaultProps} />);
    
    // Check types
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Épica')).toBeInTheDocument();
    expect(screen.getByText('Historia')).toBeInTheDocument();
    // Two Tasks (one for 'Task', one default for null)
    expect(screen.getAllByText('Tarea').length).toBe(2);

    // Check priorities
    expect(screen.getByText('Crítica')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    // Two Bajas (one for 'Baja', one default for null)
    expect(screen.getAllByText('Baja').length).toBe(2);

    // Check statuses
    expect(screen.getByText('Finalizado')).toBeInTheDocument();
    expect(screen.getByText('En Curso')).toBeInTheDocument();
    expect(screen.getByText('En Revisión')).toBeInTheDocument();
    expect(screen.getByText('Bloqueada')).toBeInTheDocument();
    expect(screen.getByText('Por Hacer')).toBeInTheDocument(); // Default status
  });

  it('calls setSelectedTaskModal when a row is clicked', () => {
    render(<DevWorkloadTable {...defaultProps} />);
    const taskRow = screen.getByText('TASK-1').closest('tr');
    fireEvent.click(taskRow);
    expect(defaultProps.setSelectedTaskModal).toHaveBeenCalledWith(defaultProps.paginatedTasks[0]);
  });

  it('calls setSelectedTaskModal when button is clicked', () => {
    render(<DevWorkloadTable {...defaultProps} />);
    const buttons = screen.getAllByText('Gestionar');
    fireEvent.click(buttons[0]);
    expect(defaultProps.setSelectedTaskModal).toHaveBeenCalledWith(defaultProps.paginatedTasks[0]);
  });

  it('renders empty state when no tasks match', () => {
    render(<DevWorkloadTable {...defaultProps} paginatedTasks={[]} />);
    expect(screen.getByText('No se encontraron tareas con los filtros actuales.')).toBeInTheDocument();
    
    // Test clearFilters button
    const clearBtn = screen.getByText('Limpiar todos los filtros');
    fireEvent.click(clearBtn);
    expect(defaultProps.clearFilters).toHaveBeenCalled();
  });

  it('handles pagination correctly', () => {
    render(<DevWorkloadTable {...defaultProps} currentPage={2} />);
    
    expect(screen.getByText('Anterior')).not.toBeDisabled();
    expect(screen.getByText('Siguiente')).not.toBeDisabled();
    
    fireEvent.click(screen.getByText('Anterior'));
    expect(defaultProps.setCurrentPage).toHaveBeenCalledWith(expect.any(Function));
    
    fireEvent.click(screen.getByText('Siguiente'));
    expect(defaultProps.setCurrentPage).toHaveBeenCalledWith(expect.any(Function));

    // Click on page 3 number (get button specifically)
    fireEvent.click(screen.getAllByRole('button', { name: '3' })[0]);
    expect(defaultProps.setCurrentPage).toHaveBeenCalledWith(3);
  });
});
