import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DevKPIGrid from '../DevKPIGrid';

describe('DevKPIGrid Component', () => {
  const mockIssues = [
    { key: 'PA-101', summary: 'Tarea 1', status: 'Done', assignee: 'Stephany Leon', story_points: 5, cycle_time: 2.0 },
    { key: 'PA-102', summary: 'Tarea 2', status: 'In Progress', assignee: 'Stephany Leon', story_points: 3, cycle_time: 1.5 },
    { key: 'PA-103', summary: 'Tarea 3', status: 'Done', assignee: 'Carlos Perez', story_points: 8, cycle_time: 3.0 }
  ];

  const mockUserProfile = {
    nombre: 'Stephany Leon',
    rol: 'Desarrollador'
  };

  it('renders developer role banner with user name and read-only badge', () => {
    render(<DevKPIGrid issues={mockIssues} userProfile={mockUserProfile} />);
    
    expect(screen.getByText(/Vista de Desarrollador/i)).toBeDefined();
    expect(screen.getByText(/Stephany Leon/i)).toBeDefined();
    expect(screen.getByText(/Modo Solo Lectura/i)).toBeDefined();
  });

  it('renders developer specific KPI cards', () => {
    render(<DevKPIGrid issues={mockIssues} userProfile={mockUserProfile} />);
    
    expect(screen.getByText('Mis Tareas Asignadas')).toBeDefined();
    expect(screen.getByText('Mis Tareas Cerradas')).toBeDefined();
    expect(screen.getByText('Mi Cycle Time Promedio')).toBeDefined();
    expect(screen.getByText('Mi Carga Activa')).toBeDefined();
  });
});
