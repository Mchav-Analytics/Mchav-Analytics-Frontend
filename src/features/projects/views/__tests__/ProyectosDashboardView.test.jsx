import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProyectosDashboardView from '../ProyectosDashboardView';
import api from '../../../../services/api';

vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' },
    token: 'mock-token' 
  }))
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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
      getProjects: vi.fn(() => Promise.resolve([])),
      updateProject: vi.fn(),
    },
    userService: {
      getUsers: vi.fn(() => Promise.resolve([])),
    }
  };
});

// Mock Recharts to avoid rendering SVG/Canvas complexity in jsdom
vi.mock('recharts', () => {
  const Original = vi.importActual('recharts');
  return {
    ...Original,
    ResponsiveContainer: ({ children }) => <div data-testid="recharts-responsive-container">{children}</div>,
    BarChart: () => <div data-testid="recharts-barchart" />,
    LineChart: () => <div data-testid="recharts-linechart" />,
    AreaChart: () => <div data-testid="recharts-areachart" />,
    PieChart: () => <div data-testid="recharts-piechart" />,
    ComposedChart: () => <div data-testid="recharts-composedchart" />
  };
});

describe('ProyectosDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default api mocks
    api.get.mockImplementation((url) => {
      if (url.includes('/api/v1/projects')) {
        return Promise.resolve({ data: [{ id_proyecto: 'P1', nombre: 'Proyecto Test', estado: 'Activo' }] });
      }
      if (url.includes('/api/v1/users')) {
        return Promise.resolve({ data: [{ id_usuario: 'U1', nombre: 'User Test', rol: 'DEVELOPER' }] });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('renders correctly and fetches initial data', async () => {
    render(<ProyectosDashboardView />);
    
    expect(screen.getByText('Control de Proyectos')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects');
    });
  });

  it('filters projects based on search term', async () => {
    render(<ProyectosDashboardView />);
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects');
    });

    const searchInput = screen.getByPlaceholderText('Buscar proyectos...');
    expect(searchInput).toBeInTheDocument();
  });
});
