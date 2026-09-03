import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SystemSyncControlPanel from '../SystemSyncControlPanel';

describe('SystemSyncControlPanel', () => {
  const defaultProps = {
    syncStatus: {
      status: 'IDLE' as const,
      lastSync: '10:00 AM',
      nextScheduledSync: '11:00 AM'
    },
    handleManualSync: vi.fn(),
    isAutoSync: true,
    setIsAutoSync: vi.fn(),
    cronSchedule: '6h',
    setCronSchedule: vi.fn(),
    cronTime: '10:00',
    handleCronTimeChange: vi.fn(),
    handleSaveCronTime: vi.fn(),
    isSavingCron: false,
    savedCronTime: '09:00'
  };

  it('renders correctly', () => {
    render(<SystemSyncControlPanel {...defaultProps} />);
    
    expect(screen.getByText('Sincronización Automática & Programación de Tareas (CRON)')).toBeDefined();
    expect(screen.getByText('Conectado a Jira Cloud')).toBeDefined();
    expect(screen.getByText('10:00 AM')).toBeDefined(); // lastSync
    expect(screen.getByText('11:00 AM')).toBeDefined(); // nextScheduledSync
  });

  it('calls handleManualSync when button is clicked', () => {
    render(<SystemSyncControlPanel {...defaultProps} />);
    const syncButton = screen.getByText('Sincronizar Manualmente Ahora');
    fireEvent.click(syncButton);
    expect(defaultProps.handleManualSync).toHaveBeenCalled();
  });

  it('calls setIsAutoSync when switch is toggled', () => {
    render(<SystemSyncControlPanel {...defaultProps} />);
    const autoSyncButtons = screen.getAllByRole('button');
    // The second button is the switch
    const switchButton = autoSyncButtons[1];
    fireEvent.click(switchButton);
    expect(defaultProps.setIsAutoSync).toHaveBeenCalledWith(false);
  });

  it('calls setCronSchedule on schedule change', () => {
    render(<SystemSyncControlPanel {...defaultProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '12h' } });
    expect(defaultProps.setCronSchedule).toHaveBeenCalledWith('12h');
  });

  it('calls handleCronTimeChange and handleSaveCronTime', () => {
    render(<SystemSyncControlPanel {...defaultProps} />);
    const input = screen.getByDisplayValue('10:00');
    fireEvent.change(input, { target: { value: '11:00' } });
    expect(defaultProps.handleCronTimeChange).toHaveBeenCalled();

    const saveButton = screen.getByText('Ok');
    fireEvent.click(saveButton);
    expect(defaultProps.handleSaveCronTime).toHaveBeenCalled();
  });

  it('shows syncing state correctly', () => {
    render(<SystemSyncControlPanel {...defaultProps} syncStatus={{ ...defaultProps.syncStatus, status: 'SYNCING' }} />);
    expect(screen.getByText('Sincronizando...')).toBeDefined();
    expect(screen.getByText('Sincronizando en segundo plano...')).toBeDefined();
  });
});
