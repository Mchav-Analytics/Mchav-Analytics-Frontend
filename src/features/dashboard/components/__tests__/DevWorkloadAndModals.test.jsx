import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NubiDevAnalysisModal from '../NubiDevAnalysisModal';
import { DevWorkloadModals } from '../DevWorkloadModals';
import ScopeCreepModal from '../ScopeCreepModal';
import { projectService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  projectService: {
    getKpiIssuesDetail: vi.fn()
  }
}));

describe('DevWorkload and Modals Components', () => {
  describe('NubiDevAnalysisModal', () => {
    const mockDev = {
      id: 'd-1',
      nombre: 'Mateo Developer',
      rol: 'DEVELOPER',
      analisis_ia: {
        fortalezas: ['Gran velocidad de entrega', 'Excelente calidad de código'],
        oportunidades: ['Reducir días bloqueado']
      },
      desglose_score: {
        score_total: 92,
        throughput_score: 95,
        calidad_score: 90
      },
      cuadrante: {
        nombre: 'Alto Rendimiento',
        color: 'emerald'
      }
    };

    it('returns null when closed or no developer', () => {
      const { container } = render(<NubiDevAnalysisModal isOpen={false} onClose={vi.fn()} developer={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders modal with developer details and triggers actions', () => {
      const onClose = vi.fn();
      const onSelectDev = vi.fn();

      render(
        <NubiDevAnalysisModal
          isOpen={true}
          onClose={onClose}
          developer={mockDev}
          onSelectDevForScorecard={onSelectDev}
        />
      );

      expect(screen.getByText('Análisis de Rendimiento Personalizado')).toBeDefined();
      expect(screen.getByText('Mateo Developer')).toBeDefined();
      expect(screen.getByText('Gran velocidad de entrega')).toBeDefined();
      expect(screen.getByText('Reducir días bloqueado')).toBeDefined();

      // Close button
      const closeBtn = screen.getByRole('button', { name: 'Cerrar' });
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('DevWorkloadModals', () => {
    const mockTask = {
      id: 't-1',
      key: 'MCH-55',
      summary: 'Optimizar consultas a Jira',
      status: 'EN CURSO',
      rawStatus: 'En Progreso',
      descripcion: 'Detalles de la tarea',
      priority: 'Alta'
    };

    it('returns null when selectedTaskModal is null', () => {
      const { container } = render(<DevWorkloadModals selectedTaskModal={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders task modal and handles branch copying and transition selection', () => {
      const setSelectedTaskModal = vi.fn();
      const handleCopyGitBranch = vi.fn();
      const handleSelectTransition = vi.fn();
      const setIsStatusDropdownOpen = vi.fn();

      render(
        <DevWorkloadModals
          selectedTaskModal={mockTask}
          setSelectedTaskModal={setSelectedTaskModal}
          updatingStatus={false}
          isStatusDropdownOpen={true}
          setIsStatusDropdownOpen={setIsStatusDropdownOpen}
          dropdownRef={{ current: null }}
          loadingTransitions={false}
          availableTransitions={[{ id: '11', name: 'Listo para QA' }]}
          handleSelectTransition={handleSelectTransition}
          copiedBranch={false}
          handleCopyGitBranch={handleCopyGitBranch}
          errorMsg="Error de red"
        />
      );

      expect(screen.getByText('MCH-55')).toBeDefined();
      expect(screen.getByText('Optimizar consultas a Jira')).toBeDefined();
      expect(screen.getByText('Error de red')).toBeDefined();

      // Click copy branch
      const copyBtn = screen.getByText('Copiar rama Git');
      fireEvent.click(copyBtn);
      expect(handleCopyGitBranch).toHaveBeenCalledWith(mockTask);

      // Click transition
      const transitionBtn = screen.getByText('Listo para QA');
      fireEvent.click(transitionBtn);
      expect(handleSelectTransition).toHaveBeenCalledWith({ id: '11', name: 'Listo para QA' });
    });
  });

  describe('ScopeCreepModal', () => {
    it('returns null when closed', () => {
      const { container } = render(<ScopeCreepModal isOpen={false} onClose={vi.fn()} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders modal, fetches issues and handles search and pagination', async () => {
      const mockIssues = [
        { key_issue: 'MCH-1', story_points: 3, assignee_name: 'Dev One' },
        { key_issue: 'MCH-2', story_points: 5, assignee_name: 'Dev Two' }
      ];

      projectService.getKpiIssuesDetail.mockResolvedValueOnce({
        issues: mockIssues
      });

      const onClose = vi.fn();

      render(
        <ScopeCreepModal
          isOpen={true}
          onClose={onClose}
          sprintId="sprint-1"
          projectId="proj-1"
        />
      );

      expect(screen.getByText('Registro de Cambios de Alcance')).toBeDefined();

      await waitFor(() => {
        expect(screen.getByText('MCH-1')).toBeDefined();
        expect(screen.getByText('MCH-2')).toBeDefined();
      });

      // Search filter
      const searchInput = screen.getByPlaceholderText('Buscar por ticket o autor...');
      fireEvent.change(searchInput, { target: { value: 'MCH-1' } });
      expect(screen.getByText('MCH-1')).toBeDefined();
      expect(screen.queryByText('MCH-2')).toBeNull();

      // Close modal button
      const closeButtons = screen.getAllByRole('button');
      const closeBtn = closeButtons.find(b => b.querySelector('svg.lucide-x'));
      if (closeBtn) {
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });
});
