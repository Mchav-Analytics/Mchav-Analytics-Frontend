import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '../Sidebar';

// Mock AuthContext
vi.mock('../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' },
    logout: vi.fn(),
    switchViewRole: vi.fn(),
    isRealAdmin: true,
  })),
  normalizeRole: vi.fn((role) => role),
}));

// Mock child components that might have complex logic
vi.mock('../../ui/ThemeToggleSwitch', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

vi.mock('../../../features/auth/components/ProfileSettingsModal', () => ({
  default: ({ isOpen }) => isOpen ? <div data-testid="settings-modal">Settings Modal</div> : null,
}));

vi.mock('../../ui/AiChatModal', () => ({
  default: ({ isOpen }) => isOpen ? <div data-testid="ai-chat-modal">AI Chat Modal</div> : null,
}));

describe('Sidebar', () => {
  it('renders navigation items for ADMIN role', () => {
    const setActiveTab = vi.fn();
    render(<Sidebar activeTab="dashboard" setActiveTab={setActiveTab} isCollapsed={false} />);
    
    // Check for some admin navigation items
    expect(screen.getByText('Resumen')).toBeInTheDocument();
    expect(screen.getByText('Usuarios y Roles')).toBeInTheDocument();
    expect(screen.getByText('Proyectos')).toBeInTheDocument();
  });

  it('calls setActiveTab when a nav item is clicked', () => {
    const setActiveTab = vi.fn();
    render(<Sidebar activeTab="dashboard" setActiveTab={setActiveTab} isCollapsed={false} />);
    
    // Click on "Usuarios y Roles" button
    const usersBtn = screen.getByText('Usuarios y Roles').closest('button');
    fireEvent.click(usersBtn);
    
    expect(setActiveTab).toHaveBeenCalledWith('usuarios');
  });

  it('opens AI Chat modal when clicking spark button', () => {
    const setActiveTab = vi.fn();
    render(<Sidebar activeTab="dashboard" setActiveTab={setActiveTab} isCollapsed={false} />);
    
    const aiBtn = screen.getByText('💬 Consultar a NubI IA').closest('button');
    fireEvent.click(aiBtn);
    
    expect(screen.getByTestId('ai-chat-modal')).toBeInTheDocument();
  });

  it('renders user info correctly', () => {
    render(<Sidebar activeTab="dashboard" setActiveTab={vi.fn()} isCollapsed={false} />);
    expect(screen.getByText('Test Admin')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByText('TA')).toBeInTheDocument(); // Initials
  });
});
