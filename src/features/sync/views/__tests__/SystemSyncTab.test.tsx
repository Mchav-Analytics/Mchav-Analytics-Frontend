import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SystemSyncTab from '../SystemSyncTab';

vi.mock('../../../services/api', () => ({
  jiraService: {
    triggerSync: vi.fn(),
    getSyncLogs: vi.fn(() => Promise.resolve([]))
  },
  authService: {},
  jqlService: {}
}));

// Mock LiderNotificationBell
vi.mock('../../dashboard/components/LiderNotificationBell', () => ({
  default: () => <div data-testid="bell-mock">LiderNotificationBell</div>
}));

describe('SystemSyncTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly without crashing', () => {
    render(<SystemSyncTab />);
        expect(screen.getByText('Sincronización del Sistema')).toBeInTheDocument();
  });
});
