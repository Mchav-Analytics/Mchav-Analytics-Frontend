import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BlockersTable from '../BlockersTable';

describe('BlockersTable component', () => {
  it('renders empty state when no blockers exist', () => {
    render(<BlockersTable data={[]} />);
    expect(screen.getByText('Blockers Activos')).toBeInTheDocument();
    expect(screen.getByText('No hay trabajo actualmente bloqueado.')).toBeInTheDocument();
    expect(screen.getByText('0 activos')).toBeInTheDocument();
  });

  it('renders table with blockers list', () => {
    const mockBlockers = [
      {
        issue_key: 'MCHAV-201',
        assignee: 'Carlos Gómez',
        state: 'Bloqueado por Dependencia',
        duration_days: 5
      }
    ];

    render(<BlockersTable data={mockBlockers} />);
    expect(screen.getByText('Hay 1 elementos bloqueados.')).toBeInTheDocument();
    expect(screen.getByText('1 activos')).toBeInTheDocument();
    expect(screen.getByText('MCHAV-201')).toBeInTheDocument();
    expect(screen.getByText('Carlos Gómez')).toBeInTheDocument();
    expect(screen.getByText('Bloqueado por Dependencia')).toBeInTheDocument();
    expect(screen.getByText('5d')).toBeInTheDocument();
  });
});
