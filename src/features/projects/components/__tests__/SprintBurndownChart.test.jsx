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
    Legend: ({ content }) => <div>{typeof content === 'function' ? content() : content}</div>,
    Tooltip: ({ content }) => {
      if (React.isValidElement(content)) {
        return React.cloneElement(content, {
          active: true,
          label: '10/Sep',
          payload: [
            { name: 'esfuerzo_ideal', dataKey: 'esfuerzo_ideal', value: 100, color: '#10b981' },
            { name: 'esfuerzo_restante', dataKey: 'esfuerzo_restante', value: 80, color: '#6366f1' },
            { name: 'tareas_completadas', dataKey: 'tareas_completadas', value: 3, color: '#fbbf24' }
          ]
        });
      }
      return <div data-testid="recharts-tooltip" />;
    }
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

    render(<SprintBurndownChart data={null} />);
    expect(screen.getAllByText('No hay datos suficientes para calcular el Burndown').length).toBeGreaterThan(0);
  });

  it('renders chart, legend and custom tooltip with data', () => {
    render(<SprintBurndownChart data={mockData} />);
    
    // Check chart elements
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    
    // Check legend items
    expect(screen.getByText('Ritmo Ideal (Lo planeado)')).toBeInTheDocument();
    expect(screen.getByText('Trabajo Real Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Tareas Terminadas Ese Día')).toBeInTheDocument();

    // Check tooltip items
    expect(screen.getByText('Ritmo Ideal')).toBeInTheDocument();
    expect(screen.getByText('Trabajo Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Tareas Terminadas')).toBeInTheDocument();
    expect(screen.getByText('100 pts')).toBeInTheDocument();
    expect(screen.getByText('3 unds')).toBeInTheDocument();
  });
});
