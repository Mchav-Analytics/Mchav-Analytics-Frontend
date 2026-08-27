import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import PercentilesChart from '../PercentilesChart';

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

describe('PercentilesChart', () => {
  const mockData = {
    labels: ['Sprint 1', 'Sprint 2'],
    p50: [2.5, 3.0],
    p85: [4.0, 5.0],
    p95: [6.0, 7.5],
    promedio: [3.2, 4.1]
  };

  it('renders correctly with data', () => {
    const { container } = render(<PercentilesChart data={{...mockData, meta: { total_items: 10 }}} metric="resolucion" title="Tiempo de Resolución" />);
    expect(screen.getByText(/Tiempo de Resolución/)).toBeInTheDocument();
  });

  it('handles null data safely', () => {
    const { container } = render(<PercentilesChart data={null} />);
    expect(container).toBeInTheDocument();
  });

  it('handles empty data structure safely', () => {
    const { container } = render(<PercentilesChart data={{ labels: [], p50: [], p85: [], p95: [], promedio: [] }} />);
    expect(container).toBeInTheDocument();
  });
});
