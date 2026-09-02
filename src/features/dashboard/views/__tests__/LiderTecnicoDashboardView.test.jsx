import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import LiderTecnicoDashboardView from '../LiderTecnicoDashboardView';
import { projectService } from '../../../../services/api';

vi.mock('../../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' },
    token: 'mock-token' 
  }))
}));

vi.mock('../../../../services/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    projectService: {
      getKpiIssuesDetail: vi.fn(() => Promise.resolve({ issues: [] })),
      getSprintHealth: vi.fn(() => Promise.resolve({})),
      getDevsPerformance: vi.fn(() => Promise.resolve([])),
      getProjectMetrics: vi.fn(() => Promise.resolve({})),
      getKpis: vi.fn(() => Promise.resolve({})),
      getSprints: vi.fn(() => Promise.resolve([]))
    },
    userService: {
      getUsers: vi.fn(() => Promise.resolve([]))
    },
    jqlService: {
      executeJql: vi.fn(() => Promise.resolve({ issues: [] }))
    }
  };
});

// Mock Recharts
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div data-testid="recharts-responsive-container">{children}</div>,
    AreaChart: () => <div data-testid="recharts-areachart" />,
    BarChart: () => <div data-testid="recharts-barchart" />,
    Area: () => <div />,
    Bar: () => <div />
  };
});

describe('LiderTecnicoDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly without crashing', async () => {
    await act(async () => {
      render(<LiderTecnicoDashboardView selectedProjectId="PROJ-01" projects={[]} />);
    });
    expect(screen.getByText('Panel Operativo del Sprint Activo')).toBeInTheDocument();
  });
});
