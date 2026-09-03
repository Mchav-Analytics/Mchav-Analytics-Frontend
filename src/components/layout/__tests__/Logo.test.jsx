import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import Logo from '../Logo';

describe('Logo Component', () => {
  it('renders the logo image correctly with default props', () => {
    render(<Logo />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('alt', 'MCHAV Analytics Logo');
    expect(imgElement).toHaveStyle({ width: '38px', height: '38px', marginRight: '8px', objectFit: 'contain' });
  });

  it('applies custom size and className props', () => {
    render(<Logo size={50} className="custom-class" />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).toHaveClass('custom-class');
    expect(imgElement).toHaveStyle({ width: '50px', height: '50px' });
  });
});
