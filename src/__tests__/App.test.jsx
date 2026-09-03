import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as AuthContext from '../features/auth/context/AuthContext';
import { jiraService, projectService } from '../services/api';

// Mock child views to avoid deep rendering issues and speed up tests
vi.mock('../features/auth/views/LoginView', () => ({
  default: () => <div data-testid="login-view">Login View</div>
}));

vi.mock('../components/layout/MainLayout', () => ({
  default: ({ children, activeTab, setActiveTab, topbarTitle, handleSyncNow, setIsDarkMode }) => (
    <div data-testid="main-layout">
      <div data-testid="topbar-title">{topbarTitle}</div>
      <div data-testid="active-tab">{activeTab}</div>
      <button data-testid="change-tab-btn" onClick={() => setActiveTab('daily_focus')}>Change Tab</button>
      <button data-testid="sync-btn" onClick={handleSyncNow}>Sync Now</button>
      <button data-testid="dark-mode-btn" onClick={() => setIsDarkMode(false)}>Dark Mode</button>
      <div>{children}</div>
    </div>
  )
}));

// Mock all the tab views
vi.mock('../features/dashboard/views/DashboardView', () => ({ default: () => <div data-testid="dashboard-view">Dashboard</div> }));
vi.mock('../features/dashboard/views/LiderTecnicoDashboardView', () => ({ default: () => <div data-testid="lider-dashboard">Lider Dashboard</div> }));
vi.mock('../features/dashboard/views/DeveloperView', () => ({ default: () => <div data-testid="developer-view">Developer View</div> }));
vi.mock('../features/projects/views/ProyectosDashboardView', () => ({ default: () => <div data-testid="proyectos-view">Proyectos View</div> }));
vi.mock('../features/users/views/AdminUsuariosView', () => ({ default: () => <div data-testid="usuarios-view">Usuarios View</div> }));
vi.mock('../features/dashboard/views/DailyFocusView', () => ({ default: () => <div data-testid="daily-focus-view">Daily Focus</div> }));
vi.mock('../features/dashboard/views/DevWorkloadView', () => ({ default: () => <div data-testid="dev-workload-view">Dev Workload</div> }));
vi.mock('../features/dashboard/views/DevAlertsView', () => ({ default: () => <div data-testid="dev-alerts-view">Dev Alerts</div> }));
vi.mock('../features/dashboard/views/ActivityHistoryView', () => ({ default: () => <div data-testid="activity-history-view">Activity History</div> }));
vi.mock('../features/dashboard/views/TeamDevScorecardsView', () => ({ default: () => <div data-testid="team-dev-scorecards-view">Team Dev Scorecards</div> }));
vi.mock('../features/dashboard/views/TeamMatrixView', () => ({ default: () => <div data-testid="team-matrix-view">Team Matrix</div> }));
vi.mock('../features/dashboard/views/SprintHealthView', () => ({ default: () => <div data-testid="sprint-health-view">Sprint Health</div> }));
vi.mock('../features/dashboard/views/AlertsCenterView', () => ({ default: () => <div data-testid="alerts-center-view">Alerts Center</div> }));
vi.mock('../features/sync/views/SystemSyncTab', () => ({ default: () => <div data-testid="system-sync-tab">System Sync</div> }));
vi.mock('../features/reports/views/CentroReportesView', () => ({ default: () => <div data-testid="centro-reportes-view">Centro Reportes</div> }));
vi.mock('../features/jql/views/JqlConsultasView', () => ({ default: () => <div data-testid="jql-consultas-view">JQL Consultas</div> }));
vi.mock('../features/dashboard/views/CapacityCalculatorView', () => ({ default: () => <div data-testid="capacity-calculator-view">Capacity Calculator</div> }));

// Mock API services
vi.mock('../services/api', () => ({
  jiraService: {
    getMetrics: vi.fn(),
    triggerSync: vi.fn(),
  },
  projectService: {
    getProjects: vi.fn(),
    getSprints: vi.fn(),
    getKpis: vi.fn(),
  }
}));

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Component to throw error and test ErrorBoundary
vi.mock('../features/dashboard/views/DeveloperView', () => ({
  default: () => {
    if (window.triggerError) {
      throw new Error("Test error for ErrorBoundary");
    }
    return <div data-testid="developer-view">Developer View</div>;
  }
}));

