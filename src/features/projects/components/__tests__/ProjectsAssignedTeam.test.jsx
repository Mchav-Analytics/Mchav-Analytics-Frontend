import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectsAssignedTeam } from '../ProjectsAssignedTeam';

vi.mock('../Tooltips', () => ({
  InfoTooltip: () => <div data-testid="tooltip" />
}));

describe('ProjectsAssignedTeam Component', () => {
  const mockTeam = [
    {
      id: '1',
      role: 'LÍDER',
      name: 'Alice Leader',
      initial: 'AL',
      color: '#a855f7',
      userStatus: 'Activo',
      tasks: '5 Tareas (10 SP)'
    },
    {
      id: '2',
      role: 'DESARROLLADOR',
      name: 'Bob Dev',
      initial: 'BD',
      color: '#3b82f6',
      userStatus: 'Inactivo',
      tasks: '2 Tareas (3 SP)'
    }
  ];

  it('renders team header and summary', () => {
    render(<ProjectsAssignedTeam assignedTeam={mockTeam} />);
    expect(screen.getByText('Equipo Asignado al Proyecto')).toBeInTheDocument();
    expect(screen.getByText('2 miembros asignados')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<ProjectsAssignedTeam assignedTeam={mockTeam} />);
    expect(screen.getByText('Rol')).toBeInTheDocument();
    expect(screen.getByText('Usuario')).toBeInTheDocument();
    expect(screen.getByText('Estado Usuario')).toBeInTheDocument();
    expect(screen.getByText('Carga Actual')).toBeInTheDocument();
  });

  it('renders all team members with correct data and badges', () => {
    render(<ProjectsAssignedTeam assignedTeam={mockTeam} />);
    
    // Miembro 1
    expect(screen.getByText('Alice Leader')).toBeInTheDocument();
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByText('LÍDER')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('5 Tareas (10 SP)')).toBeInTheDocument();

    // Miembro 2
    expect(screen.getByText('Bob Dev')).toBeInTheDocument();
    expect(screen.getByText('BD')).toBeInTheDocument();
    expect(screen.getByText('DESARROLLADOR')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByText('2 Tareas (3 SP)')).toBeInTheDocument();
  });
});
