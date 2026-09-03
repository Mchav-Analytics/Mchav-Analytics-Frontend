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
    AreaChart: ({ children }) => <svg>{children}</svg>,
    Area: () => <div data-testid="recharts-area" />,
    XAxis: () => <div data-testid="recharts-xaxis" />,
    YAxis: () => <div data-testid="recharts-yaxis" />,
    CartesianGrid: () => <div data-testid="recharts-cartesiangrid" />,
    Tooltip: ({ content }) => {
      const mockPayload = [
        { dataKey: 'completado', value: 10, name: 'completado', color: '#123' },
        { dataKey: 'en_revision', value: 5, name: 'en_revision', color: '#123' },
        { dataKey: 'en_progreso', value: 2, name: 'en_progreso', color: '#123' },
        { dataKey: 'por_hacer', value: 8, name: 'por_hacer', color: '#123' },
        { dataKey: 'otro', value: 1, name: 'otro', color: '#123' }
      ];
      return (
        <div data-testid="recharts-tooltip">
          {content && React.isValidElement(content) 
            ? React.cloneElement(content, { active: true, payload: mockPayload, label: 'Día 1' }) 
            : 'Tooltip'}
        </div>
      );
    },
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
    
    // Check if custom legend and tooltip render
    expect(screen.getAllByText('Completado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('En Revisión / QA').length).toBeGreaterThan(0);
    expect(screen.getAllByText('En Progreso').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Por Hacer').length).toBeGreaterThan(0);

    // Check if recharts components are rendered
    expect(screen.getAllByTestId('recharts-area').length).toBe(4);
    expect(screen.getByTestId('recharts-xaxis')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-yaxis')).toBeInTheDocument();
  });
});
