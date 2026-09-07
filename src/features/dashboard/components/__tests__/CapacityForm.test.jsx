import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CapacityForm from '../CapacityForm';

// Mock CapacityShared helpers if needed, but here we can just mock InfoTooltip for simplicity
vi.mock('../CapacityShared', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    InfoTooltip: ({ text }) => <div data-testid="info-tooltip">{text}</div>,
    calculateBusinessDays: vi.fn(() => 5)
  };
});

import { calculateBusinessDays } from '../CapacityShared';

describe('CapacityForm', () => {
  const defaultProps = {
    devCount: 4,
    setDevCount: vi.fn(),
    sprintDays: 10,
    setSprintDays: vi.fn(),
    vacationDays: 0,
    setVacationDays: vi.fn(),
    sickDevsCount: 0,
    setSickDevsCount: vi.fn(),
    sickDays: 0,
    setSickDays: vi.fn(),
    avgDevVelocity: 5,
    setAvgDevVelocity: vi.fn(),
    absenceEvents: [],
    handleAddAbsenceEvent: vi.fn().mockReturnValue(true),
    handleRemoveEvent: vi.fn(),
    handleResetScenarios: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders general fields correctly', () => {
    render(<CapacityForm {...defaultProps} />);
    expect(screen.getByDisplayValue('4')).toBeInTheDocument(); // devCount
    expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // sprintDays
  });

  it('calls set callbacks on general fields change', () => {
    render(<CapacityForm {...defaultProps} />);
    
    // There are several number inputs, we can select them by their value or role
    const inputs = screen.getAllByRole('spinbutton');
    
    // The inputs are:
    // 0: devCount
    // 1: sprintDays
    // 2: vacationDays
    // 3: sickDevsCount
    // 4: sickDays
    // 5: avgDevVelocity

    fireEvent.change(inputs[0], { target: { value: '5' } });
    expect(defaultProps.setDevCount).toHaveBeenCalledWith(5);

    fireEvent.change(inputs[1], { target: { value: '14' } });
    expect(defaultProps.setSprintDays).toHaveBeenCalledWith(14);

    fireEvent.change(inputs[2], { target: { value: '2' } });
    expect(defaultProps.setVacationDays).toHaveBeenCalledWith(2);

    fireEvent.change(inputs[3], { target: { value: '1' } });
    expect(defaultProps.setSickDevsCount).toHaveBeenCalledWith(1);

    fireEvent.change(inputs[4], { target: { value: '3' } });
    expect(defaultProps.setSickDays).toHaveBeenCalledWith(3);

    fireEvent.change(inputs[5], { target: { value: '8' } });
    expect(defaultProps.setAvgDevVelocity).toHaveBeenCalledWith(8);
  });

  it('toggles calendar form', () => {
    render(<CapacityForm {...defaultProps} />);
    const toggleBtn = screen.getByText('+ Programar Fecha');
    
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Ocultar Formulario')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Ocultar Formulario'));
    expect(screen.getByText('+ Programar Fecha')).toBeInTheDocument();
  });

  it('handles add absence event form submission', () => {
    render(<CapacityForm {...defaultProps} />);
    fireEvent.click(screen.getByText('+ Programar Fecha'));

    const startDateInput = screen.getAllByRole('textbox', { hidden: true }).find(i => i.type === 'date' || i.className.includes('date'));
    // Wait, the dates are inputs of type date, not text
    
    // So let's get by class or type since labels are not attached
    const startDate = document.querySelector('input[type="date"]');
    const endDate = document.querySelectorAll('input[type="date"]')[1];
    
    fireEvent.change(startDate, { target: { value: '2026-09-01' } });
    fireEvent.change(endDate, { target: { value: '2026-09-07' } });

    const note = screen.getByPlaceholderText(/Motivo/i);
    fireEvent.change(note, { target: { value: 'Test note' } });

    // Submit
    fireEvent.click(screen.getByText('Guardar en Calendario'));

    expect(defaultProps.handleAddAbsenceEvent).toHaveBeenCalledWith(
      'Desarrollador 1', // default dev
      'SICK', // default type
      '2026-09-01',
      '2026-09-07',
      'Test note'
    );
  });

  it('renders scheduled absence events and handles remove', () => {
    const events = [
      { id: 1, type: 'SICK', devName: 'Dev 1', startDate: '2026-09-01', endDate: '2026-09-02', days: 2, note: 'Flu' },
      { id: 2, type: 'VACATION', devName: 'Dev 2', startDate: '2026-09-10', endDate: '2026-09-15', days: 4 }
    ];
    render(<CapacityForm {...defaultProps} absenceEvents={events} />);

    expect(screen.getByText('🚨 Incapacidad')).toBeInTheDocument();
    expect(screen.getByText('🏖️ Vacaciones')).toBeInTheDocument();
    expect(screen.getByText('Flu')).toBeInTheDocument();

    const deleteBtns = screen.getAllByTitle('Eliminar este evento del calendario');
    fireEvent.click(deleteBtns[0]);
    expect(defaultProps.handleRemoveEvent).toHaveBeenCalledWith(1);
  });

  it('handles quick scenario buttons', () => {
    render(<CapacityForm {...defaultProps} />);
    
    const sick1Btn = screen.getByTitle('Simula 1 desarrollador fuera por 6 días laborables');
    fireEvent.click(sick1Btn);
    expect(defaultProps.setSickDevsCount).toHaveBeenCalledWith(1);
    expect(defaultProps.setSickDays).toHaveBeenCalledWith(6);

    const sickAllBtn = screen.getByTitle('Simula 1 desarrollador fuera durante los 10 días completos del sprint');
    fireEvent.click(sickAllBtn);
    expect(defaultProps.setSickDays).toHaveBeenCalledWith(10); // sprintDays

    const resetBtn = screen.getByTitle('Restablece los campos de ausencias e incapacidades a cero');
    fireEvent.click(resetBtn);
    expect(defaultProps.handleResetScenarios).toHaveBeenCalled();
  });
});
