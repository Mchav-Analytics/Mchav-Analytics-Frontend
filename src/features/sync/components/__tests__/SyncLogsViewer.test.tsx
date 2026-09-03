import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SyncLogsViewer from '../SyncLogsViewer';
import { SyncLog } from '../../hooks/useSystemSync';

describe('SyncLogsViewer', () => {
  const mockSyncStatus = {
    status: 'IDLE' as const,
    lastSync: 'Hoy',
    nextScheduledSync: 'Manana'
  };

  const mockLogs: SyncLog[] = [
    {
      id: 'log-1',
      timestamp: '2026-08-27T10:00:00Z',
      executionType: 'AUTOMATIC',
      processedIssues: 120,
      durationSeconds: 20,
      result: 'SUCCESS',
      ejecutadoPor: 'System'
    },
    {
      id: 'log-2',
      timestamp: '2026-08-27T11:00:00Z',
      executionType: 'MANUAL',
      processedIssues: 5,
      durationSeconds: 125,
      result: 'FAILED',
      ejecutadoPor: 'Admin',
      detalleError: 'Error message here'
    }
  ];

  const defaultProps = {
    syncStatus: mockSyncStatus,
    timeFilter: 'all',
    setTimeFilter: vi.fn(),
    filteredLogs: mockLogs,
    paginatedLogs: mockLogs,
    logPage: 1,
    setLogPage: vi.fn(),
    totalLogPages: 1,
    logsPerPage: 5,
    handleShowLogDetail: vi.fn(),
    handleManualSync: vi.fn(),
    handleDownloadLog: vi.fn()
  };

  it('renders correctly with logs', () => {
    render(<SyncLogsViewer {...defaultProps} />);
    
    // Check headers
    expect(screen.getByText('Historial de Ejecución de Tareas (Logs)')).toBeDefined();
    
    // Check logs data
    expect(screen.getByText('120')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('2m 5s')).toBeDefined(); // 125 seconds
    
    // Check error details rendering on hover/click is available in the DOM
    expect(screen.getByText('Error message here')).toBeDefined();
  });

  it('calls handler functions on button clicks', () => {
    render(<SyncLogsViewer {...defaultProps} />);
    
    const detailsButtons = screen.getAllByTitle('Ver detalles');
    fireEvent.click(detailsButtons[0]);
    expect(defaultProps.handleShowLogDetail).toHaveBeenCalledWith(mockLogs[0]);

    const syncButtons = screen.getAllByTitle('Re-ejecutar');
    fireEvent.click(syncButtons[0]);
    expect(defaultProps.handleManualSync).toHaveBeenCalled();

    const downloadButtons = screen.getAllByTitle('Descargar log');
    fireEvent.click(downloadButtons[0]);
    expect(defaultProps.handleDownloadLog).toHaveBeenCalledWith(mockLogs[0]);
  });

  it('handles empty state', () => {
    render(<SyncLogsViewer {...defaultProps} filteredLogs={[]} paginatedLogs={[]} />);
    expect(screen.getByText('No se encontraron registros de sincronización.')).toBeDefined();
  });

  it('calls setTimeFilter when filter changes', () => {
    render(<SyncLogsViewer {...defaultProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '30d' } });
    expect(defaultProps.setTimeFilter).toHaveBeenCalledWith('30d');
  });

  it('handles pagination button clicks', () => {
    const setLogPageMock = vi.fn();
    render(
      <SyncLogsViewer 
        {...defaultProps} 
        logPage={2} 
        totalLogPages={3} 
        setLogPage={setLogPageMock} 
      />
    );
    
    const prevButton = screen.getByRole('button', { name: 'Anterior' });
    fireEvent.click(prevButton);
    expect(setLogPageMock).toHaveBeenCalled();

    const nextButton = screen.getByRole('button', { name: 'Siguiente' });
    fireEvent.click(nextButton);
    expect(setLogPageMock).toHaveBeenCalled();
  });
});
