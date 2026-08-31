import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DevAlertsView from '../DevAlertsView';
import { useDevAlerts } from '../../hooks/useDevAlerts';

// Mocks
vi.mock('../../hooks/useDevAlerts', () => ({
  useDevAlerts: vi.fn()
}));

vi.mock('../../components/DevAlertsHeader', () => ({
  default: ({ projectName }) => <div data-testid="mock-dev-alerts-header">{projectName}</div>
}));

vi.mock('../../components/DevAlertCard', () => ({
  default: ({ alert }) => <div data-testid="mock-dev-alert-card">{alert.title}</div>
}));

vi.mock('../../components/DevAlertsEmpty', () => ({
  default: () => <div data-testid="mock-dev-alerts-empty">Empty</div>
}));

describe('DevAlertsView Component', () => {
  const defaultMockHook = {
    projectName: 'Test Project',
    actionMsg: '',
    executingAction: null,
    alerts: [
      { id: 1, title: 'Alert 1' },
      { id: 2, title: 'Alert 2' }
    ],
    handleAlertAction: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useDevAlerts.mockReturnValue(defaultMockHook);
  });

  it('renders empty state when no project selected', () => {
    render(
      <DevAlertsView 
        projects={[]}
        selectedProjectId={null}
        setSelectedProjectId={vi.fn()}
      />
    );
    
    expect(screen.getByTestId('mock-dev-alerts-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-dev-alerts-header')).not.toBeInTheDocument();
  });

  it('renders alerts and header when project is selected', () => {
    render(
      <DevAlertsView 
        projects={[{ id_proyecto: '1', nombre: 'Test Project' }]}
        selectedProjectId="1"
        setSelectedProjectId={vi.fn()}
      />
    );
    
    expect(screen.getByTestId('mock-dev-alerts-header')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    
    const cards = screen.getAllByTestId('mock-dev-alert-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Alert 1')).toBeInTheDocument();
    expect(screen.getByText('Alert 2')).toBeInTheDocument();
  });

  it('renders action message when provided', () => {
    useDevAlerts.mockReturnValue({
      ...defaultMockHook,
      actionMsg: 'Action completed successfully'
    });

    render(
      <DevAlertsView 
        projects={[{ id_proyecto: '1', nombre: 'Test Project' }]}
        selectedProjectId="1"
        setSelectedProjectId={vi.fn()}
      />
    );
    
    expect(screen.getByText('Action completed successfully')).toBeInTheDocument();
  });
});
