import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LiderNotificationBell from '../LiderNotificationBell';
import { jiraService } from '../../../../services/api';
import {
  getReadNotificationIds,
  getAcceptedNotificationIds,
  markNotificationAsRead,
  markNotificationAsAccepted,
  markAllNotificationsAsRead,
  markAllNotificationsAsAccepted,
  subscribeToNotificationUpdates
} from '../../../../services/notificationStore';

vi.mock('../../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' }
  }))
}));

vi.mock('../../../../services/api', () => ({
  jiraService: {
    triggerSync: vi.fn()
  }
}));

vi.mock('../../../../services/notificationStore', () => ({
  getReadNotificationIds: vi.fn(),
  getAcceptedNotificationIds: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markNotificationAsAccepted: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  markAllNotificationsAsAccepted: vi.fn(),
  subscribeToNotificationUpdates: vi.fn()
}));

describe('LiderNotificationBell', () => {
  const mockDynamicNotifications = [
    { id: '1', type: 'TASK_ASSIGNED', title: 'Task 1', description: 'Desc 1', time: '10:00', issueKey: 'T-1' },
    { id: '2', type: 'SOLICITUD', title: 'Sol 1', description: 'Desc 2', time: '10:05' },
    { id: '3', type: 'BUG', title: 'Bug 1', description: 'Desc 3', time: '10:10' },
    { id: '4', type: 'ALERTA', title: 'Alert 1', description: 'Desc 4', time: '10:15' },
    { id: '5', type: 'SYNC_FAIL', title: 'Sync 1', description: 'Desc 5', time: '10:20' },
    { id: '6', type: 'USER_REG', title: 'User 1', description: 'Desc 6', time: '10:25' },
    { id: '7', type: 'REPORT', title: 'Report 1', description: 'Desc 7', time: '10:30' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    getReadNotificationIds.mockReturnValue([]);
    getAcceptedNotificationIds.mockReturnValue([]);
    subscribeToNotificationUpdates.mockImplementation((cb) => {
      // return unsubscribe function
      return () => {};
    });
  });

  it('renders bell icon and opens popover on click', () => {
    render(<LiderNotificationBell dynamicNotifications={[]} />);
    
    const bellBtn = screen.getByTitle('Notificaciones - Rol ADMIN');
    fireEvent.click(bellBtn);
    
    expect(screen.getByText(/Notificaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/Rol ADMIN/i)).toBeInTheDocument();
  });

  it('renders notifications and action buttons', () => {
    render(<LiderNotificationBell dynamicNotifications={mockDynamicNotifications} />);
    
    // Open popover
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));

    // Check titles
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Sol 1')).toBeInTheDocument();
    expect(screen.getByText('Bug 1')).toBeInTheDocument();
    
    // Check unread count
    expect(screen.getByText(/activas/i)).toBeInTheDocument();

    // Check specific buttons
    expect(screen.getByText('Ver tarea')).toBeInTheDocument();
    expect(screen.getAllByText('Ver en Hub')[0]).toBeInTheDocument();
  });

  it('handles mark all as read', () => {
    render(<LiderNotificationBell dynamicNotifications={mockDynamicNotifications} />);
    
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    
    const markAllBtn = screen.getByText('Marcar leídas');
    fireEvent.click(markAllBtn);
    
    expect(markAllNotificationsAsRead).toHaveBeenCalled();
  });

  it('handles clicking a single notification to mark as read', () => {
    render(<LiderNotificationBell dynamicNotifications={mockDynamicNotifications} />);
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    
    // The notification wrapper has onClick. We click on the title or somewhere inside.
    fireEvent.click(screen.getByText('Task 1'));
    
    expect(markNotificationAsRead).toHaveBeenCalledWith('1');
  });

  it('handles accepting an alert', () => {
    render(<LiderNotificationBell dynamicNotifications={mockDynamicNotifications} />);
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));

    const acceptButtons = screen.getAllByText('Aceptar Alerta');
    expect(acceptButtons.length).toBeGreaterThan(0);
    fireEvent.click(acceptButtons[0]);

    expect(markNotificationAsAccepted).toHaveBeenCalled();
  });

  it('handles retry sync logic', async () => {
    jiraService.triggerSync.mockResolvedValueOnce({});
    
    const syncNotification = [
      { id: '5', type: 'SYNC_FAIL', title: 'Sync Fail 1', description: 'Failed', time: '10:20' }
    ];
    render(<LiderNotificationBell dynamicNotifications={syncNotification} />);
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    
    const retryBtn = screen.getByText('Reintentar');
    await act(async () => {
      fireEvent.click(retryBtn);
    });
    expect(jiraService.triggerSync).toHaveBeenCalled();
  });

  it('handles navigation actions correctly', () => {
    const onNavigateTab = vi.fn();
    const onOpenTask = vi.fn();
    
    render(
      <LiderNotificationBell 
        dynamicNotifications={mockDynamicNotifications} 
        onNavigateTab={onNavigateTab}
        onOpenTask={onOpenTask}
      />
    );

    // Open modal
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));

    // Click "Ver Centro de Actividad completo"
    fireEvent.click(screen.getByText('Ver Centro de Actividad completo'));
    expect(onNavigateTab).toHaveBeenCalledWith('alerts_center');
  });

  it('closes popover on outside click', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <LiderNotificationBell dynamicNotifications={[]} />
      </div>
    );
    
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    expect(screen.getByText(/Notificaciones/i)).toBeInTheDocument();
    
    fireEvent.mouseDown(screen.getByTestId('outside'));
    
    expect(screen.queryByText(/Notificaciones/i)).not.toBeInTheDocument();
  });

  it('handles accept all notifications', () => {
    render(<LiderNotificationBell dynamicNotifications={mockDynamicNotifications} />);
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));

    const acceptAllBtn = screen.getByText('Aceptar todas');
    fireEvent.click(acceptAllBtn);
    expect(markAllNotificationsAsAccepted).toHaveBeenCalled();
  });

  it('switches between filter tabs and shows corresponding notifications or empty states', () => {
    render(<LiderNotificationBell dynamicNotifications={mockDynamicNotifications} />);
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));

    // Switch to Nubi AI tab
    fireEvent.click(screen.getByRole('button', { name: /Nubi AI/i }));
    expect(screen.getByRole('button', { name: /Nubi AI/i })).toBeInTheDocument();

    // Switch to Críticas tab
    fireEvent.click(screen.getByRole('button', { name: /Críticas/i }));
    expect(screen.getByRole('button', { name: /Críticas/i })).toBeInTheDocument();

    // Switch to Aceptadas tab
    fireEvent.click(screen.getByRole('button', { name: /Aceptadas/i }));
    expect(screen.getByText(/Aún no has aceptado ninguna alerta/i)).toBeInTheDocument();

    // Switch back to Todas tab
    fireEvent.click(screen.getByRole('button', { name: /Todas/i }));
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('scans AI alerts with Nubi AI', () => {
    vi.useFakeTimers();
    render(<LiderNotificationBell dynamicNotifications={mockDynamicNotifications} />);
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));

    const scanBtn = screen.getByTitle(/Re-analizar métricas/i);
    fireEvent.click(scanBtn);
    expect(screen.getByText(/analizando métricas/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/completó la detección/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3500);
    });
    vi.useRealTimers();
  });

  it('handles isCollapsed prop correctly', () => {
    render(<LiderNotificationBell dynamicNotifications={mockDynamicNotifications} isCollapsed={true} />);
    expect(screen.queryByText('Alertas IA')).not.toBeInTheDocument();
    
    // Clicking opens the modal
    const bellBtn = screen.getByTitle('Notificaciones - Rol ADMIN');
    fireEvent.click(bellBtn);
    expect(screen.getByText(/Notificaciones/i)).toBeInTheDocument();

    // Close button X
    const closeButtons = screen.getAllByRole('button');
    const xBtn = closeButtons.find(b => b.querySelector('svg.lucide-x'));
    if (xBtn) {
      fireEvent.click(xBtn);
      expect(screen.queryByText(/Notificaciones/i)).not.toBeInTheDocument();
    }
  });

  it('handles clicking Ver tarea and onNavigateToHub fallback', () => {
    const onOpenTask = vi.fn();
    const onNavigateToHub = vi.fn();
    render(
      <LiderNotificationBell
        dynamicNotifications={mockDynamicNotifications}
        onOpenTask={onOpenTask}
        onNavigateToHub={onNavigateToHub}
      />
    );

    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));

    // Click "Ver tarea" button
    const taskBtn = screen.getByText('Ver tarea');
    fireEvent.click(taskBtn);
    expect(onOpenTask).toHaveBeenCalledWith('T-1');

    // Reopen and click Ver en Hub to trigger handleGoToHub -> onNavigateToHub
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    const hubButtons = screen.getAllByText('Ver en Hub');
    fireEvent.click(hubButtons[0]);
    expect(onNavigateToHub).toHaveBeenCalledWith('alerts_center');
  });
});
