import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  it('renders toast message and handles dismissal', async () => {
    const useLeaderDashboardHook = await import('../../hooks/useLeaderDashboard');
    const setToastMessage = vi.fn();
    vi.spyOn(useLeaderDashboardHook, 'useLeaderDashboard').mockReturnValue({
      velocityData: [],
      kpis: {},
      criticalIssues: [],
      teamMembers: [],
      geminiInsights: {},
      loading: false,
      toastMessage: 'Acción realizada correctamente',
      setToastMessage,
      isExportingPdf: false,
      handleConfirmReassign: vi.fn(),
      handleNotifyDev: vi.fn(),
      handleExportPdf: vi.fn()
    });

    render(<LiderTecnicoDashboardView selectedProjectId="PROJ-01" />);
    const toastSpan = screen.getByText('Acción realizada correctamente');
    expect(toastSpan).toBeInTheDocument();

    const closeBtn = toastSpan.parentElement.querySelector('button');
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(setToastMessage).toHaveBeenCalledWith(null);
    }
  });
});
