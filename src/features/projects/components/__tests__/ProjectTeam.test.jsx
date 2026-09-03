import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProjectTeam } from '../ProjectTeam';

describe('ProjectTeam', () => {
  it('renders leader and developers correctly', () => {
    const mockProject = {
      lider: 'Andres Leader',
      lider_avatar: 'AL',
      desarrolladores: [
        { id: '1', name: 'Dev One', avatar: 'D1' },
        { id: '2', name: 'Dev Two', avatar: 'D2' }
      ]
    };

    render(<ProjectTeam activeProject={mockProject} />);

    expect(screen.getByText('Líder Técnico')).toBeDefined();
    expect(screen.getByText('Andres Leader')).toBeDefined();
    expect(screen.getByText('AL')).toBeDefined();
    
    expect(screen.getByText('Escuadrón de Desarrollo')).toBeDefined();
    expect(screen.getByText('2 Miembros Activos')).toBeDefined();
    expect(screen.getByText('Dev One')).toBeDefined();
    expect(screen.getByText('Dev Two')).toBeDefined();
  });

  it('renders correctly without assigned leader and developers', () => {
    const mockProject = {};

    render(<ProjectTeam activeProject={mockProject} />);

    expect(screen.getByText('Sin Asignar')).toBeDefined();
    expect(screen.getByText('?')).toBeDefined();
    expect(screen.getByText('0 Miembros Activos')).toBeDefined();
    expect(screen.getByText('No hay desarrolladores asignados aún.')).toBeDefined();
  });
});
