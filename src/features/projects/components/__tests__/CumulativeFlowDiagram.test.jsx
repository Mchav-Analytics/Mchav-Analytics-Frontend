import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { CumulativeFlowDiagram } from '../CumulativeFlowDiagram';

// Mock Recharts to avoid jsdom render issues
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    AreaChart: ({ children }) => <div>{children}</div>,
    Area: () => <div data-testid="recharts-area" />,
    XAxis: () => <div data-testid="recharts-xaxis" />,
    YAxis: () => <div data-testid="recharts-yaxis" />,
    CartesianGrid: () => <div data-testid="recharts-cartesiangrid" />,
    Tooltip: () => <div data-testid="recharts-tooltip" />,
    Legend: ({ content }) => <div>{content ? content() : 'Legend'}</div>
  };
});

describe('CumulativeFlowDiagram', () => {
  it('renders empty state when no data provided', () => {
    render(<CumulativeFlowDiagram data={[]} />);
    expect(screen.getByText('No hay datos suficientes para calcular el Flujo Acumulado (CFD)')).toBeInTheDocument();
  });

  it('renders empty state when data is null', () => {
    render(<CumulativeFlowDiagram data={null} />);
    expect(screen.getByText('No hay datos suficientes para calcular el Flujo Acumulado (CFD)')).toBeInTheDocument();
  });

  it('renders chart and legend correctly when data is provided', () => {
    const mockData = [
      { fecha_real: '1', completado: 10, en_revision: 5, en_progreso: 2, por_hacer: 8 },
      { fecha_real: '2', completado: 15, en_revision: 3, en_progreso: 4, por_hacer: 5 },
    ];
    
    render(<CumulativeFlowDiagram data={mockData} />);
    
    // Check if custom legend renders
    expect(screen.getByText('Completado')).toBeInTheDocument();
    expect(screen.getByText('En Revisión / QA')).toBeInTheDocument();
    expect(screen.getByText('En Progreso')).toBeInTheDocument();
    expect(screen.getByText('Por Hacer')).toBeInTheDocument();

    // Check if recharts components are rendered
    expect(screen.getAllByTestId('recharts-area').length).toBe(4);
    expect(screen.getByTestId('recharts-xaxis')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-yaxis')).toBeInTheDocument();
  });
});
