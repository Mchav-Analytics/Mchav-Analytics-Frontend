import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ProjectsTable } from '../ProjectsTable';

// Mock child component
vi.mock('../ProjectsAssignedTeam', () => ({
  ProjectsAssignedTeam: ({ assignedTeam }) => (
    <div data-testid="projects-assigned-team-mock">
      {assignedTeam.map(t => <span key={t.id}>{t.name}</span>)}
    </div>
  )
}));

// Mock InfoTooltip
vi.mock('../Tooltips', () => ({
  InfoTooltip: () => <div data-testid="info-tooltip-mock" />
}));

describe('ProjectsTable', () => {
  const mockDisplayProjects = [
    {
      id: 'P1',
      key: 'KEY-1',
      name: 'Proyecto Alpha',
      status: 'Activo',
      issuesCount: 15,
      velocity: 25,
      cycleTime: '3.5 días',
      progress: 60,
      lastSync: 'Hace 5 min',
      color: '#ff0000'
    },
    {
      id: 'P2',
      key: 'KEY-2',
      name: 'Proyecto Beta',
      status: 'Inactivo',
      issuesCount: 10,
      velocity: 12,
      cycleTime: '5 días',
      progress: 30,
      lastSync: 'Hace 2 horas',
      color: '#00ff00'
    }
  ];

  const mockProps = {
    selectedProjectObj: null,
    searchTerm: '',
    setSearchTerm: vi.fn(),
    displayProjects: mockDisplayProjects,
    selectedProjectId: null,
    setSelectedProjectId: vi.fn(),
    expandedTeamProjectId: null,
    setExpandedTeamProjectId: vi.fn(),
    assignedTeam: [{ id: '1', name: 'Dev 1' }]
  };

  it('renders loading state when displayProjects is empty', () => {
    render(<ProjectsTable {...mockProps} displayProjects={[]} />);
    expect(screen.getByText('Cargando proyectos reales desde Jira Cloud...')).toBeInTheDocument();
  });

  it('renders table with projects', () => {
    render(<ProjectsTable {...mockProps} />);
    expect(screen.getByText('Proyecto Alpha')).toBeInTheDocument();
    expect(screen.getByText('Proyecto Beta')).toBeInTheDocument();
    expect(screen.getByText('KEY-1')).toBeInTheDocument();
    expect(screen.getByText('KEY-2')).toBeInTheDocument();
    
    // Check status styles mapping
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('calls setSearchTerm when typing in search input', () => {
    render(<ProjectsTable {...mockProps} />);
    const input = screen.getByPlaceholderText('Buscar proyecto...');
    fireEvent.change(input, { target: { value: 'Alpha' } });
    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('Alpha');
  });

  it('calls setSelectedProjectId when clicking a row', () => {
    render(<ProjectsTable {...mockProps} />);
    // Select the first row (Proyecto Alpha)
    const row = screen.getByText('Proyecto Alpha').closest('tr');
    fireEvent.click(row);
    expect(mockProps.setSelectedProjectId).toHaveBeenCalledWith('P1');
  });

  it('deselects project if row is already selected', () => {
    render(<ProjectsTable {...mockProps} selectedProjectId="P1" />);
    const row = screen.getByText('Proyecto Alpha').closest('tr');
    fireEvent.click(row);
    // If it's already selected, it sets to 'ALL'
    expect(mockProps.setSelectedProjectId).toHaveBeenCalledWith('ALL');
  });

  it('calls setExpandedTeamProjectId when clicking "Ver equipo"', () => {
    render(<ProjectsTable {...mockProps} />);
    const buttons = screen.getAllByRole('button', { name: /Ver equipo/i });
    fireEvent.click(buttons[0]);
    expect(mockProps.setExpandedTeamProjectId).toHaveBeenCalledWith('P1');
  });

  it('calls setExpandedTeamProjectId with null when clicking "Ocultar equipo"', () => {
    render(<ProjectsTable {...mockProps} expandedTeamProjectId="P1" />);
    const button = screen.getByRole('button', { name: /Ocultar equipo/i });
    fireEvent.click(button);
    expect(mockProps.setExpandedTeamProjectId).toHaveBeenCalledWith(null);
  });

  it('calls setExpandedTeamProjectId when clicking the ChevronDown icon', () => {
    // The chevron icon is an SVG. We can find it inside the project cell.
    render(<ProjectsTable {...mockProps} />);
    // Get the Chevron icon which is the first SVG inside the table cell with project name
    const projectNameCell = screen.getByText('Proyecto Alpha').closest('td');
    const chevronIcon = projectNameCell.querySelector('svg');
    fireEvent.click(chevronIcon);
    expect(mockProps.setExpandedTeamProjectId).toHaveBeenCalledWith('P1');
  });

  it('renders ProjectsAssignedTeam when a row is expanded', () => {
    render(<ProjectsTable {...mockProps} expandedTeamProjectId="P1" />);
    expect(screen.getByTestId('projects-assigned-team-mock')).toBeInTheDocument();
    expect(screen.getByText('Dev 1')).toBeInTheDocument();
  });

  it('displays selectedProjectObj details in the header if provided', () => {
    render(<ProjectsTable {...mockProps} selectedProjectObj={{ name: 'Mi Super Proyecto' }} />);
    expect(screen.getByText('Detalle del Proyecto: Mi Super Proyecto')).toBeInTheDocument();
  });
});
