import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useJqlConsole } from '../useJqlConsole';
import { jqlService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  jqlService: {
    executeJql: vi.fn()
  }
}));

describe('useJqlConsole (sync module)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default states', () => {
    const { result } = renderHook(() => useJqlConsole());
    expect(result.current.jqlQuery).toBe('project = "10000" AND status in ("In Progress", "En curso")');
    expect(result.current.jqlError).toBe('');
    expect(result.current.jqlSuccess).toBe('');
    expect(result.current.jqlIssues).toEqual([]);
    expect(result.current.showJqlTable).toBe(true);
    expect(result.current.isExecutingJql).toBe(false);
  });

  it('updates simple states correctly', () => {
    const { result } = renderHook(() => useJqlConsole());
    
    act(() => {
      result.current.setJqlQuery('status = done');
      result.current.setShowDictionaryTable(true);
      result.current.setDictionarySearch('test');
      result.current.setSelectedDictCategory('Consultas Básicas');
      result.current.setJqlPageSize(10);
      result.current.setJqlCurrentPage(2);
    });

    expect(result.current.jqlQuery).toBe('status = done');
    expect(result.current.showDictionaryTable).toBe(true);
    expect(result.current.dictionarySearch).toBe('test');
    expect(result.current.selectedDictCategory).toBe('Consultas Básicas');
    expect(result.current.jqlPageSize).toBe(10);
    expect(result.current.jqlCurrentPage).toBe(2);
  });

  it('handles executeJql success', async () => {
    const { result } = renderHook(() => useJqlConsole());
    const mockEvent = { preventDefault: vi.fn() } as any;

    (jqlService.executeJql as any).mockResolvedValueOnce({
      total: 2,
      issues: [{ key: 'TEST-1' }, { key: 'TEST-2' }]
    });

    await act(async () => {
      await result.current.handleExecuteJql(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(jqlService.executeJql).toHaveBeenCalledWith('project = "10000" AND status in ("In Progress", "En curso")');
    expect(result.current.jqlIssues).toHaveLength(2);
    expect(result.current.jqlSuccess).toContain('2 incidencias encontradas');
    expect(result.current.jqlError).toBe('');
  });

  it('handles executeJql failure', async () => {
    const { result } = renderHook(() => useJqlConsole());
    const mockEvent = { preventDefault: vi.fn() } as any;

    (jqlService.executeJql as any).mockRejectedValueOnce({
      response: { data: { detail: 'Sintaxis inválida' } }
    });

    await act(async () => {
      await result.current.handleExecuteJql(mockEvent);
    });

    expect(result.current.jqlError).toBe('Sintaxis inválida');
    expect(result.current.jqlSuccess).toBe('');
    expect(result.current.jqlIssues).toEqual([]);
  });

  it('exports JQL to CSV', () => {
    const mockLink = { setAttribute: vi.fn(), click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    const { result } = renderHook(() => useJqlConsole());
    
    // Test early return when no issues
    act(() => {
      result.current.exportJqlToCsv();
    });
    expect(document.createElement).not.toHaveBeenCalled();

    // Set issues and test export
    act(() => {
      // simulate issues loaded
      result.current.handleExecuteJql = vi.fn();
    });

    (jqlService.executeJql as any).mockResolvedValueOnce({
      total: 1,
      issues: [{ key: 'TEST-1', fields: { issuetype: { name: 'Bug' }, summary: 'Bug', status: { name: 'Open' } } }]
    });

    return act(async () => {
      await result.current.handleExecuteJql({ preventDefault: vi.fn() } as any);
    }).then(() => {
      act(() => {
        result.current.exportJqlToCsv();
      });

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', expect.stringContaining('data:text/csv'));
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('jql_export_'));
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  it('copies to clipboard correctly', () => {
    const mockWriteText = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const { result } = renderHook(() => useJqlConsole());

    act(() => {
      result.current.handleCopyToClipboard('project = 10000', 1);
    });

    expect(mockWriteText).toHaveBeenCalledWith('project = 10000');
    expect(result.current.copiedJqlIdx).toBe(1);
  });

  it('loads JQL into console textarea', () => {
    const mockScrollIntoView = vi.fn();
    const mockFocus = vi.fn();
    const mockTextarea = { scrollIntoView: mockScrollIntoView, focus: mockFocus };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockTextarea as any);

    const { result } = renderHook(() => useJqlConsole());

    act(() => {
      result.current.handleLoadIntoConsole('new jql');
    });

    expect(result.current.jqlQuery).toBe('new jql');
    expect(mockScrollIntoView).toHaveBeenCalled();
    expect(mockFocus).toHaveBeenCalled();
  });
});
