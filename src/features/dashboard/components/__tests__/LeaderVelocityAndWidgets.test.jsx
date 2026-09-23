import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LiderVelocityChart, { MetricInfoTooltip } from '../LiderVelocityChart';
import { DevWorkloadFilters } from '../DevWorkloadFilters';
import CriticalIssuesList from '../CriticalIssuesList';
import PercentilesChart from '../PercentilesChart';
import DashboardTrends from '../DashboardTrends';
import DashboardPerformance from '../DashboardPerformance';

// Mock Recharts cleanly to execute custom content/tooltips
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div data-testid="bar" />,
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div data-testid="area" />,
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
    Line: () => <div data-testid="line" />,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />,
    XAxis: () => <div data-testid="xaxis" />,
    YAxis: () => <div data-testid="yaxis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    ReferenceArea: () => <div data-testid="reference-area" />,
    ReferenceLine: () => <div data-testid="reference-line" />,
    Tooltip: ({ content }) => {
      if (typeof content === 'function') {
        return (
          <div data-testid="custom-tooltip">
            {content({
              active: true,
              payload: [
                { dataKey: 'compromisos', value: 40 },
                { dataKey: 'entregados', value: 35 }
              ],
              label: 'Sprint Test'
            })}
          </div>
        );
      }
      return <div data-testid="tooltip" />;
    }
  };
});

describe('LeaderVelocityChart & MetricInfoTooltip', () => {
  it('renders MetricInfoTooltip with different alignment', () => {
    const { rerender } = render(<MetricInfoTooltip text="Información de velocidad" align="right" />);
    expect(screen.getByText('Información de velocidad')).toBeDefined();

    rerender(<MetricInfoTooltip text="Información izquierda" align="left" />);
    expect(screen.getByText('Información izquierda')).toBeDefined();

    rerender(<MetricInfoTooltip text="Información centro" align="auto" />);
    expect(screen.getByText('Información centro')).toBeDefined();
  });

  it('renders LiderVelocityChart with empty data', () => {
    render(<LiderVelocityChart velocityData={[]} velocityStats={null} isDarkMode={false} />);
    expect(screen.getByText('No hay datos de velocidad para este proyecto.')).toBeDefined();
  });

  it('renders LiderVelocityChart with velocity stats and data in light and dark mode', () => {
    const mockData = [
      { sprint: 'Sprint 1', compromisos: 30, entregados: 28 },
      { sprint: 'Sprint 2', compromisos: 35, entregados: 0 }
    ];
    const mockStats = { min: 20, max: 40, avg: 30 };

    const { rerender } = render(
      <LiderVelocityChart velocityData={mockData} velocityStats={mockStats} isDarkMode={false} />
    );
    expect(screen.getByText('Histórico de Velocidad por Sprint')).toBeDefined();
    expect(screen.getByText(/Rango Estable \(20 - 40 SP\)/i)).toBeDefined();

    rerender(
      <LiderVelocityChart velocityData={mockData} velocityStats={mockStats} isDarkMode={true} />
    );
    expect(screen.getByText('Histórico de Velocidad por Sprint')).toBeDefined();
  });
});

describe('DevWorkloadFilters Component', () => {
  it('handles search query, select filters and clear filters button', () => {
    const setSearchQuery = vi.fn();
    const setStatusFilter = vi.fn();
    const setPriorityFilter = vi.fn();
    const setSortBy = vi.fn();
    const clearFilters = vi.fn();

    const { rerender } = render(
      <DevWorkloadFilters
        searchQuery="TEST-1"
        setSearchQuery={setSearchQuery}
        statusFilter="EN CURSO"
        setStatusFilter={setStatusFilter}
        priorityFilter="Alta"
        setPriorityFilter={setPriorityFilter}
        sortBy="RECENT"
        setSortBy={setSortBy}
        hasActiveFilters={true}
        clearFilters={clearFilters}
      />
    );

    // Search input change
    const searchInput = screen.getByPlaceholderText(/Buscar por clave/i);
    fireEvent.change(searchInput, { target: { value: 'MCH-12' } });
    expect(setSearchQuery).toHaveBeenCalledWith('MCH-12');

    // Click clear search (X)
    const clearSearchBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(clearSearchBtn);
    expect(setSearchQuery).toHaveBeenCalledWith('');

    // Status select
    const statusSelect = screen.getByDisplayValue('En Curso');
    fireEvent.change(statusSelect, { target: { value: 'FINALIZADO' } });
    expect(setStatusFilter).toHaveBeenCalledWith('FINALIZADO');

    // Priority select
    const prioritySelect = screen.getByDisplayValue('Alta');
    fireEvent.change(prioritySelect, { target: { value: 'Crítica' } });
    expect(setPriorityFilter).toHaveBeenCalledWith('Crítica');

    // SortBy select
    const sortSelect = screen.getByDisplayValue('Más recientes');
    fireEvent.change(sortSelect, { target: { value: 'SP_DESC' } });
    expect(setSortBy).toHaveBeenCalledWith('SP_DESC');

    // Clear filters button
    const clearBtn = screen.getByText('Limpiar');
    fireEvent.click(clearBtn);
    expect(clearFilters).toHaveBeenCalled();

    // When hasActiveFilters is false, Limpiar should not be in document
    rerender(
      <DevWorkloadFilters
        searchQuery=""
        setSearchQuery={setSearchQuery}
        statusFilter="TODOS"
        setStatusFilter={setStatusFilter}
        priorityFilter="TODAS"
        setPriorityFilter={setPriorityFilter}
        sortBy="RECENT"
        setSortBy={setSortBy}
        hasActiveFilters={false}
        clearFilters={clearFilters}
      />
    );
    expect(screen.queryByText('Limpiar')).toBeNull();
  });
});

