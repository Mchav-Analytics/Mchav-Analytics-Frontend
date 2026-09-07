import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SprintBurndownChart } from '../SprintBurndownChart';

// Mocks para recharts
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    ComposedChart: ({ children }) => <div data-testid="composed-chart">{children}</div>,
    Line: () => <div data-testid="recharts-line" />,
    Bar: () => <div data-testid="recharts-bar" />,
    XAxis: () => <div data-testid="recharts-xaxis" />,
    YAxis: () => <div data-testid="recharts-yaxis" />,
    CartesianGrid: () => <div data-testid="recharts-cartesiangrid" />,
    Legend: ({ content }) => <div>{content ? content() : 'Legend'}</div>,
    Tooltip: () => <div data-testid="recharts-tooltip" />
  };
});

describe('SprintBurndownChart Component', () => {
  const mockData = [
    {
      fecha_real: '10/Sep',
      esfuerzo_ideal: 100,
      esfuerzo_restante: 90,
      tareas_completadas: 2
    },
    {
      fecha_real: '11/Sep',
      esfuerzo_ideal: 90,
      esfuerzo_restante: 80,
      tareas_completadas: 3
    }
  ];

  it('renders fallback when no data is provided', () => {
    render(<SprintBurndownChart data={[]} />);
    expect(screen.getByText('No hay datos suficientes para calcular el Burndown')).toBeInTheDocument();
  });

  it('renders chart and custom legend correctly with data', () => {
    render(<SprintBurndownChart data={mockData} />);
    
    // Check chart elements
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    
    // Check legend items
    expect(screen.getByText('Ritmo Ideal (Lo planeado)')).toBeInTheDocument();
    expect(screen.getByText('Trabajo Real Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Tareas Terminadas Ese Día')).toBeInTheDocument();
  });
});
