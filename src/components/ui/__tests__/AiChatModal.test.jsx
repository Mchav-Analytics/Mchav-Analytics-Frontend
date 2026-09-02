import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AiChatModal from '../AiChatModal';
import { aiService } from '../../../services/api';

vi.mock('../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ 
    user: { email: 'admin@test.com', rol: 'ADMIN', nombre: 'Test Admin' },
    token: 'mock-token' 
  }))
}));

vi.mock('../../../services/api', () => ({
  aiService: {
    chat: vi.fn()
  }
}));

// Mock window.confirm
const originalConfirm = window.confirm;
window.confirm = vi.fn();

// Mock ResizeObserver and scrollIntoView
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('AiChatModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.confirm.mockReturnValue(true); // Default to confirming
  });

  afterAll(() => {
    window.confirm = originalConfirm;
  });

  it('renders correctly when open', () => {
    render(<AiChatModal isOpen={true} onClose={() => {}} selectedProjectId="PROJ-01" />);
    expect(screen.getByText('Historial de Chats')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(<AiChatModal isOpen={false} onClose={() => {}} selectedProjectId="PROJ-01" />);
    expect(container.firstChild).toBeNull();
  });

  it('can create a new session', async () => {
    render(<AiChatModal isOpen={true} onClose={() => {}} selectedProjectId="PROJ-01" />);
    const buttons = screen.getAllByText(/Nuevo Chat/i);
    // Click the sidebar "Nuevo Chat" button
    fireEvent.click(buttons[0]);
    // Since local storage is empty, creating a new session means we now have 2 sessions in the list
    const sessionTitles = screen.getAllByText('Nueva Conversación');
    expect(sessionTitles.length).toBeGreaterThanOrEqual(2);
  });

  it('can delete a session', async () => {
    render(<AiChatModal isOpen={true} onClose={() => {}} selectedProjectId="PROJ-01" />);
    // Create one first
    const buttons = screen.getAllByText(/Nuevo Chat/i);
    fireEvent.click(buttons[0]);
    
    // There should be multiple sessions now. Find the delete buttons.
    const deleteButtons = screen.getAllByTitle('Eliminar esta conversación');
    fireEvent.click(deleteButtons[0]);
    
    // We expect one fewer session now
    const currentSessions = screen.getAllByTitle('Eliminar esta conversación');
    expect(currentSessions.length).toBe(deleteButtons.length - 1);
  });

  it('can clear all history', async () => {
    render(<AiChatModal isOpen={true} onClose={() => {}} selectedProjectId="PROJ-01" />);
    // Create a new one
    fireEvent.click(screen.getAllByText(/Nuevo Chat/i)[0]);
    
    // Clear all
    const clearAllBtn = screen.getByText(/Borrar todo/i);
    fireEvent.click(clearAllBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    // Should reset to exactly 1 session
    const currentSessions = screen.getAllByTitle('Eliminar esta conversación');
    expect(currentSessions.length).toBe(1);
  });

  it('can toggle history sidebar visibility', async () => {
    render(<AiChatModal isOpen={true} onClose={() => {}} selectedProjectId="PROJ-01" />);
    
    // Hide
    const hideBtn = screen.getByTitle('Ocultar historial');
    fireEvent.click(hideBtn);
    expect(screen.queryByText('Historial de Chats')).not.toBeInTheDocument();
    
    // Show
    const showBtn = screen.getByTitle('Ver historial de chats');
    fireEvent.click(showBtn);
    expect(screen.getByText('Historial de Chats')).toBeInTheDocument();
  });

  it('can toggle fullscreen mode', async () => {
    render(<AiChatModal isOpen={true} onClose={() => {}} selectedProjectId="PROJ-01" />);
    
    const fullscreenBtn = screen.getByTitle('Restaurar ventana'); // Starts fullscreen
    fireEvent.click(fullscreenBtn);
    
    const expandBtn = screen.getByTitle('Expandir a pantalla completa');
    expect(expandBtn).toBeInTheDocument();
  });

  it('can send a message and receive a response', async () => {
    aiService.chat.mockResolvedValueOnce({ reply: 'Aquí está la tabla:\n| Col1 | Col2 |\n|---|---|\n| Data1 | Data2 |\n\n### Heading\n\n* Bullet' });
    
    render(<AiChatModal isOpen={true} onClose={() => {}} selectedProjectId="PROJ-01" />);
    
    const input = screen.getByPlaceholderText(/Pregúntale lo que quieras/i);
    const sendBtn = screen.getByTitle('Enviar mensaje');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Muéstrame la tabla' } });
      fireEvent.click(sendBtn);
    });

    // Check if user message is in document
    expect(screen.getAllByText(/Muéstrame la tabla/i)[0]).toBeInTheDocument();
    
    // Wait for AI response mock to resolve and check for markdown table content
    const heading = await screen.findByText('Heading');
    expect(heading).toBeInTheDocument();
    expect(screen.getByText('Data1')).toBeInTheDocument();
    expect(screen.getByText('Data2')).toBeInTheDocument();
    
    // Check bullet point parsing (Bullet word should be in doc)
    expect(screen.getByText('Bullet')).toBeInTheDocument();
  });

  it('handles aiService.chat error gracefully', async () => {
    aiService.chat.mockRejectedValueOnce(new Error('API failed'));
    
    render(<AiChatModal isOpen={true} onClose={() => {}} selectedProjectId="PROJ-01" />);
    
    const input = screen.getByPlaceholderText(/Pregúntale lo que quieras/i);
    const sendBtn = screen.getByTitle('Enviar mensaje');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Test error handling' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    });

    const errorMsg = await screen.findByText(/Tuve un inconveniente al conectar con el motor de IA/i);
    expect(errorMsg).toBeInTheDocument();
  });
});
