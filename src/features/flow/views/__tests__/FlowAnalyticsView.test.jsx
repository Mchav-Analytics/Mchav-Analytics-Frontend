import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FlowAnalyticsView from '../FlowAnalyticsView';
import * as flowHooks from '../../hooks/useFlowMetrics';

vi.mock('../../hooks/useFlowMetrics', () => ({
  useFlowMetrics: vi.fn(() => ({
    cycleTime: null,
    efficiency: null,
    bottlenecks: null,
    blockers: null,
    aging: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }))
}));

describe('FlowAnalyticsView component', () => {
  it('renders prompt to select project when selectedProjectId is missing', () => {
    const handleNavigate = vi.fn();
    render(<FlowAnalyticsView selectedProjectId={null} onNavigateTab={handleNavigate} />);

    expect(screen.getByText('Selecciona un proyecto para ver sus métricas de flujo.')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Ir a Proyectos/i });
    fireEvent.click(btn);
    expect(handleNavigate).toHaveBeenCalledWith('proyectos');
  });

  it('renders loading spinner when useFlowMetrics is loading', () => {
    vi.spyOn(flowHooks, 'useFlowMetrics').mockReturnValue({
      isLoading: true,
      isError: false,
    });

    render(<FlowAnalyticsView selectedProjectId="PROJ-TEST" />);
    expect(screen.getByText('Analizando flujo de trabajo y procesando histórico...')).toBeInTheDocument();
  });

  it('renders error state and handles refetch click', () => {
    const mockRefetch = vi.fn();
    vi.spyOn(flowHooks, 'useFlowMetrics').mockReturnValue({
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<FlowAnalyticsView selectedProjectId="PROJ-TEST" />);
    expect(screen.getByText('Error al cargar las métricas de flujo')).toBeInTheDocument();
    
    const retryBtn = screen.getByRole('button', { name: /Reintentar/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders full dashboard, handles period and issue type changes, and refresh button', () => {
    const mockRefetch = vi.fn();
    vi.spyOn(flowHooks, 'useFlowMetrics').mockReturnValue({
      isLoading: false,
      isError: false,
      cycleTime: { p50: 5, p75: 10 },
      efficiency: { active_pct: 50, waiting_pct: 30, blocked_pct: 20, total_days: 10 },
      bottlenecks: [{ state: 'Code Review', avg: 3, p50: 2, p75: 4, p95: 8, current_issues: 2 }],
      blockers: [],
      aging: [],
      cfdWip: {},
      refetch: mockRefetch,
    });

    render(<FlowAnalyticsView selectedProjectId="PROJ-ALPHA" />);

    expect(screen.getByText('Análisis de Flujo (Flow Analytics)')).toBeInTheDocument();
    expect(screen.getByText('PROJ-ALPHA')).toBeInTheDocument();

    // Test selectors
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
    fireEvent.change(selects[0], { target: { value: '90d' } });
    fireEvent.change(selects[1], { target: { value: 'bug' } });

    // Click refresh button
    const refreshBtn = screen.getByRole('button', { name: /Actualizar/i });
    fireEvent.click(refreshBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
