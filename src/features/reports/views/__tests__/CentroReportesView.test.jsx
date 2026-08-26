import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CentroReportesView from '../CentroReportesView';
import api from '../../../../services/api';

vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ token: 'mock-token' }))
}));

vi.mock('../../../../services/api', () => ({
  default: {
    get: vi.fn(),
  }
}));

// Mock fetch for history
global.fetch = vi.fn();

describe('CentroReportesView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the initial data fetches
    api.get.mockImplementation((url) => {
      if (url === '/api/v1/projects') {
        return Promise.resolve({ data: [{ id_proyecto: 'P1', nombre: 'Proyecto Test' }] });
      }
      if (url === '/api/v1/users') {
        return Promise.resolve({ data: [{ id_usuario: 'U1', nombre: 'User Test' }] });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('renders correctly and fetches initial data', async () => {
    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });
    
    expect(screen.getByText('Centro de Reportes')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects');
      expect(api.get).toHaveBeenCalledWith('/api/v1/users');
    });
  });

  it('can switch tabs to Historial', async () => {
    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });
    
    const histTab = screen.getByText('Historial Inmutable');
    
    await act(async () => {
      fireEvent.click(histTab);
    });
    
    expect(screen.getByText('Reconstruir Histórico')).toBeInTheDocument();
  });

  it('can change report type to developer and load users', async () => {
    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });
    
    // Click on "Desarrollador" card
    const devCard = screen.getByText('Desarrollador');
    
    await act(async () => {
      fireEvent.click(devCard);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Selecciona un desarrollador...')).toBeInTheDocument();
    });
  });

  it('triggers fake live report generation', async () => {
    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });
    
    const generateBtn = screen.getByText('Generar reporte →');
    
    await act(async () => {
      fireEvent.click(generateBtn);
    });
    
    expect(generateBtn).toBeDisabled();
    
    await waitFor(() => {
      expect(generateBtn).not.toBeDisabled();
    }, { timeout: 3500 });
  });
});
