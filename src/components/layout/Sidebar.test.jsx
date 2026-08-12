import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar';
import * as AuthContext from '../../features/auth/context/AuthContext';

// Mock the AuthContext hook
vi.mock('../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(),
  normalizeRole: vi.fn((role) => role || 'DEVELOPER')
}));

// Mock the Logo component
vi.mock('./Logo', () => ({
  default: () => <div data-testid="mock-logo">Logo</div>
}));

// Mock the ThemeToggleSwitch component
vi.mock('../ui/ThemeToggleSwitch', () => ({
  default: () => <div data-testid="mock-theme-toggle">ThemeToggle</div>
}));

describe('Sidebar Component', () => {
  const defaultProps = {
    activeTab: 'dashboard',
    setActiveTab: vi.fn(),
    isDarkMode: false,
    setIsDarkMode: vi.fn(),
    isCollapsed: false,
    setIsCollapsed: vi.fn(),
    projects: [],
    selectedProjectId: 'PROJ-01',
    setSelectedProjectId: vi.fn()
  };

  it('renders correctly with DEVELOPER role', () => {
    // Setup mock return values
    AuthContext.useAuth.mockReturnValue({
      user: { nombre: 'Andres Alcala', rol: 'DEVELOPER' },
      logout: vi.fn(),
      isRealAdmin: false
    });
    AuthContext.normalizeRole.mockReturnValue('DEVELOPER');

    render(<Sidebar {...defaultProps} />);

    // Logo should be rendered
    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();

    // Check for developer specific nav items
    expect(screen.getByText('Mi Trabajo')).toBeInTheDocument();
    expect(screen.getByText('Enfoque Diario')).toBeInTheDocument();
    
    // Developer role name should be visible
    expect(screen.getByText('Andres Alcala')).toBeInTheDocument();
    expect(screen.getByText('DEVELOPER')).toBeInTheDocument();
  });
});
