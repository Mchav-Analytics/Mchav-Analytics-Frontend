import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DailyFocusView from '../DailyFocusView';
import { useDailyFocus } from '../../hooks/useDailyFocus';

// Mocks
vi.mock('../../hooks/useDailyFocus', () => ({
  useDailyFocus: vi.fn()
}));

vi.mock('../../components/DailyFocusHeader', () => ({
  default: () => <div data-testid="mock-daily-focus-header">DailyFocusHeader</div>
}));

vi.mock('../../components/DailyFocusTasks', () => ({
  default: () => <div data-testid="mock-daily-focus-tasks">DailyFocusTasks</div>
}));

vi.mock('../../components/DailyFocusSidebar', () => ({
  default: () => <div data-testid="mock-daily-focus-sidebar">DailyFocusSidebar</div>
}));

describe('DailyFocusView Component', () => {
  const defaultMockHook = {
    selectedDate: new Date(),
    setSelectedDate: vi.fn(),
    highlightedTaskKey: null,
    todayTasks: [],
    overdueTasks: [],
    completedToday: 0,
    totalToday: 0,
    progressPct: 0,
    filteredNotes: [],
    currentPage: 1,
    setCurrentPage: vi.fn(),
    totalPages: 1,
    paginatedTasks: [],
    handleToggleDone: vi.fn(),
    handleAddNote: vi.fn(),
    handleDeleteNote: vi.fn(),
    newNoteText: '',
    setNewNoteText: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useDailyFocus.mockReturnValue(defaultMockHook);
  });

  it('renders correctly with given props', () => {
    const projects = [
      { id_proyecto: '1', nombre: 'Test Project' }
    ];

    render(
      <DailyFocusView 
        projects={projects}
        selectedProjectId="1"
        setSelectedProjectId={vi.fn()}
      />
    );
    
    expect(useDailyFocus).toHaveBeenCalledWith('1', 'Test Project');
    expect(screen.getByTestId('mock-daily-focus-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-daily-focus-tasks')).toBeInTheDocument();
    expect(screen.getByTestId('mock-daily-focus-sidebar')).toBeInTheDocument();
  });

  it('handles missing project correctly', () => {
    render(
      <DailyFocusView 
        projects={[]}
        selectedProjectId="99"
        setSelectedProjectId={vi.fn()}
      />
    );
    
    expect(useDailyFocus).toHaveBeenCalledWith('99', 'Proyecto 99');
    expect(screen.getByTestId('mock-daily-focus-header')).toBeInTheDocument();
  });
});
