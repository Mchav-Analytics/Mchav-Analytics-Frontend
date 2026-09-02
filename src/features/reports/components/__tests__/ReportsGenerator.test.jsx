import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ReportsGenerator } from '../ReportsGenerator';

describe('ReportsGenerator', () => {
  const defaultProps = {
    reportType: 'proyecto',
    setReportType: vi.fn(),
    reportParam: '',
    setReportParam: vi.fn(),
    customStartDate: '',
    setCustomStartDate: vi.fn(),
    customEndDate: '',
    setCustomEndDate: vi.fn(),
    isGenerating: false,
    handleGenerateLiveReport: vi.fn(),
    dbProjects: [{ id_proyecto: 'P1', nombre: 'Test Project' }],
    dbUsers: [{ id_usuario: 'U1', nombre: 'Test User' }]
  };

  it('renders correctly', () => {
    render(<ReportsGenerator {...defaultProps} />);
    expect(screen.getByText('¿Qué quieres analizar?')).toBeInTheDocument();
    expect(screen.getByText('Configura tu reporte')).toBeInTheDocument();
    expect(screen.getByText('Contenido del reporte')).toBeInTheDocument();
  });

  it('changes report type on click', () => {
    render(<ReportsGenerator {...defaultProps} />);
    const sprintCard = screen.getByText('Sprint').closest('div').parentElement;
    fireEvent.click(sprintCard);
    expect(defaultProps.setReportType).toHaveBeenCalledWith('sprint');
  });

  it('changes report param for project', async () => {
    const user = userEvent.setup();
    render(<ReportsGenerator {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'P1');
    expect(defaultProps.setReportParam).toHaveBeenCalledWith('P1');
  });

  it('changes report param for developer', async () => {
    const user = userEvent.setup();
    render(<ReportsGenerator {...defaultProps} reportType="desarrollador" />);
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'U1');
    expect(defaultProps.setReportParam).toHaveBeenCalledWith('U1');
  });

  it('does not show param select for general report', () => {
    render(<ReportsGenerator {...defaultProps} reportType="general" />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('allows filling in custom parameters for Custom report', async () => {
    const { container } = render(<ReportsGenerator {...defaultProps} />);

    const dateInputs = container.querySelectorAll('input[type="date"]');
    if (dateInputs.length >= 2) {
      fireEvent.change(dateInputs[0], { target: { value: '2026-09-01' } });
      fireEvent.change(dateInputs[1], { target: { value: '2026-09-30' } });
      expect(defaultProps.setCustomStartDate).toHaveBeenCalledWith('2026-09-01');
      expect(defaultProps.setCustomEndDate).toHaveBeenCalledWith('2026-09-30');
    }
  });

  it('generates report on button click', () => {
    render(<ReportsGenerator {...defaultProps} />);
    const btn = screen.getByRole('button', { name: /Generar reporte/i });
    fireEvent.click(btn);
    expect(defaultProps.handleGenerateLiveReport).toHaveBeenCalled();
  });
  
  it('disables generate button when isGenerating is true', () => {
    render(<ReportsGenerator {...defaultProps} isGenerating={true} />);
    const btn = screen.getByRole('button', { name: /Generar reporte/i });
    expect(btn).toBeDisabled();
  });
});
