import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDevAlerts } from '../hooks/useDevAlerts';
import { developerService } from '../../../services/api';
import { useAuth } from '../../../features/auth/context/AuthContext';

// Mock dependencies
vi.mock('../../../services/api', () => ({
  developerService: {
    getDevAlerts: vi.fn(),
    performAlertAction: vi.fn()
  }
}));

vi.mock('../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { nombre: 'Test User' }
  }))
}));

const mockProjects = [
  { id_proyecto: '10000', nombre: 'Proyecto Test' },
  { id_proyecto: '20000', nombre: 'Otro Proyecto' }
];

describe('Hook: useDevAlerts (Fase 4.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe limpiar las alertas y no hacer fetch si no hay selectedProjectId', () => {
    const { result } = renderHook(() => useDevAlerts(null, mockProjects));

    expect(result.current.loading).toBe(true); // Inicializa verdadero pero no llama
    expect(developerService.getDevAlerts).not.toHaveBeenCalled();
    // Usa los defaultAlerts por ahora en el hook si alertsData es null
    expect(result.current.alerts).toHaveLength(2);
  });

  it('debe obtener las alertas cuando se proporciona un selectedProjectId', async () => {
    const mockAlertsResponse = {
      total_active_alerts: 1,
      alerts: [{ id: 'mock-1', title: 'Alerta Mock' }]
    };
    developerService.getDevAlerts.mockResolvedValueOnce(mockAlertsResponse);

    const { result } = renderHook(() => useDevAlerts('10000', mockProjects));

    // Inicialmente cargando
    expect(result.current.loading).toBe(true);

    // Esperar a que cambie el loading y resuelva la promesa
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(developerService.getDevAlerts).toHaveBeenCalledWith('10000');
    expect(result.current.alerts).toEqual(mockAlertsResponse.alerts);
    expect(result.current.projectName).toBe('Proyecto Test');
    expect(result.current.devName).toBe('Test User');
  });

  it('debe manejar error al obtener alertas', async () => {
    developerService.getDevAlerts.mockRejectedValueOnce(new Error('API failed'));

    const { result } = renderHook(() => useDevAlerts('10000', mockProjects));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Como alertsData será null, fallback a defaultAlerts
    expect(result.current.alerts).toHaveLength(2);
  });

  it('handleAlertAction debe ejecutar acción y actualizar mensaje', async () => {
    developerService.getDevAlerts.mockResolvedValueOnce({ alerts: [] });
    developerService.performAlertAction.mockResolvedValueOnce({ message: 'Exito' });

    const { result } = renderHook(() => useDevAlerts('10000', mockProjects));

    await act(async () => {
      result.current.handleAlertAction('issue-1', 'help');
    });

    expect(result.current.executingAction).toBe(false);
    expect(developerService.performAlertAction).toHaveBeenCalledWith('issue-1', 'help');
    expect(result.current.actionMsg).toBe('✅ Exito');
  });
});
