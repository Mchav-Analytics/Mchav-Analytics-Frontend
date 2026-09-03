import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TeamDevScorecardsDashboard from '../TeamDevScorecardsDashboard';

// Mocks para recharts
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    AreaChart: ({ children }) => <div>{children}</div>,
    Area: () => <div data-testid="recharts-area" />,
    BarChart: ({ children }) => <div>{children}</div>,
    Bar: () => <div data-testid="recharts-bar" />
  };
});

vi.mock('../ScorecardShared', () => ({
  MetricInfoTooltip: () => <div data-testid="tooltip" />
}));

describe('TeamDevScorecardsDashboard Component', () => {
  const mockScorecard = {
    cycle_time_personal: 4.5,
    wip_tickets: 6,
    wip_max: 8,
    throughput_tickets: 12,
    throughput_avg_daily: 1.5,
    story_points_burned: 45,
    story_points_target: 50,
    story_points_achieved_pct: 90,
    throughput_daily: [{ v: 2 }, { v: 1 }]
  };

  it('renders all 4 scorecard metrics correctly with provided data', () => {
    render(<TeamDevScorecardsDashboard scorecard={mockScorecard} />);
    
    // Tarjeta 1: Cycle Time
    expect(screen.getByText('Cycle Time Dev')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();

    // Tarjeta 2: WIP
    expect(screen.getByText('Tickets WIP')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('8 Tickets')).toBeInTheDocument();

    // Tarjeta 3: Throughput
    expect(screen.getByText('Throughput Dev')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('1.5/día')).toBeInTheDocument();

    // Tarjeta 4: Story Points
    expect(screen.getByText('Story Points Dev')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('50 SP')).toBeInTheDocument();
    
    // Gráficos deben estar renderizados
    expect(screen.getByTestId('recharts-area')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar')).toBeInTheDocument();
  });

  it('renders fallback values when scorecard is missing or empty', () => {
    render(<TeamDevScorecardsDashboard scorecard={null} />);
    
    // Verify default zeroes
    const zeroes = screen.getAllByText('0');
    expect(zeroes.length).toBeGreaterThan(0);
    expect(screen.getByText('0/día')).toBeInTheDocument();
    expect(screen.getByText('0 SP')).toBeInTheDocument();
  });
});
