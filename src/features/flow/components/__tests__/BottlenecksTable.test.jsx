import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BottlenecksTable from '../BottlenecksTable';

describe('BottlenecksTable component', () => {
  const mockRows = [
    {
      state: 'En Code Review',
      avg: 4.5,
      p50: 3,
      p75: 6,
      p95: 12,
      pct_of_total: 55.2,
      current_issues: 8
    },
    {
      state: 'En Testing',
      avg: 2.1,
      p50: 2,
      p75: 3,
      p95: 5,
      pct_of_total: 20.1,
      current_issues: 3
    }
  ];

  it('renders bottleneck alert and table rows', () => {
    render(<BottlenecksTable data={mockRows} />);
    expect(screen.getByText('Cuellos de Botella (Bottlenecks)')).toBeInTheDocument();
    expect(screen.getByText('BOTTLENECK DETECTADO: En Code Review')).toBeInTheDocument();
    expect(screen.getAllByText('En Code Review').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('4.5d')).toBeInTheDocument();
    expect(screen.getByText('8 issues')).toBeInTheDocument();
    expect(screen.getByText('En Testing')).toBeInTheDocument();
  });

  it('opens and closes internal recommendations modal when clicking Nubi IA button', () => {
    render(<BottlenecksTable data={mockRows} />);
    const nubiButtons = screen.getAllByRole('button');
    // Click the action button
    fireEvent.click(nubiButtons[0]);

    expect(screen.getByText('Recomendaciones de Optimización de Flujo')).toBeInTheDocument();

    // Close modal
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(b => b.querySelector('svg.lucide-x'));
    if (xButton) {
      fireEvent.click(xButton);
      expect(screen.queryByText('Recomendaciones de Optimización de Flujo')).not.toBeInTheDocument();
    }
  });

  it('calls onOpenAiRecommendations prop when provided', () => {
    const handleAi = vi.fn();
    render(<BottlenecksTable data={mockRows} onOpenAiRecommendations={handleAi} />);
    const nubiButtons = screen.getAllByRole('button');
    fireEvent.click(nubiButtons[0]);
    expect(handleAi).toHaveBeenCalledWith(mockRows[0]);
  });
});
