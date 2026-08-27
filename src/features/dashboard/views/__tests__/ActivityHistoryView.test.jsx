import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
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
    getKpiIssuesDetail: vi.fn(() => Promise.resolve({ issues: [] }))
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

  it('renders history when project is selected', async () => {
    render(<ActivityHistoryView selectedProjectId="PROJ-01" projects={[{id_proyecto: 'PROJ-01', nombre: 'Proj 1'}]} />);
    
    expect(screen.getByText('Historial')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(projectService.getKpiIssuesDetail).toHaveBeenCalled();
    });
  });
});
