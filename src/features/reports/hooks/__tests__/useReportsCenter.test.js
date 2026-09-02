import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useReportsCenter } from '../useReportsCenter';
import api from '../../../../services/api';
import { useAuth } from '../../../auth/context/AuthContext';
import { useReactToPrint } from 'react-to-print';

vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../../../services/api', () => ({
  default: {
    get: vi.fn()
  }
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: vi.fn()
}));

describe('useReportsCenter', () => {
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'mock-token' });
    
    global.fetch = vi.fn();
    
    api.get.mockImplementation((url) => {
      if (url === '/api/v1/projects') return Promise.resolve({ data: [{ id_proyecto: 'P1' }] });
      if (url === '/api/v1/users') return Promise.resolve({ data: [{ id_usuario: 'U1' }] });
      return Promise.reject(new Error('not found'));
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  it('initializes default state correctly', async () => {
    const { result } = renderHook(() => useReportsCenter('P1'));
    
    expect(result.current.activeTab).toBe('generacion');
    expect(result.current.reportType).toBe('proyecto');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.loadingHistory).toBe(false);
    expect(result.current.reportData).toBeNull();
    
    await waitFor(() => {
      expect(result.current.dbProjects).toHaveLength(1);
      expect(result.current.dbUsers).toHaveLength(1);
    });
  });

  it('handles API errors gracefully during initialization', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.get.mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useReportsCenter('P1'));
    
    await waitFor(() => {
      expect(result.current.dbProjects).toEqual([]);
      expect(result.current.dbUsers).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });
    
    consoleSpy.mockRestore();
  });

  it('handles state updates', async () => {
    const { result } = renderHook(() => useReportsCenter('P1'));
    
    act(() => {
      result.current.setActiveTab('historial');
      result.current.setReportType('developer');
      result.current.setSelectedMonth('01');
    });
    
    expect(result.current.activeTab).toBe('historial');
    expect(result.current.reportType).toBe('developer');
    expect(result.current.selectedMonth).toBe('01');
  });

  it('handles live report generation', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useReportsCenter('P1'));
    
    act(() => {
      result.current.handleGenerateLiveReport();
    });
    
    expect(result.current.isGenerating).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.reportData).toBeDefined();
    expect(result.current.reportData.month).toBe('Reporte en Vivo');
  });

  it('handles fetch history successfully', async () => {
    const mockReportData = { pointsCompleted: 100 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReportData
    });
    
    const { result } = renderHook(() => useReportsCenter('P1'));
    
    act(() => {
      result.current.setSelectedMonth('05');
      result.current.setSelectedYear('2026');
    });
    
    await act(async () => {
      await result.current.handleFetchHistory();
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/reports/historical?proyecto_id=P1&month=2026-05',
      expect.objectContaining({
        headers: { 'Authorization': 'Bearer mock-token' }
      })
    );
    expect(result.current.reportData).toEqual(mockReportData);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch history with missing parameters', async () => {
    const { result } = renderHook(() => useReportsCenter(null));
    
    await act(async () => {
      await result.current.handleFetchHistory();
    });
    
    expect(result.current.error).toBe('Faltan parámetros.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles fetch history error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useReportsCenter('P1'));
    
    act(() => {
      result.current.setSelectedMonth('05');
    });
    
    await act(async () => {
      await result.current.handleFetchHistory();
    });
    
    expect(result.current.error).toBe('Error al reconstruir el historial.');
    expect(result.current.reportData).toBeNull();
    consoleSpy.mockRestore();
  });
  
  it('setup handlePrint correctly', () => {
    const mockPrintFn = vi.fn();
    useReactToPrint.mockReturnValue(mockPrintFn);
    
    const { result } = renderHook(() => useReportsCenter('P1'));
    
    expect(useReactToPrint).toHaveBeenCalledWith(expect.objectContaining({
      documentTitle: "MCHAV_Reporte_Ejecutivo",
    }));
    
    expect(result.current.handlePrint).toBe(mockPrintFn);
    
    // Also test onAfterPrint
    const printConfig = useReactToPrint.mock.calls[0][0];
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    printConfig.onAfterPrint();
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Búho IA'));
    
    alertSpy.mockRestore();
  });
});
