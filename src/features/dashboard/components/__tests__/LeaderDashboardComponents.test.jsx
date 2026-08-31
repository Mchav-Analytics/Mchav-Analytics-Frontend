import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LeaderDashboardHeader from '../LeaderDashboardHeader';
import LiderKpiCards from '../LiderKpiCards';
import LiderNotificationBell from '../LiderNotificationBell';
import LiderVelocityChart from '../LiderVelocityChart';
import { useLocation, useNavigate } from 'react-router-dom';

// Mocks for recharts
vi.mock('recharts', async () => {
  const OriginalRechartsModule = await vi.importActual('recharts');
  return {
    ...OriginalRechartsModule,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    BarChart: ({ children }) => <div>{children}</div>,
    Bar: () => <div />,
    CartesianGrid: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Tooltip: () => <div>Tooltip Mock</div>
  };
});

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn()
}));

describe('LeaderDashboardHeader Component', () => {
  it('renders correctly and displays project ID', () => {
    const props = {
      selectedProjectId: 'TEST-123',
      isExportingPdf: false,
      handleExportPdf: vi.fn(),
      setActiveTab: vi.fn()
    };
    render(<LeaderDashboardHeader {...props} />);

    expect(screen.getByText('Panel Operativo del Sprint Activo')).toBeInTheDocument();
    expect(screen.getByText('TEST-123')).toBeInTheDocument();
    expect(screen.getByText('Planificar Capacidad')).toBeInTheDocument();
    expect(screen.getByText('Exportar PDF')).toBeInTheDocument();
  });

  it('handles button clicks correctly', () => {
    const props = {
      selectedProjectId: 'TEST-123',
      isExportingPdf: false,
      handleExportPdf: vi.fn(),
      setActiveTab: vi.fn()
    };
    render(<LeaderDashboardHeader {...props} />);

    fireEvent.click(screen.getByText('Planificar Capacidad'));
    expect(props.setActiveTab).toHaveBeenCalledWith('capacidad');

    fireEvent.click(screen.getByText('Exportar PDF'));
    expect(props.handleExportPdf).toHaveBeenCalled();
  });

  it('disables export button while exporting', () => {
    const props = {
      selectedProjectId: 'TEST-123',
      isExportingPdf: true,
      handleExportPdf: vi.fn(),
      setActiveTab: vi.fn()
    };
    render(<LeaderDashboardHeader {...props} />);

    const exportBtn = screen.getByText('Generando...');
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).toBeDisabled();
  });
});

describe('LiderKpiCards Component', () => {
  it('renders default values when no kpis provided', () => {
    render(<LiderKpiCards kpis={null} />);
    
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getAllByText('0.0 días').length).toBe(2);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders provided kpi values correctly', () => {
    const kpis = {
      sprintCompliance: 85.5,
      leadTime: 5.2,
      cycleTime: 3.1,
      scopeCreep: 12
    };
    render(<LiderKpiCards kpis={kpis} />);
    
    expect(screen.getByText('85.5%')).toBeInTheDocument();
    expect(screen.getByText('5.2 días')).toBeInTheDocument();
    expect(screen.getByText('3.1 días')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
  });

  it('toggles tooltips on click', () => {
    render(<LiderKpiCards kpis={null} />);
    
    // Tooltip not present initially
    expect(screen.queryByText(/Puntos de Historia entregados en relación a la meta del Sprint/i)).not.toBeInTheDocument();
    
    // Find the info button for Sprint Compliance
    const infoButtons = screen.getAllByRole('button');
    // First button is for velocity
    fireEvent.click(infoButtons[0]);
    
    expect(screen.getByText(/Puntos de Historia entregados en relación a la meta del Sprint/i)).toBeInTheDocument();
    
    // Click again to hide
    fireEvent.click(infoButtons[0]);
    expect(screen.queryByText(/Puntos de Historia entregados en relación a la meta del Sprint/i)).not.toBeInTheDocument();
  });
});

describe('LiderNotificationBell Component', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    vi.clearAllMocks();
  });

  it('renders and toggles popover correctly', () => {
    render(<LiderNotificationBell />);
    
    // Initially popover is closed
    expect(screen.queryByText('Notificaciones')).not.toBeInTheDocument();
    
    // Click the bell button
    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);
    
    // Popover should be open
    expect(screen.getByText('Notificaciones')).toBeInTheDocument();
    expect(screen.getByText('Ir al Centro de Actividad completo')).toBeInTheDocument();
    
    // Click outside to close (or click button again)
    fireEvent.click(bellButton);
    expect(screen.queryByText('Notificaciones')).not.toBeInTheDocument();
  });
});

describe('LiderVelocityChart Component', () => {
  it('renders correctly with empty data', () => {
    render(<LiderVelocityChart velocityData={[]} isDarkMode={false} />);
    
    expect(screen.getByText('Histórico de Velocidad por Sprint')).toBeInTheDocument();
    expect(screen.getByText('No hay datos de velocidad para este proyecto.')).toBeInTheDocument();
  });

  it('renders correctly with velocity data', () => {
    const data = [
      { sprint: 'Sprint 1', compromisos: 50, entregados: 40 },
      { sprint: 'Sprint 2', compromisos: 60, entregados: 60 }
    ];
    render(<LiderVelocityChart velocityData={data} isDarkMode={true} />);
    
    expect(screen.getByText('Histórico de Velocidad por Sprint')).toBeInTheDocument();
    expect(screen.getByText('SP Comprometidos (Planificados)')).toBeInTheDocument();
    expect(screen.getByText('SP Entregados (Completados)')).toBeInTheDocument();
  });
});
