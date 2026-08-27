import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import ProfileSettingsModal from '../ProfileSettingsModal';

vi.mock('../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' },
    token: 'mock-token' 
  }))
}));

describe('ProfileSettingsModal', () => {
  it('renders correctly when open', () => {
    render(<ProfileSettingsModal isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('Nombre Completo')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(<ProfileSettingsModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
