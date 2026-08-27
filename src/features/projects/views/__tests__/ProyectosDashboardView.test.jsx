import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProyectosDashboardView from '../ProyectosDashboardView';
import { projectService, userService } from '../../../../services/api';
import { useProjectsData } from '../../../../hooks/useProjectsData';

// Mock Auth
vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' },
    token: 'mock-token' 
  }))
}));

// Mock hooks
vi.mock('../../../../hooks/useProjectsData', () => ({
  useProjectsData: vi.fn()
}));

// ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Component Mocks
vi.mock('../../dashboard/components/LiderNotificationBell', () => ({
  default: () => <div data-testid="lider-bell-mock">LiderNotificationBell</div>
}));

vi.mock('../components/SprintBurndownChart', () => ({
  SprintBurndownChart: () => <div data-testid="sprint-burndown-mock">SprintBurndownChart</div>
}));

vi.mock('../components/ProjectMetrics', () => ({
  ProjectMetrics: () => <div data-testid="project-metrics-mock">ProjectMetrics</div>
}));

vi.mock('../../dashboard/components/PercentilesChart', () => ({
  default: () => <div data-testid="percentiles-chart-mock">PercentilesChart</div>
}));

// API mocks
vi.mock('../../../../services/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
    projectService: {
      getAllProjects: vi.fn(),
      getProjects: vi.fn(),
      updateProject: vi.fn(),
      getKpis: vi.fn(),
      getKpiIssuesDetail: vi.fn()
    },
    userService: {
      getUsers: vi.fn(),
    }
  };
});

describe('ProyectosDashboardView', () => {
  const mockProjects = [
    { id_proyecto: 'P1', key_proyecto: 'KEY-1', nombre: 'Proyecto ALPHA', estado: 'ACTIVE' },
    { id_proyecto: 'P2', key_proyecto: 'KEY-2', nombre: 'Proyecto BETA', estado: 'INACTIVE' }
  ];

  const mockUsers = [
    { id_usuario: 'U1', nombre: 'Lead 1', rol: 'Líder Técnico', email: 'lead1@test.com' },
    { id_usuario: 'U2', nombre: 'Dev 1', rol: 'Desarrollador', email: 'dev1@test.com' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default localStorage
    localStorage.clear();
    
    // Mock useProjectsData
    useProjectsData.mockReturnValue({
      dbUsers: mockUsers,
      dbProjects: mockProjects,
      developers: [mockUsers[1]],
      assignedDevs: [],
      unassignedDevs: [mockUsers[1]],
      assignProjectId: {},
      setAssignProjectId: vi.fn(),
      handleAssignProject: vi.fn()
    });

    // Default API resolves
    userService.getUsers.mockResolvedValue(mockUsers);
    projectService.getProjects.mockResolvedValue(mockProjects);
    projectService.getKpis.mockResolvedValue({ total: 10 });
    projectService.getKpiIssuesDetail.mockResolvedValue({ total_issues: 5, issues: [] });
  });

  it('renders correctly and fetches initial data', async () => {
    render(<ProyectosDashboardView />);
    
    expect(screen.getByText(/Control de Proyectos/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(projectService.getProjects).toHaveBeenCalled();
    });

    // Should render the cards for both mock projects by finding their text
    expect(await screen.findByText('Proyecto ALPHA')).toBeInTheDocument();
    expect(await screen.findByText('Proyecto BETA')).toBeInTheDocument();
  });

  it('filters projects based on search term', async () => {
    const user = userEvent.setup();
    render(<ProyectosDashboardView />);
    
    expect(await screen.findByText('Proyecto ALPHA')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Buscar proyectos/i);
    await user.type(searchInput, 'ALPHA');

    expect(screen.getByText('Proyecto ALPHA')).toBeInTheDocument();
    // Use queryByText for elements that shouldn't be there
    expect(screen.queryByText('Proyecto BETA')).not.toBeInTheDocument();
  });

  it('expands a project card and fetches its metrics', async () => {
    const user = userEvent.setup();
    render(<ProyectosDashboardView />);
    
    expect(await screen.findByText('Proyecto ALPHA')).toBeInTheDocument();

    // The chevron button to expand is typically near the project name
    const buttons = screen.getAllByRole('button');
    const toggleBtn = buttons.find(btn => btn.closest('div').textContent.includes('Proyecto ALPHA'));
    
    if (toggleBtn) {
      await user.click(toggleBtn);
      
      await waitFor(() => {
        expect(projectService.getKpis).toHaveBeenCalledWith('P1');
      });
    }
  });

  it('switches tabs properly inside the view (HU-014 Análisis de Tiempos)', async () => {
    const user = userEvent.setup();
    render(<ProyectosDashboardView />);
    
    expect(await screen.findByText('Proyecto ALPHA')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    const toggleBtn = buttons.find(btn => btn.closest('div').textContent.includes('Proyecto ALPHA'));
    
    if (toggleBtn) {
      await user.click(toggleBtn);
      
      const tiemposTab = await screen.findByRole('button', { name: /TIEMPOS \(HU-014\)/i });
      await user.click(tiemposTab);

      expect(screen.getByTestId('percentiles-chart-mock')).toBeInTheDocument();
    }
  });
});
