import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ReportsHistory } from '../ReportsHistory';

describe('ReportsHistory', () => {
  const defaultProps = {
    selectedMonth: '',
    setSelectedMonth: vi.fn(),
    selectedYear: '2026',
    setSelectedYear: vi.fn(),
    compareMonth: '',
    setCompareMonth: vi.fn(),
    compareYear: '2026',
    setCompareYear: vi.fn(),
    handleFetchHistory: vi.fn(),
    months: [{ value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' }],
    years: ['2026', '2025']
  };

  it('renders correctly', () => {
    render(<ReportsHistory {...defaultProps} />);
    expect(screen.getByText('Reconstruir Histórico')).toBeInTheDocument();
    expect(screen.getByText('Reportes recientes')).toBeInTheDocument();
    
    // Check recent reports cards
    expect(screen.getByText('Reporte de Proyecto')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Equipo')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Sprint')).toBeInTheDocument();
  });

  it('handles base month and year changes', async () => {
    const user = userEvent.setup();
    render(<ReportsHistory {...defaultProps} />);
    
    const selects = screen.getAllByRole('combobox');
    // selects[0] is Base Month, selects[1] is Base Year, selects[2] is Compare Month, selects[3] is Compare Year
    
    await user.selectOptions(selects[0], '01');
    expect(defaultProps.setSelectedMonth).toHaveBeenCalledWith('01');
    
    await user.selectOptions(selects[1], '2025');
    expect(defaultProps.setSelectedYear).toHaveBeenCalledWith('2025');
  });

  it('handles compare month and year changes', async () => {
    const user = userEvent.setup();
    render(<ReportsHistory {...defaultProps} />);
    
    const selects = screen.getAllByRole('combobox');
    
    await user.selectOptions(selects[2], '02');
    expect(defaultProps.setCompareMonth).toHaveBeenCalledWith('02');
    
    await user.selectOptions(selects[3], '2025');
    expect(defaultProps.setCompareYear).toHaveBeenCalledWith('2025');
  });

  it('calls handleFetchHistory on Generar button click', () => {
    render(<ReportsHistory {...defaultProps} />);
    const btn = screen.getByRole('button', { name: /Generar/i });
    fireEvent.click(btn);
    expect(defaultProps.handleFetchHistory).toHaveBeenCalled();
  });
});
