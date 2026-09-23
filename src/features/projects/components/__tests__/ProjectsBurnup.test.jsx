import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectsBurnup } from '../ProjectsBurnup';

describe('ProjectsBurnup component', () => {
  it('renders burnup header and toggles detail panel', () => {
    const handleModal = vi.fn();
    const mockData = [
      { day: 'Día 1', scope: 50, completed: 5 },
      { day: 'Día 2', scope: 50, completed: 12 }
    ];

    render(
      <ProjectsBurnup 
        activeBurnupData={mockData}
        setShowBurndownDocModal={handleModal}
        selectedProjectObj={{ name: 'Portal Pagos', key: 'PAG' }}
      />
    );

    expect(screen.getByText('Sprint Burnup Chart')).toBeInTheDocument();
    expect(screen.getByText('Portal Pagos (PAG)')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Ver detalle/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Ocultar detalle')).toBeInTheDocument();
    expect(handleModal).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole('button', { name: /Ocultar detalle/i }));
    expect(screen.getByText('Ver detalle')).toBeInTheDocument();
  });
});
