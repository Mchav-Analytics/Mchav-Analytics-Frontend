import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import TeamDevScorecardsView from '../TeamDevScorecardsView';
import { developerService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  developerService: {
    getTeamMatrix: vi.fn(() => Promise.resolve({ team_summary: {}, developers: [] })),
    getDevScorecardAdmin: vi.fn(() => Promise.resolve({
      assigned_issues: []
    })),
    getDevelopers: vi.fn(() => Promise.resolve([]))
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

  it('renders correctly without crashing', async () => {
    render(<TeamDevScorecardsView selectedProjectId="PROJ-01" initialSelectedDevId={null} />);

    await waitFor(() => {
      expect(developerService.getDevelopers).toHaveBeenCalledWith('PROJ-01');
    });
  });
});
