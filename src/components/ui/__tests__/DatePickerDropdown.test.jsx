import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DatePickerDropdown from '../DatePickerDropdown';

describe('DatePickerDropdown', () => {
  const mockSetDateFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<DatePickerDropdown dateFilter="all" setDateFilter={mockSetDateFilter} />);
    expect(screen.getByText('Todo el historial')).toBeInTheDocument();
  });

  it('renders disabled state with Lock icon when disabled prop is true', () => {
    render(<DatePickerDropdown dateFilter="all" setDateFilter={mockSetDateFilter} disabled={true} />);
    expect(screen.getByTitle('Filtro de fecha inactivo en estado pendiente')).toBeDisabled();
    expect(screen.getByText('Sin Historial')).toBeInTheDocument();
  });

  it('opens dropdown on click and displays options', () => {
    render(<DatePickerDropdown dateFilter="all" setDateFilter={mockSetDateFilter} />);
    const button = screen.getByTitle('Filtrar por Rango de Fecha');
    fireEvent.click(button);
    expect(screen.getByText('Seleccionar Filtro de Fecha')).toBeInTheDocument();
    expect(screen.getByText('Últimos 30 días')).toBeInTheDocument();
    expect(screen.getByText('Rango personalizado')).toBeInTheDocument();
  });

  it('handles standard string option selection (e.g. 30d)', () => {
    render(<DatePickerDropdown dateFilter="all" setDateFilter={mockSetDateFilter} />);
    fireEvent.click(screen.getByTitle('Filtrar por Rango de Fecha'));
    
    // Select 30d radio
    const radio = screen.getByDisplayValue('30d');
    fireEvent.click(radio);
    
    // Apply
    fireEvent.click(screen.getByText('Aplicar Filtro'));
    
    expect(mockSetDateFilter).toHaveBeenCalledWith('30d');
  });

  it('handles day option and renders day input', () => {
    render(<DatePickerDropdown dateFilter={{ type: 'day', day: '2026-09-01' }} setDateFilter={mockSetDateFilter} />);
    // Button label should show "Día: 2026-09-01"
    expect(screen.getByText('Día: 2026-09-01')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTitle('Filtrar por Rango de Fecha'));
    
    // Select day radio
    const radio = screen.getByDisplayValue('day');
    fireEvent.click(radio);
    
    // Change day input
    // The input has type="date", we can select it by role or type
    const dateInput = screen.getByDisplayValue('2026-09-01');
    fireEvent.change(dateInput, { target: { value: '2026-09-02' } });
    
    // Apply
    fireEvent.click(screen.getByText('Aplicar Filtro'));
    expect(mockSetDateFilter).toHaveBeenCalledWith({ type: 'day', day: '2026-09-02' });
  });

  it('handles month option and renders month input', () => {
    render(<DatePickerDropdown dateFilter={{ type: 'month', month: '2026-09' }} setDateFilter={mockSetDateFilter} />);
    expect(screen.getByText('Mes: 2026-09')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTitle('Filtrar por Rango de Fecha'));
    
    const radio = screen.getByDisplayValue('month');
    fireEvent.click(radio);
    
    const monthInput = screen.getByDisplayValue('2026-09');
    fireEvent.change(monthInput, { target: { value: '2026-10' } });
    
    fireEvent.click(screen.getByText('Aplicar Filtro'));
    expect(mockSetDateFilter).toHaveBeenCalledWith({ type: 'month', month: '2026-10' });
  });

  it('handles year option and renders year input', () => {
    render(<DatePickerDropdown dateFilter={{ type: 'year', year: '2026' }} setDateFilter={mockSetDateFilter} />);
    expect(screen.getByText('Año: 2026')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTitle('Filtrar por Rango de Fecha'));
    
    const radio = screen.getByDisplayValue('year');
    fireEvent.click(radio);
    
    const yearInput = screen.getByDisplayValue('2026');
    fireEvent.change(yearInput, { target: { value: '2027' } });
    
    fireEvent.click(screen.getByText('Aplicar Filtro'));
    expect(mockSetDateFilter).toHaveBeenCalledWith({ type: 'year', year: '2027' });
  });

  it('handles range option and renders range inputs', () => {
    render(<DatePickerDropdown dateFilter={{ type: 'range', startDate: '2026-09-01', endDate: '2026-09-30' }} setDateFilter={mockSetDateFilter} />);
    expect(screen.getByText('2026-09-01 - 2026-09-30')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTitle('Filtrar por Rango de Fecha'));
    
    const radio = screen.getByDisplayValue('range');
    fireEvent.click(radio);
    
    // There are two date inputs for range, get them by display value since they might not be textbox role
    const startInput = screen.getByDisplayValue('2026-09-01');
    const endInput = screen.getByDisplayValue('2026-09-30');
    
    fireEvent.change(startInput, { target: { value: '2026-10-01' } });
    fireEvent.change(endInput, { target: { value: '2026-10-31' } });
    
    fireEvent.click(screen.getByText('Aplicar Filtro'));
    expect(mockSetDateFilter).toHaveBeenCalledWith({ type: 'range', startDate: '2026-10-01', endDate: '2026-10-31' });
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <DatePickerDropdown dateFilter="all" setDateFilter={mockSetDateFilter} />
      </div>
    );
    
    // Open
    fireEvent.click(screen.getByTitle('Filtrar por Rango de Fecha'));
    expect(screen.getByText('Seleccionar Filtro de Fecha')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));
    
    // Dropdown should be closed (text not in document)
    expect(screen.queryByText('Seleccionar Filtro de Fecha')).not.toBeInTheDocument();
  });
});
