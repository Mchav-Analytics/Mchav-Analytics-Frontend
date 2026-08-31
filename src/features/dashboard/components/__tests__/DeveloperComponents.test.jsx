import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeveloperActiveTasks from '../DeveloperActiveTasks';
import { DeveloperKpiStrip } from '../DeveloperKpiStrip';
import DeveloperMetricsPanel from '../DeveloperMetricsPanel';
import { DeveloperWorkDistribution } from '../DeveloperWorkDistribution';
import { DeveloperPdfReport } from '../DeveloperPdfReport';

// Mocks for recharts
vi.mock('recharts', async () => {
  const OriginalRecharts = await vi.importActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    PieChart: ({ children }) => <div>{children}</div>,
    Pie: ({ children, data }) => (
      <div>
        {data.map((entry, index) => (
          <div key={`pie-cell-${index}`} data-testid={`pie-cell-${entry.name}`}>
            {entry.name}
          </div>
        ))}
      </div>
    ),
    Cell: ({ onClick, className }) => (
      <div data-testid="recharts-cell" onClick={onClick} className={className} />
    ),
    Tooltip: () => <div>Tooltip Mock</div>
  };
});

describe('DeveloperActiveTasks Component', () => {
  const defaultProps = {
    totalCount: 15,
    donutData: [
      { name: 'Historias de Usuario', count: 5, pct: 33, color: '#10b981' },
      { name: 'Bugs / Defectos', count: 5, pct: 33, color: '#f43f5e' },
      { name: 'Tareas / Deuda Técnica', count: 5, pct: 33, color: '#6366f1' }
    ],
    typeFilter: 'ALL',
    setTypeFilter: vi.fn(),
    setCurrentPage: vi.fn(),
    filteredTasks: [
      { key_issue: 'MCHAV-1', summary: 'Task 1', status_actual: 'EN PROGRESO', story_points: 3, cycle_time_days: 2 },
      { key_issue: 'MCHAV-2', summary: 'Task 2', status_actual: 'LISTO', story_points: 2, cycle_time_days: 1 },
      { key_issue: 'MCHAV-3', summary: 'Task 3', status_actual: 'BLOQUEADA', story_points: 5, cycle_time_days: 5 },
      { key_issue: 'MCHAV-4', summary: 'Task 4', status_actual: 'EN REVISIÓN', story_points: 1, cycle_time_days: 0 },
      { key_issue: 'MCHAV-5', summary: 'Task 5', status_actual: 'POR HACER', story_points: 8, cycle_time_days: 0 }
    ],
    ITEMS_PER_PAGE: 5,
    currentPage: 1,
    taskFilter: 'ALL',
    setTaskFilter: vi.fn(),
    setSelectedIssueModal: vi.fn()
  };

  it('renders correctly with given props', () => {
    render(<DeveloperActiveTasks {...defaultProps} />);

    expect(screen.getByText('Distribución de mi trabajo')).toBeInTheDocument();
    expect(screen.getByText('Total: 15 incidencias')).toBeInTheDocument();
    expect(screen.getByText('Mis Tareas Asignadas')).toBeInTheDocument();
    
    // Check legends
    expect(screen.getAllByText('Historias de Usuario').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bugs / Defectos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tareas / Deuda Técnica').length).toBeGreaterThan(0);
  });

  it('renders all task statuses in table', () => {
    render(<DeveloperActiveTasks {...defaultProps} />);

    expect(screen.getByText('MCHAV-1')).toBeInTheDocument();
    expect(screen.getByText('En Progreso')).toBeInTheDocument();

    expect(screen.getByText('MCHAV-2')).toBeInTheDocument();
    expect(screen.getByText('Listo')).toBeInTheDocument();

    expect(screen.getByText('MCHAV-3')).toBeInTheDocument();
    expect(screen.getByText('Bloqueada')).toBeInTheDocument();

    expect(screen.getByText('MCHAV-4')).toBeInTheDocument();
    expect(screen.getByText('En Revisión')).toBeInTheDocument();

    expect(screen.getByText('MCHAV-5')).toBeInTheDocument();
    expect(screen.getByText('Por Hacer')).toBeInTheDocument();
  });

  it('handles clicking on a type filter legend', () => {
    const props = { ...defaultProps, typeFilter: 'ALL', setTypeFilter: vi.fn() };
    render(<DeveloperActiveTasks {...props} />);

    // Click on Bug legend
    const bugLegend = screen.getAllByText('Bugs / Defectos')[1];
    fireEvent.click(bugLegend.closest('div').parentElement); // Click the container
    
    // Should pass the callback to setTypeFilter
    expect(props.setTypeFilter).toHaveBeenCalled();
    expect(props.setCurrentPage).toHaveBeenCalledWith(1);
  });

  it('handles empty filtered tasks', () => {
    const props = { ...defaultProps, filteredTasks: [] };
    render(<DeveloperActiveTasks {...props} />);

    expect(screen.getByText('No hay tareas que coincidan con este filtro.')).toBeInTheDocument();
  });

  it('handles pagination correctly', () => {
    const props = {
      ...defaultProps,
      filteredTasks: Array.from({ length: 10 }, (_, i) => ({
        key_issue: `MCHAV-${i}`, summary: `Task ${i}`, status_actual: 'LISTO', story_points: 2, cycle_time_days: 1
      })),
      ITEMS_PER_PAGE: 5,
      currentPage: 1
    };
    render(<DeveloperActiveTasks {...props} />);

    const nextBtn = screen.getByText('Siguiente');
    fireEvent.click(nextBtn);
    expect(props.setCurrentPage).toHaveBeenCalled();

    const prevBtn = screen.getByText('Anterior');
    // It's disabled on page 1, so wait we pass currentPage: 1, click nextBtn, props.setCurrentPage should be called.
    expect(prevBtn).toBeDisabled();
  });

  it('handles task filter buttons', () => {
    render(<DeveloperActiveTasks {...defaultProps} />);

    const completedBtn = screen.getByText('Completadas');
    fireEvent.click(completedBtn);

    expect(defaultProps.setTaskFilter).toHaveBeenCalledWith('COMPLETED');
    expect(defaultProps.setCurrentPage).toHaveBeenCalledWith(1);
  });

  it('handles view button click for a task', () => {
    render(<DeveloperActiveTasks {...defaultProps} />);

    const viewButtons = screen.getAllByText('Ver');
    fireEvent.click(viewButtons[0]);

    expect(defaultProps.setSelectedIssueModal).toHaveBeenCalledWith(defaultProps.filteredTasks[0]);
  });
});

describe('DeveloperKpiStrip Component', () => {
  it('renders default values when no scorecard is provided', () => {
    render(<DeveloperKpiStrip scorecard={null} />);
    expect(screen.getByText('CYCLE TIME')).toBeInTheDocument();
    expect(screen.getByText('3.2')).toBeInTheDocument();
    expect(screen.getByText('↓ 0.3d vs sprint previo')).toBeInTheDocument();

    expect(screen.getByText('TICKETS WIP')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('70% cap.')).toBeInTheDocument();

    expect(screen.getByText('THROUGHPUT')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Promedio: 2.3/día')).toBeInTheDocument();

    expect(screen.getByText('STORY POINTS')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('Sin meta')).toBeInTheDocument();
  });

  it('renders values from scorecard correctly', () => {
    const scorecard = {
      cycle_time_personal: 2.5,
      cycle_time_prev: 3.0,
      wip_tickets: 5,
      wip_max: 10,
      throughput_tickets: 20,
      throughput_avg_daily: '3.0',
      story_points_burned: 45,
      story_points_target: 50,
      story_points_achieved_pct: 90
    };
    render(<DeveloperKpiStrip scorecard={scorecard} />);
    
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText('↓ 0.5d vs sprint previo')).toBeInTheDocument();

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('50% cap.')).toBeInTheDocument();

    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Promedio: 3.0/día')).toBeInTheDocument();

    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('90% de la meta')).toBeInTheDocument();
  });
});

