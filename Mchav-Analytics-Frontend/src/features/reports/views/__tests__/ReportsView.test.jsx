import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportsView from '../ReportsView';
import { projectService, reportService } from '../../../../services/api';

// Mock the services
vi.mock('../../../../services/api', () => {
  return {
    projectService: {
      getProjects: vi.fn(() => Promise.resolve([
        { id_proyecto: '10033', key_proyecto: 'PASD', nombre: 'Prueba ASD' },
        { id_proyecto: '10034', key_proyecto: 'MCHAV', nombre: 'MCHAV Analytics' }
      ]))
    },
    reportService: {
      downloadPdfReport: vi.fn(() => Promise.resolve(new Blob(['dummy'], { type: 'application/pdf' })))
    }
  };
});

describe('ReportsView Component', () => {
  it('renders filters, projects dropdown, dates and PDF preview correctly', async () => {
    render(<ReportsView isDarkMode={true} />);

    // Verify view sub-header is present
    expect(screen.getByText('Métricas Consolidadas en Reporte')).toBeDefined();
    
    // Wait for projects list to load and select first option
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeDefined();
    });

    const select = screen.getByRole('combobox');
    expect(select.children.length).toBe(2);
    expect(screen.getByText('Prueba ASD (PASD)')).toBeDefined();
    expect(screen.getByText('MCHAV Analytics (MCHAV)')).toBeDefined();

    // Verify date inputs are present with default values
    // In jsdom inputs of type date are sometimes treated differently, let's verify by labels
    expect(screen.getByLabelText(/inicio/i)).toBeDefined();
    expect(screen.getByLabelText(/fin/i)).toBeDefined();

    // Verify PDF Mockup preview details are visible
    expect(screen.getByText(/Tendencias de Rendimiento/i)).toBeDefined();
    expect(screen.getByText('Throughput (Sprint Deliveries)')).toBeDefined();
    expect(screen.getByText('21.5 issues')).toBeDefined();
  });

  it('triggers PDF download when clicking download button', async () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const createMock = vi.fn(() => 'blob:dummy');
    const revokeMock = vi.fn();
    global.URL.createObjectURL = createMock;
    global.URL.revokeObjectURL = revokeMock;

    render(<ReportsView isDarkMode={true} />);

    // Wait for projects load
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeDefined();
    });

    const downloadButton = screen.getByRole('button', { name: /Generar y Descargar/i });
    expect(downloadButton).toBeDefined();

    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(reportService.downloadPdfReport).toHaveBeenCalled();
    });
  });
});
