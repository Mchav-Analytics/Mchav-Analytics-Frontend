import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CentroReportesView from '../CentroReportesView';
import api, { projectService } from '../../../../services/api';

const mockUser = { id_usuario: 'U1', name: 'Admin Test', rol: 'ADMIN' };

vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ token: 'mock-token', user: mockUser }))
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: () => vi.fn()
}));

vi.mock('../../../../services/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: { get: vi.fn(), post: vi.fn(() => Promise.resolve({ data: {} })) },
    projectService: {
      getSprints: vi.fn(() => Promise.resolve([{ id_sprint: 'S1', nombre: 'Sprint 1', state: 'active' }])),
      getKpiIssuesDetail: vi.fn(() => Promise.resolve({ total_issues: 5, issues: [{}, {}, {}, {}, {}] })),
      getKpis: vi.fn(() => Promise.resolve({ metrics: { completed_sp: 20, completed_issues: 5 } })),
      getProjectBurnup: vi.fn(() => Promise.resolve([])),
      getProjectCFD: vi.fn(() => Promise.resolve({ cfd: [] }))
    }
  };
});

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

  it('can switch tabs to Historial and back to Generación', async () => {
    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });
    
    const histTab = screen.getByText('Historial');
    await act(async () => {
      fireEvent.click(histTab);
    });
    expect(screen.getByText('Consultar Historial')).toBeInTheDocument();

    const genTab = screen.getByText('Generación de Reportes');
    await act(async () => {
      fireEvent.click(genTab);
    });
    expect(screen.getByText('¿Qué quieres analizar?')).toBeInTheDocument();
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
    let resolveDetail;
    projectService.getKpiIssuesDetail.mockReturnValueOnce(
      new Promise((resolve) => { resolveDetail = resolve; })
    );

    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });
    
    const generateBtn = screen.getByText('Generar reporte →');
    fireEvent.click(generateBtn);
    expect(generateBtn).toBeDisabled();
    
    await act(async () => {
      resolveDetail({ total_issues: 5, issues: [{}, {}, {}, {}, {}] });
    });

    await waitFor(() => {
      expect(generateBtn).not.toBeDisabled();
    }, { timeout: 3500 });
  });

  it('filters general projects correctly', async () => {
    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });
    
    // Cambiar a "Resumen General"
    const generalCard = screen.getByText('Resumen General');
    await act(async () => {
      fireEvent.click(generalCard);
    });

    const searchInput = screen.getByPlaceholderText('Buscar proyecto...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Inexistente' } });
    });

    expect(screen.getByText('No se encontraron proyectos.')).toBeInTheDocument();
  });

  it('fetches history successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });
    
    const histTab = screen.getByText('Historial');
    await act(async () => {
      fireEvent.click(histTab);
    });

    // Seleccionar mes para habilitar fetch
    const monthSelects = screen.getAllByRole('combobox').filter(sel => sel.innerHTML.includes('Mes...'));
    if (monthSelects.length > 0) {
      await act(async () => {
        fireEvent.change(monthSelects[0], { target: { value: '01' } });
      });
    }

    const loadMonthBtn = screen.getByText('Cargar mes →');
    await act(async () => {
      fireEvent.click(loadMonthBtn);
    });

    expect(global.fetch).toHaveBeenCalled();
  });

  it('handles custom ranges and sprint comparisons', async () => {
    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });
    
    const histTab = screen.getByText('Historial');
    await act(async () => {
      fireEvent.click(histTab);
    });

    // Cambiar tipo de reporte a Sprint en Rango Personalizado
    const typeSelects = screen.getAllByRole('combobox');
    const rangoSelect = typeSelects.find(s => s.value === 'Resumen General' && s.nextElementSibling?.className.includes('emerald-500'));
    
    if (rangoSelect) {
      await act(async () => {
        fireEvent.change(rangoSelect, { target: { value: 'Sprint' } });
      });
    }

    // Click en "Comparar con otro Sprint"
    const compareLabel = screen.getByText('Comparar con otro Sprint');
    await act(async () => {
      fireEvent.click(compareLabel);
    });

    expect(screen.getByText('2. Sprint Base')).toBeInTheDocument();
    expect(screen.getByText('3. Sprint a Comparar')).toBeInTheDocument();
    
    // Toggle full history
    const historyLabel = screen.getByText('Consultar Historial Completo');
    await act(async () => {
      fireEvent.click(historyLabel);
    });
    
    const loadRangeBtn = screen.getByText('Consultar historial completo →');
    expect(loadRangeBtn).toBeInTheDocument();
  });

  it('renders saved reports, toggles full history view, deletes and opens a report with pagination', async () => {
    // Generate 12 mock reports to trigger totalPages > 1 pagination
    const mockReports = Array.from({ length: 12 }).map((_, i) => ({
      id: `rep-${i + 1}`,
      name: `Reporte Sprint ${i + 1}`,
      type: i % 2 === 0 ? 'Sprint' : 'Desarrollador',
      date: `2026-03-${String(i + 1).padStart(2, '0')}`,
      data: { projectName: 'MCHAV', totalIssues: 10 }
    }));
    localStorage.setItem('mchav_generated_reports', JSON.stringify(mockReports));

    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });

    const histTab = screen.getByText('Historial');
    await act(async () => {
      fireEvent.click(histTab);
    });

    expect(screen.getAllByText('Reporte de Sprint').length).toBeGreaterThanOrEqual(1);

    // Toggle full history view
    const viewAllBtn = screen.getByText(/Ver historial completo/i);
    await act(async () => {
      fireEvent.click(viewAllBtn);
    });

    const searchInput = screen.getByPlaceholderText('Buscar reporte...');
    expect(searchInput).toBeInTheDocument();

    // Test search filter in full history
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Sprint 1' } });
    });
    expect(screen.getByText('Reporte Sprint 1')).toBeInTheDocument();

    // Clear search
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '' } });
    });

    // Delete a report
    const deleteButtons = screen.getAllByTitle('Eliminar reporte del historial');
    if (deleteButtons.length > 0) {
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });
    }

    // Open a report
    const openButtons = screen.getAllByTitle('Ver / Descargar PDF');
    if (openButtons.length > 0) {
      await act(async () => {
        fireEvent.click(openButtons[0]);
      });
    }

    // Pagination: click page 2
    const page2Btn = screen.getByText('2');
    await act(async () => {
      fireEvent.click(page2Btn);
    });
    expect(page2Btn).toHaveClass('bg-indigo-600');
  });

  it('generates general live report with AI insights and handles validation error', async () => {
    api.post.mockResolvedValueOnce({
      data: { data: '## Análisis General\n\nExcelente rendimiento general del portafolio.' }
    });

    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });

    // Select "Resumen General"
    const generalCard = screen.getByText('Resumen General');
    await act(async () => {
      fireEvent.click(generalCard);
    });

    // Click Generar reporte
    const generateBtn = screen.getByText('Generar reporte →');
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/v1/ai/generate-report-insights',
        expect.objectContaining({ reportType: 'general' })
      );
    });
  });

  it('generates developer report with AI insights', async () => {
    api.post.mockResolvedValueOnce({
      data: { data: '## Desempeño del Desarrollador\n\nAlta velocidad y calidad técnica.' }
    });

    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });

    // Select "Desarrollador"
    const devCard = screen.getByText('Desarrollador');
    await act(async () => {
      fireEvent.click(devCard);
    });

    // Select developer
    const devSelect = screen.getByDisplayValue('Selecciona un desarrollador...');
    await act(async () => {
      fireEvent.change(devSelect, { target: { value: 'U1' } });
    });

    // Click Generar reporte
    const generateBtn = screen.getByText('Generar reporte →');
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/v1/ai/generate-report-insights',
        expect.objectContaining({ reportType: 'desarrollador' })
      );
    });
  });

  it('shows validation error when records are below minimum required', async () => {
    projectService.getKpiIssuesDetail.mockResolvedValueOnce({
      total_issues: 1,
      issues: [{}]
    });

    await act(async () => {
      render(<CentroReportesView selectedProjectId="PROJ-01" />);
    });

    const generateBtn = screen.getByText('Generar reporte →');
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('¡Ups! Datos insuficientes')).toBeInTheDocument();
    });
  });
});
