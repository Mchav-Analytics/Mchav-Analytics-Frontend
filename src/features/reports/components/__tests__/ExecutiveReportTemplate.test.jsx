import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExecutiveReportTemplate from '../ExecutiveReportTemplate';

describe('ExecutiveReportTemplate component', () => {
  it('renders default executive report with fallback metrics and charts', () => {
    const ref = createRef();
    render(
      <ExecutiveReportTemplate
        ref={ref}
        reportType="general"
        filters={{}}
        user={{ name: 'Admin', email: 'admin@mchav.com' }}
        reportData={{
          projectName: 'Proyecto Demo',
          sprintName: 'Sprint 10',
          kpis: {
            metrics: {
              completed_sp: 35,
              completed_issues: 12,
              avg_cycle_time: 4.2,
              bugs_count: 2
            }
          }
        }}
        aiInsights={{
          predictabilityConclusion: 'El sprint avanzó a buen ritmo con cumplimiento del 90% del alcance.',
          valueDelivery: 'Entrega sostenida de alto valor para el negocio.'
        }}
      />
    );

    expect(screen.getAllByText(/INFORME EJECUTIVO DE RENDIMIENTO/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Proyecto Demo/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Sprint 10/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('35').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('12').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/El sprint avanzó a buen ritmo/i)).toBeInTheDocument();
  });

  it('renders with real charts data when provided', () => {
    const ref = createRef();
    render(
      <ExecutiveReportTemplate
        ref={ref}
        reportType="general"
        user={{ name: 'Scrum Master' }}
        reportData={{
          projectName: 'Proyecto Alpha',
          pointsCompleted: 40,
          totalIssues: 15,
          avgCycleTime: 3.5,
          bugs: 1,
          realBurnupData: [
            { fecha_real: '2026-03-01', alcance_total: 40, trabajo_completado: 10, ritmo_ideal: 10 }
          ],
          realCfdData: [
            { fecha_real: '2026-03-01', por_hacer: 5, en_progreso: 5, completado: 5 }
          ],
          realScatterData: [
            { id: 1, cycleTime: 2.5, type: 'Story' }
          ]
        }}
      />
    );

    expect(screen.getAllByText(/Proyecto Alpha/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders developer report type with history table and metrics', () => {
    const ref = createRef();
    render(
      <ExecutiveReportTemplate
        ref={ref}
        reportType="desarrollador"
        user={{ name: 'Líder Técnico' }}
        reportData={{
          targetName: 'Carlos Ruiz',
          developerName: 'Carlos Ruiz',
          pointsCompleted: 28,
          totalIssues: 9,
          avgCycleTime: 2.8,
          historyData: [
            { sprintName: 'Sprint 1', ticketsCompletados: 5, cycleTime: 3.0, planned: 15, completed: 15 },
            { sprintName: 'Sprint 2', ticketsCompletados: 4, cycleTime: 2.5, planned: 13, completed: 13 }
          ]
        }}
        aiInsights={{
          executiveSummary: 'Desempeño consistente y excelente calidad de código.'
        }}
      />
    );

    expect(screen.getAllByText(/INFORME EJECUTIVO DE DESARROLLADOR/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Carlos Ruiz/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders sprint report type with sprint metrics and conclusions', () => {
    const ref = createRef();
    render(
      <ExecutiveReportTemplate
        ref={ref}
        reportType="sprint"
        user={{ name: 'Valentina' }}
        reportData={{
          projectName: 'Proyecto Beta',
          sprintName: 'Sprint 4',
          pointsCompleted: 50,
          totalIssues: 20,
          avgCycleTime: 3.1,
          sprintHealth: 92
        }}
        aiInsights={{
          cfdFinding: 'Flujo continuo sin acumulación en QA.'
        }}
      />
    );

    expect(screen.getAllByText(/REPORTE EJECUTIVO DE SPRINT/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Flujo continuo/i)).toBeInTheDocument();
  });
});
