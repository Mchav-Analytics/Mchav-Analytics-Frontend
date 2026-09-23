import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CycleTimeDistribution from '../CycleTimeDistribution';

describe('CycleTimeDistribution component', () => {
  it('renders default zero values when no data passed', () => {
    render(<CycleTimeDistribution data={null} />);
    expect(screen.getByText('Cycle Time (Percentiles)')).toBeInTheDocument();
    expect(screen.getByText('P75 · 0d')).toBeInTheDocument();
    expect(screen.getAllByText('0d').length).toBeGreaterThanOrEqual(1); // P50, etc.
  });

  it('renders percentiles data correctly', () => {
    const mockData = {
      p50: 4,
      p75: 9,
      p85: 14,
      p95: 21,
      count: 42
    };

    render(<CycleTimeDistribution data={mockData} />);
    expect(screen.getByText('P75 · 9d')).toBeInTheDocument();
    expect(screen.getByText('4d')).toBeInTheDocument();
    expect(screen.getByText('9d')).toBeInTheDocument();
    expect(screen.getByText('14d')).toBeInTheDocument();
    expect(screen.getByText('21d')).toBeInTheDocument();
  });
});
