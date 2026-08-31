import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectCard } from '../ProjectCard';

describe('ProjectCard', () => {
  const mockProject = {
    id: 'proj-1',
    key: 'PROJ-1',
    name: 'Test Project',
    status: 'ACTIVE',
    leader: { name: 'Leader One', avatar: 'L' },
    developers: [{ id: 'dev-1', name: 'Dev One', avatar: 'D' }]
  };

  const defaultProps = {
    proj: mockProject,
    idx: 0,
    isExpanded: false,
    isAdmin: true,
    toggleExpand: vi.fn(),
    handleToggleDeliveredProject: vi.fn(),
    handleReactivateProject: vi.fn(),
    handleOpenDeactivateModal: vi.fn()
  };

  it('renders correctly', () => {
    render(<ProjectCard {...defaultProps} />);
    expect(screen.getByText('Test Project')).toBeDefined();
    expect(screen.getByText('PROJ-1')).toBeDefined();
    expect(screen.getByText('Activo')).toBeDefined();
    expect(screen.getByTitle('Líder: Leader One')).toBeDefined();
    expect(screen.getByTitle('Dev: Dev One')).toBeDefined();
  });

  it('handles toggle expand click on the card', () => {
    render(<ProjectCard {...defaultProps} />);
    
    // click on the card wrapper
    const card = screen.getByText('Test Project').closest('div.group');
    fireEvent.click(card);
    expect(defaultProps.toggleExpand).toHaveBeenCalledWith('proj-1');
  });

  it('handles toggle delivered project button', () => {
    render(<ProjectCard {...defaultProps} />);
    
    const deliveredBtn = screen.getByTitle('Marcar proyecto como Entregado / Finalizado');
    fireEvent.click(deliveredBtn);
    expect(defaultProps.handleToggleDeliveredProject).toHaveBeenCalledWith(mockProject);
  });

  it('handles deactivate project button for admin', () => {
    render(<ProjectCard {...defaultProps} />);
    
    const deactivateBtn = screen.getByTitle('Desactivar proyecto (Solo Admin)');
    fireEvent.click(deactivateBtn);
    expect(defaultProps.handleOpenDeactivateModal).toHaveBeenCalledWith(mockProject);
  });

  it('handles reactivate project button when inactive', () => {
    const inactiveProject = { ...mockProject, status: 'INACTIVE' };
    render(<ProjectCard {...defaultProps} proj={inactiveProject} />);
    
    expect(screen.getByText('Desactivado')).toBeDefined();
    
    const reactivateBtn = screen.getByTitle('Reactivar proyecto');
    fireEvent.click(reactivateBtn);
    expect(defaultProps.handleReactivateProject).toHaveBeenCalledWith(inactiveProject);
  });

  it('renders completed status correctly', () => {
    const completedProject = { ...mockProject, status: 'COMPLETED' };
    render(<ProjectCard {...defaultProps} proj={completedProject} />);
    
    expect(screen.getByText('Entregado')).toBeDefined();
    
    const reopenBtn = screen.getByTitle('Reabrir proyecto a Activo');
    fireEvent.click(reopenBtn);
    expect(defaultProps.handleToggleDeliveredProject).toHaveBeenCalledWith(completedProject);
  });
});
