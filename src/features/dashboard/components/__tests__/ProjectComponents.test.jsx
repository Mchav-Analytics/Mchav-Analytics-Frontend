import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardProjectPanorama from '../DashboardProjectPanorama';
import DashboardPerformance from '../DashboardPerformance';
import DashboardTrends from '../DashboardTrends';

// Mocks for Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: () => <div data-testid="mock-line-chart">LineChart</div>,
  Line: () => <div>Line</div>,
  AreaChart: () => <div data-testid="mock-area-chart">AreaChart</div>,
  Area: () => <div>Area</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  BarChart: () => <div data-testid="mock-bar-chart">BarChart</div>,
  Bar: () => <div>Bar</div>,
  Legend: () => <div>Legend</div>,
  PieChart: () => <div data-testid="mock-pie-chart">PieChart</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
}));

describe('ProjectComponents', () => {
  describe('DashboardProjectPanorama Component', () => {
    const mockProjects = [
      { id: '1', name: 'Project A', status: 'En riesgo', statusColor: 'amber', health: 60, issues: 12, sprint: 'Sprint 2' },
      { id: '2', name: 'Project B', status: 'Saludable', statusColor: 'teal', health: 90, issues: 5, sprint: 'Sprint 4' },
      { id: '3', name: 'Project C', status: 'Crítico', statusColor: 'rose', health: 30, issues: 25, sprint: 'Sprint 1' }
    ];

    it('renders project cards with correct information', () => {
      render(
        <DashboardProjectPanorama 
          projectsHealthList={mockProjects}
          setActiveTab={vi.fn()}
          carouselRef={{ current: null }}
          handleScrollCarouselRight={vi.fn()}
          hoveredProject={null}
          setHoveredProject={vi.fn()}
        />
      );

      expect(screen.getByText('Panorama de proyectos')).toBeInTheDocument();
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
      expect(screen.getByText('Project C')).toBeInTheDocument();
      
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('handles interactions correctly', () => {
      const setHoveredProject = vi.fn();
      const setActiveTab = vi.fn();
      
      render(
        <DashboardProjectPanorama 
          projectsHealthList={mockProjects}
          setActiveTab={setActiveTab}
          carouselRef={{ current: null }}
          handleScrollCarouselRight={vi.fn()}
          hoveredProject={null}
          setHoveredProject={setHoveredProject}
        />
      );

      const projACard = screen.getByText('Project A').closest('div');
      
      // Simulate hover
      fireEvent.mouseEnter(projACard);
      expect(setHoveredProject).toHaveBeenCalledWith('1');
      
      fireEvent.mouseLeave(projACard);
      expect(setHoveredProject).toHaveBeenCalledWith(null);

      // Simulate clicking "Ver todos los proyectos"
      fireEvent.click(screen.getByText('Ver todos los proyectos'));
      expect(setActiveTab).toHaveBeenCalledWith('proyectos');
    });
  });

  describe('DashboardPerformance Component', () => {
    it('renders the performance metrics correctly', () => {
      render(
        <DashboardPerformance 
          rendimientoTimeFilter="30d"
          setRendimientoTimeFilter={vi.fn()}
          animVelocity={45}
          animThroughput={12}
          animCycle={3.5}
          animLead={5.2}
          rd={{
            velocity: { trend: '15%', trendIcon: 'up', sparkline: [] },
            throughput: { trend: '5%', trendIcon: 'down', sparkline: [] },
            cycle: { trend: '10%', trendIcon: 'down', sparkline: [] },
            lead: { trend: '20%', trendIcon: 'up', sparkline: [] }
          }}
          openDrillDown={vi.fn()}
        />
      );

      // Need to use getAllByText or a flexible matcher if "Rendimiento global" is split
      expect(screen.getByText(/Rendimiento global/i)).toBeInTheDocument();
      
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('3.5')).toBeInTheDocument();
      expect(screen.getByText('5.2')).toBeInTheDocument();
      
      const charts = screen.getAllByTestId('mock-line-chart');
      expect(charts).toHaveLength(4);
    });

    it('handles filter change and drill down click', () => {
      const setFilter = vi.fn();
      const openDrillDown = vi.fn();
      
      render(
        <DashboardPerformance 
          rendimientoTimeFilter="30d"
          setRendimientoTimeFilter={setFilter}
          animVelocity={45}
          animThroughput={12}
          animCycle={3.5}
          animLead={5.2}
          rd={{
            velocity: { trend: '15%', trendIcon: 'up', sparkline: [] },
            throughput: { trend: '5%', trendIcon: 'down', sparkline: [] },
            cycle: { trend: '10%', trendIcon: 'down', sparkline: [] },
            lead: { trend: '20%', trendIcon: 'up', sparkline: [] }
          }}
          openDrillDown={openDrillDown}
        />
      );

      // Change filter
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '7d' } });
      expect(setFilter).toHaveBeenCalledWith('7d');

      // Click Velocity drill down
      fireEvent.click(screen.getByText('Velocity'));
      expect(openDrillDown).toHaveBeenCalledWith('Velocity Promedio', 'velocity');
    });
  });

  describe('DashboardTrends Component', () => {
    it('renders trends charts correctly', () => {
      render(
        <DashboardTrends 
          trendsTimeFilter="3m"
          setTrendsTimeFilter={vi.fn()}
          lastSyncInfo={{ dateText: 'Hoy', timeText: '10:00 AM' }}
          estadoDonutData={[{name: 'test', value: 10, color: 'blue', percentage: 100}]}
          tendenciaData={[]}
          totalProjectsCount={10}
        />
      );

      expect(screen.getByText(/Tendencia general/i)).toBeInTheDocument();
      expect(screen.getByTestId('mock-area-chart')).toBeInTheDocument();
      expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
    });
  });
});
