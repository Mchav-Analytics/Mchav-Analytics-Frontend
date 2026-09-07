import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FourQuadrantChart from '../FourQuadrantChart';

// Mock recharts ResponsiveContainer to render properly in JSDOM
vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 800, height: 600 }}>
        {children}
      </div>
    ),
    // Optionally we could mock Scatter, but let's let it render the SVG.
  };
});

describe('FourQuadrantChart', () => {
  const mockDevelopers = [
    { 
      id_desarrollador: 'D1', 
      nombre: 'Dev Estrella', 
      email: 'estrella@test.com', 
      performance_score: 95, 
      quality_pct: 90, 
      cuadrante: { codigo: 'ESTRELLA', nombre: 'Estrella' } 
    },
    { 
      id_desarrollador: 'D2', 
      nombre: 'Dev Metodico', 
      email: 'metodico@test.com', 
      performance_score: 60, 
      quality_pct: 95, 
      cuadrante: { codigo: 'METODICO', nombre: 'Metódico' } 
    },
    { 
      id_desarrollador: 'D3', 
      nombre: 'Dev Alto Vol', 
      email: 'altovol@test.com', 
      performance_score: 85, 
      quality_pct: 60, 
      cuadrante: { codigo: 'ALTO_VOLUMEN', nombre: 'Alto Volumen' } 
    },
    { 
      id_desarrollador: 'D4', 
      nombre: 'Dev Atascado', 
      email: 'atascado@test.com', 
      performance_score: 50, 
      quality_pct: 50, 
      cuadrante: { codigo: 'ATASCADO', nombre: 'Atascado' } 
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and descriptions correctly', () => {
    render(<FourQuadrantChart developers={mockDevelopers} isDarkMode={false} />);
    expect(screen.getByText('Matriz de Rendimiento & Calidad del Equipo')).toBeInTheDocument();
    expect(screen.getByText('¿Cómo interpretar este gráfico?')).toBeInTheDocument();
  });

  it('renders all filter buttons', () => {
    render(<FourQuadrantChart developers={mockDevelopers} isDarkMode={true} />);
    
    // There should be buttons for each quadrant and "Todos"
    expect(screen.getByText(/Todos/i)).toBeInTheDocument();
    expect(screen.getByText('ESTRELLA')).toBeInTheDocument();
    expect(screen.getByText('METÓDICO')).toBeInTheDocument();
    expect(screen.getByText('ALTO VOLUMEN')).toBeInTheDocument();
    expect(screen.getByText('ATASCADO')).toBeInTheDocument();
  });

  it('can click filter buttons without crashing', async () => {
    render(<FourQuadrantChart developers={mockDevelopers} isDarkMode={false} />);
    
    const estrellaBtn = screen.getByText('ESTRELLA').closest('button');
    const metodicoBtn = screen.getByText('METÓDICO').closest('button');
    const altoVolBtn = screen.getByText('ALTO VOLUMEN').closest('button');
    const atascadoBtn = screen.getByText('ATASCADO').closest('button');
    const todosBtn = screen.getByText(/Todos/i).closest('button');

    await act(async () => {
      fireEvent.click(estrellaBtn);
    });
    // Button should be active (bg-emerald-500)
    expect(estrellaBtn).toHaveClass('bg-emerald-500');

    await act(async () => {
      fireEvent.click(metodicoBtn);
    });
    expect(metodicoBtn).toHaveClass('bg-indigo-600');

    await act(async () => {
      fireEvent.click(altoVolBtn);
    });
    expect(altoVolBtn).toHaveClass('bg-amber-500');

    await act(async () => {
      fireEvent.click(atascadoBtn);
    });
    expect(atascadoBtn).toHaveClass('bg-rose-500');

    await act(async () => {
      fireEvent.click(todosBtn);
    });
    expect(todosBtn).toHaveClass('bg-slate-900');
  });

  it('handles empty developers array gracefully', () => {
    const { container } = render(<FourQuadrantChart developers={[]} isDarkMode={false} />);
    expect(screen.getByText(/Todos \(0\)/i)).toBeInTheDocument();
  });

  it('detects dark mode from document classes if isDarkMode is undefined', () => {
    // Mock document element class
    document.documentElement.classList.add('dark');
    render(<FourQuadrantChart developers={mockDevelopers} />);
    // Since it's internal logic that affects colors, we mainly check it renders without errors
    expect(screen.getByText('Matriz de Rendimiento & Calidad del Equipo')).toBeInTheDocument();
    document.documentElement.classList.remove('dark');
  });
});
