import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import ThemeToggleSwitch from '../ThemeToggleSwitch';

describe('ThemeToggleSwitch', () => {
  it('renders correctly in light mode', () => {
    const setIsDarkMode = vi.fn();
    render(<ThemeToggleSwitch isDarkMode={false} setIsDarkMode={setIsDarkMode} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    
    // El label debe tener el title correcto
    const label = screen.getByTitle('Cambiar a Modo Oscuro');
    expect(label).toBeInTheDocument();
  });

  it('renders correctly in dark mode', () => {
    const setIsDarkMode = vi.fn();
    render(<ThemeToggleSwitch isDarkMode={true} setIsDarkMode={setIsDarkMode} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    
    const label = screen.getByTitle('Cambiar a Modo Claro');
    expect(label).toBeInTheDocument();
  });

  it('calls setIsDarkMode when clicked', () => {
    const setIsDarkMode = vi.fn();
    render(<ThemeToggleSwitch isDarkMode={false} setIsDarkMode={setIsDarkMode} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(setIsDarkMode).toHaveBeenCalledTimes(1);
    expect(setIsDarkMode).toHaveBeenCalledWith(true);
  });
});
