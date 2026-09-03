import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAlertsCenter } from '../useAlertsCenter';
import api from '../../../../services/api';
import * as AuthContext from '../../../auth/context/AuthContext';

vi.mock('../../../../services/api', () => ({
  default: { get: vi.fn() }
}));

vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { nombre: 'Test User', rol: 'ADMIN' } }))
}));

describe('useAlertsCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default API mock
    api.get.mockResolvedValue({ data: [] });
    global.URL.createObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default data and API fetch', async () => {
    api.get.mockResolvedValueOnce({
      data: [{ id_alerta: 'a1', titulo: 'Alerta API', tipo_alerta: 'BUG', mensaje: 'Error 500', severidad: 'CRITICAL', reconocida: false, id_proyecto: 'P1' }]
    });

    const { result } = renderHook(() => useAlertsCenter({ selectedProjectId: 'P1' }));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/v1/alerts');
      // Should combine initial local storage / default items with API items
      expect(result.current.filteredItems.length).toBeGreaterThan(0);
      const apiItem = result.current.filteredItems.find(i => i.title === 'Alerta API');
      expect(apiItem).toBeDefined();
      expect(apiItem.priority).toBe('ALTA');
    });
  });

  it('handles API error gracefully', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderHook(() => useAlertsCenter({ selectedProjectId: 'P1' }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Usando catálogo dinámico'), expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it('creates new feedback', async () => {
    const { result } = renderHook(() => useAlertsCenter({ selectedProjectId: 'P1' }));

    // Trying to create without title/summary should fail
    act(() => {
      result.current.handleCreateFeedback({ preventDefault: vi.fn() });
    });
    expect(result.current.toastMessage).toContain('Ingresa el título');

    // Create valid feedback
    act(() => {
      result.current.setFormTitle('Nuevo Feedback');
      result.current.setFormSummary('Resumen del feedback');
      result.current.setFormCategory('UI/UX');
      result.current.setFormPriority('ALTA');
      result.current.setFormProject('Proy1');
    });

    act(() => {
      result.current.handleCreateFeedback({ preventDefault: vi.fn() });
    });

    await waitFor(() => {
      expect(result.current.filteredItems.some(i => i.title === 'Nuevo Feedback')).toBe(true);
      expect(result.current.toastMessage).toContain('registrado exitosamente');
    });
  });

  it('toggles feedback status', async () => {
    const { result } = renderHook(() => useAlertsCenter({ selectedProjectId: 'P1' }));
    
    await waitFor(() => {
      expect(result.current.filteredItems.length).toBeGreaterThan(0);
    });

    const initialItem = result.current.filteredItems[0];
    const initialStatus = initialItem.status;
    
    act(() => {
      result.current.handleToggleStatus(initialItem.id);
    });

    await waitFor(() => {
      const updatedItem = result.current.filteredItems.find(i => i.id === initialItem.id);
      expect(updatedItem.status).not.toBe(initialStatus);
      expect(result.current.toastMessage).toBeTruthy();
    });
  });

  it('adds comments to feedback', async () => {
    const { result } = renderHook(() => useAlertsCenter({ selectedProjectId: 'P1' }));
    
    await waitFor(() => {
      expect(result.current.filteredItems.length).toBeGreaterThan(0);
    });

    const targetId = result.current.filteredItems[0].id;

    act(() => {
      result.current.handleAddComment(targetId); // Should do nothing if empty
    });

    act(() => {
      result.current.setNewCommentText('Este es un comentario de prueba');
    });

    act(() => {
      result.current.handleAddComment(targetId);
    });

    await waitFor(() => {
      const updatedItem = result.current.filteredItems.find(i => i.id === targetId);
      expect(updatedItem.comments.some(c => c.text === 'Este es un comentario de prueba')).toBe(true);
      expect(result.current.newCommentText).toBe('');
      expect(result.current.toastMessage).toContain('Comentario añadido');
    });
  });

  it('exports CSV', async () => {
    const { result } = renderHook(() => useAlertsCenter({ selectedProjectId: 'P1' }));
    
    const mockElement = { setAttribute: vi.fn(), click: vi.fn() };
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockElement);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    act(() => {
      result.current.handleExportCSV();
    });

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(result.current.toastMessage).toContain('exportado con éxito');

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('filters and sorts correctly', async () => {
    const { result } = renderHook(() => useAlertsCenter({ selectedProjectId: 'P1' }));

    await waitFor(() => {
      expect(result.current.filteredItems.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setSearchTerm('Refactorizar');
    });
    expect(result.current.filteredItems.length).toBeGreaterThan(0);

    act(() => {
      result.current.setSearchTerm('');
      result.current.setStatusTab('PENDING');
    });
    expect(result.current.filteredItems.every(i => i.status !== 'RESUELTO')).toBe(true);

    act(() => {
      result.current.setStatusTab('RESOLVED');
    });
    expect(result.current.filteredItems.every(i => i.status === 'RESUELTO')).toBe(true);

    act(() => {
      result.current.setStatusTab('MY_ASSIGNED');
    });
    expect(result.current.filteredItems.every(i => i.author === 'Test User')).toBe(true);

    act(() => {
      result.current.setStatusTab('ALL');
      result.current.setSortBy('priority');
    });
    // Should sort by ALTA, MEDIA, BAJA
    const highPriorityIndex = result.current.filteredItems.findIndex(i => i.priority === 'ALTA');
    const lowPriorityIndex = result.current.filteredItems.findIndex(i => i.priority === 'BAJA');
    if (highPriorityIndex !== -1 && lowPriorityIndex !== -1) {
      expect(highPriorityIndex).toBeLessThan(lowPriorityIndex);
    }

    act(() => {
      result.current.setSortBy('project');
      result.current.setSidebarProject('Sistema Analytics MCHAV');
    });
    expect(result.current.filteredItems.every(i => i.project === 'Sistema Analytics MCHAV')).toBe(true);
  });
});
