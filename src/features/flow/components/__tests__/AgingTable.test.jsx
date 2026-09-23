import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AgingTable from '../AgingTable';

describe('AgingTable component', () => {
  it('renders title and empty state without crashing', () => {
    render(<AgingTable data={[]} />);
    expect(screen.getByText('Work Aging (Trabajo Estancado)')).toBeInTheDocument();
    expect(screen.getByText('Top 5 más antiguas')).toBeInTheDocument();
  });

  it('renders list of items with issue key, aging days and assignee', () => {
    const mockData = [
      {
        issue_key: 'MCHAV-101',
        title: 'Corregir error en cálculo de KPIs',
        assignee: 'Juan Pérez',
        state: 'En curso',
        aging_days: 14
      },
      {
        issue_key: 'MCHAV-102',
        title: 'Optimización de consultas SQL',
        assignee: null,
        state: null,
        aging_days: 22
      }
    ];

    render(<AgingTable data={mockData} />);
    expect(screen.getByText('MCHAV-101')).toBeInTheDocument();
    expect(screen.getByText('Corregir error en cálculo de KPIs')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('14d')).toBeInTheDocument();
    
    expect(screen.getByText('MCHAV-102')).toBeInTheDocument();
    expect(screen.getByText('Sin Asignar')).toBeInTheDocument();
    expect(screen.getByText('22d')).toBeInTheDocument();
  });
});
