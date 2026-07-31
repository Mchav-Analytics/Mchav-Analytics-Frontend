import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportsView from '../ReportsView';

describe('ReportsView Component', () => {
  const mockProjects = [
    { id_proyecto: '10033', key_proyecto: 'PASD', nombre: 'Prueba ASD' },
    { id_proyecto: '10034', key_proyecto: 'MCHAV', nombre: 'MCHAV Analytics' }
  ];

  it('renders parameters, metrics, performance trends and download history', () => {
    render(<ReportsView projects={mockProjects} isDarkMode={true} />);

    // Verify main section headers are present
    expect(screen.getByText('Parámetros del reporte')).toBeDefined();
    expect(screen.getByText('Métricas consolidadas')).toBeDefined();
    expect(screen.getByText('Tendencias de rendimiento')).toBeDefined();
    expect(screen.getByText('Historial de descargas')).toBeDefined();
  });

  it('triggers preview modal when clicking preview button', () => {
    render(<ReportsView projects={mockProjects} isDarkMode={true} />);

    const previewButton = screen.getByRole('button', { name: /Vista previa/i });
    expect(previewButton).toBeDefined();

    fireEvent.click(previewButton);

    expect(screen.getByText('Vista previa del reporte')).toBeDefined();
  });
});
