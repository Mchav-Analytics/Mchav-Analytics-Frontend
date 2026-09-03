import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JqlResultsTable } from '../JqlResultsTable';

describe('JqlResultsTable', () => {
  const defaultProps = {
    jqlSuccess: true,
    jqlIssues: [],
    showJqlTable: true,
    setShowJqlTable: vi.fn(),
    jqlCurrentPage: 1,
    jqlPageSize: 10
  };

  it('does not render if jqlSuccess is false', () => {
    const { container } = render(<JqlResultsTable {...defaultProps} jqlSuccess={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders table header when showJqlTable is true', () => {
    render(<JqlResultsTable {...defaultProps} jqlIssues={[{ key: 'TEST-1' }]} />);
    expect(screen.getByText('Previsualización de Resultados')).toBeDefined();
    expect(screen.getByText('1 incidencia')).toBeDefined();
    expect(screen.getByText('Clave')).toBeDefined();
  });

  it('toggles table visibility when clicking header', () => {
    render(<JqlResultsTable {...defaultProps} />);
    const headerBtn = screen.getByRole('button');
    fireEvent.click(headerBtn);
    expect(defaultProps.setShowJqlTable).toHaveBeenCalledWith(false);
  });

  it('renders empty state correctly', () => {
    render(<JqlResultsTable {...defaultProps} jqlIssues={[]} />);
    expect(screen.getByText('No se encontraron incidencias para esta consulta.')).toBeDefined();
  });

  it('renders paginated issues correctly with different field mappings', () => {
    const mockIssues = [
      { key: 'TEST-1', fields: { issuetype: { name: 'Bug' }, summary: 'Bug 1', status: { name: 'Open' }, assignee: { displayName: 'John' } } },
      { key_issue: 'TEST-2', issue_type: 'Task', summary: 'Task 1', status_actual: 'Done', assignee_name: 'Jane' },
      { tipo: 'Story', resumen: 'Story 1', estado: 'In Progress', asignado: 'Bob' } // missing key testing default N/A
    ];
    
    render(<JqlResultsTable {...defaultProps} jqlIssues={mockIssues} jqlPageSize={2} />);
    
    // Page 1 should show TEST-1 and TEST-2, but not TEST-3 because page size is 2
    expect(screen.getByText('TEST-1')).toBeDefined();
    expect(screen.getByText('TEST-2')).toBeDefined();
    expect(screen.queryByText('N/A')).toBeNull(); // N/A is on page 2
    
    expect(screen.getByText('Bug')).toBeDefined();
    expect(screen.getByText('Bug 1')).toBeDefined();
    expect(screen.getByText('Open')).toBeDefined();
    expect(screen.getByText('John')).toBeDefined();
    
    expect(screen.getByText('Task')).toBeDefined();
    expect(screen.getByText('Jane')).toBeDefined();
  });

  it('renders page 2 correctly', () => {
    const mockIssues = [
      { key: 'TEST-1' },
      { key: 'TEST-2' },
      { tipo: 'Story', resumen: 'Story 1', estado: 'In Progress', asignado: 'Bob' } // missing key testing default N/A
    ];
    
    render(<JqlResultsTable {...defaultProps} jqlIssues={mockIssues} jqlPageSize={2} jqlCurrentPage={2} />);
    
    // Page 2 should show only the 3rd item
    expect(screen.queryByText('TEST-1')).toBeNull();
    expect(screen.queryByText('TEST-2')).toBeNull();
    expect(screen.getByText('N/A')).toBeDefined();
    expect(screen.getByText('Story')).toBeDefined();
    expect(screen.getByText('Story 1')).toBeDefined();
    expect(screen.getByText('In Progress')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
  });
});
