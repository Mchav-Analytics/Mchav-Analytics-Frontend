import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeveloperView from '../DeveloperView';
import { developerService, projectService, jiraService } from '../../../../services/api';

vi.mock('../../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'dev@test.com', rol: 'DEVELOPER', nombre: 'Test Dev' },
    token: 'mock-token' 
  }))
}));

// Mock Recharts
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div data-testid="recharts-responsive-container">{children}</div>,
    AreaChart: () => <div data-testid="recharts-areachart" />,
    PieChart: () => <div data-testid="recharts-piechart" />,
    BarChart: () => <div data-testid="recharts-barchart" />,
    Area: () => <div />,
    Pie: () => <div />,
    Cell: () => <div />,
    Bar: () => <div />
  };
});

// Mock LiderNotificationBell
vi.mock('../../components/LiderNotificationBell', () => ({
  default: () => <div data-testid="bell-mock">LiderNotificationBell</div>
}));

// Mock DeveloperProjectHeader
vi.mock('../../../../components/layout/DeveloperProjectHeader', () => ({
  default: () => <div data-testid="header-mock">DeveloperProjectHeader</div>
}));

// Mock services
vi.mock('../../../../services/api', () => ({
  developerService: {
    getMyScorecard: vi.fn(),
    getDailyFocus: vi.fn(),
    updateTaskStatus: vi.fn()
  },
  jiraService: {
    triggerSync: vi.fn(() => Promise.resolve()),
    addComment: vi.fn()
  },
  projectService: {
    getKpiIssuesDetail: vi.fn(),
    transitionIssue: vi.fn()
  }
}));

describe('DeveloperView Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    developerService.getMyScorecard.mockResolvedValue({
      cycle_time_personal: 3.5,
      wip_tickets: 5,
      throughput_tickets: 10,
      story_points_burned: 40,
      assigned_issues: [
        { key_issue: 'TSK-1', summary: 'Hacer login', status_actual: 'IN PROGRESS', issue_type: 'Historia', story_points: 5 },
        { key_issue: 'TSK-2', summary: 'Fix bug', status_actual: 'DONE', issue_type: 'Bug', story_points: 3 }
      ]
    });
    
    projectService.getKpiIssuesDetail.mockResolvedValue({
      issues: []
    });

    developerService.getDailyFocus.mockResolvedValue({
      ai_coach_tip: "Tip mock",
      efficiency_gain_pct: 10,
      clean_deliveries_pct: 100
    });
  });

  it('renders correctly and loads data', async () => {
    await act(async () => {
      render(<DeveloperView selectedProjectId="PROJ-01" projects={[]} />);
    });
    
    expect(screen.getByText('CYCLE TIME')).toBeInTheDocument();
    expect(screen.getByText('TICKETS WIP')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getAllByText('Hacer login').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Fix bug').length).toBeGreaterThan(0);
    });
  });

  it('opens issue detail modal', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<DeveloperView selectedProjectId="PROJ-01" projects={[]} />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Hacer login').length).toBeGreaterThan(0);
    });

    // Click on "Ver"
    const viewButtons = screen.getAllByRole('button', { name: /ver detalle/i });
    if(viewButtons.length === 0) {
        const altViewButtons = screen.getAllByRole('button', { name: /ver/i });
        await act(async () => {
          await user.click(altViewButtons[0]);
        });
    } else {
        await act(async () => {
          await user.click(viewButtons[0]);
        });
    }

    // Modal should be open
    expect(screen.getByText(/Sin descripción detallada de Jira/i)).toBeInTheDocument();
  });

  it('filters issues correctly', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<DeveloperView selectedProjectId="PROJ-01" projects={[]} />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Hacer login').length).toBeGreaterThan(0);
    });

    // Filter by completed
    const btnCompletadas = screen.getByRole('button', { name: 'Completadas' });
    await act(async () => {
      await user.click(btnCompletadas);
    });

    expect(screen.queryAllByText('Hacer login').length).toBe(0);
    expect(screen.getAllByText('Fix bug').length).toBeGreaterThan(0);
  });
});
