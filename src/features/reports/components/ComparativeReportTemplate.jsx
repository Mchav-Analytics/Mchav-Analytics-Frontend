import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';

/**
 * Reporte Comparativo con diseño Documento/Formal
 */
const ComparativeReportTemplate = forwardRef(({ data, user }, ref) => {
  if (!data) return null;

  const { 
    sprintNameBase, sprintNameCompare,
    velocity = 0, velocityCompare = 0,
    throughput = 0, throughputCompare = 0,
    predictability1 = 0, predictability2 = 0,
    cycleTime = 0, cycleTimeCompare = 0,
    aiInsights, projectName, dateStr, reportType
  } = data;

  const isComparative = reportType === 'sprint_comparativo';

  const getPageStyle = (isCover = false) => ({
    width: '210mm',
    minHeight: '297mm',
    padding: isCover ? '0' : '25.4mm',
    position: 'relative',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontFamily: '"Times New Roman", Times, serif',
    boxSizing: 'border-box',
    pageBreakAfter: 'always',
    display: 'flex',
    flexDirection: 'column'
  });

  // Datos para Gráfica de Tendencia (Evolución de Entrega)
  const trendData = isComparative ? [
    { sprint: sprintNameBase, sp: velocity },
    { sprint: sprintNameCompare, sp: velocityCompare }
  ] : [
    { sprint: sprintNameBase, sp: velocity }
  ];

  const CoverPage = () => (
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
          {isComparative ? 'ANÁLISIS COMPARATIVO DE SPRINTS' : `CONSULTA HISTÓRICA: ${sprintNameBase}`}
        </h1>
        
        {isComparative && (
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: '50px' }}>
            {sprintNameBase} VS {sprintNameCompare}
          </h2>
        )}

        {!isComparative && <div style={{ marginBottom: '60px' }} />}

        {/* Metadatos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          {[
            { label: 'Proyecto', value: projectName },
            { label: 'Fecha de Emisión', value: dateStr || new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) },
            { label: 'Generado Por', value: `${user?.nombre || user?.name || (user?.email ? user.email.split('@')[0] : 'Administrador del Sistema')}${user?.rol ? ` (${user.rol})` : ''}` },
          ].filter(Boolean).map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{label}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer confidencial */}
      <div style={{ position: 'absolute', bottom: '25.4mm', left: '25.4mm', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
        <span style={{ fontSize: '8px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>CONFIDENCIAL · USO INTERNO</span>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="report-wrapper" style={{ backgroundColor: 'white', fontFamily: '"Times New Roman", Times, serif' }}>
      <style>{`
        .report-wrapper, .report-wrapper * {
          font-family: "Times New Roman", Times, serif !important;
        }
      `}</style>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .prose p, .prose li { font-family: "Times New Roman", Times, serif !important; font-size: 12pt !important; line-height: 1.5 !important; color: black !important; }
        .prose p { margin-bottom: 8pt !important; }
        .prose li { margin-bottom: 4pt !important; }
        .prose h1, .prose h2 { font-family: "Times New Roman", Times, serif !important; color: black !important; page-break-after: avoid; break-after: avoid; font-size: 18pt !important; font-weight: bold !important; margin-top: 18pt !important; margin-bottom: 12pt !important; }
        .prose h3 { font-family: "Times New Roman", Times, serif !important; color: black !important; page-break-after: avoid; break-after: avoid; font-size: 16pt !important; font-weight: bold !important; margin-top: 14pt !important; margin-bottom: 8pt !important; }
        .prose p, .prose li, .prose h1, .prose h2, .prose h3 { orphans: 3; widows: 3; }
      `}</style>
      
      <CoverPage />

      {/* Página de Análisis y Gráficas */}
      <div style={getPageStyle(false)}>
        {/* Header de Página */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '15px', borderBottom: '2px solid #0f172a', fontFamily: '"Times New Roman", Times, serif' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>MCHAV Analytics</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Análisis Ejecutivo Comparativo</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
            {projectName}
          </div>
        </div>

        {/* PROPOSITO E INTRODUCCION (Texto de IA) */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18pt', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
            01 — Análisis de Rendimiento Cruzado
          </h2>
          <div style={{ fontSize: '12pt', lineHeight: 1.6, color: '#334155' }} className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {aiInsights?.markdown || "Generando análisis inteligente de los sprints seleccionados..."}
            </ReactMarkdown>
          </div>
        </div>

        {/* GRAFICA/TABLA: COMPARACION DE METRICAS */}
        <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '16pt', fontWeight: 700, color: '#475569', marginBottom: '15px' }}>
            A. Comparación de Métricas Clave
          </h3>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>Métrica</th>
                  <th style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 800 }}>{sprintNameBase}</th>
                  {isComparative && <th style={{ padding: '12px 16px', color: '#3b82f6', fontWeight: 800 }}>{sprintNameCompare}</th>}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Velocity (SP)</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '14pt', color: '#0f172a' }}>{velocity}</td>
                  {isComparative && <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '14pt', color: '#1d4ed8' }}>{velocityCompare}</td>}
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Throughput (Tickets)</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '14pt', color: '#0f172a' }}>{throughput}</td>
                  {isComparative && <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '14pt', color: '#1d4ed8' }}>{throughputCompare}</td>}
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Predictibilidad</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{predictability1}%</td>
                  {isComparative && <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1d4ed8' }}>{predictability2}%</td>}
                </tr>
                <tr>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Cycle Time</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{cycleTime} d</td>
                  {isComparative && <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1d4ed8' }}>{cycleTimeCompare} d</td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* GRAFICA: TENDENCIA DE ENTREGA */}
        <div style={{ pageBreakInside: 'avoid' }}>
          <h3 style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '16pt', fontWeight: 700, color: '#475569', marginBottom: '15px' }}>
            B. Evolución de Entrega (Puntos Completados)
          </h3>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#fafafa' }}>
            <div style={{ width: '100%', height: 250 }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <BarChart width={600} height={250} data={trendData} margin={{ top: 20, right: 50, left: 50, bottom: 5 }} barSize={80}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="sprint" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 600, fontFamily: '"Times New Roman", Times, serif' }} dy={10} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar isAnimationActive={false} dataKey="sp" name="Story Points" fill="#10b981" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="sp" position="top" fill="#047857" fontSize={10} fontWeight={800} fontFamily='"Times New Roman", Times, serif' />
                  </Bar>
                </BarChart>
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', marginTop: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
              Fig. 2 — Volumen absoluto de entrega entre los periodos evaluados.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
});

ComparativeReportTemplate.displayName = 'ComparativeReportTemplate';
export default ComparativeReportTemplate;
