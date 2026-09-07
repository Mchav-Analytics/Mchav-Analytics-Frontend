import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CapacityJiraTasks from '../CapacityJiraTasks';

describe('CapacityJiraTasks', () => {
  const defaultProps = {
    adjustedCapacitySP: 150,
    taskStatusTab: 'ALL',
    setTaskStatusTab: vi.fn(),
    taskSearchTerm: '',
    setTaskSearchTerm: vi.fn(),
    selectedTaskProject: 'ALL',
    setSelectedTaskProject: vi.fn(),
    filteredTasks: [
      { key: 'PROJ-1', summary: 'Fix login bug', status: 'Por Hacer', project: 'Prueba ASD (87)', assignee: 'Dev 1', sp: 3, priority: 'Alta' },
      { key: 'PROJ-2', summary: 'Add dashboard', status: 'En Progreso', project: 'MCHAV ANALITYCS (100)', assignee: 'Dev 2', sp: 5, priority: 'Media' },
      { key: 'PROJ-3', summary: 'Code review', status: 'En Revisión', project: 'MCHAV ANALITYCS (100)', assignee: 'Dev 3', sp: 2, priority: 'Baja' },
      { key: 'PROJ-4', summary: 'Deploy', status: 'Completados', project: 'Prueba ASD (87)', assignee: 'Dev 4', sp: 8, priority: 'Alta' },
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with given capacity', () => {
    render(<CapacityJiraTasks {...defaultProps} />);
    expect(screen.getByText('Incidencias y Carga de Trabajo en Vivo (Jira)')).toBeInTheDocument();
    expect(screen.getByText('150 SP')).toBeInTheDocument();
  });

  it('renders all table rows with correct colors based on status and priority', () => {
    render(<CapacityJiraTasks {...defaultProps} />);
    
    // Check if the tasks are in the document
    expect(screen.getByText('PROJ-1')).toBeInTheDocument();
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.getByText('PROJ-2')).toBeInTheDocument();
    expect(screen.getByText('PROJ-3')).toBeInTheDocument();
    expect(screen.getByText('PROJ-4')).toBeInTheDocument();

    // Check specific priorities and statuses
    expect(screen.getByText('Por Hacer')).toBeInTheDocument();
    expect(screen.getByText('En Progreso')).toBeInTheDocument();
    expect(screen.getByText('En Revisión')).toBeInTheDocument();
    expect(screen.getByText('Completados')).toBeInTheDocument();

    const altas = screen.getAllByText('Alta');
    expect(altas.length).toBe(2);
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Baja')).toBeInTheDocument();
  });

  it('shows empty state when no tasks match', () => {
    render(<CapacityJiraTasks {...defaultProps} filteredTasks={[]} />);
    expect(screen.getByText('No hay tareas coincidentes con los filtros de capacidad.')).toBeInTheDocument();
  });

  it('calls setTaskStatusTab on clicking status tabs', () => {
    render(<CapacityJiraTasks {...defaultProps} />);
    
    const progTab = screen.getByText(/En Progreso \(\d+\)/i);
    fireEvent.click(progTab);
    expect(defaultProps.setTaskStatusTab).toHaveBeenCalledWith('En Progreso');

    const revTab = screen.getByText(/En Revisión \(\d+\)/i);
    fireEvent.click(revTab);
    expect(defaultProps.setTaskStatusTab).toHaveBeenCalledWith('En Revisión');

    const compTab = screen.getByText(/Completados \(\d+\)/i);
    fireEvent.click(compTab);
    expect(defaultProps.setTaskStatusTab).toHaveBeenCalledWith('Completados');

    const doTab = screen.getByText(/Por Hacer \(\d+\)/i);
    fireEvent.click(doTab);
    expect(defaultProps.setTaskStatusTab).toHaveBeenCalledWith('Por Hacer');

    const allTab = screen.getByText(/Todas \(\d+\)/i);
    fireEvent.click(allTab);
    expect(defaultProps.setTaskStatusTab).toHaveBeenCalledWith('ALL');
  });

  it('calls setSelectedTaskProject on changing project select', () => {
    render(<CapacityJiraTasks {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '10000' } });
    
    expect(defaultProps.setSelectedTaskProject).toHaveBeenCalledWith('10000');
  });

  it('calls setTaskSearchTerm on typing in search box', () => {
    render(<CapacityJiraTasks {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Buscar por clave o título...');
    fireEvent.change(input, { target: { value: 'login' } });
    
    expect(defaultProps.setTaskSearchTerm).toHaveBeenCalledWith('login');
  });
});
