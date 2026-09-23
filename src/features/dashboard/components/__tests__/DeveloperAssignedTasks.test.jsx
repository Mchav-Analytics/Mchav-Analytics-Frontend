import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeveloperAssignedTasks } from '../DeveloperAssignedTasks';

describe('DeveloperAssignedTasks Component', () => {
  const mockTasks = [
    { key_issue: 'MCHAV-101', summary: 'Frontend fix', status_actual: 'LISTO', story_points: 3, cycle_time_days: 2 },
    { key_issue: 'MCHAV-102', summary: 'Backend endpoint', status_actual: 'EN PROGRESO', story_points: 5, cycle_time_days: 0 },
    { key_issue: 'MCHAV-103', summary: 'Database deadlock', status_actual: 'BLOQUEADA', story_points: 8, cycle_time_days: 4 },
    { key_issue: 'MCHAV-104', summary: 'Code review PR', status_actual: 'EN REVISIÓN', story_points: 2, cycle_time_days: 1 },
    { key_issue: 'MCHAV-105', summary: 'New story backlog', status_actual: 'POR HACER', story_points: 1, cycle_time_days: -1 },
  ];

  const defaultProps = {
    filteredTasks: mockTasks,
    taskFilter: 'ALL',
    setTaskFilter: vi.fn(),
    currentPage: 1,
    setCurrentPage: vi.fn(),
    ITEMS_PER_PAGE: 5,
    setSelectedIssueModal: vi.fn(),
  };

  it('renders task list header and counter correctly for plural tasks', () => {
    render(<DeveloperAssignedTasks {...defaultProps} />);
    expect(screen.getByText('Mis Tareas Asignadas')).toBeInTheDocument();
    expect(screen.getByText('5 tareas')).toBeInTheDocument();
  });

  it('renders task counter correctly for singular task', () => {
    render(<DeveloperAssignedTasks {...defaultProps} filteredTasks={[mockTasks[0]]} />);
    expect(screen.getByText('1 tarea')).toBeInTheDocument();
  });

  it('renders all statuses and cycle times in desktop and mobile view', () => {
    render(<DeveloperAssignedTasks {...defaultProps} />);

    // Keys
    expect(screen.getAllByText('MCHAV-101').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MCHAV-102').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MCHAV-103').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MCHAV-104').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MCHAV-105').length).toBeGreaterThan(0);

    // Statuses
    expect(screen.getAllByText(/Listo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Progreso/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bloqueada/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/En Revisión/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Por Hacer/i).length).toBeGreaterThan(0);

    // Cycle time fallback '--'
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });

  it('handles clicking filter buttons', () => {
    render(<DeveloperAssignedTasks {...defaultProps} />);

    const inProgressBtn = screen.getByRole('button', { name: 'En progreso' });
    fireEvent.click(inProgressBtn);
    expect(defaultProps.setTaskFilter).toHaveBeenCalledWith('IN_PROGRESS');
    expect(defaultProps.setCurrentPage).toHaveBeenCalledWith(1);

    const blockedBtn = screen.getByRole('button', { name: 'Bloqueadas' });
    fireEvent.click(blockedBtn);
    expect(defaultProps.setTaskFilter).toHaveBeenCalledWith('BLOCKED');

    const completedBtn = screen.getByRole('button', { name: 'Completadas' });
    fireEvent.click(completedBtn);
    expect(defaultProps.setTaskFilter).toHaveBeenCalledWith('COMPLETED');
  });

  it('triggers setSelectedIssueModal when clicking Ver or Ver detalle', () => {
    render(<DeveloperAssignedTasks {...defaultProps} />);

    // Desktop 'Ver' button
    const verButtons = screen.getAllByRole('button', { name: 'Ver' });
    fireEvent.click(verButtons[0]);
    expect(defaultProps.setSelectedIssueModal).toHaveBeenCalledWith(mockTasks[0]);

    // Mobile 'Ver detalle' button
    const verDetalleButtons = screen.getAllByRole('button', { name: 'Ver detalle' });
    fireEvent.click(verDetalleButtons[0]);
    expect(defaultProps.setSelectedIssueModal).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('handles pagination next and previous buttons', () => {
    const setCurrentPageMock = vi.fn();
    const { rerender } = render(
      <DeveloperAssignedTasks
        {...defaultProps}
        filteredTasks={Array.from({ length: 12 }, (_, i) => ({
          key_issue: `MCHAV-${i}`,
          summary: `Task ${i}`,
          status_actual: 'LISTO',
          story_points: 2,
          cycle_time_days: 1,
        }))}
        ITEMS_PER_PAGE={5}
        currentPage={1}
        setCurrentPage={setCurrentPageMock}
      />
    );

    const prevBtn = screen.getByRole('button', { name: 'Anterior' });
    const nextBtn = screen.getByRole('button', { name: 'Siguiente' });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(nextBtn);
    expect(setCurrentPageMock).toHaveBeenCalled();
    const nextUpdater = setCurrentPageMock.mock.calls[0][0];
    expect(nextUpdater(1)).toBe(2);

    // Rerender at page 3 (last page of 12 items / 5 per page = 3 pages)
    rerender(
      <DeveloperAssignedTasks
        {...defaultProps}
        filteredTasks={Array.from({ length: 12 }, (_, i) => ({
          key_issue: `MCHAV-${i}`,
          summary: `Task ${i}`,
          status_actual: 'LISTO',
          story_points: 2,
          cycle_time_days: 1,
        }))}
        ITEMS_PER_PAGE={5}
        currentPage={3}
        setCurrentPage={setCurrentPageMock}
      />
    );

    const nextBtnDisabled = screen.getByRole('button', { name: 'Siguiente' });
    expect(nextBtnDisabled).toBeDisabled();

    const prevBtnActive = screen.getByRole('button', { name: 'Anterior' });
    fireEvent.click(prevBtnActive);
    const prevUpdater = setCurrentPageMock.mock.calls[1][0];
    expect(prevUpdater(3)).toBe(2);
  });

  it('renders empty state correctly when there are no tasks', () => {
    render(<DeveloperAssignedTasks {...defaultProps} filteredTasks={[]} />);

    expect(screen.getAllByText('No hay tareas que coincidan con este filtro.').length).toBe(2);
    expect(screen.getByText('0 tareas')).toBeInTheDocument();
    expect(screen.getByText('Mostrando 0 - 0 de 0 tareas')).toBeInTheDocument();
  });
});
