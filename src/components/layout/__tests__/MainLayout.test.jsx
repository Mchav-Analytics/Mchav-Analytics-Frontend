import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import MainLayout from '../MainLayout';

vi.mock('../Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar Mock</div>,
}));

vi.mock('../Topbar', () => ({
  default: () => <div data-testid="topbar">Topbar Mock</div>,
}));

vi.mock('../../services/api', () => ({
  authService: {
    getCurrentUser: vi.fn().mockResolvedValue({ name: 'Test' }),
  }
}));

describe('MainLayout', () => {
  it('renders Sidebar and children', async () => {
    await act(async () => {
      render(
        <MainLayout
          activeTab="dashboard"
          setActiveTab={vi.fn()}
          isDarkMode={false}
          setIsDarkMode={vi.fn()}
        >
          <div data-testid="child-content">Child Content</div>
        </MainLayout>
      );
    });
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('applies dark theme class when isDarkMode is true', async () => {
    let containerElement;
    await act(async () => {
      const { container } = render(
        <MainLayout
          activeTab="dashboard"
          setActiveTab={vi.fn()}
          isDarkMode={true}
          setIsDarkMode={vi.fn()}
        >
          <div>Content</div>
        </MainLayout>
      );
      containerElement = container;
    });
    
    // Check if the dashboard-layout div has dark theme classes
    const layoutDiv = containerElement.firstChild;
    expect(layoutDiv).toHaveClass('dark-theme');
    expect(layoutDiv).toHaveClass('dark');
  });
});
