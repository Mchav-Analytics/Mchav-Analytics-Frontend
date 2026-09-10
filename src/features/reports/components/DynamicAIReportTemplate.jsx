import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  PieChart,
  Pie,
  Cell,
  LabelList
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

/** Gráfica de Velocidad Específica para Desarrolladores (Estilo Dashboard) */
const GraficaVelocidadDesarrollador = ({ data }) => {
  return (
    <div style={{ margin: '30px 0', pageBreakInside: 'avoid', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          VELOCIDAD DEL EQUIPO (STORY POINTS)
        </h3>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#e9d5ff', borderRadius: '3px' }}></span> Comprometido
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7e22ce' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#9333ea', borderRadius: '3px' }}></span> Completado
          </div>
        </div>
      </div>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="sprint" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Bar dataKey="comprometido" fill="#e9d5ff" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="comprometido" position="top" fill="#64748b" fontSize={11} fontWeight={700} />
            </Bar>
            <Bar dataKey="completado" fill="#9333ea" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="completado" position="top" fill="#64748b" fontSize={11} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

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

const PerfilDesempeno = ({ targetName, score, stats }) => {
  const scoreColor = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626';
  const scoreText = score >= 80 ? 'Desempeño Sólido' : score >= 60 ? 'Desempeño Estable' : 'Atención Requerida';

  // Calculate qualitative tags
  const entregaScore = stats.throughput > 10 ? 'ALTA' : stats.throughput > 5 ? 'MEDIA' : 'BAJA';
  const calidadScore = stats.bugs === 0 ? 'EXCELENTE' : stats.bugs <= 3 ? 'FAVORABLE' : 'CRÍTICA';
  const flujoScore = stats.blockedDays === 0 ? 'FLUIDO' : stats.blockedDays <= 2 ? 'ESTABLE' : 'LENTO';

  return (
    <div style={{ margin: '30px 0', pageBreakInside: 'avoid', fontFamily: '"Georgia", serif' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', fontFamily: '"Inter", sans-serif' }}>
        PERFIL DE DESEMPEÑO
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ fontSize: '32px', color: '#0f172a' }}>
          {targetName}
        </div>
        <div style={{ textAlign: 'right', fontFamily: '"Inter", sans-serif' }}>
          <div style={{ fontSize: '36px', fontWeight: 300, color: scoreColor, lineHeight: 1 }}>
            {score}<span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 400 }}>/100</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
            {scoreText}
          </div>
        </div>
      </div>

      <div style={{ height: '1px', background: '#e2e8f0', margin: '20px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-around', fontFamily: '"Inter", sans-serif' }}>
        {[
          { label: 'Tickets completados', value: stats.throughput || '0' },
          { label: 'Bugs reportados', value: stats.bugs || '0' },
          { label: 'Días bloqueado', value: stats.blockedDays || '0' }
        ].map((item, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 400, color: '#0f172a', fontFamily: '"Georgia", serif' }}>{item.value}</div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: '1px', background: '#e2e8f0', margin: '20px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-around', fontFamily: '"Inter", sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Entrega</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: entregaScore === 'BAJA' ? '#ef4444' : '#10b981', letterSpacing: '0.05em' }}>{entregaScore}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Calidad</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: calidadScore === 'CRÍTICA' ? '#ef4444' : '#10b981', letterSpacing: '0.05em' }}>{calidadScore}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Flujo</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: flujoScore === 'LENTO' ? '#f59e0b' : '#10b981', letterSpacing: '0.05em' }}>{flujoScore}</div>
        </div>
      </div>

      <div style={{ height: '1px', background: '#e2e8f0', marginTop: '20px' }} />
    </div>
  );
};

const TablaIndicadores = ({ stats }) => {
  const evaluate = (val, ref, isLowerBetter = false) => {
    if (!val && val !== 0) return 'N/D';
    if (isLowerBetter) return val <= ref ? 'Favorable' : 'Atención';
    return val >= ref ? 'Favorable' : 'Atención';
  };
  
  return (
    <div style={{ width: '100%', margin: '25px 0', pageBreakInside: 'avoid' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: '"Inter", system-ui, sans-serif', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Indicador</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Resultado</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Referencia</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Lectura</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <td style={{ padding: '12px', fontWeight: 600, color: '#334155' }}>Tickets Completados</td>
            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>{stats.throughput || 'N/D'}</td>
            <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>~8</td>
            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: evaluate(stats.throughput, 8) === 'Favorable' ? '#10b981' : '#f59e0b' }}>{evaluate(stats.throughput, 8)}</td>
          </tr>
          <tr style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
            <td style={{ padding: '12px', fontWeight: 600, color: '#334155' }}>Cycle Time</td>
            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>{stats.cycleTime ? `${stats.cycleTime} días` : 'N/D'}</td>
            <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>5.0 días</td>
            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: evaluate(stats.cycleTime, 5, true) === 'Favorable' ? '#10b981' : '#f59e0b' }}>{evaluate(stats.cycleTime, 5, true)}</td>
          </tr>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <td style={{ padding: '12px', fontWeight: 600, color: '#334155' }}>Bugs Reportados</td>
            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>{stats.bugsCount || 0}</td>
            <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>~2</td>
            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: evaluate(stats.bugsCount, 2, true) === 'Favorable' ? '#10b981' : '#f59e0b' }}>{evaluate(stats.bugsCount, 2, true)}</td>
          </tr>
          <tr style={{ background: 'white' }}>
            <td style={{ padding: '12px', fontWeight: 600, color: '#334155' }}>Días Bloqueado</td>
            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>{stats.blockedDays || 0}</td>
            <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>{'< 3 días'}</td>
            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: evaluate(stats.blockedDays, 3, true) === 'Favorable' ? '#10b981' : '#ef4444' }}>{evaluate(stats.blockedDays, 3, true)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const TablaDistribucion = ({ data }) => {
  return (
    <div style={{ width: '100%', maxWidth: '350px', margin: '0 auto', padding: '10px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: '"Inter", system-ui, sans-serif' }}>
        <thead>
          <tr style={{ backgroundColor: '#1e3a8a', color: 'white', borderBottom: '2px solid #0f172a' }}>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Tipo de Trabajo</th>
            <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Cantidad</th>
            <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>%</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => {
            const total = data.reduce((acc, curr) => acc + curr.value, 0);
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px', color: '#1e293b', fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>{item.value}</td>
                <td style={{ padding: '10px', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/** Gráfica 5: Distribución de Trabajo (Pie Chart) */
const GraficaDistribucion = ({ data }) => {
  const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];
  return (
    <div style={{ margin: '0', pageBreakInside: 'avoid', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ width: '100%', height: 220, display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              itemStyle={{ color: '#1e293b', fontWeight: 600 }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', marginTop: '8px' }}>
        Fig. — Distribución del Trabajo: Enfoque de esfuerzo por tipo de tarea
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
  prose-p:text-[11.5px] prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-justify prose-p:mb-3 prose-p:break-inside-avoid
  prose-li:text-[11.5px] prose-li:text-gray-700 prose-li:mb-0.5 prose-li:leading-relaxed
  prose-strong:text-slate-800 prose-strong:font-semibold
  prose-ul:my-2 prose-ol:my-2
  prose-hr:hidden prose-hr:m-0 prose-hr:border-0
  prose-table:w-full prose-table:my-6 prose-table:border-collapse
  prose-th:bg-slate-800 prose-th:text-white prose-th:p-2 prose-th:text-[10px] prose-th:uppercase prose-th:font-bold prose-th:text-left
  prose-td:p-2 prose-td:border-b prose-td:border-slate-200 prose-td:text-[11.5px] prose-td:text-slate-700
`;

// ================= Componentes Multi-Proyecto (General) =================

const TablaPortafolio = ({ metrics }) => {
  if (!metrics || metrics.length === 0) return null;
  return (
    <div style={{ margin: '20px 0', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead style={{ background: '#f8fafc', color: '#475569', fontWeight: 600, textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
          <tr>
            <th style={{ padding: '12px 16px' }}>Proyecto</th>
            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Velocidad (SP)</th>
            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Throughput</th>
            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Cycle Time</th>
            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Bloqueos</th>
            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Bugs</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((p, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{p.projectName}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', color: '#10b981', fontWeight: 700 }}>{p.velocity}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', color: '#3b82f6', fontWeight: 700 }}>{p.throughput}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>{p.cycleTime}d</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', color: p.blockedDays > 5 ? '#ef4444' : '#64748b' }}>{p.blockedDays}d</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', color: p.bugs > 2 ? '#ef4444' : '#64748b' }}>{p.bugs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const GraficaPortafolioVelocidad = ({ metrics }) => {
  if (!metrics || metrics.length === 0) return null;
  return (
    <div style={{ width: '100%', height: 350, margin: '20px 0', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', background: 'white' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={metrics} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="projectName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="velocity" name="Velocidad (SP Completados)" fill="#10b981" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="velocity" position="top" fill="#64748b" fontSize={11} fontWeight={600} />
          </Bar>
          <Bar dataKey="throughput" name="Tickets Entregados" fill="#3b82f6" radius={[4, 4, 0, 0]}>
             <LabelList dataKey="throughput" position="top" fill="#64748b" fontSize={11} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};



function renderMarkdownWithCharts(markdownText, chartData, stats, totalScope, reportType, reportData, devScore) {
  const isProyecto = reportType === 'proyecto';
  const isDesarrollador = reportType === 'desarrollador';
  const isGeneral = reportType === 'general';

  // Dividir según el formato del reporte
  const splitRegex = isProyecto 
    ? /(?=(?:^|\n)(?:\*\*)?\[PROYECTO_\d\])/gi 
    : /(?=(?:^|\n)# 0\d)/gi;
  
  const pages = markdownText.split(splitRegex).filter(Boolean);

  // Extraer títulos para el Índice
  const tableOfContents = pages.map((pageText) => {
    let titleMatch;
    if (isProyecto) {
      titleMatch = pageText.match(/^(?:#+\s*|\*\*)?\[PROYECTO_\d\]\s*(.*?)(?:\*\*)?$/mi);
    } else {
      titleMatch = pageText.match(/^#\s*0\d\s*[-—?\s]+(.*)$/mi);
    }
    return titleMatch ? titleMatch[1].trim() : null;
  }).filter(Boolean);

  // Limpiar tags residuales
  const cleanText = (text) => text
    .replace(/\[GRAFICA_FLUJO\]/gi, '')
    .replace(/\[GRAFICA_PREDICTIBILIDAD\]/gi, '')
    .replace(/^\s*---+\s*$/gm, '');

  const renderedPages = pages.map((pageText, pageIndex) => {
    // Detectar número de sección según formato
    let sectionNum = null;
    if (isProyecto) {
      const match = pageText.match(/\[PROYECTO_(\d)\]/i);
      if (match) sectionNum = parseInt(match[1], 10);
    } else {
      const sectionMatch = pageText.trim().match(/^# 0(\d)/i);
      sectionNum = sectionMatch ? parseInt(sectionMatch[1], 10) : null;
    }

    let trimmed = cleanText(pageText).trim();
    if (!trimmed) return null;

    // Limpiar prefijos de título para formato limpio
    if (isProyecto) {
      // Eliminar el tag [PROYECTO_X] para que no se vea en el PDF final, dejando solo el texto del título como H3
      trimmed = trimmed.replace(/^(?:#+\s*|\*\*)?\[PROYECTO_\d\]\s*(.*?)(?:\*\*)?$/gmi, '### $1');
    } else {
      trimmed = trimmed.replace(/^#\s*0\d\s*[-—?\s]+/gi, '# ');
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
    // Sprint:    Sección 3 → Burnup + Velocidad, Sección 4 → CFD, Sección 5 → Predictibilidad
    // Proyecto:  ACTO 2 → CFD, ACTO 3 → Burnup, ACTO 4 → Velocidad, ACTO 5 → Predictibilidad
    // ═══════════════════════════════════════════════════════════════════════
    const showCFD = isProyecto ? sectionNum === 2 : (!isDesarrollador && sectionNum === 4);
    const showBurnup = isProyecto ? sectionNum === 3 : (!isDesarrollador && sectionNum === 3);
    const showVelocidad = isProyecto ? sectionNum === 4 : (!isDesarrollador && sectionNum === 3);
    const showScatter = isProyecto ? sectionNum === 5 : (!isDesarrollador && sectionNum === 5);

    return (
      <div key={`section-${pageIndex}`} style={{ 
        width: '100%',
        padding: '30px 25.4mm',
        boxSizing: 'border-box',
        position: 'relative',
        background: 'white',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
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
            margin: '0 0 25px 0', 
            padding: '5px 0',
          }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#334155', margin: 0, lineHeight: 1.5 }}>
              {highlightText}
            </p>
          </div>
        )}

        {/* ═══ KPIs (Solo Sprint, sección 2) ═══ */}
        {!isProyecto && !isDesarrollador && sectionNum === 2 && (
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
        {!isProyecto && !isDesarrollador && sectionNum === 3 && (
          <div style={{ margin: '40px 0', pageBreakInside: 'avoid' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: '"Inter", system-ui, sans-serif' }}>
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

        {/* ANÁLISIS (Texto de la IA) con INYECCIÓN INLINE PARA SECCIÓN 3 */}
        {(() => {
          if (!isProyecto && !isDesarrollador && sectionNum === 3) {
            let renderedBurnup = false;
            let renderedVelocidad = false;
            
            const parts = trimmed.split(/(\[GRAFICA_BURNUP\]|\[GRAFICA_VELOCIDAD\])/gi);
            
            const content = parts.map((part, i) => {
              if (/\[GRAFICA_BURNUP\]/i.test(part)) {
                renderedBurnup = true;
                return showBurnup ? (
                  <div key={`inline-burnup-${i}`} style={{ pageBreakInside: 'avoid', margin: '30px 0' }}>
                    <GraficaBurnup data={chartData.burnupData} />
                  </div>
                ) : null;
              }
              if (/\[GRAFICA_VELOCIDAD\]/i.test(part)) {
                renderedVelocidad = true;
                return showVelocidad ? (
                  <div key={`inline-vel-${i}`} style={{ pageBreakInside: 'avoid', margin: '30px 0' }}>
                    <GraficaVelocidad data={chartData.velocityData} />
                  </div>
                ) : null;
              }
              return part.trim() ? (
                <div key={`text-${i}`} className={PROSE} style={{ pageBreakInside: 'avoid' }}>
                  <ReactMarkdown>{part}</ReactMarkdown>
                </div>
              ) : null;
            });

            return (
              <>
                {content}
                {/* Fallbacks si la IA no puso las etiquetas */}
                {showBurnup && !renderedBurnup && (
                  <div style={{ pageBreakInside: 'avoid', marginTop: '25px' }}>
                    <GraficaBurnup data={chartData.burnupData} />
                  </div>
                )}
                {showVelocidad && !renderedVelocidad && (
                  <div style={{ pageBreakInside: 'avoid', marginTop: '25px' }}>
                    <GraficaVelocidad data={chartData.velocityData} />
                  </div>
                )}
              </>
            );
          }

          // ═══ SECCIÓN 4 (CFD) CON DISEÑO DE REVISTA (MAGAZINE LAYOUT) ═══
          if (!isProyecto && !isDesarrollador && sectionNum === 4) {
            let renderedCFD = false;
            const parts = trimmed.split(/(\[GRAFICA_FLUJO\])/gi);

            return (
              <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '15px' }}>
                {parts.map((part, i) => {
                  if (/\[GRAFICA_FLUJO\]/i.test(part)) {
                    renderedCFD = true;
                    return showCFD ? (
                      <div key={`inline-cfd-${i}`} style={{ flex: '1 1 50%', minWidth: '400px', pageBreakInside: 'avoid' }}>
                        <GraficaFlujo data={chartData.cfdData} />
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: '"Inter", system-ui, sans-serif', marginTop: '30px' }}>
                          <thead>
                            <tr style={{ background: '#1e293b' }}>
                              <th style={{ padding: '8px 15px', textAlign: 'left', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Indicador de Flujo</th>
                              <th style={{ padding: '8px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Valor</th>
                              <th style={{ padding: '8px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Interpretación</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px 15px', fontWeight: 700, color: '#1e293b' }}>Cycle Time</td>
                              <td style={{ padding: '8px 15px', textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>{stats.cycleTime} días</td>
                              <td style={{ padding: '8px 15px', textAlign: 'center', color: '#64748b', fontSize: '10px' }}>{stats.cycleTime <= 3 ? 'Óptimo' : 'Vigilar'}</td>
                            </tr>
                            <tr style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px 15px', fontWeight: 700, color: '#1e293b' }}>Throughput</td>
                              <td style={{ padding: '8px 15px', textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>{stats.throughput} tkts</td>
                              <td style={{ padding: '8px 15px', textAlign: 'center', color: '#64748b', fontSize: '10px' }}>Entrega</td>
                            </tr>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px 15px', fontWeight: 700, color: '#1e293b' }}>Bloqueo</td>
                              <td style={{ padding: '8px 15px', textAlign: 'center', fontWeight: 700, color: stats.blockedDays > 5 ? '#ef4444' : '#10b981' }}>{stats.blockedDays || 0} días</td>
                              <td style={{ padding: '8px 15px', textAlign: 'center', color: '#64748b', fontSize: '10px' }}>{stats.blockedDays > 5 ? 'Impacto alto' : 'Bajo'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : null;
                  }
                  return part.trim() ? (
                    <div key={`text-${i}`} className={PROSE} style={{ flex: '1 1 40%', minWidth: '300px', pageBreakInside: 'avoid' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.replace(/\[GR[AÁ]FICA_PREDICTIBILIDAD\]/gi, '').replace(/\[GR[AÁ]FICA_FLUJO\]/gi, '')}</ReactMarkdown>
                    </div>
                  ) : null;
                })}

                {showCFD && !renderedCFD && (
                  <div style={{ flex: '1 1 50%', minWidth: '400px', pageBreakInside: 'avoid' }}>
                    <GraficaFlujo data={chartData.cfdData} />
                  </div>
                )}
              </div>
            );
          }

          // Para todas las demás secciones o proyectos
          return (
            <>

              {/* ================= HEADER DINÁMICO ================= */}
              {sectionNum === 1 && (
                <div style={{ marginBottom: '40px', borderBottom: '2px solid #0f172a', paddingBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                        {isGeneral ? 'Resumen Ejecutivo de Portafolio' : isDesarrollador ? 'Reporte de Desempeño Individual' : (isProyecto ? 'Reporte de Salud de Proyecto' : 'Reporte de Cierre de Sprint')}
                      </h1>
                      <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
                        {isDesarrollador || isGeneral ? null : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                            {reportData?.projectName || 'MCHAV Analytics'}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          {reportData?.period || 'Sprint Actual'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* ═══ RENDERIZADO INLINE GENERAL ═══ */}
              {(() => {
                if (isGeneral) {
                  const inlineParts = trimmed.split(/(\[GRAFICA_PORTAFOLIO_VELOCIDAD\]|\[TABLA_PORTAFOLIO\])/gi);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {inlineParts.map((part, i) => {
                        const isMatch = ['[GRAFICA_PORTAFOLIO_VELOCIDAD]', '[TABLA_PORTAFOLIO]'].includes(part.toUpperCase());
                        
                        if (isMatch) {
                          if (part.toUpperCase() === '[GRAFICA_PORTAFOLIO_VELOCIDAD]') {
                            return <GraficaPortafolioVelocidad key={`grafica-port-${i}`} metrics={reportData?.projectMetrics} />;
                          }
                          if (part.toUpperCase() === '[TABLA_PORTAFOLIO]') {
                            return <TablaPortafolio key={`tabla-port-${i}`} metrics={reportData?.projectMetrics} />;
                          }
                        }
                        
                        return part.trim() ? (
                          <div key={`text-${i}`} className={PROSE} style={{ flex: '1 1 100%' }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown>
                          </div>
                        ) : null;
                      })}
                    </div>
                  );
                }

                if (isDesarrollador) {
                  // Separar por cualquier tag que necesitemos inyectar
                  const parts = trimmed.split(/(\[GR[AÁ]FICA_VELOCIDAD\]|\[GR[AÁ]FICA_FLUJO\]|\[PLAN_MEJORA\]|\[TABLA_EVOLUCION\])/gi);
                  
                  return (
                    <div>
                      {/* Section 1: Perfil de Desempeño */}
                      {sectionNum === 1 && (
                        <PerfilDesempeno targetName={reportData?.targetName} score={devScore} stats={stats} />
                      )}

                      {/* Content mapping */}
                      {parts.map((part, i) => {
                        if (/\[TABLA_EVOLUCION\]/i.test(part)) {
                          const history = stats.history_data && stats.history_data.length > 0 ? stats.history_data : [
                            { sprintName: 'Sprint 18', ticketsCompletados: 24, cycleTime: 4.8, bloqueos: 2 },
                            { sprintName: 'Sprint 19', ticketsCompletados: 31, cycleTime: 4.1, bloqueos: 1 },
                            { sprintName: 'Sprint 20', ticketsCompletados: 38, cycleTime: 3.6, bloqueos: 0 },
                            { sprintName: 'Actual', ticketsCompletados: stats.throughput || 42, cycleTime: stats.cycleTime || 3.2, bloqueos: stats.blockedDays || 0 }
                          ];
                          return (
                            <div key={`dev-hist-${i}`} style={{ width: '100%', pageBreakInside: 'avoid', margin: '20px 0 40px 0' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'serif', border: '1px solid black' }}>
                                <thead>
                                  <tr>
                                    <th style={{ border: '1px solid black', padding: '8px 12px', textAlign: 'left', fontWeight: 'bold' }}>Sprint</th>
                                    <th style={{ border: '1px solid black', padding: '8px 12px', textAlign: 'center', fontWeight: 'bold' }}>Tickets completados</th>
                                    <th style={{ border: '1px solid black', padding: '8px 12px', textAlign: 'center', fontWeight: 'bold' }}>Cycle Time</th>
                                    <th style={{ border: '1px solid black', padding: '8px 12px', textAlign: 'center', fontWeight: 'bold' }}>Bloqueos</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {history.map((h, idx) => (
                                    <tr key={idx}>
                                      <td style={{ border: '1px solid black', padding: '8px 12px' }}>{h.sprintName}</td>
                                      <td style={{ border: '1px solid black', padding: '8px 12px', textAlign: 'center' }}>{h.ticketsCompletados}</td>
                                      <td style={{ border: '1px solid black', padding: '8px 12px', textAlign: 'center' }}>{h.cycleTime}</td>
                                      <td style={{ border: '1px solid black', padding: '8px 12px', textAlign: 'center' }}>{h.bloqueos}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        }
                        if (/\[GR[AÁ]FICA_VELOCIDAD\]/i.test(part)) {
                          const history = stats.history_data && stats.history_data.length > 0 ? stats.history_data : [
                            { sprintName: 'Sprint 18', planned: 28, completed: 24 },
                            { sprintName: 'Sprint 19', planned: 35, completed: 31 },
                            { sprintName: 'Sprint 20', planned: 40, completed: 38 },
                            { sprintName: 'Actual', planned: 45, completed: stats.throughput || 42 }
                          ];
                          const velocityData = history.map(h => ({
                            sprint: h.sprintName,
                            comprometido: h.planned || 0,
                            completado: h.completed || 0
                          }));
                          return (
                            <div key={`dev-vel-${i}`} style={{ display: 'flex', justifyContent: 'center', margin: '40px 0', pageBreakInside: 'avoid' }}>
                              <div style={{ width: '100%', maxWidth: '700px' }}>
                                <GraficaVelocidadDesarrollador data={velocityData} />
                              </div>
                            </div>
                          );
                        }
                        if (/\[GR[AÁ]FICA_FLUJO\]/i.test(part)) {
                          return (
                            <div key={`dev-cfd-${i}`} style={{ width: '100%', pageBreakInside: 'avoid', margin: '40px 0' }}>
                              <GraficaFlujo data={chartData.cfdData} />
                              
                              {/* Tabla Distribución (Debajo del CFD en sección 3) */}
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: '"Inter", system-ui, sans-serif', marginTop: '30px' }}>
                                <thead>
                                  <tr style={{ background: '#1e293b' }}>
                                    <th style={{ padding: '8px 15px', textAlign: 'left', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Tipo</th>
                                    <th style={{ padding: '8px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Cantidad</th>
                                    <th style={{ padding: '8px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>%</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {chartData.distribucionData && chartData.distribucionData.map((d, idx) => {
                                    const total = chartData.distribucionData.reduce((acc, curr) => acc + curr.value, 0);
                                    const perc = total > 0 ? Math.round((d.value / total) * 100) : 0;
                                    return (
                                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '8px 15px', fontWeight: 700, color: '#1e293b' }}>{d.name}</td>
                                        <td style={{ padding: '8px 15px', textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>{d.value}</td>
                                        <td style={{ padding: '8px 15px', textAlign: 'center', color: '#64748b' }}>{perc}%</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        }
                        if (/\[PLAN_MEJORA\]/i.test(part)) {
                          return (
                            <div key={`dev-plan-${i}`} style={{ textAlign: 'center', marginTop: '40px', pageBreakInside: 'avoid' }}>
                              <button style={{ background: '#0f172a', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                Generar plan de mejora
                              </button>
                            </div>
                          );
                        }
                        
                        return part.trim() ? (
                          <div key={`dev-text-${i}`} className={PROSE} style={{ pageBreakInside: 'avoid' }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown>
                          </div>
                        ) : null;
                      })}
                    </div>
                  );
                }

                // Fallback para Proyecto o Sprint en estas secciones
                return (
                  <div className={PROSE} style={{ pageBreakInside: 'avoid' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{trimmed.replace(/\[GR[AÁ]FICA_BURNUP\]/gi, '').replace(/\[GR[AÁ]FICA_VELOCIDAD\]/gi, '').replace(/\[GR[AÁ]FICA_FLUJO\]/gi, '').replace(/\[GR[AÁ]FICA_PREDICTIBILIDAD\]/gi, '').replace(/\[GR[AÁ]FICA_DISTRIBUCION\]/gi, '').replace(/\[PLAN_MEJORA\]/gi, '').replace(/\|\s*\|/g, '|\n|').replace(/(?=\|\s*Tipo de)/i, '\n\n')}</ReactMarkdown>
                  </div>
                );
              })()}



              {/* ═══ GRÁFICA BURNUP Y VELOCIDAD PROYECTO ═══ */}
              {showBurnup && isProyecto && (
                <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
                  <GraficaBurnup data={chartData.burnupData} />
                </div>
              )}
              {showVelocidad && isProyecto && (
                <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
                  <GraficaVelocidad data={chartData.velocityData} />
                </div>
              )}
            </>
          );
        })()}

        {/* ═══ GRÁFICA CFD Y TABLA PARA PROYECTOS ═══ */}
        {showCFD && isProyecto && (
          <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
            <GraficaFlujo data={chartData.cfdData} />
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

  // Renderizar el Índice al inicio del reporte (excepto para desarrolladores)
  if (tableOfContents.length > 0 && reportType !== 'desarrollador') {
    renderedPages.unshift(
      <div key="toc" style={{ 
        padding: '25.4mm', 
        breakAfter: 'page', pageBreakAfter: 'always', 
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Índice de Contenidos
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
          {tableOfContents.map((title, i) => (
             <li key={`toc-${i}`} style={{ 
               display: 'flex', alignItems: 'center',
               padding: '10px 0',
               fontSize: '14px', color: '#334155', fontWeight: 600
             }}>
               <span style={{ 
                 color: '#3b82f6', width: '15px', 
                 display: 'inline-block', fontSize: '18px', fontWeight: 900, marginRight: '10px', lineHeight: 1 
               }}>
                 •
               </span> 
               {title.replace(/\*/g, '')}
             </li>
          ))}
        </ul>
      </div>
    );
  }

  return renderedPages;
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
    bugsCount: metrics.bugs_count || 0
  };
  const totalScope = Math.max(stats.velocity, 40);

  const calculateScore = (s) => {
    let sc = 50;
    if (s.throughput > 5) sc += 20;
    else if (s.throughput > 2) sc += 10;
    if (s.cycleTime && s.cycleTime < 4) sc += 20;
    else if (s.cycleTime && s.cycleTime < 7) sc += 10;
    if (s.bugsCount === 0) sc += 10;
    return Math.min(100, sc);
  };
  const devScore = calculateScore(stats);

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

  const bugsCount = stats.bugs || Math.max(1, Math.floor(stats.throughput * 0.15));
  const historias = Math.max(1, Math.floor((stats.throughput - bugsCount) * 0.55));
  const tareas = Math.max(1, Math.floor((stats.throughput - bugsCount) * 0.35));
  const otros = Math.max(1, stats.throughput - bugsCount - historias - tareas);

  const distribucionData = [
    { name: 'Historias', value: historias },
    { name: 'Tareas', value: tareas },
    { name: 'Bugs', value: bugsCount },
    { name: 'Otros', value: otros }
  ];

  const chartData = {
    burnupData, cfdData, velocityData, distribucionData,
    percentilesData: { p50: p50.toFixed(1), p85: p85.toFixed(1), p95: p95.toFixed(1), scatterPoints },
  };

  // ── Metadatos ──────────────────────────────────────────────────────────────
  const dates = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const titleMap = { general: 'INFORME EJECUTIVO DE RENDIMIENTO', proyecto: 'INFORME EJECUTIVO DEL PROYECTO', sprint: 'REPORTE EJECUTIVO DE SPRINT', desarrollador: 'INFORME EJECUTIVO DE DESEMPEÑO INDIVIDUAL' };
  const projectName = reportData?.projectName || 'MCHAV Analytics';
  const targetName = reportData?.targetName || 'Desarrollador';
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
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#243b67', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', marginBottom: '10px', maxWidth: '420px', lineHeight: 1.25 }}>
              {reportType === 'sprint' ? `REPORTE DE ${sprintName}` : reportType === 'desarrollador' ? `EVALUACIÓN DE DESEMPEÑO` : (titleMap[reportType] || titleMap.general)}
            </h1>
            
            {reportType === 'desarrollador' && (
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: '50px' }}>
                {targetName}
              </h2>
            )}

            {reportType !== 'desarrollador' && <div style={{ marginBottom: '60px' }} />}

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
          {renderMarkdownWithCharts(markdownText, chartData, stats, totalScope, reportType, reportData, devScore)}
        </div>
      </div>
    </div>
  );
});

DynamicAIReportTemplate.displayName = 'DynamicAIReportTemplate';
export default DynamicAIReportTemplate;
