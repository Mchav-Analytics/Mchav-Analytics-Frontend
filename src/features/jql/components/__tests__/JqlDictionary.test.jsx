import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { JqlDictionary } from '../JqlDictionary';

describe('JqlDictionary', () => {
  const mockJqlAuditLog = [
    { id: '1', query: 'project = "MCHAV"', count: 10, timeMs: 45, date: '2026-09-01' },
    { id: '2', query: 'status = "Done"', count: 5, timeMs: 20, date: '2026-09-02' }
  ];

  const defaultProps = {
    dictionarySearch: '',
    setDictionarySearch: vi.fn(),
    setJqlQuery: vi.fn(),
    jqlAuditLog: mockJqlAuditLog
  };

  it('renders correctly', () => {
    render(<JqlDictionary {...defaultProps} />);
    expect(screen.getByText('Diccionario de Campos JQL')).toBeInTheDocument();
    expect(screen.getByText('Auditoría de Consultas JQL')).toBeInTheDocument();
    
    // Check if dictionary items are rendered
    expect(screen.getByText('project')).toBeInTheDocument();
    expect(screen.getByText('status')).toBeInTheDocument();
    
    // Check if audit log items are rendered
    expect(screen.getByText('project = "MCHAV"')).toBeInTheDocument();
    expect(screen.getByText('status = "Done"')).toBeInTheDocument();
  });

  it('filters dictionary items based on search', () => {
    render(<JqlDictionary {...defaultProps} dictionarySearch="prioridad" />);
    // "priority" should match "prioridad" since description has "Prioridad"
    expect(screen.getByText('priority')).toBeInTheDocument();
    
    // "project" should not be rendered
    expect(screen.queryByText('project')).not.toBeInTheDocument();
  });

  it('calls setDictionarySearch on input change', async () => {
    const user = userEvent.setup();
    render(<JqlDictionary {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Buscar campo/i);
    await user.type(input, 'a');
    expect(defaultProps.setDictionarySearch).toHaveBeenCalledWith('a');
  });

  it('calls setJqlQuery when clicking on a dictionary item', () => {
    render(<JqlDictionary {...defaultProps} />);
    const projectItem = screen.getByText('project');
    fireEvent.click(projectItem);
    
    // The example for project is 'project = "MCHAV" OR project = "PROJ-01"'
    expect(defaultProps.setJqlQuery).toHaveBeenCalledWith('project = "MCHAV" OR project = "PROJ-01"');
  });
});
