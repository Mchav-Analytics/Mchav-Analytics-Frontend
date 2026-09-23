import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectsHeader } from '../ProjectsHeader';

describe('ProjectsHeader component', () => {
  it('renders greeting with user profile name and handles project selection', () => {
    const handleSelectProject = vi.fn();
    const mockProjects = [
      { id: '1', name: 'Project Alpha', key: 'ALPHA' },
      { id: '2', name: 'Project Beta', key: 'BETA' }
    ];

    render(
      <ProjectsHeader 
        userProfile={{ first_name: 'Mateo' }}
        selectedProjectId="1"
        setSelectedProjectId={handleSelectProject}
        allProjectsList={mockProjects}
      />
    );

    expect(screen.getByText('¡Hola, Mateo!')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument(); // Avatar initial
    expect(screen.getByText('Resumen general del rendimiento y métricas de tus proyectos')).toBeInTheDocument();

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('1');
    fireEvent.change(select, { target: { value: '2' } });
    expect(handleSelectProject).toHaveBeenCalledWith('2');
  });

  it('renders fallback name when userProfile is null', () => {
    render(
      <ProjectsHeader 
        user={{ email: 'developer@example.com' }}
        selectedProjectId={null}
        setSelectedProjectId={vi.fn()}
        allProjectsList={[]}
      />
    );

    expect(screen.getByText('¡Hola, developer!')).toBeInTheDocument();
    expect(screen.getByText('Todos los proyectos')).toBeInTheDocument();
  });
});
