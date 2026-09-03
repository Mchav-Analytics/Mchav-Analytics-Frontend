import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectPickerDropdown from '../ProjectPickerDropdown';

describe('ProjectPickerDropdown', () => {
  const mockSetSelectedProjectId = vi.fn();
  const mockProjects = [
    { id_proyecto: 'PROJ-1', nombre: 'Project Alpha' },
    { id_proyecto: 'PROJ-2', nombre: 'Project Beta' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders disabled state with Lock icon when disabled prop is true', () => {
    render(
      <ProjectPickerDropdown 
        projects={mockProjects} 
        selectedProjectId="PROJ-1" 
        setSelectedProjectId={mockSetSelectedProjectId} 
        disabled={true} 
      />
    );
    expect(screen.getByTitle('Sin proyectos asignados por el Administrador')).toBeDisabled();
    expect(screen.getByText('Sin Proyectos')).toBeInTheDocument();
  });

  it('renders selected project name when not disabled', () => {
    render(
      <ProjectPickerDropdown 
        projects={mockProjects} 
        selectedProjectId="PROJ-2" 
        setSelectedProjectId={mockSetSelectedProjectId} 
      />
    );
    expect(screen.getAllByText('Project Beta')[0]).toBeInTheDocument();
  });

  it('renders default text when no project is selected', () => {
    render(
      <ProjectPickerDropdown 
        projects={mockProjects} 
        selectedProjectId="PROJ-UNKNOWN" 
        setSelectedProjectId={mockSetSelectedProjectId} 
      />
    );
    expect(screen.getByText('Seleccionar Proyecto')).toBeInTheDocument();
  });

  it('opens dropdown on click and displays project list', () => {
    render(
      <ProjectPickerDropdown 
        projects={mockProjects} 
        selectedProjectId="PROJ-1" 
        setSelectedProjectId={mockSetSelectedProjectId} 
      />
    );
    const button = screen.getByTitle('Seleccionar Proyecto Activo');
    fireEvent.click(button);
    
    expect(screen.getByText('Proyectos Disponibles')).toBeInTheDocument();
    expect(screen.getAllByText('Project Alpha')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Project Beta')[0]).toBeInTheDocument();
  });

  it('displays empty message when projects list is empty', () => {
    render(
      <ProjectPickerDropdown 
        projects={[]} 
        selectedProjectId="PROJ-1" 
        setSelectedProjectId={mockSetSelectedProjectId} 
      />
    );
    fireEvent.click(screen.getByTitle('Seleccionar Proyecto Activo'));
    expect(screen.getByText('No hay proyectos registrados')).toBeInTheDocument();
  });

  it('calls setSelectedProjectId and closes dropdown when a project is selected', () => {
    render(
      <ProjectPickerDropdown 
        projects={mockProjects} 
        selectedProjectId="PROJ-1" 
        setSelectedProjectId={mockSetSelectedProjectId} 
      />
    );
    fireEvent.click(screen.getByTitle('Seleccionar Proyecto Activo'));
    
    // Select Project Beta
    fireEvent.click(screen.getAllByText('Project Beta')[0]);
    
    expect(mockSetSelectedProjectId).toHaveBeenCalledWith('PROJ-2');
    // Dropdown should be closed
    expect(screen.queryByText('Proyectos Disponibles')).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <ProjectPickerDropdown 
          projects={mockProjects} 
          selectedProjectId="PROJ-1" 
          setSelectedProjectId={mockSetSelectedProjectId} 
        />
      </div>
    );
    
    // Open
    fireEvent.click(screen.getByTitle('Seleccionar Proyecto Activo'));
    expect(screen.getByText('Proyectos Disponibles')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));
    
    // Dropdown should be closed
    expect(screen.queryByText('Proyectos Disponibles')).not.toBeInTheDocument();
  });
});
