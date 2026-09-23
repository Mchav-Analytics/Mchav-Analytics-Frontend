import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeveloperProjectHeader from '../DeveloperProjectHeader';

describe('DeveloperProjectHeader', () => {
  const mockProjects = [
    { id_proyecto: '1', nombre: 'Alpha Project', key_proyecto: 'ALP', estado: 'Activo' },
    { id_proyecto: '2', nombre: 'Beta System', key_proyecto: 'BET', estado: 'Pausado' }
  ];

  it('renders default state without selected project', () => {
    render(<DeveloperProjectHeader projects={mockProjects} selectedProjectId={null} isGlobalView={true} />);
    expect(screen.getByText(/Proyecto Activo \(Global\)/i)).toBeDefined();
    expect(screen.getByText('Seleccionar proyecto...')).toBeDefined();
  });

  it('renders with selected project and sync success message', () => {
    render(
      <DeveloperProjectHeader 
        projects={mockProjects} 
        selectedProjectId="1" 
        syncSuccessMsg="Sync OK" 
      />
    );
    expect(screen.getByText('Alpha Project')).toBeDefined();
    expect(screen.getByText('ALP')).toBeDefined();
    expect(screen.getByText('Sincronizado')).toBeDefined();
  });

  it('opens dropdown, searches, and selects project', () => {
    const setSelectedProjectId = vi.fn();
    render(
      <DeveloperProjectHeader 
        projects={mockProjects} 
        selectedProjectId="1" 
        setSelectedProjectId={setSelectedProjectId} 
      />
    );

    // Click to open dropdown
    const toggleBtn = screen.getByRole('button');
    fireEvent.click(toggleBtn);

    // Search filter
    const searchInput = screen.getByPlaceholderText('Buscar proyecto por nombre o key...');
    fireEvent.change(searchInput, { target: { value: 'Beta' } });
    expect(screen.getByText('Beta System')).toBeDefined();
    expect(screen.queryByText('ALP · Activo')).toBeNull();

    // Select Beta project
    const projectBtn = screen.getByText('Beta System');
    fireEvent.click(projectBtn);
    expect(setSelectedProjectId).toHaveBeenCalledWith('2');
  });

  it('shows empty state when search finds nothing and closes on click outside', () => {
    render(
      <DeveloperProjectHeader 
        projects={mockProjects} 
        selectedProjectId="1" 
      />
    );

    const toggleBtn = screen.getByRole('button');
    fireEvent.click(toggleBtn);

    const searchInput = screen.getByPlaceholderText('Buscar proyecto por nombre o key...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });
    expect(screen.getByText('No se encontraron proyectos')).toBeDefined();

    // Click outside to close
    fireEvent.mouseDown(document.body);
    expect(screen.queryByPlaceholderText('Buscar proyecto por nombre o key...')).toBeNull();
  });
});
