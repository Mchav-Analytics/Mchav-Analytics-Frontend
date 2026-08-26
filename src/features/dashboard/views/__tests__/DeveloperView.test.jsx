import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import DeveloperView from '../DeveloperView';
import { developerService } from '../../../../services/api';

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
vi.mock('../../../../services/api', () => {
  return {
    developerService: {
      getMyScorecard: vi.fn(() => Promise.resolve({
        cycle_time_personal: 3.5,
        wip_tickets: 5,
        throughput_tickets: 10,
        story_points_burned: 40,
        assigned_issues: []
      })),
      getDailyFocus: vi.fn(() => Promise.resolve({
        ai_coach_tip: 'Keep up the good work!',
        efficiency_gain_pct: 10,
        clean_deliveries_pct: 95
      })),
      updateTaskStatus: vi.fn()
    },
    jiraService: {
      triggerSync: vi.fn(() => Promise.resolve())
    },
    projectService: {
      getKpiIssuesDetail: vi.fn(() => Promise.resolve({ issues: [] })),
      transitionIssue: vi.fn()
    },
    jqlService: {
      fetch: vi.fn()
    }
  };
});

describe('DeveloperView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly without crashing', async () => {
    render(<DeveloperView selectedProjectId="PROJ-01" projects={[]} />);
    
    // Check if main metrics text is rendered
    expect(screen.getByText('CYCLE TIME')).toBeInTheDocument();
    expect(screen.getByText('TICKETS WIP')).toBeInTheDocument();
    expect(screen.getByText('THROUGHPUT')).toBeInTheDocument();
    expect(screen.getByText('STORY POINTS')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(developerService.getMyScorecard).toHaveBeenCalled();
    });
  });
});
