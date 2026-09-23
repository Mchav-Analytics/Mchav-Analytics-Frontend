import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AlertsCenterFilters } from '../AlertsCenterFilters';
import { AlertsCenterHeader } from '../AlertsCenterHeader';
import { AlertsCenterModal } from '../AlertsCenterModal';
import { AlertsCenterWidgets } from '../AlertsCenterWidgets';
import { AlertsCenterBottomWidgets } from '../AlertsCenterBottomWidgets';
import { AlertsCenterDetailPanel } from '../AlertsCenterDetailPanel';
import { AlertsCenterList } from '../AlertsCenterList';
import { AuthContext } from '../../../auth/context/AuthContext';
import { reportService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  reportService: {
    sendMonthlyReports: vi.fn().mockResolvedValue({ admins_notified: 2, leaders_notified: 3 })
  },
  jiraService: {
    getSyncLogs: vi.fn().mockResolvedValue([])
  },
  default: {}
}));

vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: () => ({ user: { rol: 'Administrador', email: 'admin@test.com' } })
}));

describe('AlertsCenter Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AlertsCenterFilters', () => {
    const defaultProps = {
      sidebarProject: 'ALL',
      setSidebarProject: vi.fn(),
      sidebarCategory: 'ALL',
      setSidebarCategory: vi.fn(),
      sidebarPriority: 'ALL',
      setSidebarPriority: vi.fn(),
      sidebarStatus: 'ALL',
      setSidebarStatus: vi.fn(),
      categoryCounts: {
        'Código': 5,
        'Documentación': 2,
        'Procesos': 3,
        'UI/UX': 1,
        'Arquitectura': 4
      }
    };

    it('renders and triggers filter selections and category clicks', () => {
      render(<AlertsCenterFilters {...defaultProps} />);

      expect(screen.getByText('Filtros')).toBeInTheDocument();
      expect(screen.getByText('Tipos de Feedback')).toBeInTheDocument();

      // Change selects
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'API Gateway ETL' } });
      expect(defaultProps.setSidebarProject).toHaveBeenCalledWith('API Gateway ETL');

      fireEvent.change(selects[1], { target: { value: 'Código' } });
      expect(defaultProps.setSidebarCategory).toHaveBeenCalledWith('Código');

      fireEvent.change(selects[2], { target: { value: 'ALTA' } });
      expect(defaultProps.setSidebarPriority).toHaveBeenCalledWith('ALTA');

      fireEvent.change(selects[3], { target: { value: 'RESUELTO' } });
      expect(defaultProps.setSidebarStatus).toHaveBeenCalledWith('RESUELTO');

      // Click categories
      fireEvent.click(screen.getByText('Código'));
      expect(defaultProps.setSidebarCategory).toHaveBeenCalledWith('Código');

      fireEvent.click(screen.getAllByText('Documentación')[1]);
      expect(defaultProps.setSidebarCategory).toHaveBeenCalledWith('Documentación');

      fireEvent.click(screen.getByText('Procesos'));
      expect(defaultProps.setSidebarCategory).toHaveBeenCalledWith('Procesos');

      fireEvent.click(screen.getByText('UI/UX'));
      expect(defaultProps.setSidebarCategory).toHaveBeenCalledWith('UI/UX');

      fireEvent.click(screen.getAllByText('Arquitectura')[1]);
      expect(defaultProps.setSidebarCategory).toHaveBeenCalledWith('Arquitectura');
    });
  });

  describe('AlertsCenterHeader', () => {
    it('renders dev view correctly and handles card and button clicks', () => {
      const setShowCreateModal = vi.fn();
      const setStatusTab = vi.fn();
      const setSidebarProject = vi.fn();

      render(
        <AlertsCenterHeader
          isDev={true}
          setShowCreateModal={setShowCreateModal}
          handleExportCSV={vi.fn()}
          pendingCount={2}
          resolvedCount={5}
          inProgressCount={1}
          statusTab="ALL"
          setStatusTab={setStatusTab}
          searchTerm=""
          setSearchTerm={vi.fn()}
          sidebarProject="ALL"
          setSidebarProject={setSidebarProject}
          projectsList={[{ id_proyecto: 'P1', nombre: 'Alpha' }]}
        />
      );

      expect(screen.getByText('Centro de Actividad')).toBeInTheDocument();

      // Click Nuevo Feedback
      const newBtn = screen.getByRole('button', { name: /Nuevo Feedback/i });
      fireEvent.click(newBtn);
      expect(setShowCreateModal).toHaveBeenCalledWith(true);

      // Select project
      const projectSelect = screen.getByRole('combobox');
      fireEvent.change(projectSelect, { target: { value: 'Alpha' } });
      expect(setSidebarProject).toHaveBeenCalledWith('Alpha');

      // Click metric cards
      fireEvent.click(screen.getByText('Enviados'));
      expect(setStatusTab).toHaveBeenCalledWith('ALL');

      fireEvent.click(screen.getByText('En proceso'));
      expect(setStatusTab).toHaveBeenCalledWith('IN_PROGRESS');

      fireEvent.click(screen.getByText('Resueltos'));
      expect(setStatusTab).toHaveBeenCalledWith('RESOLVED');
    });

    it('renders admin view and handles monthly email send success and failure', async () => {
      const setSearchTerm = vi.fn();
      const setStatusTab = vi.fn();
      const setSidebarPriority = vi.fn();

      const { rerender } = render(
        <AlertsCenterHeader
          isDev={false}
          isAdmin={true}
          setShowCreateModal={vi.fn()}
          handleExportCSV={vi.fn()}
          statusTab="ALL"
          setStatusTab={setStatusTab}
          searchTerm=""
          setSearchTerm={setSearchTerm}
          sidebarPriority="30"
          setSidebarPriority={setSidebarPriority}
          projectsList={[{ id_proyecto: 'P1', nombre: 'Proyecto 1' }]}
        />
      );

      const sendBtn = screen.getByText(/Enviar Reportes por Correo/i);
      expect(sendBtn).toBeInTheDocument();
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(reportService.sendMonthlyReports).toHaveBeenCalled();
      });

      // Search input change
      const searchInput = screen.getByPlaceholderText(/Buscar por título, proyecto o usuario.../i);
      fireEvent.change(searchInput, { target: { value: 'Report' } });
      expect(setSearchTerm).toHaveBeenCalledWith('Report');

      // Priority date select
      const dateSelect = screen.getByRole('combobox');
      fireEvent.change(dateSelect, { target: { value: '7' } });
      expect(setSidebarPriority).toHaveBeenCalledWith('7');

      // Subheader filter pills
      fireEvent.click(screen.getByRole('button', { name: 'Pendientes' }));
      expect(setStatusTab).toHaveBeenCalledWith('PENDING');

      fireEvent.click(screen.getByRole('button', { name: 'En conversación' }));
      expect(setStatusTab).toHaveBeenCalledWith('IN_PROGRESS');

      fireEvent.click(screen.getByRole('button', { name: 'Resueltos' }));
      expect(setStatusTab).toHaveBeenCalledWith('RESOLVED');

      fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
      expect(setStatusTab).toHaveBeenCalledWith('ALL');

      // Summary cards click
      fireEvent.click(screen.getByText('Total de feedback'));
      expect(setStatusTab).toHaveBeenCalledWith('ALL');

      fireEvent.click(screen.getByText('Pendientes'));
      expect(setStatusTab).toHaveBeenCalledWith('PENDING');

      // Test error branch of sendMonthlyEmails
      vi.mocked(reportService.sendMonthlyReports).mockRejectedValueOnce({
        response: { data: { detail: 'Error de servidor SMTP' } }
      });
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(screen.getByText(/Atención: Error de servidor SMTP/i)).toBeInTheDocument();
      });
    });

    it('renders leader view correctly and handles cards and controls', () => {
      const setStatusTab = vi.fn();
      const setSidebarPriority = vi.fn();
      const setShowCreateModal = vi.fn();

      render(
        <AlertsCenterHeader
          isDev={false}
          isAdmin={false}
          isLeader={true}
          setShowCreateModal={setShowCreateModal}
          handleExportCSV={vi.fn()}
          statusTab="ALL"
          setStatusTab={setStatusTab}
          sidebarPriority="30"
          setSidebarPriority={setSidebarPriority}
          pendingCount={4}
          inProgressCount={2}
          resolvedCount={7}
        />
      );

      expect(screen.getByText('Recibidos (Dev)')).toBeInTheDocument();
      expect(screen.getByText('Enviados (Admin)')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Recibidos (Dev)'));
      expect(setStatusTab).toHaveBeenCalledWith('RECEIVED_DEV');

      fireEvent.click(screen.getByText('Enviados (Admin)'));
      expect(setStatusTab).toHaveBeenCalledWith('SENT_ADMIN');

      fireEvent.click(screen.getByText('En conversación'));
      expect(setStatusTab).toHaveBeenCalledWith('IN_PROGRESS');

      fireEvent.click(screen.getByText('Resueltos'));
      expect(setStatusTab).toHaveBeenCalledWith('RESOLVED');

      const dateSelect = screen.getByRole('combobox');
      fireEvent.change(dateSelect, { target: { value: '90' } });
      expect(setSidebarPriority).toHaveBeenCalledWith('90');

      const newBtn = screen.getByRole('button', { name: /Nuevo Feedback/i });
      fireEvent.click(newBtn);
      expect(setShowCreateModal).toHaveBeenCalledWith(true);
    });
  });

  describe('AlertsCenterModal', () => {
    it('returns null when showCreateModal is false', () => {
      const { container } = render(<AlertsCenterModal showCreateModal={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders modal, handles form inputs and submit', () => {
      const setFormTitle = vi.fn();
      const setFormSummary = vi.fn();
      const setFormCategory = vi.fn();
      const setFormPriority = vi.fn();
      const setFormProject = vi.fn();
      const setFormRecipient = vi.fn();
      const setShowCreateModal = vi.fn();
      const handleCreateFeedback = vi.fn(e => e.preventDefault());

      render(
        <AlertsCenterModal
          showCreateModal={true}
          setShowCreateModal={setShowCreateModal}
          formTitle="Bug fix"
          setFormTitle={setFormTitle}
          formSummary="Desc"
          setFormSummary={setFormSummary}
          formCategory="Código"
          setFormCategory={setFormCategory}
          formPriority="ALTA"
          setFormPriority={setFormPriority}
          formProject="P1"
          setFormProject={setFormProject}
          formRecipient="user@test.com"
          setFormRecipient={setFormRecipient}
          recipientsInfo={{ recipients: [{ email: 'user@test.com', name: 'User One', role: 'ADMIN' }] }}
          handleCreateFeedback={handleCreateFeedback}
          projectsList={[{ id_proyecto: 'P1', nombre: 'Proyecto 1' }]}
        />
      );

      expect(screen.getByText('Nuevo Feedback / Revisión')).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/Mejorar documentación de APIs/i);
      fireEvent.change(input, { target: { value: 'New title' } });
      expect(setFormTitle).toHaveBeenCalledWith('New title');

      const descTextarea = screen.getByPlaceholderText(/Explica claramente el feedback/i);
      fireEvent.change(descTextarea, { target: { value: 'New detailed summary' } });
      expect(setFormSummary).toHaveBeenCalledWith('New detailed summary');

      // Change dropdowns
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'P1' } });
      expect(setFormProject).toHaveBeenCalledWith('P1');

      fireEvent.change(selects[1], { target: { value: 'user@test.com' } });
      expect(setFormRecipient).toHaveBeenCalledWith('user@test.com');

      fireEvent.change(selects[2], { target: { value: 'Código' } });
      expect(setFormCategory).toHaveBeenCalledWith('Código');

      fireEvent.change(selects[3], { target: { value: 'ALTA' } });
      expect(setFormPriority).toHaveBeenCalledWith('ALTA');

      const submitBtn = screen.getByRole('button', { name: /Guardar Feedback/i });
      fireEvent.click(submitBtn);
      expect(handleCreateFeedback).toHaveBeenCalled();

      // Cancel button
      const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
      fireEvent.click(cancelBtn);
      expect(setShowCreateModal).toHaveBeenCalledWith(false);
    });
  });

  describe('AlertsCenterDetailPanel', () => {
    const mockItem = {
      id: 'fb-101',
      title: 'Fix auth token refresh',
      summary: 'Needs urgent fix on JWT',
      status: 'PENDIENTE',
      priority: 'ALTA',
      category: 'Código',
      author: 'Tester',
      createdAt: '2026-03-01',
      comments: [{ id: 1, author: 'Lead', text: 'Working on it', createdAt: '2026-03-02' }]
    };

    it('renders detail and handles adding comments and status toggling', () => {
      const onClose = vi.fn();
      const onAddComment = vi.fn();
      const onToggleStatus = vi.fn();

      const { rerender } = render(
        <AlertsCenterDetailPanel
          item={mockItem}
          onClose={onClose}
          onAddComment={onAddComment}
          onToggleStatus={onToggleStatus}
        />
      );

      expect(screen.getByText('Fix auth token refresh')).toBeInTheDocument();
      expect(screen.getAllByText('Needs urgent fix on JWT').length).toBeGreaterThan(0);

      // Typing comment
      const commentInput = screen.getByPlaceholderText(/Escribe una respuesta o aclaración/i);
      fireEvent.change(commentInput, { target: { value: 'Understood' } });

      const form = commentInput.closest('form');
      fireEvent.submit(form);
      expect(onAddComment).toHaveBeenCalledWith('fb-101', 'Understood');

      // Status toggle button
      const toggleBtn = screen.getByRole('button', { name: /Marcar como Resuelto/i });
      fireEvent.click(toggleBtn);
      expect(onToggleStatus).toHaveBeenCalledWith('fb-101');

      // Close button
      const closeBtn = screen.getByTitle('Volver');
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();

      // Render with empty comments
      rerender(
        <AlertsCenterDetailPanel
          item={{ ...mockItem, comments: [] }}
          onClose={onClose}
          onAddComment={onAddComment}
          onToggleStatus={onToggleStatus}
        />
      );
      expect(screen.getByText(/Aún no hay comentarios/i)).toBeInTheDocument();
    });
  });

  describe('AlertsCenterWidgets and BottomWidgets', () => {
    it('renders dev widgets when isDev is true', () => {
      render(
        <AlertsCenterWidgets
          isDev={true}
          categoryCounts={{ 'Código': 4, 'UI/UX': 2 }}
        />
      );

      expect(screen.getByText(/Tu progreso/i)).toBeInTheDocument();
      expect(screen.getByText(/Actividad reciente/i)).toBeInTheDocument();
      expect(screen.getByText('68%')).toBeInTheDocument();
    });

    it('renders admin/leader widgets when isDev is false', () => {
      render(
        <AlertsCenterWidgets
          isDev={false}
          isAdmin={true}
          categoryCounts={{ 'Código': 4, 'UI/UX': 2 }}
        />
      );

      expect(screen.getByText(/Proyectos con más feedback/i)).toBeInTheDocument();
      expect(screen.getByText(/Resumen de la gestión/i)).toBeInTheDocument();
    });

    it('renders BottomWidgets and interacts with timeframe select and categories', () => {
      const setTrendTimeframe = vi.fn();
      const setSidebarCategory = vi.fn();
      const setStatusTab = vi.fn();

      render(
        <AlertsCenterBottomWidgets
          categoryCounts={{ 'Código': 10, 'Documentación': 5, 'Procesos': 3, 'UI/UX': 2 }}
          trendTimeframe="weekly"
          setTrendTimeframe={setTrendTimeframe}
          setSidebarCategory={setSidebarCategory}
          setStatusTab={setStatusTab}
        />
      );

      expect(screen.getByText(/Tendencia de feedback general/i)).toBeInTheDocument();
      expect(screen.getByText(/Áreas que requieren atención/i)).toBeInTheDocument();

      // Timeframe select
      const timeframeSelect = screen.getByRole('combobox');
      fireEvent.change(timeframeSelect, { target: { value: 'monthly' } });
      expect(setTrendTimeframe).toHaveBeenCalledWith('monthly');

      // Click categories
      fireEvent.click(screen.getByText('Código'));
      expect(setSidebarCategory).toHaveBeenCalledWith('Código');

      fireEvent.click(screen.getByText('Procesos'));
      expect(setSidebarCategory).toHaveBeenCalledWith('Procesos');

      fireEvent.click(screen.getByText('UI/UX'));
      expect(setSidebarCategory).toHaveBeenCalledWith('UI/UX');

      fireEvent.click(screen.getByText('Documentación'));
      expect(setSidebarCategory).toHaveBeenCalledWith('Documentación');

      // Click Ver todas
      fireEvent.click(screen.getByRole('button', { name: /Ver todas/i }));
      expect(setSidebarCategory).toHaveBeenCalledWith('ALL');
      expect(setStatusTab).toHaveBeenCalledWith('ALL');
    });
  });

  describe('AlertsCenterList', () => {
    const mockFeedbacks = [
      {
        id: 'fb-1',
        title: 'Issue 1',
        description: 'Desc 1',
        status: 'PENDIENTE',
        priority: 'ALTA',
        category: 'Código',
        author: 'Alice',
        createdAt: '2026-01-01',
        comments: []
      },
      {
        id: 'fb-2',
        title: 'Issue 2',
        description: 'Desc 2',
        status: 'RESUELTO',
        priority: 'BAJA',
        category: 'UI/UX',
        author: 'Bob',
        createdAt: '2026-01-02',
        comments: [{ id: 1, author: 'Carol', text: 'Done', createdAt: '2026-01-03' }]
      }
    ];

    it('renders feedback cards, handles status select, expand, toggle and comments', () => {
      const setExpandedId = vi.fn();
      const handleToggleStatus = vi.fn();
      const setSidebarStatus = vi.fn();
      const setNewCommentText = vi.fn();
      const handleAddComment = vi.fn();

      const { rerender } = render(
        <AlertsCenterList
          filteredItems={mockFeedbacks}
          statusTab="ALL"
          setStatusTab={vi.fn()}
          searchTerm=""
          setSearchTerm={vi.fn()}
          expandedId={null}
          setExpandedId={setExpandedId}
          handleToggleStatus={handleToggleStatus}
          newCommentText=""
          setNewCommentText={setNewCommentText}
          handleAddComment={handleAddComment}
          setSidebarStatus={setSidebarStatus}
          sidebarStatus="ALL"
          isAdmin={true}
        />
      );

      expect(screen.getByText('Issue 1')).toBeInTheDocument();
      expect(screen.getByText('Issue 2')).toBeInTheDocument();

      // Status select change
      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: 'PENDIENTE' } });
      expect(setSidebarStatus).toHaveBeenCalledWith('PENDIENTE');

      // Click card to expand
      fireEvent.click(screen.getByText('Issue 1'));
      expect(setExpandedId).toHaveBeenCalledWith('fb-1');

      // Rerender with expanded card fb-2
      rerender(
        <AlertsCenterList
          filteredItems={mockFeedbacks}
          statusTab="ALL"
          setStatusTab={vi.fn()}
          searchTerm=""
          setSearchTerm={vi.fn()}
          expandedId="fb-2"
          setExpandedId={setExpandedId}
          handleToggleStatus={handleToggleStatus}
          newCommentText="My reply"
          setNewCommentText={setNewCommentText}
          handleAddComment={handleAddComment}
          setSidebarStatus={setSidebarStatus}
          sidebarStatus="ALL"
          isAdmin={true}
        />
      );

      // Comment input typing
      const commentInputs = screen.getAllByPlaceholderText(/Escribe una respuesta o comentario.../i);
      if (commentInputs.length > 0) {
        fireEvent.change(commentInputs[0], { target: { value: 'New text' } });
        expect(setNewCommentText).toHaveBeenCalledWith('New text');

        const addCommentBtns = screen.getAllByRole('button', { name: /Responder/i });
        if (addCommentBtns.length > 0) {
          fireEvent.click(addCommentBtns[0]);
          expect(handleAddComment).toHaveBeenCalledWith('fb-2');
        }
      }
    });

    it('renders empty state when filteredItems is empty and resets filters', () => {
      const setStatusTab = vi.fn();
      const setSidebarCategory = vi.fn();
      const setSidebarPriority = vi.fn();
      const setSidebarStatus = vi.fn();
      const setSearchTerm = vi.fn();

      render(
        <AlertsCenterList
          filteredItems={[]}
          statusTab="PENDING"
          setStatusTab={setStatusTab}
          searchTerm="foo"
          setSearchTerm={setSearchTerm}
          setSidebarCategory={setSidebarCategory}
          setSidebarPriority={setSidebarPriority}
          setSidebarStatus={setSidebarStatus}
          sidebarStatus="PENDING"
          expandedId={null}
          setExpandedId={vi.fn()}
          handleToggleStatus={vi.fn()}
          newCommentText=""
          setNewCommentText={vi.fn()}
          handleAddComment={vi.fn()}
          isAdmin={true}
        />
      );

      expect(screen.getByText('No se encontró feedback con los filtros aplicados.')).toBeInTheDocument();

      const resetBtn = screen.getByRole('button', { name: /Restablecer filtros/i });
      fireEvent.click(resetBtn);

      expect(setStatusTab).toHaveBeenCalledWith('ALL');
      expect(setSidebarCategory).toHaveBeenCalledWith('ALL');
      expect(setSidebarPriority).toHaveBeenCalledWith('ALL');
      expect(setSidebarStatus).toHaveBeenCalledWith('ALL');
      expect(setSearchTerm).toHaveBeenCalledWith('');
    });
  });
});
