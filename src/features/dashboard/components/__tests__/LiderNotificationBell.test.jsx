import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LiderNotificationBell from '../LiderNotificationBell';
import { jiraService } from '../../../../services/api';
import {
  getReadNotificationIds,
  markNotificationAsRead,
  markAllNotificationsAsRead,
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
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
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
    subscribeToNotificationUpdates.mockImplementation((cb) => {
      // return unsubscribe function
      return () => {};
    });
  });

  it('renders bell icon and opens popover on click', () => {
    render(<LiderNotificationBell dynamicNotifications={[]} />);
    
    const bellBtn = screen.getByTitle('Notificaciones - Rol ADMIN');
    fireEvent.click(bellBtn);
    
    expect(screen.getByText('Notificaciones')).toBeInTheDocument();
    expect(screen.getByText('Rol ADMIN')).toBeInTheDocument();
    expect(screen.getByText(/No tienes notificaciones/i)).toBeInTheDocument();
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
    expect(screen.getByText('7 activas')).toBeInTheDocument();

    // Check specific buttons
    expect(screen.getByText('Ver tarea')).toBeInTheDocument();
    expect(screen.getByText('Ver usuarios')).toBeInTheDocument();
    expect(screen.getByText('Responder')).toBeInTheDocument();
    expect(screen.getByText('Ver bug')).toBeInTheDocument();
    expect(screen.getByText('Revisar')).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
    expect(screen.getByText('Ver informe')).toBeInTheDocument();
  });

  it('handles mark all as read', () => {
    render(<LiderNotificationBell dynamicNotifications={mockDynamicNotifications} />);
    
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    
    const markAllBtn = screen.getByText('Marcar leídas');
    fireEvent.click(markAllBtn);
    
    expect(markAllNotificationsAsRead).toHaveBeenCalledWith(['1', '2', '3', '4', '5', '6', '7']);
  });

  it('handles clicking a single notification to mark as read', () => {
    render(<LiderNotificationBell dynamicNotifications={mockDynamicNotifications} />);
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    
    // The notification wrapper has onClick. We click on the title or somewhere inside.
    fireEvent.click(screen.getByText('Task 1'));
    
    expect(markNotificationAsRead).toHaveBeenCalledWith('1');
  });

  it('handles retry sync logic', async () => {
    jiraService.triggerSync.mockResolvedValueOnce({});
    
    render(<LiderNotificationBell dynamicNotifications={mockDynamicNotifications} />);
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    
    const retryBtn = screen.getByText('Reintentar');
    
    await act(async () => {
      fireEvent.click(retryBtn);
    });
    
    expect(jiraService.triggerSync).toHaveBeenCalled();
    expect(screen.getByText('✨ Sincronización completada con éxito')).toBeInTheDocument();
    expect(markNotificationAsRead).toHaveBeenCalledWith('5'); // SYNC_FAIL id is '5'
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
    // Ver tarea
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    fireEvent.click(screen.getByText('Ver tarea'));
    expect(onOpenTask).toHaveBeenCalledWith('T-1');

    // Ver usuarios
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    fireEvent.click(screen.getByText('Ver usuarios'));
    expect(onNavigateTab).toHaveBeenCalledWith('usuarios');

    // Responder
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    fireEvent.click(screen.getByText('Responder'));
    expect(onNavigateTab).toHaveBeenCalledWith('alerts_center');

    // Ver bug
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    fireEvent.click(screen.getByText('Ver bug'));
    expect(onNavigateTab).toHaveBeenCalledWith('team_matrix');

    // Revisar
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    fireEvent.click(screen.getByText('Revisar'));
    expect(onNavigateTab).toHaveBeenCalledWith('alerts_center');

    // Ver informe
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    fireEvent.click(screen.getByText('Ver informe'));
    expect(onNavigateTab).toHaveBeenCalledWith('sprint_health');
    
    // Ir al Centro de Actividad completo
    fireEvent.click(screen.getByTitle('Notificaciones - Rol ADMIN'));
    fireEvent.click(screen.getByText('Ir al Centro de Actividad completo'));
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
    expect(screen.getByText('Notificaciones')).toBeInTheDocument();
    
    fireEvent.mouseDown(screen.getByTestId('outside'));
    
    expect(screen.queryByText('Notificaciones')).not.toBeInTheDocument();
  });
});
