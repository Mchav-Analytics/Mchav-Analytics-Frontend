import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DynamicAIReportTemplate from '../DynamicAIReportTemplate';

describe('DynamicAIReportTemplate component', () => {
  it('renders report cover and metadata for sprint report with aiInsights markdown and charts', () => {
    const ref = createRef();
    const markdownSample = `
# 01 - Resumen Ejecutivo
El rendimiento del sprint fue favorable en todas las dimensiones.
[GRÁFICA_BURNUP]
[GRÁFICA_VELOCIDAD]
[GRÁFICA_FLUJO]
[GRÁFICA_PREDICTIBILIDAD]

# 08 - Conclusiones Finales y Veredicto
Evaluación general del cierre.
`;

    render(
      <DynamicAIReportTemplate
        ref={ref}
        reportType="sprint"
        user={{ nombre: 'Laura Dev', rol: 'DEVELOPER' }}
        aiInsights={{ markdown: markdownSample }}
        reportData={{
          projectName: 'MCHAV Analytics',
          sprintName: 'Sprint 24',
          dates: '01 Mar - 15 Mar 2026',
          totalIssues: 18,
          kpis: {
            metrics: {
              completed_sp: 45,
              completed_issues: 18,
              avg_cycle_time: 3.8,
              bugs_count: 0,
              blocked_days: 1
            }
          },
          realBurnupData: [{ fecha_real: '2026-03-01', alcance_total: 45, trabajo_completado: 15, ritmo_ideal: 15 }],
          realCfdData: [{ fecha_real: '2026-03-01', por_hacer: 10, en_progreso: 5, completado: 5 }],
          realVelocityData: [{ sprint: 'Sprint 24', comprometido: 45, completado: 40 }],
          percentilesData: { p85: 6.0, p95: 9.0, scatterPoints: [{ x: 1, y: 3.5 }] }
        }}
      />
    );

    expect(screen.getAllByText(/MCHAV Analytics/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Sprint 24/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Laura Dev/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/SPRINT CUMPLIDO/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders developer report with dev placeholders and scorecards', () => {
    const ref = createRef();
    const markdownSample = `
# 01 - Rendimiento Técnico Individual
Análisis del desarrollador.
[GRÁFICA_VELOCIDAD]
[GRÁFICA_FLUJO]
[GRAFICA_VELOCIDAD_DEV]
[GRAFICA_RADAR]
[GRAFICA_TIPO_TAREAS]
[TABLA_DISTRIBUCION]
[PLAN_MEJORA]
`;

    render(
      <DynamicAIReportTemplate
        ref={ref}
        reportType="desarrollador"
        user={{ name: 'Admin Leader', rol: 'ADMIN' }}
        aiInsights={{ markdown: markdownSample }}
        reportData={{
          projectName: 'Finanzas Core',
          targetName: 'Carlos Senior',
          dates: 'Febrero 2026',
          totalIssues: 12,
          kpis: {
            metrics: {
              completed_sp: 30,
              completed_issues: 8,
              avg_cycle_time: 5.5,
              bugs_count: 2,
              blocked_days: 0
            }
          },
          realVelocityData: [
            { sprint: 'Sprint 1', comprometido: 20, completado: 18 },
            { sprint: 'Sprint 2', comprometido: 25, completado: 22 }
          ]
        }}
      />
    );

    expect(screen.getAllByText(/Carlos Senior/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/EVALUACIÓN DE DESEMPEÑO/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Generar plan de mejora')).toBeDefined();
  });

  it('renders project report with fallback message when aiInsights is missing', () => {
    const ref = createRef();
    render(
      <DynamicAIReportTemplate
        ref={ref}
        reportType="proyecto"
        user={{ email: 'lead@mchav.com' }}
        reportData={{
          projectName: 'Proyecto Global',
          pointsCompleted: 20
        }}
      />
    );

    expect(screen.getAllByText(/Proyecto Global/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Generando análisis inteligente/i).length).toBeGreaterThanOrEqual(1);
  });
});
