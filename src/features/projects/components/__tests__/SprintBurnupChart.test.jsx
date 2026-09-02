import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SprintBurnupChart } from '../SprintBurnupChart';

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

describe('SprintBurnupChart Component', () => {
  const mockData = [
    {
      fecha_real: '10/Sep',
      alcance_total: 100,
      trabajo_completado: 10,
      ritmo_ideal: 10,
      tareas_completadas: 2
    },
    {
      fecha_real: '11/Sep',
      alcance_total: 100,
      trabajo_completado: 25,
      ritmo_ideal: 20,
      tareas_completadas: 3
    }
  ];

  it('renders fallback when no data is provided', () => {
    render(<SprintBurnupChart data={[]} />);
    expect(screen.getByText('No hay datos suficientes para calcular el Burnup del Sprint')).toBeInTheDocument();
  });

  it('renders chart and custom legend correctly with data', () => {
    render(<SprintBurnupChart data={mockData} />);
    
    // Check chart elements
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    
    // Check legend items
    expect(screen.getByText('Alcance Total (Total Scope)')).toBeInTheDocument();
    expect(screen.getByText('Trabajo Completado')).toBeInTheDocument();
    expect(screen.getByText('Ritmo Ideal')).toBeInTheDocument();
    expect(screen.getByText('Tareas Terminadas Ese Día')).toBeInTheDocument();
  });
});