describe('DeveloperMetricsPanel Component', () => {
  it('renders default values when no scorecard is provided', () => {
    render(<DeveloperMetricsPanel scorecard={null} />);
    expect(screen.getByText('CYCLE TIME')).toBeInTheDocument();
    expect(screen.getByText('3.2')).toBeInTheDocument();
    expect(screen.getByText('↓ 0.3d vs sprint previo')).toBeInTheDocument();

    expect(screen.getByText('TICKETS WIP')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('70% de capacidad')).toBeInTheDocument();

    expect(screen.getByText('THROUGHPUT')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Promedio: 2.3/día')).toBeInTheDocument();

    expect(screen.getByText('STORY POINTS')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('Sin meta de sprint')).toBeInTheDocument();
  });

  it('renders values from scorecard correctly', () => {
    const scorecard = {
      cycle_time_personal: 2.5,
      cycle_time_prev: 3.0,
      wip_tickets: 5,
      wip_max: 10,
      throughput_tickets: 20,
      throughput_avg_daily: '3.0',
      story_points_burned: 45,
      story_points_target: 50,
      story_points_achieved_pct: 90
    };
    render(<DeveloperMetricsPanel scorecard={scorecard} />);
    
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText('↓ 0.5d vs sprint previo')).toBeInTheDocument();

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('50% de capacidad')).toBeInTheDocument();

    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Promedio: 3.0/día')).toBeInTheDocument();

    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('90% de la meta')).toBeInTheDocument();
  });
});