describe('CriticalIssuesList Component', () => {
  it('renders empty state when no critical issues exist', () => {
    render(
      <CriticalIssuesList
        criticalIssues={[]}
        teamMembers={[]}
        handleNotifyDev={vi.fn()}
        handleConfirmReassign={vi.fn()}
        setActiveTab={vi.fn()}
      />
    );
    expect(screen.getByText('No hay impedimentos activos.')).toBeDefined();
  });

  it('renders critical issues list, notifies dev, and reassigns issue', () => {
    const handleNotifyDev = vi.fn();
    const handleConfirmReassign = vi.fn();
    const setActiveTab = vi.fn();

    const mockIssues = [
      {
        key: 'MCH-10',
        priority: 'Muy Alta',
        summary: 'Error crítico en producción',
        assignee: 'Dev Alpha',
        sp: 5
      },
      {
        key: 'MCH-11',
        priority: 'Media',
        summary: 'Ajuste secundario',
        assignee: 'Sin Asignar',
        sp: 3
      }
    ];

    const mockMembers = [
      { name: 'Dev Alpha' },
      { name: 'Dev Beta' }
    ];

    render(
      <CriticalIssuesList
        criticalIssues={mockIssues}
        teamMembers={mockMembers}
        handleNotifyDev={handleNotifyDev}
        handleConfirmReassign={handleConfirmReassign}
        setActiveTab={setActiveTab}
      />
    );

    expect(screen.getByText('MCH-10')).toBeDefined();
    expect(screen.getByText('MCH-11')).toBeDefined();

    // Click "Ver Alertas"
    fireEvent.click(screen.getByText(/Ver Alertas/i));
    expect(setActiveTab).toHaveBeenCalledWith('alerts_center');

    // Click Notificar
    const notifyBtns = screen.getAllByText('Notificar');
    fireEvent.click(notifyBtns[0]);
    expect(handleNotifyDev).toHaveBeenCalledWith('MCH-10', 'Dev Alpha');

    // Click Reasignar
    const reassignBtns = screen.getAllByText('Reasignar');
    fireEvent.click(reassignBtns[0]);

    // Select new assignee and confirm
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Dev Beta' } });

    // Confirm button has check icon
    const checkBtn = select.nextElementSibling;
    fireEvent.click(checkBtn);
    expect(handleConfirmReassign).toHaveBeenCalledWith('MCH-10', 'Dev Beta');
  });
});

