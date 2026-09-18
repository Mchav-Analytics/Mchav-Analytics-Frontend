import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SprintHealthNav from '../SprintHealthNav';

describe('SprintHealthNav Component', () => {
  const mockSprints = [
    { id_sprint: 'S1', nombre_sprint: 'Sprint 1' },
    { id_sprint: 'S2', nombre: 'Sprint 2 (Alt Name)' },
    { id_sprint: 'S3' } // Without name
  ];

  const defaultProps = {
    sprints: mockSprints,
    selectedSprintId: 'S1',
    setSelectedSprintId: vi.fn(),
    onNavigateToMatrix: vi.fn(),
    onNavigateToScorecards: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation title correctly', () => {
    render(<SprintHealthNav {...defaultProps} />);
    
    expect(screen.getByText('Salud del Sprint & Flow')).toBeInTheDocument();
  });

  it('renders sprints dropdown correctly and handles changes', () => {
    render(<SprintHealthNav {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('S1');
    
    // Check options
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('Sprint 2 (Alt Name)')).toBeInTheDocument();
    expect(screen.getByText('S3')).toBeInTheDocument();
    
    // Change selection
    fireEvent.change(select, { target: { value: 'S2' } });
    expect(defaultProps.setSelectedSprintId).toHaveBeenCalledWith('S2');
  });

  it('displays fallback when there are no sprints', () => {
    render(<SprintHealthNav {...defaultProps} sprints={[]} />);
    
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('Kanban / Sin Sprints Scrum')).toBeInTheDocument();
  });
});
