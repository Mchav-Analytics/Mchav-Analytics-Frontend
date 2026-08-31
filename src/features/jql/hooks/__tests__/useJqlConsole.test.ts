import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useJqlConsole } from '../useJqlConsole';
import { jqlService, automationService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  jqlService: {
    executeJql: vi.fn()
  },
  automationService: {
    executeJqlQuery: vi.fn()
  }
}));

describe('useJqlConsole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default states', () => {
    const { result } = renderHook(() => useJqlConsole());
    expect(result.current.jqlQuery).toBe('project = "10000"');
    expect(result.current.jqlSuccess).toBeNull();
    expect(result.current.jqlError).toBeNull();
    expect(result.current.jqlIssues).toEqual([]);
  });

  it('updates jqlQuery state', () => {
    const { result } = renderHook(() => useJqlConsole());
    act(() => {
      result.current.setJqlQuery('status = done');
    });
    expect(result.current.jqlQuery).toBe('status = done');
  });

  it('sets error when executing empty query', async () => {
    const { result } = renderHook(() => useJqlConsole());
    
    act(() => {
      result.current.setJqlQuery('');
    });

    await act(async () => {
      await result.current.handleExecuteJql();
    });

    expect(result.current.jqlError).toBe('Por favor ingresa una consulta JQL válida.');
  });

  it('handles successful jql execution', async () => {
    jqlService.executeJql.mockResolvedValueOnce({
      success: true,
      issues: [{ id: 1, key: 'TEST-1' }]
    });

    const { result } = renderHook(() => useJqlConsole());
    
    await act(async () => {
      await result.current.handleExecuteJql();
    });

    expect(jqlService.executeJql).toHaveBeenCalledWith('project = "10000"');
    expect(result.current.jqlIssues).toHaveLength(1);
    expect(result.current.jqlSuccess).toMatch(/Sintaxis JQL válida/);
    expect(result.current.jqlAuditLog[0].query).toBe('project = "10000"');
  });

  it('handles jql execution failure from API', async () => {
    jqlService.executeJql.mockResolvedValueOnce({
      success: false,
      detail: 'Sintaxis inválida'
    });

    const { result } = renderHook(() => useJqlConsole());
    
    await act(async () => {
      await result.current.handleExecuteJql();
    });

    expect(result.current.jqlError).toBe('Sintaxis inválida');
  });

  it('handles jql execution network error', async () => {
    jqlService.executeJql.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useJqlConsole());
    
    await act(async () => {
      await result.current.handleExecuteJql();
    });

    expect(result.current.jqlError).toBe('Network error');
  });

  it('exports to CSV correctly', () => {
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn()
    };
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    const { result } = renderHook(() => useJqlConsole());
    
    act(() => {
      // Simulate issues loaded
      result.current.handleExecuteJql = vi.fn(); 
    });

    // Manually setting issues isn't possible directly without triggering a setState, 
    // we can mock the initial state or just call the API. Let's call the API to set issues.
    jqlService.executeJql.mockResolvedValueOnce({
      success: true,
      issues: [{ key: 'TEST-1', fields: { issuetype: { name: 'Bug' }, summary: 'Bug test', status: { name: 'Open' }, assignee: { displayName: 'John' } } }]
    });

    // Need an async act to fetch
    return act(async () => {
      await result.current.handleExecuteJql();
    }).then(() => {
      act(() => {
        result.current.exportJqlToCsv();
      });

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', expect.stringContaining('data:text/csv'));
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('consultas_jql_resultados_'));
      expect(appendChildSpy).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
