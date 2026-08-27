import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as AuthContext from '../features/auth/context/AuthContext';
import { jiraService, projectService } from '../services/api';

// Mock child views to avoid deep rendering issues and speed up tests
vi.mock('../features/auth/views/LoginView', () => ({
  default: () => <div data-testid="login-view">Login View</div>
}));

vi.mock('../components/layout/MainLayout', () => ({
  default: ({ children, activeTab, topbarTitle }) => (
    <div data-testid="main-layout">
      <div data-testid="topbar-title">{topbarTitle}</div>
      <div data-testid="active-tab">{activeTab}</div>
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

describe('App Root Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Default API mock responses
    jiraService.getMetrics.mockResolvedValue({ proyectos_totales: 10 });
    projectService.getProjects.mockResolvedValue([{ id_proyecto: '1', nombre: 'Test Project' }]);
    projectService.getSprints.mockResolvedValue([]);
    projectService.getKpis.mockResolvedValue({});
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
    expect(screen.getByTestId('topbar-title')).toHaveTextContent(/Panel Operativo del Líder Técnico/i);
    expect(screen.getByTestId('lider-dashboard')).toBeInTheDocument();
    
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
    localStorage.setItem('mchav_active_tab', 'proyectos');

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { rol: 'ADMIN' },
      isAuthenticated: true,
      loading: false
    });

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByTestId('proyectos-view')).toBeInTheDocument();
    expect(screen.getByTestId('topbar-title')).toHaveTextContent(/Proyectos y Equipos/i);
  });
});