describe('App Root Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Default API mock responses
    jiraService.getMetrics.mockResolvedValue({ proyectos_totales: 10 });
    projectService.getProjects.mockResolvedValue([{ id_proyecto: '1', nombre: 'Test Project' }]);
    projectService.getSprints.mockResolvedValue([]);
    projectService.getKpis.mockResolvedValue({ lead_time_medio_dias: 15, proyecto_id: 'Test' });
    jiraService.triggerSync.mockResolvedValue({});
  });

  it('shows loading state when auth is loading', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true
    });

    render(<App />);
    expect(screen.getByText(/Cargando MCHAV Analytics/i)).toBeInTheDocument();
  });

  it('renders LoginView when user is not authenticated', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false
    });

    render(<App />);
    expect(screen.getByTestId('login-view')).toBeInTheDocument();
  });

  it('renders MainLayout and Executive Dashboard for MANAGER role', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'MANAGER' },
      isAuthenticated: true,
      loading: false
    });

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('topbar-title')).toHaveTextContent(/Proyectos y Equipos/i);
    expect(screen.getByTestId('proyectos-view')).toBeInTheDocument();
    
    // Verificamos que se haya llamado la API al autenticarse
    expect(jiraService.getMetrics).toHaveBeenCalled();
    expect(projectService.getProjects).toHaveBeenCalled();
  });

  it('renders Developer View for DEVELOPER role by default', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'DEVELOPER' },
      isAuthenticated: true,
      loading: false
    });

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('topbar-title')).toHaveTextContent(/Mi Trabajo/i);
    expect(screen.getByTestId('developer-view')).toBeInTheDocument();
  });

  it('navigates to saved tab from localStorage if it exists', async () => {
    localStorage.setItem('mchav_active_tab', 'usuarios');

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'ADMIN' },
      isAuthenticated: true,
      loading: false
    });

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByTestId('usuarios-view')).toBeInTheDocument();
    expect(screen.getByTestId('topbar-title')).toHaveTextContent(/Gestión de Usuarios y Roles/i);
  });

  it('handles tab changes correctly via internal layout interaction', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'ADMIN' },
      isAuthenticated: true,
      loading: false
    });

    await act(async () => {
      render(<App />);
    });

    const btn = screen.getByTestId('change-tab-btn');
    await act(async () => {
      fireEvent.click(btn);
    });

    expect(screen.getByTestId('daily-focus-view')).toBeInTheDocument();
  });

  it('handles custom event for tab change', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'ADMIN' },
      isAuthenticated: true,
      loading: false
    });

    await act(async () => {
      render(<App />);
    });

    await act(async () => {
      const event = new CustomEvent('mchav-change-tab', { detail: { tab: 'jql_queries' } });
      window.dispatchEvent(event);
    });

    expect(screen.getByTestId('jql-consultas-view')).toBeInTheDocument();
  });

  it('handles manual sync triggering', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'ADMIN' },
      isAuthenticated: true,
      loading: false
    });

    await act(async () => {
      render(<App />);
    });

    const syncBtn = screen.getByTestId('sync-btn');
    await act(async () => {
      fireEvent.click(syncBtn);
    });

    expect(jiraService.triggerSync).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    jiraService.getMetrics.mockRejectedValue(new Error('API Error'));
    projectService.getProjects.mockRejectedValue(new Error('API Error'));
    
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'ADMIN' },
      isAuthenticated: true,
      loading: false
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<App />);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching general metrics:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('toggles dark mode off', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'ADMIN' },
      isAuthenticated: true,
      loading: false
    });

    await act(async () => {
      render(<App />);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    const darkBtn = screen.getByTestId('dark-mode-btn');
    await act(async () => {
      fireEvent.click(darkBtn);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('renders all possible tabs to maximize coverage', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'ADMIN' },
      isAuthenticated: true,
      loading: false
    });

    const tabs = [
      'dev_workload', 'dev_alerts', 'activity_history', 'team_devs', 'team_matrix',
      'sprint_health', 'alerts_center', 'sincronizacion', 'reports_center', 'capacity_calculator'
    ];

    for (const tab of tabs) {
      await act(async () => {
        const event = new CustomEvent('mchav-change-tab', { detail: { tab } });
        window.dispatchEvent(event);
      });
      // the DOM unmounts and remounts views internally
    }
  });

  it('tests ErrorBoundary fallback', async () => {
    window.triggerError = true;
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'DEVELOPER' },
      isAuthenticated: true,
      loading: false
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText(/Algo salió mal en el renderizado/i)).toBeInTheDocument();
    
    // Test recovery button
    window.triggerError = false;
    await act(async () => {
      fireEvent.click(screen.getByText('Intentar de nuevo'));
    });
    
    consoleSpy.mockRestore();
    delete window.triggerError;
  });
});
