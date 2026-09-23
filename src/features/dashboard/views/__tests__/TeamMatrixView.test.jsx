import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TeamMatrixView from '../TeamMatrixView';
import { developerService } from '../../../../services/api';
import * as matrixHooks from '../../hooks/useTeamMatrix';

vi.mock('../../../../services/api', () => ({
  default: { get: vi.fn(() => Promise.resolve({ data: [] })) },
  projectService: { getProjects: vi.fn(() => Promise.resolve([])) },
  developerService: {
    getTeamMatrix: vi.fn(() => Promise.resolve({ team_summary: {}, developers: [] }))
  }
}));

// Mock subcomponents
vi.mock('../../components/LiderNotificationBell', () => ({
  default: () => <div data-testid="bell-mock">LiderNotificationBell</div>
}));

vi.mock('../../components/FourQuadrantChart', () => ({
  default: ({ onSelectDev }) => (
    <div data-testid="chart-mock">
      FourQuadrantChart
      <button onClick={() => onSelectDev({ assignee_id: 'dev-1', display_name: 'Dev One' })}>
        Select Dev Chart
      </button>
    </div>
  )
}));

vi.mock('../../components/TeamMatrixHeader', () => ({
  default: ({ onOpenSettings, onOpenGuide, onSelectProject }) => (
    <div data-testid="header-mock">
      <button onClick={onOpenSettings}>Open Settings</button>
      <button onClick={onOpenGuide}>Open Guide</button>
      <button onClick={() => onSelectProject('PROJ-NEW')}>Change Project</button>
    </div>
  )
}));

vi.mock('../../components/TeamMatrixNav', () => ({
  default: () => <div data-testid="nav-mock">Nav</div>
}));

vi.mock('../../components/TeamMatrixKpis', () => ({
  default: () => <div data-testid="kpis-mock">KPIs</div>
}));

vi.mock('../../components/TeamMatrixLeaderboard', () => ({
  default: ({ onOpenAiAnalysis }) => (
    <div data-testid="leaderboard-mock">
      <button onClick={() => onOpenAiAnalysis({ name: 'Dev One' })}>Open AI</button>
    </div>
  )
}));

vi.mock('../../components/MatrixSettingsModal', () => ({
  default: ({ isOpen, onClose, onSaveConfig, onApplyPreview }) => isOpen ? (
    <div data-testid="settings-modal">
      Settings Open
      <button onClick={onClose}>Close Settings</button>
      <button onClick={() => onSaveConfig({})}>Save Config</button>
      <button onClick={() => onApplyPreview({})}>Apply Preview</button>
    </div>
  ) : null
}));

vi.mock('../../components/MatrixMethodologyGuide', () => ({
  default: ({ isOpen, onClose }) => isOpen ? (
    <div data-testid="guide-modal">
      Guide Open
      <button onClick={onClose}>Close Guide</button>
    </div>
  ) : null
}));

vi.mock('../../components/NubiDevAnalysisModal', () => ({
  default: ({ isOpen, onClose }) => isOpen ? (
    <div data-testid="nubi-modal">
      Nubi Modal Open
      <button onClick={onClose}>Close Nubi</button>
    </div>
  ) : null
}));

describe('TeamMatrixView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when loading is true', async () => {
    vi.spyOn(matrixHooks, 'useTeamMatrix').mockReturnValue({
      loading: true
    });

    render(<TeamMatrixView selectedProjectId="PROJ-01" />);
    expect(screen.getByText(/Calculando métricas de la Matriz de Flujo/i)).toBeInTheDocument();
  });

  it('renders full matrix view, handles modals, settings and callbacks', async () => {
    const mockSave = vi.fn();
    const mockApply = vi.fn();
    const handleScorecard = vi.fn();
    const handleSelectProj = vi.fn();

    vi.spyOn(matrixHooks, 'useTeamMatrix').mockReturnValue({
      loading: false,
      selectedDevDetail: null,
      setSelectedDevDetail: vi.fn(),
      teamSummary: { avg_cycle_time: 4 },
      developers: [{ assignee_id: 'dev-1', display_name: 'Dev One' }],
      topPerformer: null,
      conteo: { total: 1 },
      activeThreshold: 75,
      activeWeights: {},
      activeModelName: 'Default',
      saveConfig: mockSave,
      applyPreview: mockApply
    });

    render(
      <TeamMatrixView 
        selectedProjectId="PROJ-01"
        onSelectProject={handleSelectProj}
        onSelectDevForScorecard={handleScorecard}
      />
    );

    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('chart-mock')).toBeInTheDocument();
    expect(screen.getByTestId('leaderboard-mock')).toBeInTheDocument();

    // Select dev from chart
    fireEvent.click(screen.getByText('Select Dev Chart'));
    expect(handleScorecard).toHaveBeenCalledWith('dev-1');

    // Change project
    fireEvent.click(screen.getByText('Change Project'));
    expect(handleSelectProj).toHaveBeenCalledWith('PROJ-NEW');

    // Open & close settings modal
    fireEvent.click(screen.getByText('Open Settings'));
    expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Save Config'));
    expect(mockSave).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Apply Preview'));
    expect(mockApply).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Close Settings'));
    expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();

    // Open & close guide modal
    fireEvent.click(screen.getByText('Open Guide'));
    expect(screen.getByTestId('guide-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close Guide'));
    expect(screen.queryByTestId('guide-modal')).not.toBeInTheDocument();

    // Open & close Nubi AI modal
    fireEvent.click(screen.getByText('Open AI'));
    expect(screen.getByTestId('nubi-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close Nubi'));
    expect(screen.queryByTestId('nubi-modal')).not.toBeInTheDocument();
  });
});
