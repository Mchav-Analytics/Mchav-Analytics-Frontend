import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActivityHistoryView from '../ActivityHistoryView';
import { projectService } from '../../../../services/api';

vi.mock('../../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'dev@test.com', rol: 'DEVELOPER', nombre: 'Test Dev' },
    token: 'mock-token' 
  }))
}));

vi.mock('../../../../services/api', () => ({
  projectService: {
    getKpiIssuesDetail: vi.fn(() => Promise.resolve({
      issues: [
        {
          key_issue: 'ISSUE-1',
          summary: 'Tarea completada',
          status_actual: 'Done',
          resolved_at: '2026-03-01T12:00:00Z',
          story_points: 3,
          assignee_name: 'Test Dev'
        }
      ]
    }))
  }
}));

describe('ActivityHistoryView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly without crashing and shows empty state when no project selected', () => {
    render(<ActivityHistoryView selectedProjectId={null} projects={[]} />);
    expect(screen.getByText('Selecciona un Proyecto')).toBeInTheDocument();
  });

  it('renders history when project is selected and allows switching to ACHIEVEMENTS tab', async () => {
    render(<ActivityHistoryView selectedProjectId="PROJ-01" projects={[{ id_proyecto: 'PROJ-01', nombre: 'Proj 1' }]} />);
    
    expect(screen.getByRole('heading', { name: /Historial/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(projectService.getKpiIssuesDetail).toHaveBeenCalled();
    });

    // Switch to Logros y Medallas tab
    const achievementsBtn = screen.getByRole('button', { name: /Logros y Medallas/i });
    fireEvent.click(achievementsBtn);
    expect(achievementsBtn).toBeInTheDocument();

    // Switch back to Timeline tab
    const timelineBtn = screen.getByRole('button', { name: /Timeline de Actividades/i });
    fireEvent.click(timelineBtn);
    expect(timelineBtn).toBeInTheDocument();
  });
});