describe('DeveloperWorkDistribution Component', () => {
  const defaultProps = {
    donutData: [
      { name: 'Historias de Usuario', count: 5, pct: 33, color: '#10b981' },
      { name: 'Bugs / Defectos', count: 5, pct: 33, color: '#f43f5e' },
      { name: 'Tareas / Deuda Técnica', count: 5, pct: 33, color: '#6366f1' }
    ],
    totalCount: 15,
    typeFilter: 'ALL',
    setTypeFilter: vi.fn(),
    setCurrentPage: vi.fn()
  };

  it('renders correctly', () => {
    render(<DeveloperWorkDistribution {...defaultProps} />);
    
    expect(screen.getByText('Distribución de mi trabajo')).toBeInTheDocument();
    expect(screen.getAllByText('15').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Historias de Usuario').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bugs / Defectos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tareas / Deuda Técnica').length).toBeGreaterThan(0);
  });

  it('handles clicking on a type filter legend', () => {
    render(<DeveloperWorkDistribution {...defaultProps} />);
    
    const bugLegend = screen.getAllByText('Bugs / Defectos')[1] || screen.getByText('Bugs / Defectos');
    fireEvent.click(bugLegend.closest('div').parentElement); // Click the container
    
    expect(defaultProps.setTypeFilter).toHaveBeenCalled();
    expect(defaultProps.setCurrentPage).toHaveBeenCalledWith(1);
  });
});

describe('DeveloperPdfReport Component', () => {
  it('renders correctly with given props', () => {
    const props = {
      project: { nombre: 'Test Project' },
      devName: 'John Doe',
      kpis: [
        { id: 'cycle-time', value: '4.5', trend: 'Up' },
        { id: 'wip', value: '3', trend: 'Ok' }
      ],
      assignedIssues: [
        { tipo: 'Historia', key_issue: 'TEST-1', summary: 'Do something', status_actual: 'EN PROGRESO', story_points: 5, cycle_time_days: 2 },
        { tipo: 'Bug', key_issue: 'TEST-2', summary: 'Fix something', status_actual: 'COMPLETADA', story_points: 3, cycle_time_days: 1 }
      ]
    };
    
    // forwardRef requires wrapper or direct render with ref
    const ref = React.createRef();
    render(<DeveloperPdfReport {...props} ref={ref} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // KPIs
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('Up')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getByText('Ok')).toBeInTheDocument();
    
    // Defaults for missing KPIs
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();

    // Issues table
    expect(screen.getByText('TEST-1')).toBeInTheDocument();
    expect(screen.getByText('Do something')).toBeInTheDocument();
    expect(screen.getByText('EN PROGRESO')).toBeInTheDocument();
    
    expect(screen.getByText('TEST-2')).toBeInTheDocument();
    expect(screen.getByText('Fix something')).toBeInTheDocument();
    expect(screen.getByText('COMPLETADA')).toBeInTheDocument();
  });
});
