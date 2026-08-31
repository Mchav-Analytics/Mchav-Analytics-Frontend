import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectMetrics } from '../ProjectMetrics';

// Mock Recharts to avoid DOM/Canvas issues in tests
vi.mock('recharts', () => {
  const OriginalRecharts = vi.importActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    ComposedChart: ({ children }) => <div data-testid="composed-chart">{children}</div>,
    Line: () => <div data-testid="line-chart" />,
    Area: () => <div data-testid="area-chart" />,
    Bar: () => <div data-testid="bar-chart" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />,
    Tooltip: () => <div data-testid="tooltip" />
  };
});

describe('ProjectMetrics', () => {
  const mockActiveProject = {
    key: 'PROJ-1',
    name: 'Test Project',
    category: 'Frontend',
    leader: { name: 'Leader', avatar: 'L' },
    developers: [{ id: '1', name: 'Dev 1', avatar: 'D1' }]
  };

  const mockActiveMetrics = {
    kpis: {
      velocitySp: 50,
      deliveryHealth: '95%',
      cycleTimeDays: '5.5',
      criticalBugs: 2
    },
    burnup: [],
    distribution: [{ name: 'Task', value: 10, color: '#fff', percentage: 100 }],
    velocity: []
  };

  const defaultProps = {
    activeProject: mockActiveProject,
    activeMetrics: mockActiveMetrics,
    activeProjectTab: 'RESUMEN',
    setActiveProjectTab: vi.fn(),
    burndownData: [],
    loadingPercentiles: false,
    percentilesWindow: 30,
    setPercentilesWindow: vi.fn(),
    percentilesData: []
  };

  it('renders summary tab correctly', () => {
    render(<ProjectMetrics {...defaultProps} />);
    
    expect(screen.getByText(/Resumen Ejecutivo & Métricas Jira/)).toBeDefined();
    expect(screen.getByText('PROJ-1 • Frontend')).toBeDefined();
    expect(screen.getByText('50 SP / sprint')).toBeDefined();
    expect(screen.getByText('95%')).toBeDefined();
    expect(screen.getByText('5.5')).toBeDefined();
    expect(screen.getByText('2 Activos')).toBeDefined();
    expect(screen.getByText('Equipo Asignado al Proyecto')).toBeDefined();
    expect(screen.getByText('Leader')).toBeDefined();
    expect(screen.getByText('Dev 1')).toBeDefined();
  });

  it('changes tab when clicking Análisis de Tiempos', () => {
    render(<ProjectMetrics {...defaultProps} />);
    const timeTab = screen.getByText('Análisis de Tiempos');
    fireEvent.click(timeTab);
    expect(defaultProps.setActiveProjectTab).toHaveBeenCalledWith('TIEMPOS');
  });

  it('renders TIEMPOS tab correctly with empty data', () => {
    render(<ProjectMetrics {...defaultProps} activeProjectTab="TIEMPOS" />);
    expect(screen.getByText('Métricas de Flujo (Lead Time y Cycle Time)')).toBeDefined();
    expect(screen.getByText(/No se encontraron datos de tareas resueltas/)).toBeDefined();
  });

  it('renders TIEMPOS tab correctly with loading state', () => {
    render(<ProjectMetrics {...defaultProps} activeProjectTab="TIEMPOS" loadingPercentiles={true} />);
    expect(screen.getByText(/Calculando percentiles y agregando datos/)).toBeDefined();
  });

  it('renders TIEMPOS tab correctly with percentiles data', () => {
    const mockPercentilesData = [{ issue_type: 'Task' }];
    render(<ProjectMetrics {...defaultProps} activeProjectTab="TIEMPOS" percentilesData={mockPercentilesData} />);
    expect(screen.getByText('Análisis de Task')).toBeDefined();
  });

  it('handles percentiles window change', () => {
    render(<ProjectMetrics {...defaultProps} activeProjectTab="TIEMPOS" />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '60' } });
    expect(defaultProps.setPercentilesWindow).toHaveBeenCalledWith(60);
  });

  it('renders cycle time status correctly based on threshold', () => {
    const { rerender } = render(<ProjectMetrics {...defaultProps} activeMetrics={{ ...mockActiveMetrics, kpis: { ...mockActiveMetrics.kpis, cycleTimeDays: '8' } }} />);
    expect(screen.getByText('En Riesgo')).toBeDefined();

    rerender(<ProjectMetrics {...defaultProps} activeMetrics={{ ...mockActiveMetrics, kpis: { ...mockActiveMetrics.kpis, cycleTimeDays: '15' } }} />);
    expect(screen.getByText('Crítico')).toBeDefined();
    
    rerender(<ProjectMetrics {...defaultProps} activeMetrics={{ ...mockActiveMetrics, kpis: { ...mockActiveMetrics.kpis, cycleTimeDays: '4' } }} />);
    expect(screen.getByText('Óptimo')).toBeDefined();
  });
});
