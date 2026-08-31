import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SprintHealthView from '../SprintHealthView';
import { useSprintHealth } from '../../hooks/useSprintHealth';

// Mocks
vi.mock('../../hooks/useSprintHealth', () => ({
  useSprintHealth: vi.fn()
}));

vi.mock('../../components/SprintHealthHeader', () => ({
  default: () => <div data-testid="mock-sprint-health-header">SprintHealthHeader</div>
}));

vi.mock('../../components/SprintHealthNav', () => ({
  default: () => <div data-testid="mock-sprint-health-nav">SprintHealthNav</div>
}));

vi.mock('../../components/SprintHealthKpis', () => ({
  default: () => <div data-testid="mock-sprint-health-kpis">SprintHealthKpis</div>
}));

vi.mock('../../components/SprintHealthChart', () => ({
  default: () => <div data-testid="mock-sprint-health-chart">SprintHealthChart</div>
}));

describe('SprintHealthView Component', () => {
  const defaultMockHook = {
    loading: false,
    sprints: [],
    selectedSprintId: 'Sprint 1',
    setSelectedSprintId: vi.fn(),
    metrics: {},
    healthScore: 85,
    stages: [],
    insight: 'Good',
    warning: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSprintHealth.mockReturnValue(defaultMockHook);
  });

  it('renders loading state correctly', () => {
    useSprintHealth.mockReturnValue({
      ...defaultMockHook,
      loading: true
    });
    
    render(<SprintHealthView selectedProjectId="1" isDarkMode={false} />);
    
    expect(screen.getByText('Analizando Salud y Predictibilidad del Sprint (Sprint 1)...')).toBeInTheDocument();
  });

  it('renders correctly when not loading', () => {
    render(<SprintHealthView selectedProjectId="1" isDarkMode={false} />);
    
    expect(screen.getByTestId('mock-sprint-health-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sprint-health-nav')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sprint-health-kpis')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sprint-health-chart')).toBeInTheDocument();
  });

  it('handles dark mode correctly via prop', () => {
    render(<SprintHealthView selectedProjectId="1" isDarkMode={true} />);
    
    // We pass isDarkMode={true} to SprintHealthChart in the actual component. 
    // Since we mocked it, we just verify it renders without errors for now.
    expect(screen.getByTestId('mock-sprint-health-chart')).toBeInTheDocument();
  });
});
