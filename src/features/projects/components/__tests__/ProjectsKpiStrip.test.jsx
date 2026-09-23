import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProjectsKpiStrip } from '../ProjectsKpiStrip';

describe('ProjectsKpiStrip component', () => {
  it('renders computed metrics correctly', () => {
    const mockMetrics = {
      totalIssues: 45,
      completados: 30,
      enProgreso: 10,
      pctCompletado: '66.7%',
      pctNum: 66.7
    };

    render(<ProjectsKpiStrip computedMetrics={mockMetrics} />);

    expect(screen.getByText('Issues totales')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();

    expect(screen.getByText('Completados')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();

    expect(screen.getByText('En progreso')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('% Completado')).toBeInTheDocument();
    expect(screen.getByText('66.7%')).toBeInTheDocument();
  });
});
