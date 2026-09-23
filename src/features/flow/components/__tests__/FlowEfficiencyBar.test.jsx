import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FlowEfficiencyBar from '../FlowEfficiencyBar';

describe('FlowEfficiencyBar component', () => {
  it('renders default values and empty message when total is 0', () => {
    render(<FlowEfficiencyBar />);
    expect(screen.getByText('Eficiencia del Flujo')).toBeInTheDocument();
    expect(screen.getByText('Sin datos de flujo registrados')).toBeInTheDocument();
    expect(screen.getByText('0.0 días')).toBeInTheDocument();
  });

  it('renders percentages and days correctly with snake_case and camelCase props', () => {
    render(
      <FlowEfficiencyBar 
        active_pct={45} 
        waiting_pct={35} 
        blocked_pct={20} 
        total_days={12.5}
        trendPct={-8}
      />
    );

    expect(screen.getByText('45% Activo')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('35%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('12.5 días')).toBeInTheDocument();
    expect(screen.getByText('↓ 8% vs. sprint anterior')).toBeInTheDocument();
  });

  it('renders positive trend correctly', () => {
    render(
      <FlowEfficiencyBar 
        activePct={60} 
        waitingPct={30} 
        blockedPct={10} 
        totalDays={8.0}
        trendPct={15}
      />
    );

    expect(screen.getByText('↑ 15% vs. sprint anterior')).toBeInTheDocument();
  });
});
