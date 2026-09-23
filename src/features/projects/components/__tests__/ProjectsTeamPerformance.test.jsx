import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProjectsTeamPerformance } from '../ProjectsTeamPerformance';

describe('ProjectsTeamPerformance component', () => {
  it('renders velocity chart headers and average story points', () => {
    const mockVelocityData = [
      { sprint: 'Sprint 1', committed: 20, completed: 18 },
      { sprint: 'Sprint 2', committed: 25, completed: 24 }
    ];

    const mockStats = {
      avg: 21,
      min: 18,
      max: 24
    };

    render(
      <ProjectsTeamPerformance 
        activeVelocityData={mockVelocityData}
        velocityStats={mockStats}
        activePercentilesData={{ p50: 3, p75: 7, p90: 12 }}
        selectedProjectObj={{ name: 'Backend Core', key: 'CORE' }}
      />
    );

    expect(screen.getByText('VELOCIDAD DEL EQUIPO (STORY POINTS)')).toBeInTheDocument();
    expect(screen.getByText('CORE')).toBeInTheDocument();
    expect(screen.getByText('Promedio (21 SP)')).toBeInTheDocument();
  });
});
