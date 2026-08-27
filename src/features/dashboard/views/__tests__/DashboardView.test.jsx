import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DashboardView from '../DashboardView';
import { projectService, reportService, jiraService } from '../../../../services/api';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
});

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 800, height: 400 }}>
        {children}
      </div>
    )
  };
});

vi.mock('../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' },
    token: 'mock-token' 
  }))
}));

vi.mock('../../../../services/api', () => ({
  projectService: {
    getProjects: vi.fn(() => Promise.resolve([])),
    getKpis: vi.fn(() => Promise.resolve([]))
  },
  reportService: {
    getReports: vi.fn(() => Promise.resolve([]))
  },
  jiraService: {
    syncIssues: vi.fn(() => Promise.resolve({}))
  }
}));

vi.mock('../components/KpiDetailModal', () => ({
  default: () => <div data-testid="kpi-detail-modal">KpiDetailModal</div>
}));

vi.mock('../components/LiderNotificationBell', () => ({
  default: () => <div data-testid="lider-bell-mock">LiderNotificationBell</div>
}));

describe('DashboardView', () => {
  it('renders correctly', async () => {
    render(<DashboardView />);
    expect(screen.getByText('Histórico General')).toBeInTheDocument();
  });

  it('fetches projects on mount', async () => {
    render(<DashboardView />);
    expect(projectService.getProjects).toHaveBeenCalled();
  });
});