describe('PercentilesChart Component', () => {
  it('returns null when data is not provided', () => {
    const { container } = render(<PercentilesChart data={null} title="Tiempos" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders warning when has_enough_data is false (CA-04)', () => {
    const lowData = {
      issue_type: 'Bug',
      has_enough_data: false,
      count: 2
    };
    render(<PercentilesChart data={lowData} title="Percentiles de Bugs" />);
    expect(screen.getByText(/Percentiles de Bugs — Datos Insuficientes/i)).toBeDefined();
    expect(screen.getByText(/Se requiere un mínimo de/i)).toBeDefined();
  });

  it('renders chart and tooltips when enough data exists with different color themes', () => {
    const fullData = {
      issue_type: 'Story',
      has_enough_data: true,
      count: 15,
      lead_time: { avg: 5.2, p25: 2.1, p50: 4.5, p75: 7.2, p90: 10.5 },
      cycle_time: { avg: 3.1, p25: 1.5, p50: 2.8, p75: 4.2, p90: 6.1 }
    };

    const { rerender } = render(
      <PercentilesChart data={fullData} title="Percentiles de Historias" colorTheme="emerald" />
    );
    expect(screen.getByText('Percentiles de Historias')).toBeDefined();
    expect(screen.getByText('15 muestras (15 días)')).toBeDefined();

    // Hover tooltip
    const infoIcon = document.querySelector('.lucide-info');
    if (infoIcon) {
      fireEvent.mouseEnter(infoIcon.parentElement);
      expect(screen.getByText(/Métrica calculada sobre los últimos 15 días/i)).toBeDefined();
      fireEvent.mouseLeave(infoIcon.parentElement);
    }

    // Test rose theme
    rerender(
      <PercentilesChart data={fullData} title="Percentiles de Historias" colorTheme="rose" />
    );
    expect(screen.getByText('Percentiles de Historias')).toBeDefined();
  });
});

describe('DashboardTrends Component', () => {
  it('handles metric select, timeframe select, and navigation', () => {
    const setTrendMetric = vi.fn();
    const setTrendTimeframe = vi.fn();
    const setActiveTab = vi.fn();

    const mockTendencia = [
      { name: 'Ene', value: 12 },
      { name: 'Feb', value: 18 }
    ];

    const mockDonut = [
      { name: 'Completado', value: 20 },
      { name: 'Pendiente', value: 5 }
    ];

    render(
      <DashboardTrends
        trendMetric="completed"
        setTrendMetric={setTrendMetric}
        trendTimeframe="6m"
        setTrendTimeframe={setTrendTimeframe}
        tendenciaData={mockTendencia}
        setActiveTab={setActiveTab}
        lastSyncInfo={{ timestamp: '2026-03-20 10:00', duration: '2s' }}
        totalProjectsCount={4}
        estadoDonutData={mockDonut}
      />
    );

    expect(screen.getByText('Tendencia general')).toBeDefined();

    // Change trend metric
    const metricSelect = screen.getByDisplayValue('Issues completadas');
    fireEvent.change(metricSelect, { target: { value: 'created' } });
    expect(setTrendMetric).toHaveBeenCalledWith('created');

    // Change timeframe
    const timeframeSelect = screen.getByDisplayValue('Últimos 6 meses');
    fireEvent.change(timeframeSelect, { target: { value: '30d' } });
    expect(setTrendTimeframe).toHaveBeenCalledWith('30d');
  });
});

describe('DashboardPerformance Component', () => {
  it('renders performance cards and handles drilldown and time filter', () => {
    const setRendimientoTimeFilter = vi.fn();
    const openDrillDown = vi.fn();

    const mockRd = {
      velocity: {
        trendIcon: 'up',
        trend: '+12%',
        sparkline: [{ v: 10 }, { v: 15 }]
      },
      throughput: {
        trendIcon: 'down',
        trend: '-5%',
        sparkline: [{ v: 5 }, { v: 4 }]
      },
      cycle: {
        trendIcon: 'down',
        trend: '-10%',
        sparkline: [{ v: 8 }, { v: 6 }]
      },
      lead: {
        trendIcon: 'up',
        trend: '+4%',
        sparkline: [{ v: 12 }, { v: 14 }]
      }
    };

    render(
      <DashboardPerformance
        rendimientoTimeFilter="30d"
        setRendimientoTimeFilter={setRendimientoTimeFilter}
        rd={mockRd}
        animVelocity={35}
        animThroughput={14}
        animCycle={4.2}
        animLead={8.5}
        openDrillDown={openDrillDown}
      />
    );

    expect(screen.getByText(/Rendimiento global/i)).toBeDefined();
    expect(screen.getByText('35')).toBeDefined();

    // Change filter
    const filterSelect = screen.getByDisplayValue('Último mes');
    fireEvent.change(filterSelect, { target: { value: '90d' } });
    expect(setRendimientoTimeFilter).toHaveBeenCalledWith('90d');

    // Click velocity card to trigger drilldown
    fireEvent.click(screen.getByText('Velocity').closest('div[class*="group"]'));
    expect(openDrillDown).toHaveBeenCalledWith('Velocity Promedio', 'velocity');
  });
});
