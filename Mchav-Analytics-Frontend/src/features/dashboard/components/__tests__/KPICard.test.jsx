import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KPICard from '../KPICard';
import { CheckCircle2 } from 'lucide-react';

describe('KPICard Component', () => {
  it('renders title, value, unit and tooltip text correctly', () => {
    render(
      <KPICard
        title="PUNTOS ENTREGADOS"
        value={30}
        unit="sp"
        tooltipText="Suma de Story Points entregados"
        icon={CheckCircle2}
      />
    );

    // Verify title is rendered in uppercase
    expect(screen.getByText('PUNTOS ENTREGADOS')).toBeDefined();
    
    // Verify value and unit are rendered
    expect(screen.getByText('30')).toBeDefined();
    expect(screen.getByText('sp')).toBeDefined();
    
    // Verify tooltip description
    expect(screen.getByText('Suma de Story Points entregados')).toBeDefined();
  });

  it('renders positive trend correctly', () => {
    render(
      <KPICard
        title="PUNTOS ENTREGADOS"
        value={30}
        current={30}
        previous={20}
      />
    );

    // Change from 20 to 30 is a 50% increase
    expect(screen.getByText('50%')).toBeDefined();
  });

  it('renders negative trend correctly', () => {
    render(
      <KPICard
        title="TIEMPO DE CICLO"
        value={4.2}
        current={4.2}
        previous={5.0}
      />
    );

    // Change from 5.0 to 4.2 is a 16% decrease (Math.abs((4.2 - 5) / 5) * 100 = 16%)
    expect(screen.getByText('16%')).toBeDefined();
  });
});
