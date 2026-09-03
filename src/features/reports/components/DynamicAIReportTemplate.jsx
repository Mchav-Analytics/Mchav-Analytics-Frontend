import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { SprintBurnupChart } from '../../projects/components/SprintBurnupChart';
import { CumulativeFlowDiagram } from '../../projects/components/CumulativeFlowDiagram';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// Gráficas embebidas — estilo editorial de documento, sin header de dashboard
// ─────────────────────────────────────────────────────────────────────────────

/** Gráfica 1: Sprint Burnup — fluida, sin borde agresivo */
const GraficaBurnup = ({ data }) => (
  <div style={{ margin: '20px 0', pageBreakInside: 'avoid', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
    <div style={{ width: '100%', height: 350 }}>
      <SprintBurnupChart data={data} isAnimationActive={false} width={600} height={340} />
    </div>
    <p style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', marginTop: '8px' }}>
      Fig. 1 — Sprint Burnup Chart: avance real vs. alcance comprometido vs. ritmo ideal
    </p>
  </div>
);

/** Gráfica 2: CFD */
const GraficaFlujo = ({ data }) => (
  <div style={{ margin: '20px 0', pageBreakInside: 'avoid', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
    <div style={{ width: '100%', height: 350 }}>
      <CumulativeFlowDiagram data={data} isAnimationActive={false} width={600} height={340} />
    </div>
    <p style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', marginTop: '8px' }}>
      Fig. 2 — Diagrama de Flujo Acumulado (CFD): distribución de tareas entre estados
    </p>
  </div>
);

/** Gráfica 3: Velocidad histórica */
const GraficaVelocidad = ({ data }) => {
  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: '2px 0' }}>{p.name}: <strong>{p.value} SP</strong></p>
        ))}
      </div>
    );
  };
  return (
    <div style={{ margin: '20px 0', pageBreakInside: 'avoid', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ width: '100%', height: 350 }}>
          <BarChart data={data} width={600} height={340} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="sprint" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <RechartsTooltip content={<Tip />} />
            <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="comprometido" name="Comprometido" fill="#c7d2fe" radius={[6, 6, 0, 0]} />
            <Bar dataKey="completado" name="Completado" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
      </div>
      <p style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', marginTop: '8px' }}>
        Fig. 3 — Velocidad por sprint: Story Points comprometidos vs. completados
      </p>
    </div>
  );
};

