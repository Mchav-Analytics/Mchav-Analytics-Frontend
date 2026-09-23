import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectsCFD } from '../ProjectsCFD';

describe('ProjectsCFD component', () => {
  it('renders CFD header and toggles detail panel', () => {
    const handleModal = vi.fn();
    const mockData = [
      { date: '2026-03-01', Done: 10, 'In Progress': 5, 'To Do': 15 }
    ];

    render(
      <ProjectsCFD 
        activeCfdData={mockData}
        setShowCfdDocModal={handleModal}
        selectedProjectObj={{ name: 'App Móvil', key: 'MOV' }}
      />
    );

    expect(screen.getByText('Diagrama de Flujo Acumulado (CFD)')).toBeInTheDocument();
    expect(screen.getByText('App Móvil (MOV)')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Ver detalle/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Ocultar detalle')).toBeInTheDocument();
    expect(handleModal).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole('button', { name: /Ocultar detalle/i }));
    expect(screen.getByText('Ver detalle')).toBeInTheDocument();
  });
});
