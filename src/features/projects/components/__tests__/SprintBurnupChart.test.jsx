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
    Legend: ({ content }) => <div>{typeof content === 'function' ? content() : content}</div>,
    Tooltip: ({ content }) => {
      if (React.isValidElement(content)) {
        return React.cloneElement(content, {
          active: true,
          label: '10/Sep',
          payload: [
            { name: 'alcance_total', dataKey: 'alcance_total', value: 100, color: '#f59e0b' },
            { name: 'trabajo_completado', dataKey: 'trabajo_completado', value: 25, color: '#10b981' },
            { name: 'ritmo_ideal', dataKey: 'ritmo_ideal', value: 20, color: '#6366f1' },
            { name: 'tareas_completadas', dataKey: 'tareas_completadas', value: 3, color: '#fbbf24' }
          ]
        });
      }
      return <div data-testid="recharts-tooltip" />;
    }
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

    render(<SprintBurnupChart data={null} />);
    expect(screen.getAllByText('No hay datos suficientes para calcular el Burnup del Sprint').length).toBeGreaterThan(0);
  });

  it('renders chart, legend and tooltip correctly with data', () => {
    render(<SprintBurnupChart data={mockData} />);
    
    // Check chart elements
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    
    // Check legend items
    expect(screen.getByText('Alcance Total (Total Scope)')).toBeInTheDocument();
    expect(screen.getAllByText('Trabajo Completado').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ritmo Ideal').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Tareas Terminadas Ese Día')).toBeInTheDocument();

    // Check tooltip items
    expect(screen.getByText('Alcance Total')).toBeInTheDocument();
    expect(screen.getByText('Tareas Terminadas')).toBeInTheDocument();
    expect(screen.getByText('100 pts')).toBeInTheDocument();
    expect(screen.getByText('3 unds')).toBeInTheDocument();
  });
});