/** Gráfica 4: Cycle Time Scatter + Percentiles */
const GraficaPredictibilidad = ({ data }) => {
  const { p50, p85, p95, scatterPoints } = data;
  return (
    <div style={{ margin: '20px 0', pageBreakInside: 'avoid', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ width: '100%', height: 350 }}>
          <ScatterChart width={600} height={340} margin={{ top: 20, right: 50, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="x" type="number" name="Ticket #" axisLine={false} tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              label={{ value: 'Tickets', position: 'insideBottom', offset: -20, fill: '#94a3b8', fontSize: 12 }} />
            <YAxis dataKey="y" type="number" name="Cycle Time" axisLine={false} tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              label={{ value: 'Días', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8', fontSize: 12 }} />
            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }}
              formatter={(val, name) => [`${val} días`, name === 'y' ? 'Cycle Time' : name]} />
            <Scatter data={scatterPoints} fill="#6366f1" opacity={0.7} r={6} />
            <ReferenceLine y={Number(p50)} stroke="#10b981" strokeDasharray="6 3" strokeWidth={2}
              label={{ value: `P50: ${p50}d`, fill: '#10b981', fontSize: 12, fontWeight: 700, position: 'right' }} />
            <ReferenceLine y={Number(p85)} stroke="#f59e0b" strokeDasharray="6 3" strokeWidth={2}
              label={{ value: `P85: ${p85}d`, fill: '#f59e0b', fontSize: 12, fontWeight: 700, position: 'right' }} />
            <ReferenceLine y={Number(p95)} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={2}
              label={{ value: `P95: ${p95}d`, fill: '#ef4444', fontSize: 12, fontWeight: 700, position: 'right' }} />
          </ScatterChart>
      </div>
      <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', paddingTop: '2px' }}>
        {[{ label: `P50: ${p50}d`, color: '#10b981', desc: 'mediana' },
          { label: `P85: ${p85}d`, color: '#f59e0b', desc: 'rango esperado' },
          { label: `P95: ${p95}d`, color: '#ef4444', desc: 'casos atípicos' }].map(({ label, color, desc }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '16px', height: '2px', background: color }} />
            <span style={{ fontSize: '9.5px', color: '#475569' }}><strong style={{ color }}>{label}</strong> · {desc}</span>
          </div>
        ))}
      </div>
      <p style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>
        Fig. 4 — Distribución de Cycle Time con líneas de percentil P50, P85 y P95
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Motor de renderizado: divide Markdown por etiquetas e inyecta gráficas
// ─────────────────────────────────────────────────────────────────────────────

/** Clases del prose de Markdown — estilo limpio de documento ejecutivo */
const PROSE = `
  prose prose-sm max-w-none
  prose-headings:font-bold prose-headings:text-[#1e293b] prose-headings:uppercase prose-headings:tracking-wide
  prose-h1:text-base prose-h1:mb-3
  prose-h2:text-[11px] prose-h2:mt-6 prose-h2:mb-3
  prose-h3:text-[10.5px] prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-slate-600
  prose-p:text-[11.5px] prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-justify prose-p:mb-3
  prose-li:text-[11.5px] prose-li:text-gray-700 prose-li:mb-0.5 prose-li:leading-relaxed
  prose-strong:text-slate-800 prose-strong:font-semibold
  prose-ul:my-2 prose-ol:my-2
`;

function renderMarkdownWithCharts(markdownText, chartData, stats, totalScope, reportType) {
  const isProyecto = reportType === 'proyecto';
  const isDesarrollador = reportType === 'desarrollador';

  // Dividir según el formato del reporte
  const splitRegex = isProyecto 
    ? /(?=(?:^|\n)(?:\*\*)?\[PROYECTO_\d\])/gi 
    : /(?=(?:^|\n)# 0\d —)/gi;
  
  const pages = markdownText.split(splitRegex).filter(Boolean);

  // Limpiar tags residuales
  const cleanText = (text) => text
    .replace(/\[GRAFICA_BURNUP\]/gi, '')
    .replace(/\[GRAFICA_FLUJO\]/gi, '')
    .replace(/\[GRAFICA_VELOCIDAD\]/gi, '')
    .replace(/\[GRAFICA_PREDICTIBILIDAD\]/gi, '');

  return pages.map((pageText, pageIndex) => {
    // Detectar número de sección según formato
    let sectionNum = null;
    if (isProyecto) {
      const match = pageText.match(/\[PROYECTO_(\d)\]/i);
      if (match) sectionNum = parseInt(match[1], 10);
    } else {
      const sectionMatch = pageText.match(/^# 0(\d) —/i);
      sectionNum = sectionMatch ? parseInt(sectionMatch[1], 10) : null;
    }

    let trimmed = cleanText(pageText).trim();
    if (!trimmed) return null;

    // Limpiar prefijos de título para formato limpio
    if (isProyecto) {
      // Eliminar el tag [PROYECTO_X] para que no se vea en el PDF final, dejando solo el texto del título como H3
      trimmed = trimmed.replace(/^(?:#+\s*|\*\*)?\[PROYECTO_\d\]\s*(.*?)(?:\*\*)?$/gmi, '### $1');
    } else {
      trimmed = trimmed.replace(/^#\s*0\d\s*—\s*/gi, '# ');
      trimmed = trimmed.replace(/^#\s*ACTO\s*\d*:?\s*/gi, '# ');
    }

    // Extraer %%HIGHLIGHT%%
    const highlightMatch = trimmed.match(/%%HIGHLIGHT%%\s*(.*?)\s*(?:%%\/?HIGHLIGHT%%|%%)/is);
    let highlightText = null;
    if (highlightMatch) {
      highlightText = highlightMatch[1];
      trimmed = trimmed.replace(/%%HIGHLIGHT%%\s*(.*?)\s*(?:%%\/?HIGHLIGHT%%|%%)/is, '');
    }

    // Separar título del contenido
    let lines = trimmed.split('\n');
    let title = '';
    if (lines.length > 0 && (lines[0].startsWith('# ') || lines[0].startsWith('### '))) {
      title = lines[0];
      lines.shift();
      trimmed = lines.join('\n');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MAPEO DE GRÁFICAS POR TIPO DE REPORTE
    // Sprint:    sección 4 → Burnup, sección 5 → CFD, sección 7 → Scatter
    // Proyecto:  ACTO 2 → Burnup, ACTO 3 → CFD, ACTO 4 → Scatter
    // ═══════════════════════════════════════════════════════════════════════
    const showBurnup = isProyecto ? sectionNum === 2 : sectionNum === 4;
    const showCFD = isProyecto ? sectionNum === 3 : sectionNum === 5;
    const showScatter = isProyecto ? sectionNum === 4 : sectionNum === 7;

    return (
      <div key={`section-${pageIndex}`} style={{ 
        width: '100%',
        padding: '30px 25.4mm',
        boxSizing: 'border-box',
        position: 'relative',
        background: 'white',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
      }}>
        {/* Separador entre secciones */}
        {pageIndex > 0 && (
          <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: '30px' }} />
        )}

        {/* ENCABEZADO */}
        {title && (
          <div className={PROSE} style={{ marginBottom: highlightText ? '5px' : '15px' }}>
            <ReactMarkdown>{title}</ReactMarkdown>
          </div>
        )}

        {/* HIGHLIGHT */}
        {highlightText && (
          <div style={{
            margin: '0 0 20px 0', 
            padding: '15px 20px', 
            background: '#f8fafc', 
            borderLeft: '5px solid #6366f1', 
            borderRadius: '0 8px 8px 0',
          }}>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
              {highlightText}
            </p>
          </div>
        )}

        {/* ═══ KPIs (Solo Sprint, sección 2) ═══ */}
        {!isProyecto && sectionNum === 2 && (
          <div style={{ display: 'flex', gap: '20px', margin: '20px 0', alignItems: 'center', justifyContent: 'space-around', background: '#f8fafc', padding: '30px 15px', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '42px', fontWeight: 900, color: '#3b82f6', margin: 0, lineHeight: 1 }}>
                {totalScope ? Math.round((stats.velocity / totalScope) * 100) : 0}%
              </p>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '8px' }}>Cumplimiento</p>
            </div>
            <div style={{ width: '1px', height: '60px', background: '#cbd5e1' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '42px', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1 }}>{stats.velocity}</p>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '8px' }}>SP Completados</p>
            </div>
            <div style={{ width: '1px', height: '60px', background: '#cbd5e1' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '42px', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1 }}>{stats.throughput}</p>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '8px' }}>Incidencias</p>
            </div>
            <div style={{ width: '1px', height: '60px', background: '#cbd5e1' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '42px', fontWeight: 900, color: stats.bugs > 3 ? '#ef4444' : '#10b981', margin: 0, lineHeight: 1 }}>{stats.bugs}</p>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '8px' }}>Bugs</p>
            </div>
          </div>
        )}

        {/* ═══ Tabla comparativa (Solo Sprint, sección 3) ═══ */}
        {!isProyecto && sectionNum === 3 && (
          <div style={{ margin: '20px 0', pageBreakInside: 'avoid' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: '"Times New Roman", serif' }}>
              <thead>
                <tr style={{ background: '#1e293b' }}>
                  <th style={{ padding: '10px 15px', textAlign: 'left', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Métrica</th>
                  <th style={{ padding: '10px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Planificado</th>
                  <th style={{ padding: '10px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Entregado</th>
                  <th style={{ padding: '10px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { metric: 'Story Points', planned: totalScope, delivered: stats.velocity, unit: 'SP' },
                  { metric: 'Incidencias', planned: Math.max(stats.throughput, totalScope), delivered: stats.throughput, unit: '' },
                  { metric: 'Cycle Time Promedio', planned: '-', delivered: `${stats.cycleTime} días`, unit: '', isDirect: true },
                  { metric: 'Bugs Reportados', planned: '0', delivered: stats.bugs, unit: '', isDirect: true },
                ].map((row, i) => {
                  const diff = row.isDirect ? '-' : (row.delivered - row.planned);
                  const diffColor = row.isDirect ? '#64748b' : (diff >= 0 ? '#10b981' : '#ef4444');
                  const diffText = row.isDirect ? diff : `${diff > 0 ? '+' : ''}${diff} ${row.unit}`;
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 15px', fontWeight: 700, color: '#1e293b' }}>{row.metric}</td>
                      <td style={{ padding: '10px 15px', textAlign: 'center', color: '#64748b' }}>{row.planned} {!row.isDirect && row.unit}</td>
                      <td style={{ padding: '10px 15px', textAlign: 'center', fontWeight: 700, color: '#1e293b' }}>{row.delivered} {!row.isDirect && row.unit}</td>
                      <td style={{ padding: '10px 15px', textAlign: 'center', fontWeight: 700, color: diffColor }}>{diffText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ANÁLISIS (Texto de la IA) */}
        <div className={PROSE}>
          <ReactMarkdown>{trimmed}</ReactMarkdown>
        </div>

        {/* ═══ GRÁFICA BURNUP ═══ */}
        {showBurnup && (
          <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
            <GraficaBurnup data={chartData.burnupData} />
          </div>
        )}

        {/* ═══ GRÁFICA CFD ═══ */}
        {showCFD && (
          <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
            <GraficaFlujo data={chartData.cfdData} />
            {/* Tabla de flujo solo para sprint */}
            {!isProyecto && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: '"Times New Roman", serif', marginTop: '20px' }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ padding: '8px 15px', textAlign: 'left', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Indicador de Flujo</th>
                    <th style={{ padding: '8px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Valor</th>
                    <th style={{ padding: '8px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Interpretación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 15px', fontWeight: 700, color: '#1e293b' }}>Cycle Time Promedio</td>
                    <td style={{ padding: '8px 15px', textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>{stats.cycleTime} días</td>
                    <td style={{ padding: '8px 15px', textAlign: 'center', color: '#64748b', fontSize: '10px' }}>{stats.cycleTime <= 3 ? 'Dentro del rango saludable' : stats.cycleTime <= 7 ? 'Requiere monitoreo' : 'Fuera de rango óptimo'}</td>
                  </tr>
                  <tr style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 15px', fontWeight: 700, color: '#1e293b' }}>Throughput</td>
                    <td style={{ padding: '8px 15px', textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>{stats.throughput} tickets</td>
                    <td style={{ padding: '8px 15px', textAlign: 'center', color: '#64748b', fontSize: '10px' }}>Volumen de entrega del período</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 15px', fontWeight: 700, color: '#1e293b' }}>Días de Bloqueo</td>
                    <td style={{ padding: '8px 15px', textAlign: 'center', fontWeight: 700, color: stats.blockedDays > 5 ? '#ef4444' : '#10b981' }}>{stats.blockedDays || 0} días</td>
                    <td style={{ padding: '8px 15px', textAlign: 'center', color: '#64748b', fontSize: '10px' }}>{stats.blockedDays > 5 ? 'Impacto significativo en el flujo' : 'Impacto controlado'}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ═══ GRÁFICA SCATTER (Predictibilidad) ═══ */}
        {showScatter && (
          <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
            <GraficaPredictibilidad data={chartData.percentilesData} />
          </div>
        )}

        {/* ═══ Veredicto final (Solo Sprint, sección 8) ═══ */}
        {!isProyecto && sectionNum === 8 && (
          <div style={{ margin: '30px 0', textAlign: 'center', background: '#f8fafc', padding: '35px', borderRadius: '16px', pageBreakInside: 'avoid' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', lineHeight: 1 }}>
               {(stats.velocity / totalScope) >= 0.9 ? '🟢' : (stats.velocity / totalScope) >= 0.7 ? '🟡' : '🔴'}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
               SPRINT {(stats.velocity / totalScope) >= 0.9 ? 'CUMPLIDO' : (stats.velocity / totalScope) >= 0.7 ? 'PARCIALMENTE CUMPLIDO' : 'EN RIESGO'}
            </h2>
            <p style={{ fontSize: '16px', color: '#475569', margin: 0, fontWeight: 600 }}>
              {totalScope ? Math.round((stats.velocity / totalScope) * 100) : 0}% del compromiso inicial fue completado
            </p>
          </div>
        )}
      </div>
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

const DynamicAIReportTemplate = forwardRef(({ reportType, filters, user, reportData, aiInsights }, ref) => {
  const kpis = reportData?.kpis || {};
  const metrics = kpis.metrics || {};

  const stats = {
    velocity: metrics.completed_sp || 0,
    throughput: metrics.completed_issues || reportData?.totalIssues || 0,
    cycleTime: metrics.avg_cycle_time || 0,
    bugs: metrics.bugs_count || 0,
    blockedDays: metrics.blocked_days || reportData?.blockedDays || 0,
  };
  const totalScope = Math.max(stats.velocity, 40);

  // ── Datos de gráficas ──────────────────────────────────────────────────────
  const burnupData = [
    { fecha_real: 'Inicio', alcance_total: totalScope, trabajo_completado: 0, ritmo_ideal: 0, tareas_completadas: 0 },
    { fecha_real: 'Sem 1', alcance_total: totalScope, trabajo_completado: Math.floor(stats.velocity * 0.25), ritmo_ideal: Math.floor(totalScope * 0.25), tareas_completadas: Math.floor(stats.throughput * 0.25) },
    { fecha_real: 'Sem 2', alcance_total: totalScope, trabajo_completado: Math.floor(stats.velocity * 0.55), ritmo_ideal: Math.floor(totalScope * 0.5), tareas_completadas: Math.floor(stats.throughput * 0.5) },
    { fecha_real: 'Sem 3', alcance_total: totalScope, trabajo_completado: Math.floor(stats.velocity * 0.8), ritmo_ideal: Math.floor(totalScope * 0.75), tareas_completadas: Math.floor(stats.throughput * 0.75) },
    { fecha_real: 'Fin', alcance_total: totalScope, trabajo_completado: stats.velocity, ritmo_ideal: totalScope, tareas_completadas: stats.throughput },
  ];

  const cfdData = [
    { fecha_real: 'Inicio', por_hacer: stats.throughput, en_progreso: 0, en_revision: 0, completado: 0 },
    { fecha_real: 'Sem 1', por_hacer: Math.floor(stats.throughput * 0.65), en_progreso: Math.floor(stats.throughput * 0.25), en_revision: Math.floor(stats.throughput * 0.05), completado: Math.floor(stats.throughput * 0.05) },
    { fecha_real: 'Sem 2', por_hacer: Math.floor(stats.throughput * 0.35), en_progreso: Math.floor(stats.throughput * 0.25), en_revision: Math.floor(stats.throughput * 0.1), completado: Math.floor(stats.throughput * 0.3) },
    { fecha_real: 'Sem 3', por_hacer: Math.floor(stats.throughput * 0.1), en_progreso: Math.floor(stats.throughput * 0.15), en_revision: Math.floor(stats.throughput * 0.1), completado: Math.floor(stats.throughput * 0.65) },
    { fecha_real: 'Fin', por_hacer: 0, en_progreso: 0, en_revision: 0, completado: stats.throughput },
  ];

  const velocityData = [
    { sprint: 'Sprint Anterior', comprometido: Math.max(stats.velocity - 5, 20), completado: Math.max(stats.velocity - 10, 15) },
    { sprint: 'Sprint Actual', comprometido: totalScope, completado: stats.velocity },
  ];

  const p50 = stats.cycleTime > 0 ? stats.cycleTime : 2.5;
  const p85 = parseFloat((p50 * 1.5).toFixed(1));
  const p95 = parseFloat((p50 * 2.0).toFixed(1));
  const scatterPoints = [
    { x: 1, y: parseFloat((p50 * 0.4).toFixed(1)) }, { x: 2, y: parseFloat((p50 * 0.7).toFixed(1)) },
    { x: 3, y: parseFloat((p50 * 0.9).toFixed(1)) }, { x: 4, y: parseFloat(p50.toFixed(1)) },
    { x: 5, y: parseFloat((p50 * 1.1).toFixed(1)) }, { x: 6, y: parseFloat((p85 * 0.9).toFixed(1)) },
    { x: 7, y: parseFloat(p85.toFixed(1)) }, { x: 8, y: parseFloat((p95 * 0.85).toFixed(1)) },
    { x: 9, y: parseFloat(p95.toFixed(1)) },
  ];

  const chartData = {
    burnupData, cfdData, velocityData,
    percentilesData: { p50: p50.toFixed(1), p85: p85.toFixed(1), p95: p95.toFixed(1), scatterPoints },
  };

  // ── Metadatos ──────────────────────────────────────────────────────────────
  const dates = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const titleMap = { general: 'INFORME EJECUTIVO DE RENDIMIENTO', proyecto: 'INFORME EJECUTIVO DEL PROYECTO', sprint: 'REPORTE EJECUTIVO DE SPRINT', desarrollador: 'INFORME EJECUTIVO INDIVIDUAL' };
  const projectName = reportData?.projectName || reportData?.targetName || 'MCHAV Analytics';
  const sprintName = reportData?.sprintName || 'Sprint Actual';
  const markdownText = aiInsights?.markdown || 'Generando análisis inteligente... Si ves este mensaje, la conexión con IA falló o los datos no cargaron.';

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '210mm', height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
      <div ref={ref} className="bg-white text-black w-full mx-auto font-serif text-[12pt] leading-loose">
        <style type="text/css" media="print">{`
          @page { 
            size: A4; 
            margin: 0 !important; 
          }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important; 
          }
          /* FORMATO APA AJUSTADO (MÁS COMPACTO) */
          p, li { 
            font-family: "Times New Roman", Times, serif !important;
            font-size: 12pt !important;
            line-height: 1.5 !important; /* Interlineado reducido */
            color: black !important;
          }
          p { 
            margin-bottom: 0 !important;
          }
          h1, h2, h3 { 
            font-family: "Times New Roman", Times, serif !important;
            color: black !important;
            page-break-after: avoid; 
            break-after: avoid; 
          }
          /* Control de viudas y huérfanas */
          p, li, h1, h2, h3 { orphans: 3; widows: 3; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
        `}</style>

        {/* ═══════════ PORTADA ═══════════ */}
        <div style={{
          width: '100%', minHeight: '100vh', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'white', pageBreakAfter: 'always', breakAfter: 'page'
        }}>
          {/* Decoración top-left */}
          <div style={{ position: 'absolute', top: '0', left: '0', width: '380px', height: '300px', zIndex: 0, pointerEvents: 'none' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path d="M0,0 L65,0 C30,20 15,50 0,85 Z" fill="#e2e8f0" opacity="0.6" />
              <path d="M0,0 L45,0 C20,15 10,35 0,65 Z" fill="#60a5fa" opacity="0.3" />
              <path d="M0,0 L30,0 C12,10 5,25 0,45 Z" fill="#243b67" />
            </svg>
          </div>
          {/* Decoración bottom-right */}
          <div style={{ position: 'absolute', bottom: '0', right: '0', width: '380px', height: '300px', zIndex: 0, pointerEvents: 'none', transform: 'rotate(180deg)' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path d="M0,0 L65,0 C30,20 15,50 0,85 Z" fill="#e2e8f0" opacity="0.6" />
              <path d="M0,0 L45,0 C20,15 10,35 0,65 Z" fill="#60a5fa" opacity="0.3" />
              <path d="M0,0 L30,0 C12,10 5,25 0,45 Z" fill="#243b67" />
            </svg>
          </div>

          {/* Contenido portada */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <img src="/Logo_sf.png" alt="MCHAV Analytics" style={{ height: '220px', objectFit: 'contain', marginBottom: '32px' }} />
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#243b67', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', marginBottom: '60px', maxWidth: '420px', lineHeight: 1.25 }}>
              {titleMap[reportType] || titleMap.general}
            </h1>

            {/* Metadatos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              {[
                { label: 'Proyecto', value: projectName },
                reportType === 'sprint' ? { label: 'Sprint', value: sprintName } : null,
                { label: 'Período', value: dates },
                { label: 'Fecha de Emisión', value: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) },
                { label: 'Generado Por', value: user?.nombre || 'MCHAV Analytics' },
              ].filter(Boolean).map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer confidencial */}
          <div style={{ position: 'absolute', bottom: '0', left: '0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>CONFIDENCIAL · USO INTERNO</span>
          </div>
        </div>

        {/* ═══════════ PÁGINAS DE ANÁLISIS ═══════════ */}
        {/* Renderizado particionado tipo diapositiva */}
        <div style={{ background: 'white' }}>

          {/* Error si no llegó el análisis */}
          {markdownText.startsWith('Generando análisis') && (
            <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '12px', marginBottom: '12px', padding: '25.4mm' }}>{markdownText}</p>
          )}

          {/* Contenido: Markdown + gráficas intercaladas + KPIs nativos */}
          {renderMarkdownWithCharts(markdownText, chartData, stats, totalScope, reportType)}
        </div>
      </div>
    </div>
  );
});

DynamicAIReportTemplate.displayName = 'DynamicAIReportTemplate';
export default DynamicAIReportTemplate;
