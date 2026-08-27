import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CentroReportesView from '../CentroReportesView';
import api from '../../../../services/api';

vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ token: 'mock-token' }))
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: () => vi.fn()
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
    render(<CentroReportesView selectedProjectId="PROJ-01" />);
    
    expect(screen.getByText('Centro de Reportes')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects');
      expect(api.get).toHaveBeenCalledWith('/api/v1/users');
    });
  });

  it('can switch tabs to Historial', () => {
    render(<CentroReportesView selectedProjectId="PROJ-01" />);
    
    const histTab = screen.getByText('Historial Inmutable');
    fireEvent.click(histTab);
    
    expect(screen.getByText('Reconstruir Histórico')).toBeInTheDocument();
  });

  it('can change report type to developer and load users', async () => {
    render(<CentroReportesView selectedProjectId="PROJ-01" />);
    
    // Click on "Desarrollador" card
    const devCard = screen.getByText('Desarrollador');
    fireEvent.click(devCard);
    
    await waitFor(() => {
      expect(screen.getByText('Selecciona un desarrollador...')).toBeInTheDocument();
    });
  });

  it('triggers fake live report generation', async () => {
    render(<CentroReportesView selectedProjectId="PROJ-01" />);
    
    const generateBtn = screen.getByText('Generar reporte →');
    fireEvent.click(generateBtn);
    
    expect(generateBtn).toBeDisabled();
    
    await waitFor(() => {
      expect(generateBtn).not.toBeDisabled();
    }, { timeout: 3000 });
  });
});
