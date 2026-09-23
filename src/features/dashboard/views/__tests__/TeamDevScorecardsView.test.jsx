import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TeamDevScorecardsView from '../TeamDevScorecardsView';
import { developerService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} })
  },
  projectService: {
    getProjects: vi.fn(() => Promise.resolve([]))
  },
  developerService: {
    getTeamMatrix: vi.fn(() => Promise.resolve({ team_summary: {}, developers: [] })),
    getDeveloperScorecard: vi.fn(() => Promise.resolve({
      assigned_issues: [
        { key_issue: 'ISSUE-1', summary: 'Hacer login', status_actual: 'Done', story_points: 3 }
      ]
    })),
    getDevScorecardAdmin: vi.fn(() => Promise.resolve({
      assigned_issues: [
        { key_issue: 'ISSUE-1', summary: 'Hacer login', status_actual: 'Done', story_points: 3 }
      ]
    })),
    getDevelopers: vi.fn(() => Promise.resolve([
      { assignee_id: 'dev-1', nombre: 'Carlos Ruiz', email: 'carlos@test.com' },
      { assignee_id: 'dev-2', nombre: '', email: 'anon@test.com' }
    ]))
  }
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

describe('TeamDevScorecardsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with developers and loads scorecard profile', async () => {
    render(<TeamDevScorecardsView selectedProjectId="PROJ-01" />);

    await waitFor(() => {
      expect(developerService.getDevelopers).toHaveBeenCalledWith('PROJ-01');
    });

    await waitFor(() => {
      expect(screen.getByText(/Developer Workload & Flow Profile:/i)).toBeInTheDocument();
    });
  });
});
