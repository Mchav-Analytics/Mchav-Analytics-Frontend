import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import DevWorkloadView from '../DevWorkloadView';
import { developerService } from '../../../../services/api';

vi.mock('../../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'dev@test.com', rol: 'DEVELOPER', nombre: 'Test Dev' },
    token: 'mock-token' 
  }))
}));

vi.mock('../../../../services/api', () => ({
  developerService: {
    getMyScorecard: vi.fn(() => Promise.resolve({ assigned_issues: [] }))
  },
  jiraService: {
    triggerSync: vi.fn(() => Promise.resolve())
  }
}));

describe('DevWorkloadView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly without crashing', async () => {
    render(<DevWorkloadView selectedProjectId="PROJ-01" projects={[]} />);
    
    // Smoke test to ensure it renders main title
    expect(screen.getByText('Plan de Trabajo')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(developerService.getMyScorecard).toHaveBeenCalled();
    });
  });
});
