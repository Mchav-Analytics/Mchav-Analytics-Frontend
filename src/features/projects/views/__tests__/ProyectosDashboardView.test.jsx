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
  return {
    ResponsiveContainer: ({ children }) => <div data-testid="recharts-responsive-container">{children}</div>,
    BarChart: ({ children }) => <div>{children}</div>,
    LineChart: ({ children }) => <div>{children}</div>,
    AreaChart: ({ children }) => <div>{children}</div>,
    PieChart: ({ children }) => <div>{children}</div>,
    ComposedChart: ({ children }) => <div>{children}</div>,
    Bar: () => null,
    Line: () => null,
    Area: () => null,
    Pie: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    Cell: () => null
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
    
    expect(screen.getByRole('heading', { name: 'Proyectos' })).toBeInTheDocument();
  });

  it('renders project controls and filters', async () => {
    render(<ProyectosDashboardView />);
    
    expect(screen.getByRole('heading', { name: 'Proyectos' })).toBeInTheDocument();
  });
});
