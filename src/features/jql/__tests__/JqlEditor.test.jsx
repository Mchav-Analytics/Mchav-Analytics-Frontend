import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JqlEditor } from '../components/JqlEditor';

describe('Componente: JqlEditor (Fase 4.4)', () => {
  const defaultProps = {
    jqlQuery: '',
    setJqlQuery: vi.fn(),
    isExecutingJql: false,
    jqlSuccess: '',
    jqlError: '',
    jqlIssues: [],
    showDictionaryTable: false,
    setShowDictionaryTable: vi.fn(),
    handleExecuteJql: vi.fn((e) => e.preventDefault()),
    exportJqlToCsv: vi.fn()
  };

  it('debe renderizar el textarea y botones correctamente', () => {
    render(<JqlEditor {...defaultProps} jqlQuery='project = "TEST"' />);
    
    // Verifica textarea
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('project = "TEST"');
    
    // Verifica botón de ejecutar
    expect(screen.getByRole('button', { name: /Validar y Ejecutar JQL/i })).toBeInTheDocument();
  });

  it('debe llamar a setJqlQuery al escribir en el textarea', () => {
    render(<JqlEditor {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'status = Done' } });
    
    expect(defaultProps.setJqlQuery).toHaveBeenCalledWith('status = Done');
  });

  it('debe deshabilitar el botón de ejecutar mientras isExecutingJql sea true', () => {
    render(<JqlEditor {...defaultProps} isExecutingJql={true} />);
    
    const submitBtn = screen.getByRole('button', { name: /Validando Sintaxis/i });
    expect(submitBtn).toBeDisabled();
  });

  it('debe mostrar mensaje de éxito y botón de exportar si hay jqlSuccess y jqlIssues', () => {
    render(
      <JqlEditor 
        {...defaultProps} 
        jqlSuccess="Consulta ejecutada" 
        jqlIssues={[{ id: 1 }]} 
      />
    );
    
    expect(screen.getByText('Consulta ejecutada')).toBeInTheDocument();
    
    const btnExport = screen.getByRole('button', { name: /Exportar CSV/i });
    expect(btnExport).toBeInTheDocument();
    
    fireEvent.click(btnExport);
    expect(defaultProps.exportJqlToCsv).toHaveBeenCalled();
  });

  it('debe mostrar mensaje de error si existe jqlError', () => {
    render(<JqlEditor {...defaultProps} jqlError="Error sintáctico" />);
    
    expect(screen.getByText('Error sintáctico')).toBeInTheDocument();
  });

  it('debe llamar a handleExecuteJql al enviar el formulario', () => {
    render(<JqlEditor {...defaultProps} />);
    
    const submitBtn = screen.getByRole('button', { name: /Validar y Ejecutar JQL/i });
    fireEvent.click(submitBtn);
    
    expect(defaultProps.handleExecuteJql).toHaveBeenCalled();
  });
});
