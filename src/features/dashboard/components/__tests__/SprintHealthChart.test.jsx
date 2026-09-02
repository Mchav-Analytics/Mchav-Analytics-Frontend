import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SprintHealthChart from '../SprintHealthChart';

vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 800, height: 600 }}>
        {children}
      </div>
    ),
  };
});

describe('SprintHealthChart', () => {
  const defaultProps = {
    stages: [
      { stage: 'In Progress (Desarrollo)', spanishStage: 'Desarrollo', days: 12 },
      { stage: 'In Review', spanishStage: 'Code Review', days: 8 },
      { stage: 'In QA', spanishStage: 'QA', days: 5 },
      { stage: 'To Do (Esperando)', spanishStage: 'Backlog', days: 15 }
    ],
    insight: {
      main_stage: 'Code Review',
      days_spent: 8,
      percentage: 20,
      recommendation: 'Agilizar revisiones de código'
    },
    metrics: {
      flow_efficiency_pct: 42.5
    },
    isDark: false
  };

  it('renders chart title and insight section', () => {
    render(<SprintHealthChart {...defaultProps} />);
    
    // Title
    expect(screen.getByText('Descomposición de Tiempo de Flujo por Etapa (Días Acumulados)')).toBeInTheDocument();
    
    // Stages legends
    expect(screen.getByText('⚙️ Desarrollo Activo')).toBeInTheDocument();
    expect(screen.getByText('🔍 Revisión de Código')).toBeInTheDocument();
    expect(screen.getByText('🧪 Pruebas de Calidad (QA)')).toBeInTheDocument();
    expect(screen.getByText('⏳ En Cola de Espera')).toBeInTheDocument();

    // Insights
    expect(screen.getByText('Identificación de Cuellos de Botella')).toBeInTheDocument();
    expect(screen.getByText('Code Review')).toBeInTheDocument();
    expect(screen.getByText('8 días')).toBeInTheDocument();
    expect(screen.getByText('(20% del tiempo total)')).toBeInTheDocument();
    expect(screen.getByText('Agilizar revisiones de código')).toBeInTheDocument();
    
    // Efficiency
    expect(screen.getByText('42.5% Útil')).toBeInTheDocument();
  });

  it('handles empty insight and metric values gracefully', () => {
    render(<SprintHealthChart stages={[]} insight={{}} metrics={{}} isDark={true} />);
    
    expect(screen.getByText('N/A')).toBeInTheDocument(); // main_stage fallback
    expect(screen.getByText('0 días')).toBeInTheDocument(); // days_spent fallback
    expect(screen.getByText('(0% del tiempo total)')).toBeInTheDocument(); // percentage fallback
    expect(screen.getByText('Sin recomendaciones.')).toBeInTheDocument(); // recommendation fallback
    expect(screen.getByText('0% Útil')).toBeInTheDocument(); // efficiency fallback
  });
});
