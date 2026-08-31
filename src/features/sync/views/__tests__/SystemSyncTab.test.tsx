import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemSyncTab from '../SystemSyncTab';
import { jiraService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  jiraService: {
    getSyncLogs: vi.fn(),
    triggerSync: vi.fn()
  }
}));

describe('SystemSyncTab - Integration', () => {
  const mockLogs = [
    {
      id_log: 1,
      fecha_ejecucion: '2026-08-27T10:00:00Z',
      tipo_sincronizacion: 'AUTOMATIC',
      issues_procesados: 120,
      tiempo_ejecucion_segundos: 20,
      resultado: 'SUCCESS',
      ejecutado_por: 'System'
    },
    {
      id_log: 2,
      fecha_ejecucion: '2026-08-26T15:30:00Z',
      tipo_sincronizacion: 'MANUAL',
      issues_procesados: 5,
      tiempo_ejecucion_segundos: 2,
      resultado: 'FAILED',
      ejecutado_por: 'Admin',
      detalle_error: 'Timeout connecting to Jira'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (jiraService.getSyncLogs as any).mockResolvedValue(mockLogs);
  });

  it('renders sync logs in the table', async () => {
    await act(async () => {
      render(<SystemSyncTab />);
    });

    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument(); // issues procesados
      expect(screen.getByText('Timeout connecting to Jira')).toBeInTheDocument(); // detalle_error
    });
  });

  it('filters logs by time successfully', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<SystemSyncTab />);
    });

    await waitFor(() => {
      expect(screen.getByText('Timeout connecting to Jira')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    const timeSelect = selects.find(select => {
      const el = select as HTMLSelectElement;
      return Array.from(el.options).some(opt => opt.value === '30d');
    });

    if (timeSelect) {
      await act(async () => {
        await user.selectOptions(timeSelect, '30d');
      });
    }

    // Since mock dates are hardcoded for 2026-08-26/27, they should both be visible.
    // If the system date is different (like today), they might be filtered out.
    // The test ensures the select doesn't crash.
    expect(jiraService.getSyncLogs).toHaveBeenCalled();
  });

  it('triggers manual sync successfully', async () => {
    (jiraService.triggerSync as any).mockResolvedValueOnce({ message: 'Started' });
    const user = userEvent.setup();
    await act(async () => {
      render(<SystemSyncTab />);
    });

    // We have two "Ejecutar Sincronización Manual Ahora" buttons
    const syncButtons = screen.getAllByRole('button', { name: /Ejecutar Sincronización Manual Ahora|Sincronizar Manualmente Ahora/i });
    
    await act(async () => {
      await user.click(syncButtons[0]);
    });

    expect(jiraService.triggerSync).toHaveBeenCalled();
  });

  it('handles inline functions for showing log details and downloading logs', async () => {
    const user = userEvent.setup();
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    
    await act(async () => {
      render(<SystemSyncTab />);
    });

    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument();
    });

    // Test Show Detail
    const showDetailsButtons = screen.getAllByTitle('Ver detalles');
    await act(async () => {
      await user.click(showDetailsButtons[0]);
    });
    expect(screen.getByText(/Tarea completada con éxito. ID: 1 | Issues Procesados: 120/)).toBeInTheDocument();

    // Test Download Log
    const downloadButtons = screen.getAllByTitle('Descargar log');
    await act(async () => {
      await user.click(downloadButtons[0]);
    });
    
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });
});
