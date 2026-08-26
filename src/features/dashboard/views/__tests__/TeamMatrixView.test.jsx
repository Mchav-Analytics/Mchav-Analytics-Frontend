import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import TeamMatrixView from '../TeamMatrixView';
import { developerService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  developerService: {
    getTeamMatrix: vi.fn(() => Promise.resolve({ team_summary: {}, developers: [] }))
  }
}));

// Mock LiderNotificationBell
vi.mock('../../components/LiderNotificationBell', () => ({
  default: () => <div data-testid="bell-mock">LiderNotificationBell</div>
}));

// Mock FourQuadrantChart
vi.mock('../../components/FourQuadrantChart', () => ({
  default: () => <div data-testid="chart-mock">FourQuadrantChart</div>
}));

describe('TeamMatrixView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly without crashing', async () => {
    render(<TeamMatrixView selectedProjectId="PROJ-01" />);
    
    // Check loading state first
    expect(screen.getByText('Generando Matriz Comparativa de Equipo...')).toBeInTheDocument();

    await waitFor(() => {
      expect(developerService.getTeamMatrix).toHaveBeenCalledWith('PROJ-01');
    });
  });
});
