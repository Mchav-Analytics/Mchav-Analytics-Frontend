import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProyectosDashboardView from '../ProyectosDashboardView';
import { useProyectosDashboard } from '../../hooks/useProyectosDashboard';
import { useAuth } from '../../../auth/context/AuthContext';

// Mock Auth
vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' }
  }))
}));

// Mock hook
vi.mock('../../hooks/useProyectosDashboard', () => ({
  useProyectosDashboard: vi.fn()
}));

// Mock child components
vi.mock('../../components/ProjectsHeader', () => ({
  ProjectsHeader: () => <div data-testid="projects-header-mock">ProjectsHeader</div>
}));

vi.mock('../../components/ProjectsTable', () => ({
  ProjectsTable: ({ onNavigateToHealth }) => (
    <div data-testid="projects-table-mock">
      ProjectsTable
      <button data-testid="nav-health-btn" onClick={() => onNavigateToHealth && onNavigateToHealth('P1')}>Nav Health</button>
    </div>
  )
}));

vi.mock('../../components/ProjectsCFD', () => ({
  ProjectsCFD: ({ setShowCfdDocModal }) => (
    <div data-testid="projects-cfd-mock">
      ProjectsCFD
      <button data-testid="open-cfd-modal" onClick={() => setShowCfdDocModal(true)}>Open CFD</button>
    </div>
  )
}));

vi.mock('../../components/ProjectsBurnup', () => ({
  ProjectsBurnup: ({ setShowBurndownDocModal }) => (
    <div data-testid="projects-burnup-mock">
      ProjectsBurnup
      <button data-testid="open-burnup-modal" onClick={() => setShowBurndownDocModal(true)}>Open Burnup</button>
    </div>
  )
}));

vi.mock('../../components/ProjectsTeamPerformance', () => ({
  ProjectsTeamPerformance: () => <div data-testid="projects-team-mock">ProjectsTeamPerformance</div>
}));

describe('ProyectosDashboardView', () => {
  const setSelectedProjectIdMock = vi.fn();
  const defaultHookValues = {
    searchTerm: '',
    setSearchTerm: vi.fn(),
    selectedProjectId: null,
    setSelectedProjectId: setSelectedProjectIdMock,
    expandedTeamProjectId: null,
    setExpandedTeamProjectId: vi.fn(),
    allProjectsList: [],
    selectedProjectObj: null,
    displayProjects: [],
    activeVelocityData: [],
    activePercentilesData: [],
    activeCfdData: [],
    activeBurnupData: [],
    showCfdDocModal: false,
    setShowCfdDocModal: vi.fn(),
    showBurndownDocModal: false,
    setShowBurndownDocModal: vi.fn(),
    assignedTeam: [],
    toastMsg: ''
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useProyectosDashboard.mockReturnValue(defaultHookValues);
  });

  it('renders correctly with child components and handles onNavigateToHealth', () => {
    const setActiveTab = vi.fn();
    render(<ProyectosDashboardView setActiveTab={setActiveTab} />);
    
    expect(screen.getByTestId('projects-header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('projects-table-mock')).toBeInTheDocument();
    expect(screen.getByTestId('projects-cfd-mock')).toBeInTheDocument();
    expect(screen.getByTestId('projects-burnup-mock')).toBeInTheDocument();
    expect(screen.getByTestId('projects-team-mock')).toBeInTheDocument();

    const navBtn = screen.getByTestId('nav-health-btn');
    fireEvent.click(navBtn);
    expect(setSelectedProjectIdMock).toHaveBeenCalledWith('P1');
    expect(setActiveTab).toHaveBeenCalledWith('sprint_health');
  });

  it('displays toast message when toastMsg is provided', () => {
    useProyectosDashboard.mockReturnValue({
      ...defaultHookValues,
      toastMsg: 'Test Toast Message'
    });

    render(<ProyectosDashboardView />);
    expect(screen.getByText('Test Toast Message')).toBeInTheDocument();
  });

  it('renders and closes Burnup Documentation modal via both buttons', () => {
    const setShowBurndownDocModalMock = vi.fn();
    useProyectosDashboard.mockReturnValue({
      ...defaultHookValues,
      showBurndownDocModal: true,
      setShowBurndownDocModal: setShowBurndownDocModalMock
    });

    const { rerender } = render(<ProyectosDashboardView />);
    
    expect(screen.getByText('Justificación Técnica: Burnup')).toBeInTheDocument();
    expect(screen.getByText('1. Alcance Total vs. Trabajo Completado')).toBeInTheDocument();

    // Click close icon
    const closeBtns = screen.getAllByRole('button');
    const xBtn = closeBtns.find(b => b.querySelector('svg'));
    if (xBtn) fireEvent.click(xBtn);
    expect(setShowBurndownDocModalMock).toHaveBeenCalledWith(false);

    // Click bottom 'Cerrar panel'
    const closeBtnPanel = screen.getByText('Cerrar panel');
    fireEvent.click(closeBtnPanel);
    expect(setShowBurndownDocModalMock).toHaveBeenCalledWith(false);
  });

  it('renders and closes CFD Documentation modal via both buttons', () => {
    const setShowCfdDocModalMock = vi.fn();
    useProyectosDashboard.mockReturnValue({
      ...defaultHookValues,
      showCfdDocModal: true,
      setShowCfdDocModal: setShowCfdDocModalMock
    });

    render(<ProyectosDashboardView />);
    
    expect(screen.getByText('Justificación Técnica: CFD')).toBeInTheDocument();
    expect(screen.getByText('1. Áreas Apiladas por Estado')).toBeInTheDocument();

    const closeBtns = screen.getAllByRole('button');
    const xBtn = closeBtns.find(b => b.querySelector('svg'));
    if (xBtn) fireEvent.click(xBtn);
    expect(setShowCfdDocModalMock).toHaveBeenCalledWith(false);

    const closeBtnPanel = screen.getByText('Cerrar panel');
    fireEvent.click(closeBtnPanel);
    expect(setShowCfdDocModalMock).toHaveBeenCalledWith(false);
  });
});
