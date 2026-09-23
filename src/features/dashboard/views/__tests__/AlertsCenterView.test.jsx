import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AlertsCenterView from '../AlertsCenterView';
import * as useAlertsCenterHook from '../../hooks/useAlertsCenter';

vi.mock('../../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' },
    token: 'mock-token' 
  }))
}));

vi.mock('../../../../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
  jiraService: {
    triggerSync: vi.fn()
  }
}));

vi.mock('../../../../services/notificationStore', () => ({
  getReadNotificationIds: vi.fn(() => []),
  getAcceptedNotificationIds: vi.fn(() => []),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  subscribeToNotificationUpdates: vi.fn(() => () => {})
}));

describe('AlertsCenterView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default state without crashing', () => {
    render(<AlertsCenterView onNavigateTab={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Centro de Actividad' })).toBeInTheDocument();
  });

  it('renders toast notification and detail panel when item is selected', () => {
    const mockItem = {
      id: 'alert-1',
      title: 'Bloqueo Crítico',
      summary: 'Esperando credenciales',
      priority: 'CRITICA',
      status: 'PENDIENTE',
      category: 'BLOQUEO',
      author: 'Dev Carlos',
      createdAt: '2026-03-01T10:00:00Z',
      comments: []
    };

    vi.spyOn(useAlertsCenterHook, 'useAlertsCenter').mockReturnValue({
      showCreateModal: false,
      setShowCreateModal: vi.fn(),
      toastMessage: 'Operación realizada con éxito',
      setToastMessage: vi.fn(),
      projectsList: ['PROJ-01'],
      pendingCount: 1,
      resolvedCount: 0,
      inProgressCount: 0,
      statusTab: 'ALL',
      setStatusTab: vi.fn(),
      searchTerm: '',
      setSearchTerm: vi.fn(),
      sortBy: 'recent',
      setSortBy: vi.fn(),
      filteredItems: [mockItem],
      expandedId: 'alert-1',
      setExpandedId: vi.fn(),
      newCommentText: '',
      setNewCommentText: vi.fn(),
      handleAddComment: vi.fn(),
      handleToggleStatus: vi.fn(),
      sidebarProject: 'ALL',
      setSidebarProject: vi.fn(),
      sidebarCategory: 'ALL',
      setSidebarCategory: vi.fn(),
      sidebarPriority: 'ALL',
      setSidebarPriority: vi.fn(),
      sidebarStatus: 'ALL',
      setSidebarStatus: vi.fn(),
      categoryCounts: { BLOQUEO: 1 },
      projectCounts: {},
      trendData: [],
      trendTimeframe: '30d',
      setTrendTimeframe: vi.fn(),
      isAdmin: true,
      isLeader: false,
      isDev: false,
      handleExportCSV: vi.fn(),
      formTitle: '', setFormTitle: vi.fn(),
      formSummary: '', setFormSummary: vi.fn(),
      formCategory: 'BLOQUEO', setFormCategory: vi.fn(),
      formPriority: 'MEDIA', setFormPriority: vi.fn(),
      formProject: 'PROJ-01', setFormProject: vi.fn(),
      formRecipient: '', setFormRecipient: vi.fn(),
      recipientsInfo: {},
      handleCreateFeedback: vi.fn()
    });

    render(<AlertsCenterView onNavigateTab={() => {}} />);
    expect(screen.getByText('Operación realizada con éxito')).toBeInTheDocument();
  });
});
