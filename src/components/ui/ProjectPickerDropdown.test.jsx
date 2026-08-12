import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectPickerDropdown from './ProjectPickerDropdown';

describe('ProjectPickerDropdown', () => {
  const projects = [
    { id_proyecto: '1', nombre: 'Proyecto Alpha' },
    { id_proyecto: '2', nombre: 'Proyecto Beta' }
  ];

  it('renders disabled state correctly', () => {
    render(<ProjectPickerDropdown disabled={true} />);
    
    expect(screen.getByText('Sin Proyectos')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders selected project name', () => {
    render(<ProjectPickerDropdown projects={projects} selectedProjectId="1" setSelectedProjectId={vi.fn()} />);
    
    expect(screen.getByText('Proyecto Alpha')).toBeInTheDocument();
  });

  it('opens dropdown and selects a project', () => {
    const setSelectedProjectId = vi.fn();
    render(<ProjectPickerDropdown projects={projects} selectedProjectId="1" setSelectedProjectId={setSelectedProjectId} />);
    
    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Check if options are visible
    expect(screen.getByText('Proyectos Disponibles')).toBeInTheDocument();
    
    // Select Beta project
    const betaOption = screen.getByText('Proyecto Beta');
    fireEvent.click(betaOption);
    
    expect(setSelectedProjectId).toHaveBeenCalledWith('2');
  });

  it('shows empty state when no projects are available', () => {
    render(<ProjectPickerDropdown projects={[]} selectedProjectId={null} setSelectedProjectId={vi.fn()} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('No hay proyectos registrados')).toBeInTheDocument();
  });
});
