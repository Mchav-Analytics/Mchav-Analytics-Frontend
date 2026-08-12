import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemeToggleSwitch from './ThemeToggleSwitch';

describe('ThemeToggleSwitch', () => {
  it('renders correctly with light mode', () => {
    const setIsDarkMode = vi.fn();
    render(<ThemeToggleSwitch isDarkMode={false} setIsDarkMode={setIsDarkMode} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders correctly with dark mode', () => {
    const setIsDarkMode = vi.fn();
    render(<ThemeToggleSwitch isDarkMode={true} setIsDarkMode={setIsDarkMode} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('calls setIsDarkMode when toggled', () => {
    const setIsDarkMode = vi.fn();
    render(<ThemeToggleSwitch isDarkMode={false} setIsDarkMode={setIsDarkMode} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(setIsDarkMode).toHaveBeenCalledWith(true);
  });
});
