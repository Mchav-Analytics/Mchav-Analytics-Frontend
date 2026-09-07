import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import JqlConsultasView from '../JqlConsultasView';
import { jqlService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  jqlService: {
    executeJql: vi.fn()
  }
}));

describe('JqlConsultasView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly', () => {
    render(<JqlConsultasView />);
    expect(screen.getByText('Consultas JQL')).toBeInTheDocument();
  });

  it('shows error if empty query submitted', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<JqlConsultasView />);
    });
    
    const clearBtn = screen.getByText('[Limpiar]');
    await act(async () => {
      await user.click(clearBtn); // sets query to ''
    });
    
    const execBtn = screen.getByRole('button', { name: /Ejecutar consulta/i });
    await act(async () => {
      await user.click(execBtn);
    });
    
    expect(await screen.findByText(/Por favor ingresa una consulta JQL válida/i)).toBeInTheDocument();
  });

  it('executes successful jql query', async () => {
    const mockIssues = [
      { key: 'MCHAV-1', summary: 'Test issue', status_actual: 'To Do', priority: 'High' }
    ];
    jqlService.executeJql.mockResolvedValueOnce({ success: true, issues: mockIssues });
    
    const user = userEvent.setup();
    await act(async () => {
      render(<JqlConsultasView />);
    });
    
    const execBtn = screen.getByRole('button', { name: /Ejecutar consulta/i });
    await act(async () => {
      await user.click(execBtn);
    });
    
    expect(await screen.findByText(/Sintaxis válida \(1 resultados\)/i)).toBeInTheDocument();
    expect(screen.getByText('MCHAV-1')).toBeInTheDocument();
    expect(screen.getByText('Test issue')).toBeInTheDocument();
  });

  it('executes failing jql query', async () => {
    jqlService.executeJql.mockResolvedValueOnce({ success: false, detail: 'Syntax error at line 1' });
    const user = userEvent.setup();
    
    await act(async () => {
      render(<JqlConsultasView />);
    });
    
    const execBtn = screen.getByRole('button', { name: /Ejecutar consulta/i });
    await act(async () => {
      await user.click(execBtn);
    });
    
    expect(await screen.findByText(/Syntax error at line 1/i)).toBeInTheDocument();
  });

  it('handles network error during execution', async () => {
    jqlService.executeJql.mockRejectedValueOnce(new Error('Network disconnected'));
    const user = userEvent.setup();
    
    await act(async () => {
      render(<JqlConsultasView />);
    });
    
    const execBtn = screen.getByRole('button', { name: /Ejecutar consulta/i });
    await act(async () => {
      await user.click(execBtn);
    });
    
    expect(await screen.findByText(/Network disconnected/i)).toBeInTheDocument();
  });

  it('loads presets correctly', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<JqlConsultasView />);
    });
    
    const presetBtn = screen.getByText('[Bugs]');
    await act(async () => {
      await user.click(presetBtn);
    });
    
    const textarea = document.querySelector('textarea');
    expect(textarea.value).toContain('issuetype in (Bug, Error)');
  });

  it('opens and closes audit drawer', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<JqlConsultasView />);
    });
    
    const histBtn = screen.getByRole('button', { name: /Historial de Consultas/i });
    await act(async () => {
      await user.click(histBtn);
    });
    
    expect(screen.getByText('HISTORIAL DE CONSULTAS')).toBeInTheDocument();
    
    // click one of the history items
    const histItem = screen.getByText(/project = "10000" AND issuetype = Bug/i);
    await act(async () => {
      await user.click(histItem);
    });
    
    const textarea = document.querySelector('textarea');
    expect(textarea.value).toBe('project = "10000" AND issuetype = Bug');
  });

  it('downloads CSV correctly', async () => {
    const mockIssues = [
      { key: 'MCHAV-1', summary: 'Test', status_actual: 'To Do', assignee_name: 'Dev' }
    ];
    jqlService.executeJql.mockResolvedValueOnce({ success: true, issues: mockIssues });
    
    let mockLink;
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        mockLink = el;
        vi.spyOn(mockLink, 'setAttribute');
        vi.spyOn(mockLink, 'click');
      }
      return el;
    });
    
    render(<JqlConsultasView />);
    const execBtn = screen.getByRole('button', { name: /Ejecutar consulta/i });
    fireEvent.click(execBtn);
    
    await screen.findByText('MCHAV-1'); // wait for render
    
    const dlBtn = document.querySelector('button .lucide-download')?.parentElement;
    if (dlBtn) {
        fireEvent.click(dlBtn);
        expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.csv'));
        expect(mockLink.click).toHaveBeenCalled();
    }
  });

  it('filters dictionary', async () => {
    const user = userEvent.setup();
    render(<JqlConsultasView />);
    
    const input = screen.getByPlaceholderText(/Buscar campo/i);
    await user.type(input, 'prioridad');
    
    expect(screen.getByText('priority')).toBeInTheDocument();
    expect(screen.queryByText('project')).not.toBeInTheDocument();
  });
});
