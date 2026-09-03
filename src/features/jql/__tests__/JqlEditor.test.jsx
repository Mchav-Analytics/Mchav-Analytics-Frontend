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

  it('debe llamar a setJqlQuery con presets rápidos al hacer clic en los botones', () => {
    render(<JqlEditor {...defaultProps} />);
    
    const presets = [
      { name: 'Todas las Incidencias', expected: 'project = "10000"' },
      { name: 'En Progreso', expected: 'project = "10000" AND status in ("In Progress", "En curso")' },
      { name: 'Pendientes (To Do)', expected: 'project = "10000" AND status in ("To Do", "Por hacer", "Pendiente")' },
      { name: 'Completadas (Done)', expected: 'project = "10000" AND status in ("Done", "Finalizado", "Completado")' },
      { name: 'Alta Prioridad', expected: 'project = "10000" AND priority in (High, Highest, Alta) AND status not in ("Done", "Finalizado", "Completado")' },
      { name: 'Sin Asignar', expected: 'project = "10000" AND assignee is EMPTY AND status not in ("Done", "Finalizado", "Completado")' },
      { name: 'Bugs Activos', expected: 'project = "10000" AND issuetype in (Bug, Error) AND status not in ("Done", "Finalizado", "Completado")' },
      { name: 'Actualizadas 7 días', expected: 'project = "10000" AND updated >= -7d ORDER BY updated DESC' },
    ];

    presets.forEach(preset => {
      const button = screen.getByRole('button', { name: preset.name });
      fireEvent.click(button);
      expect(defaultProps.setJqlQuery).toHaveBeenCalledWith(preset.expected);
    });
  });

  it('debe cambiar el estado de ver diccionario al hacer clic en el botón', () => {
    render(<JqlEditor {...defaultProps} showDictionaryTable={false} />);
    
    const toggleDictionaryBtn = screen.getByRole('button', { name: /Ver Guía de Sintaxis JQL/i });
    fireEvent.click(toggleDictionaryBtn);
    expect(defaultProps.setShowDictionaryTable).toHaveBeenCalledWith(true);
  });
});
