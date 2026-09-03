import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import KpiDetailModal from '../KpiDetailModal';
import { projectService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  projectService: {
    getKpiIssuesDetail: vi.fn()
  }
}));

describe('KpiDetailModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    projectId: 'PROJ-1',
    metricTitle: 'Velocity',
    metricType: 'VELOCITY',
    sprintId: 'S-1'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', async () => {
    projectService.getKpiIssuesDetail.mockResolvedValueOnce({ issues: [] });
    
    await act(async () => {
      render(<KpiDetailModal {...defaultProps} />);
    });
    
    expect(screen.getByText(/Desglose de Incidencias:/)).toBeInTheDocument();
    expect(screen.getByText('Velocity')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(<KpiDetailModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('fetches issues on mount and renders them', async () => {
    const mockIssues = [
      { id_jira: '1', key_issue: 'TEST-1', summary: 'Test task', status_actual: 'Done', story_points: 5, lead_time_days: 2, cycle_time_days: 1, sprint_nombre: 'Sprint 1' },
      { id_jira: '2', key_issue: 'TEST-2', summary: 'Another task', status_actual: 'In Progress', story_points: 3, lead_time_days: 4, cycle_time_days: 3, sprint_nombre: 'Sprint 1' }
    ];
    
    projectService.getKpiIssuesDetail.mockResolvedValueOnce({ issues: mockIssues });
    
    await act(async () => {
      render(<KpiDetailModal {...defaultProps} />);
    });

    expect(projectService.getKpiIssuesDetail).toHaveBeenCalledWith('PROJ-1', { metric_type: 'VELOCITY', sprint_id: 'S-1' });
    expect(screen.getByText('TEST-1')).toBeInTheDocument();
    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.getByText('TEST-2')).toBeInTheDocument();
  });

  it('filters issues based on search term', async () => {
    projectService.getKpiIssuesDetail.mockResolvedValueOnce({ issues: [
      { id_jira: '1', key_issue: 'TEST-1', summary: 'Find me', status_actual: 'Done' },
      { id_jira: '2', key_issue: 'TEST-2', summary: 'Hide me', status_actual: 'Done' }
    ]});
    
    await act(async () => {
      render(<KpiDetailModal {...defaultProps} />);
    });
    
    const searchInput = screen.getByPlaceholderText(/Buscar por clave/i);
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Find' } });
    });
    
    expect(screen.getByText('TEST-1')).toBeInTheDocument();
    expect(screen.queryByText('TEST-2')).not.toBeInTheDocument();
  });

  it('handles pagination', async () => {
    const mockIssues = Array.from({ length: 10 }, (_, i) => ({
      id_jira: String(i), key_issue: `TEST-${i}`, summary: `Task ${i}`, status_actual: 'Done',
    }));

    projectService.getKpiIssuesDetail.mockResolvedValueOnce({ issues: mockIssues });
    
    await act(async () => {
      render(<KpiDetailModal {...defaultProps} />);
    });
    
    // Page 1 should have first 6 items
    expect(screen.getByText('TEST-0')).toBeInTheDocument();
    expect(screen.queryByText('TEST-6')).not.toBeInTheDocument();
    
    const nextBtn = screen.getByText('Siguiente').closest('button');
    
    await act(async () => {
      fireEvent.click(nextBtn);
    });
    
    // Page 2
    expect(screen.queryByText('TEST-0')).not.toBeInTheDocument();
    expect(screen.getByText('TEST-6')).toBeInTheDocument();
  });

  it('renders different status badges correctly', async () => {
    const mockIssues = [
      { id_jira: '1', key_issue: 'T-1', summary: 'S1', status_actual: 'Done', story_points: 0, lead_time_days: 0, cycle_time_days: 0 },
      { id_jira: '2', key_issue: 'T-2', summary: 'S2', status_actual: 'In Progress', story_points: 0, lead_time_days: 0, cycle_time_days: 0 },
      { id_jira: '3', key_issue: 'T-3', summary: 'S3', status_actual: 'To Do', story_points: 0, lead_time_days: 0, cycle_time_days: 0 },
    ];
    
    projectService.getKpiIssuesDetail.mockResolvedValueOnce({ issues: mockIssues });
    
    await act(async () => {
      render(<KpiDetailModal {...defaultProps} />);
    });
    
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    // Default values rendered as "-"
    expect(screen.getAllByText('-').length).toBe(9); // 3 SP, 3 LT, 3 CT
  });

  it('calls onClose when close button is clicked', async () => {
    projectService.getKpiIssuesDetail.mockResolvedValueOnce({ issues: [] });
    
    await act(async () => {
      render(<KpiDetailModal {...defaultProps} />);
    });
    
    // Close button has icon X, find by finding the button that contains X
    // The button doesn't have a label, but we can query by icon or just query all buttons and click the right one.
    // We can find it by getting the SVG or class or we can just find it by traversing.
    // The close button is the one with 'text-slate-400 hover:text-slate-700'
    const buttons = screen.getAllByRole('button');
    // First button is usually close button in the header
    fireEvent.click(buttons[0]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
