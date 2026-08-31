import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CapacityCalculatorView from '../CapacityCalculatorView';
import { useCapacityCalculator } from '../../hooks/useCapacityCalculator';

// Mocks
vi.mock('../../hooks/useCapacityCalculator', () => ({
  useCapacityCalculator: vi.fn()
}));

vi.mock('../../components/LiderNotificationBell', () => ({
  default: () => <div data-testid="mock-notification-bell">Bell</div>
}));

vi.mock('../../components/CapacityForm', () => ({
  default: () => <div data-testid="mock-capacity-form">CapacityForm</div>
}));

vi.mock('../../components/CapacityResults', () => ({
  default: () => <div data-testid="mock-capacity-results">CapacityResults</div>
}));

vi.mock('../../components/CapacityJiraTasks', () => ({
  default: () => <div data-testid="mock-capacity-jira-tasks">CapacityJiraTasks</div>
}));

describe('CapacityCalculatorView Component', () => {
  const defaultMockHook = {
    isCollapsed: false,
    setIsCollapsed: vi.fn(),
    results: {
      adjustedCapacitySP: 45,
      netDays: 15,
      theoreticalDays: 20,
      impactBadgeStyle: 'bg-green-100',
      impactBadgeText: 'OK'
    },
    devCount: 4,
    setDevCount: vi.fn(),
    sprintDays: 10,
    setSprintDays: vi.fn(),
    vacationDays: 2,
    setVacationDays: vi.fn(),
    sickDevsCount: 1,
    setSickDevsCount: vi.fn(),
    sickDays: 1,
    setSickDays: vi.fn(),
    avgDevVelocity: 3,
    setAvgDevVelocity: vi.fn(),
    absenceEvents: [],
    taskStatusTab: 'TODO',
    setTaskStatusTab: vi.fn(),
    taskSearchTerm: '',
    setTaskSearchTerm: vi.fn(),
    selectedTaskProject: 'ALL',
    setSelectedTaskProject: vi.fn(),
    handleAddAbsenceEvent: vi.fn(),
    handleRemoveEvent: vi.fn(),
    handleResetScenarios: vi.fn(),
    filteredTasks: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCapacityCalculator.mockReturnValue(defaultMockHook);
  });

  it('renders expanded view correctly', () => {
    render(<CapacityCalculatorView isDarkMode={false} />);
    
    expect(screen.getByText('Calculadora y Simulador de Capacidad')).toBeInTheDocument();
    expect(screen.getByTestId('mock-notification-bell')).toBeInTheDocument();
    expect(screen.getByTestId('mock-capacity-form')).toBeInTheDocument();
    expect(screen.getByTestId('mock-capacity-results')).toBeInTheDocument();
    expect(screen.getByTestId('mock-capacity-jira-tasks')).toBeInTheDocument();
  });

  it('toggles collapse state', () => {
    render(<CapacityCalculatorView isDarkMode={false} />);
    
    const toggleBtn = screen.getByTitle('Contraer el simulador de capacidad');
    fireEvent.click(toggleBtn);
    
    expect(defaultMockHook.setIsCollapsed).toHaveBeenCalledWith(true);
  });

  it('renders collapsed view correctly', () => {
    useCapacityCalculator.mockReturnValue({
      ...defaultMockHook,
      isCollapsed: true
    });
    
    render(<CapacityCalculatorView isDarkMode={false} />);
    
    // Components should not be present
    expect(screen.queryByTestId('mock-capacity-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-capacity-results')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-capacity-jira-tasks')).not.toBeInTheDocument();
    
    // Summary should be present
    expect(screen.getAllByText(/45 SP/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Disponibilidad Neta: 15/i)).toBeInTheDocument();
    
    const expandBtn = screen.getByText('Expandir y Editar');
    fireEvent.click(expandBtn);
    expect(defaultMockHook.setIsCollapsed).toHaveBeenCalledWith(false);
  });
});
