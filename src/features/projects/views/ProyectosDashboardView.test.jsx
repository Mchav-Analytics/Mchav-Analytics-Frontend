import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProyectosDashboardView from './ProyectosDashboardView';
import { projectService } from '../../../services/api';

// Mock the project service
vi.mock('../../../services/api', () => ({
  projectService: {
    getProjects: vi.fn(),
    getSprints: vi.fn(),
    getStatuses: vi.fn(),
    getMappings: vi.fn()
  },
  userService: {
    getUsers: vi.fn().mockResolvedValue([])
  },
  developerService: {
    getDevelopers: vi.fn().mockResolvedValue([]),
    getTeamMatrix: vi.fn().mockResolvedValue({})
  }
}));

// Mock ResizeObserver for Recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

describe('ProyectosDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard and displays projects', async () => {
    projectService.getProjects.mockResolvedValue([
      { 
        id_proyecto: '1', 
        key_proyecto: 'PROJ-01', 
        nombre: 'Proyecto Test', 
        tipo_proyecto: 'software',
        equipos: [] 
      }
    ]);
    projectService.getSprints.mockResolvedValue([]);
    projectService.getStatuses.mockResolvedValue([]);
    projectService.getMappings.mockResolvedValue({});

    render(<ProyectosDashboardView />);

    // Wait for the project title to appear, meaning it loaded
    await waitFor(() => {
      expect(screen.getByText('Proyecto Test')).toBeInTheDocument();
    });
  });
});
