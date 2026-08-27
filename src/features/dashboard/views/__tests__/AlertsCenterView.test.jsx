import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import AlertsCenterView from '../AlertsCenterView';

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
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  subscribeToNotificationUpdates: vi.fn(() => () => {})
}));

describe('AlertsCenterView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly without crashing', () => {
    render(<AlertsCenterView onNavigateTab={() => {}} />);
    
    // Check if main title is rendered
    expect(screen.getByText('Centro de Actividad')).toBeInTheDocument();
  });
});
