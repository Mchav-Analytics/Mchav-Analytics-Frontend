import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import AiChatModal from '../AiChatModal';

vi.mock('../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' },
    token: 'mock-token' 
  }))
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function() {};
window.Element.prototype.scrollIntoView = function() {};
if (typeof window.HTMLDivElement !== 'undefined') {
  window.HTMLDivElement.prototype.scrollIntoView = function() {};
}

describe('AiChatModal', () => {
  it('renders correctly when open', () => {
    render(<AiChatModal isOpen={true} onClose={() => {}} selectedProjectId="PROJ-01" />);
    
    // Smoke test
    expect(screen.getByText('Historial de Chats')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(<AiChatModal isOpen={false} onClose={() => {}} selectedProjectId="PROJ-01" />);
    expect(container.firstChild).toBeNull();
  });
});
