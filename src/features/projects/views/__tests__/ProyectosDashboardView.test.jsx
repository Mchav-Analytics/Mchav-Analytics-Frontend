import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
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

// Mock child components to isolate View testing
vi.mock('../../components/ProjectsHeader', () => ({
  ProjectsHeader: () => <div data-testid="projects-header-mock">ProjectsHeader</div>
}));

vi.mock('../../components/ProjectsTable', () => ({
  ProjectsTable: () => <div data-testid="projects-table-mock">ProjectsTable</div>
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
  const defaultHookValues = {
    searchTerm: '',
    setSearchTerm: vi.fn(),
    selectedProjectId: null,
    setSelectedProjectId: vi.fn(),
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

  it('renders correctly with child components', () => {
    render(<ProyectosDashboardView />);
    
    expect(screen.getByTestId('projects-header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('projects-table-mock')).toBeInTheDocument();
    expect(screen.getByTestId('projects-cfd-mock')).toBeInTheDocument();
    expect(screen.getByTestId('projects-burnup-mock')).toBeInTheDocument();
    expect(screen.getByTestId('projects-team-mock')).toBeInTheDocument();
    expect(screen.getByText(/Todos los derechos reservados/i)).toBeInTheDocument();
  });

  it('displays toast message when toastMsg is provided', () => {
    useProyectosDashboard.mockReturnValue({
      ...defaultHookValues,
      toastMsg: 'Test Toast Message'
    });

    render(<ProyectosDashboardView />);
    expect(screen.getByText('Test Toast Message')).toBeInTheDocument();
  });

  it('renders and closes Burnup Documentation modal', () => {
    const setShowBurndownDocModalMock = vi.fn();
    useProyectosDashboard.mockReturnValue({
      ...defaultHookValues,
      showBurndownDocModal: true,
      setShowBurndownDocModal: setShowBurndownDocModalMock
    });

    render(<ProyectosDashboardView />);
    
    expect(screen.getByText('Justificación Técnica: Burnup')).toBeInTheDocument();
    expect(screen.getByText('1. Alcance Total vs. Trabajo Completado')).toBeInTheDocument();

    const closeBtnPanel = screen.getByText('Cerrar panel');
    fireEvent.click(closeBtnPanel);
    expect(setShowBurndownDocModalMock).toHaveBeenCalledWith(false);
  });

  it('renders and closes CFD Documentation modal', () => {
    const setShowCfdDocModalMock = vi.fn();
    useProyectosDashboard.mockReturnValue({
      ...defaultHookValues,
      showCfdDocModal: true,
      setShowCfdDocModal: setShowCfdDocModalMock
    });

    render(<ProyectosDashboardView />);
    
    expect(screen.getByText('Justificación Técnica: CFD')).toBeInTheDocument();
    expect(screen.getByText('1. Áreas Apiladas por Estado')).toBeInTheDocument();

    const closeBtnPanel = screen.getByText('Cerrar panel');
    fireEvent.click(closeBtnPanel);
    expect(setShowCfdDocModalMock).toHaveBeenCalledWith(false);
  });
});

