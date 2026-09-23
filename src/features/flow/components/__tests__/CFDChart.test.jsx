import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CFDChart from '../CFDChart';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    AreaChart: ({ children }) => <div data-testid="recharts-areachart">{children}</div>,
    Area: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Legend: () => <div />,
    Tooltip: ({ content }) => {
      if (React.isValidElement(content)) {
        return React.cloneElement(content, {
          active: true,
          label: '2026-03-01',
          payload: [
            { name: 'Active', value: 4, color: '#3b82f6' },
            { name: 'Waiting', value: 2, color: '#f59e0b' }
          ]
        });
      }
      return <div data-testid="recharts-tooltip" />;
    }
  };
});

describe('CFDChart component', () => {
  it('renders fallback when data or cfd array is empty', () => {
    render(<CFDChart data={{ cfd: [] }} />);
    expect(screen.getByText('Cumulative Flow Diagram')).toBeInTheDocument();
    expect(screen.getByText('No hay datos históricos suficientes para el diagrama.')).toBeInTheDocument();

    render(<CFDChart data={null} />);
    expect(screen.getAllByText('Cumulative Flow Diagram').length).toBeGreaterThan(0);
  });

  it('renders chart title, WIP counters and custom tooltip when data is provided', () => {
    const mockData = {
      cfd: [
        { date: '2026-03-01', Done: 10, 'To Do': 5, Waiting: 2, Blocked: 1, Active: 4 },
        { date: '2026-03-02', Done: 12, 'To Do': 4, Waiting: 1, Blocked: 1, Active: 5 }
      ],
      wip: {
        total: 11,
        distribution: [
          { state: 'In Progress', count: 5 },
          { state: 'Code Review', count: 6 }
        ]
      }
    };

    render(<CFDChart data={mockData} />);
    expect(screen.getByText('Cumulative Flow Diagram & WIP')).toBeInTheDocument();
    expect(screen.getByText('Total WIP Actual')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Code Review')).toBeInTheDocument();

    // Check tooltip rendering
    expect(screen.getByText('2026-03-01')).toBeInTheDocument();
    expect(screen.getByText('Active:')).toBeInTheDocument();
    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getAllByText('6').length).toBeGreaterThanOrEqual(1);
  });
});
