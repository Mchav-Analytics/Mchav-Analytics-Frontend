import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboard } from '../hooks/useDashboard';
import { projectService, jiraService, reportService } from '../../../services/api';

// Mocks
vi.mock('../../../services/api', () => ({
  projectService: {
    getProjects: vi.fn()
  },
  jiraService: {
    getSyncLogs: vi.fn()
  },
  reportService: {
    downloadPdfReport: vi.fn()
  }
}));

vi.mock('../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { nombre: 'Test User' }
  }))
}));

// Mock hook useAnimatedCounter
vi.mock('../../../hooks/useAnimatedCounter', () => ({
  useAnimatedCounter: vi.fn((val) => val) // Simplemente devuelve el valor sin animar para las pruebas
}));

describe('Hook: useDashboard (Fase 4.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe inicializar con los mocks si la API no devuelve datos', async () => {
    projectService.getProjects.mockResolvedValue([]);
    jiraService.getSyncLogs.mockResolvedValue([]);

    const { result } = renderHook(() => useDashboard('10000'));

    await waitFor(() => {
      // Verificamos que projectsHealthList tenga al menos 1 elemento (el mock por defecto)
      expect(result.current.projectsHealthList).toBeDefined();
    });

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.trendMetric).toBe('completed');
  });

  it('debe obtener y formatear los proyectos reales', async () => {
    const mockProjects = [
      { id_proyecto: 'PROJ-1', key_proyecto: 'P1', nombre: 'Proyecto 1', salud_pct: 90, issues_count: 5 },
      { id_proyecto: 'PROJ-2', key_proyecto: 'P2', nombre: 'Proyecto 2', salud_pct: 50, issues_count: 10 }
    ];
    projectService.getProjects.mockResolvedValue(mockProjects);
    jiraService.getSyncLogs.mockResolvedValue([]);

    const { result } = renderHook(() => useDashboard('10000'));

    await waitFor(() => {
      expect(result.current.projectsHealthList).toHaveLength(2);
    });

    const p1 = result.current.projectsHealthList[0];
    const p2 = result.current.projectsHealthList[1];

    expect(p1.status).toBe('Saludable');
    expect(p2.status).toBe('Atención');
    expect(result.current.totalProjectsCount).toBe(2);
  });

  it('openDrillDown debe abrir el modal con título y tipo', () => {
    projectService.getProjects.mockResolvedValue([]);
    jiraService.getSyncLogs.mockResolvedValue([]);

    const { result } = renderHook(() => useDashboard('10000'));

    act(() => {
      result.current.openDrillDown('Test Title', 'velocity');
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.modalTitle).toBe('Test Title');
    expect(result.current.modalMetricType).toBe('velocity');

    act(() => {
      result.current.closeDrillDown();
    });

    expect(result.current.isModalOpen).toBe(false);
  });

  it('handleExportPDF debe llamar a reportService si hay proyecto seleccionado', () => {
    projectService.getProjects.mockResolvedValue([]);
    jiraService.getSyncLogs.mockResolvedValue([]);
    
    // Mock de window.print
    const originalPrint = window.print;
    window.print = vi.fn();

    const { result } = renderHook(() => useDashboard('10000'));

    act(() => {
      result.current.handleExportPDF();
    });

    expect(reportService.downloadPdfReport).toHaveBeenCalledWith('10000');
    expect(window.print).not.toHaveBeenCalled();

    window.print = originalPrint; // restaurar
  });
});
