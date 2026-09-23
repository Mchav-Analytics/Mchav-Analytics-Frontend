import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityTimeline } from '../ActivityTimeline';
import { ActivityModals } from '../ActivityModals';
import { ActivityAchievements } from '../ActivityAchievements';
import AiDevCoach from '../AiDevCoach';
import { Trophy, Star } from 'lucide-react';

describe('Activity and AI Components', () => {
  describe('ActivityTimeline', () => {
    it('renders empty state when selectedProjectId is null', () => {
      render(<ActivityTimeline selectedProjectId={null} />);
      expect(screen.getByText('Selecciona un Proyecto')).toBeInTheDocument();
    });

    it('renders timeline with items, filters and pagination', () => {
      const setCurrentPage = vi.fn();
      const setSearchQuery = vi.fn();
      const setActionFilter = vi.fn();

      const mockFeed = [
        {
          id: 'item-1',
          key: 'PROJ-1',
          summary: 'Task 1',
          action: 'Finalizó tarea',
          category: 'DONE',
          points: '5 SP',
          type: 'Historia',
          time: 'hace 2 horas',
        },
        {
          id: 'item-2',
          key: 'PROJ-2',
          summary: 'Task 2',
          action: 'En revisión PR',
          category: 'REVIEW',
          points: '3 SP',
          type: 'Bug',
          time: 'hace 4 horas',
        },
        {
          id: 'item-3',
          key: 'PROJ-3',
          summary: 'Task 3',
          action: 'Comenzó desarrollo',
          category: 'IN_PROGRESS',
          points: '2 SP',
          type: 'Tarea',
          time: 'hace 6 horas',
        }
      ];

      const { rerender } = render(
        <ActivityTimeline
          selectedProjectId="P1"
          activityFeed={mockFeed}
          paginatedFeed={mockFeed}
          totalPages={3}
          currentPage={2}
          setCurrentPage={setCurrentPage}
          searchQuery="Task"
          setSearchQuery={setSearchQuery}
          actionFilter="ALL"
          setActionFilter={setActionFilter}
          countDone={1}
          countReview={1}
          countInProgress={1}
          totalSPDelivered={10}
        />
      );

      expect(screen.getByText('Cronología de Entregas')).toBeInTheDocument();
      expect(screen.getByText('PROJ-1')).toBeInTheDocument();
      expect(screen.getByText('PROJ-2')).toBeInTheDocument();
      expect(screen.getByText('PROJ-3')).toBeInTheDocument();

      // Action filters
      fireEvent.click(screen.getByRole('button', { name: /Completadas/i }));
      expect(setActionFilter).toHaveBeenCalledWith('DONE');
      expect(setCurrentPage).toHaveBeenCalledWith(1);

      fireEvent.click(screen.getByRole('button', { name: /En Revisión/i }));
      expect(setActionFilter).toHaveBeenCalledWith('REVIEW');

      fireEvent.click(screen.getByRole('button', { name: /En Curso/i }));
      expect(setActionFilter).toHaveBeenCalledWith('IN_PROGRESS');

      fireEvent.click(screen.getByRole('button', { name: /Todas/i }));
      expect(setActionFilter).toHaveBeenCalledWith('ALL');

      // Clear search button
      const clearBtn = screen.getByRole('button', { name: '' });
      fireEvent.click(clearBtn);
      expect(setSearchQuery).toHaveBeenCalledWith('');

      // Search input change
      const searchInput = screen.getByPlaceholderText(/Buscar ticket o actividad/i);
      fireEvent.change(searchInput, { target: { value: 'Bug fix' } });
      expect(setSearchQuery).toHaveBeenCalledWith('Bug fix');

      // Pagination previous and next
      const prevBtn = screen.getByRole('button', { name: /Anterior/i });
      fireEvent.click(prevBtn);
      expect(setCurrentPage).toHaveBeenCalled();

      const nextBtn = screen.getByRole('button', { name: /Siguiente/i });
      fireEvent.click(nextBtn);
      expect(setCurrentPage).toHaveBeenCalled();

      // Empty paginated feed state
      rerender(
        <ActivityTimeline
          selectedProjectId="P1"
          activityFeed={[]}
          paginatedFeed={[]}
          totalPages={1}
          currentPage={1}
          setCurrentPage={setCurrentPage}
          searchQuery=""
          setSearchQuery={setSearchQuery}
          actionFilter="ALL"
          setActionFilter={setActionFilter}
          countDone={0}
          countReview={0}
          countInProgress={0}
          totalSPDelivered={0}
        />
      );
      expect(screen.getByText('No se encontraron actividades registradas con el filtro actual.')).toBeInTheDocument();
    });
  });

  describe('ActivityModals', () => {
    it('returns null when selectedBadgeModal is null', () => {
      const { container } = render(<ActivityModals selectedBadgeModal={null} setSelectedBadgeModal={vi.fn()} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders modal details and handles close clicks', () => {
      const setSelectedBadgeModal = vi.fn();
      const mockBadge = {
        title: 'Master Bug Hunter',
        category: 'Calidad',
        tier: 'III',
        tierIcon: '🥇',
        gradient: 'from-amber-400 to-orange-500',
        icon: Star,
        description: 'Resolver 50 bugs sin regresión',
        reward: '+100 XP y título de honor',
        status: 'UNLOCKED',
      };

      const { rerender } = render(
        <ActivityModals
          selectedBadgeModal={mockBadge}
          setSelectedBadgeModal={setSelectedBadgeModal}
        />
      );

      expect(screen.getByText('Master Bug Hunter')).toBeInTheDocument();
      expect(screen.getByText('Resolver 50 bugs sin regresión')).toBeInTheDocument();
      expect(screen.getByText('+100 XP y título de honor')).toBeInTheDocument();
      expect(screen.getByText(/¡Medalla desbloqueada y activa/i)).toBeInTheDocument();

      // Close using Entendido button
      const entendidoBtn = screen.getByRole('button', { name: 'Entendido' });
      fireEvent.click(entendidoBtn);
      expect(setSelectedBadgeModal).toHaveBeenCalledWith(null);

      // Locked badge variant
      rerender(
        <ActivityModals
          selectedBadgeModal={{ ...mockBadge, status: 'LOCKED', progress: 30, currentCount: '15/50' }}
          setSelectedBadgeModal={setSelectedBadgeModal}
        />
      );
      expect(screen.getByText('Progreso: 30%')).toBeInTheDocument();
      expect(screen.getByText('15/50')).toBeInTheDocument();
    });
  });

  describe('ActivityAchievements', () => {
    it('renders devRank, level, badges and handles filter and modal clicks', () => {
      const setCategoryFilter = vi.fn();
      const setBadgeStatusFilter = vi.fn();
      const setSelectedBadgeModal = vi.fn();

      const mockBadges = [
        {
          id: 'b-1',
          title: 'Fast Coder',
          category: 'Velocidad',
          unlocked: true,
          badgeColor: 'from-blue-500 to-indigo-600',
          icon: Trophy,
          tier: 'I',
          tierIcon: '🥉',
          description: 'Completar 10 SP en un día'
        },
        {
          id: 'b-2',
          title: 'Doc Master',
          category: 'Documentación',
          unlocked: false,
          progress: 50,
          maxProgress: 100,
          badgeColor: 'from-emerald-500 to-teal-600',
          icon: Star,
          tier: 'II',
          tierIcon: '🥈',
          description: 'Documentar 5 módulos'
        }
      ];

      render(
        <ActivityAchievements
          devRank={{
            level: 5,
            title: 'Senior Craftsman',
            nextTitle: 'Lead Architect',
            tier: 'Oro',
            icon: '⚡',
            badgeColor: 'from-amber-500 to-orange-600'
          }}
          currentXP={1250}
          nextLevelXP={2000}
          xpPercentage={62}
          unlockedCount={1}
          fullBadgesCatalog={mockBadges}
          categoryFilter="ALL"
          setCategoryFilter={setCategoryFilter}
          badgeStatusFilter="ALL"
          setBadgeStatusFilter={setBadgeStatusFilter}
          inProgressCount={1}
          displayedBadges={mockBadges}
          setSelectedBadgeModal={setSelectedBadgeModal}
        />
      );

      expect(screen.getByText('Senior Craftsman')).toBeInTheDocument();
      expect(screen.getByText('Fast Coder')).toBeInTheDocument();
      expect(screen.getByText('Doc Master')).toBeInTheDocument();

      // Click badge card to open modal
      fireEvent.click(screen.getByText('Fast Coder'));
      expect(setSelectedBadgeModal).toHaveBeenCalledWith(mockBadges[0]);

      // Category filter buttons
      const speedCat = screen.getByRole('button', { name: /Velocidad/i });
      fireEvent.click(speedCat);
      expect(setCategoryFilter).toHaveBeenCalledWith('Velocidad');

      // Status filter buttons
      const unlockedFilter = screen.getByRole('button', { name: /Desbloqueadas/i });
      fireEvent.click(unlockedFilter);
      expect(setBadgeStatusFilter).toHaveBeenCalledWith('UNLOCKED');
    });
  });

  describe('AiDevCoach', () => {
    it('renders default tip and handles loading state', () => {
      const { rerender } = render(<AiDevCoach loading={true} />);
      expect(screen.getByText(/Analizando.../i)).toBeInTheDocument();
      expect(screen.getByText(/¡Hola! Soy Nubi y este es mi diagnóstico de hoy/i)).toBeInTheDocument();

      rerender(<AiDevCoach tip="Consejo personalizado de IA" loading={false} />);
      expect(screen.getByText(/"Consejo personalizado de IA"/i)).toBeInTheDocument();

      // Trigger image error fallback
      const img = screen.getByAltText('Nubi Coach');
      fireEvent.error(img);
      expect(img.src).toContain('/owl_mascot.png');
    });
  });
});
