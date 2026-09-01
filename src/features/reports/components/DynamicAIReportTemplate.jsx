import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { SprintBurnupChart } from '../../projects/components/SprintBurnupChart';
import { CumulativeFlowDiagram } from '../../projects/components/CumulativeFlowDiagram';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, ScatterChart, Scatter, ReferenceLine } from 'recharts';

const DynamicAIReportTemplate = forwardRef(({ reportType, filters, user, reportData, aiInsights }, ref) => {
  const kpis = reportData?.kpis || {};
  const metrics = kpis.metrics || {};
  
  const stats = {
    velocity: metrics.completed_sp || 0,
    throughput: metrics.completed_issues || reportData?.totalIssues || 0,
    cycleTime: metrics.avg_cycle_time || 0,
    bugs: metrics.bugs_count || 0
  };

  const totalScope = Math.max(stats.velocity, 40);

  // 1. Datos Burnup
  const burnupData = [
    { fecha_real: 'Inicio', alcance_total: totalScope, trabajo_completado: 0, ritmo_ideal: 0, tareas_completadas: 0 },
    { fecha_real: 'Mitad', alcance_total: totalScope, trabajo_completado: Math.floor(stats.velocity / 2), ritmo_ideal: Math.floor(totalScope / 2), tareas_completadas: Math.floor(stats.throughput / 2) },
    { fecha_real: 'Fin', alcance_total: totalScope, trabajo_completado: stats.velocity, ritmo_ideal: totalScope, tareas_completadas: Math.ceil(stats.throughput / 2) }
  ];

  // 2. Datos CFD
  const cfdData = [
    { fecha_real: 'Inicio', por_hacer: stats.throughput, en_progreso: 0, en_revision: 0, completado: 0 },
    { fecha_real: 'Mitad', por_hacer: Math.floor(stats.throughput * 0.3), en_progreso: Math.floor(stats.throughput * 0.3), en_revision: Math.floor(stats.throughput * 0.1), completado: Math.floor(stats.throughput * 0.3) },
    { fecha_real: 'Fin', por_hacer: 0, en_progreso: 0, en_revision: 0, completado: stats.throughput }
  ];

  // 3. Datos Velocity Histórica (BarChart)
  const velocityData = [
    { sprint: 'Sprint 1', comprometido: Math.max(stats.velocity - 5, 20), completado: Math.max(stats.velocity - 10, 15) },
    { sprint: 'Sprint 2', comprometido: totalScope, completado: stats.velocity }
  ];

  // 4. Datos Percentiles (ScatterChart)
  const p50 = stats.cycleTime > 0 ? stats.cycleTime : 2.5;
  const p85 = p50 * 1.5;
  const p95 = p50 * 2.0;
  
  const scatterPoints = [
    { x: 1, y: p50 * 0.5 }, { x: 2, y: p50 * 0.8 }, { x: 3, y: p50 }, 
    { x: 4, y: p50 * 1.2 }, { x: 5, y: p85 * 0.9 }, { x: 6, y: p85 }, 
    { x: 7, y: p95 * 0.95 }
  ];

  const percentilesData = {
    p50: p50.toFixed(1),
    p85: p85.toFixed(1),
    p95: p95.toFixed(1),
    scatterPoints
  };

  const dates = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const titleMap = {
    general: "INFORME EJECUTIVO DE RENDIMIENTO",
    proyecto: "INFORME EJECUTIVO DEL PROYECTO",
    sprint: "REPORTE EJECUTIVO DE SPRINT",
    desarrollador: "INFORME EJECUTIVO INDIVIDUAL"
  };

  const projectName = reportData?.targetName || "MCHAV Analytics";
  
  // Obtenemos el Markdown
  const markdownText = aiInsights?.markdown || "Generando análisis inteligente... Si ves este mensaje, la conexión con IA falló o los datos no cargaron.";

  return (
    <div className="hidden">
      <div ref={ref} className="bg-white text-black w-[210mm] mx-auto print:w-[210mm] font-sans relative">
        
        <style type="text/css" media="print">
          {`
            @page { size: A4; margin: 0 !important; }
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; padding: 0 !important; background-color: white !important; }
            .markdown-page-break h1 { page-break-before: always; margin-top: 15mm; }
            .markdown-page-break h2 { page-break-after: avoid; }
            .markdown-page-break p, .markdown-page-break li { page-break-inside: avoid; }
          `}
        </style>
        
        {/* ==========================================
            PÁGINA 1: PORTADA
           ========================================== */}
        <div className="relative w-[210mm] h-[297mm] overflow-hidden break-after-page flex flex-col items-center justify-center bg-white">
          <div className="absolute top-0 left-0 w-[800px] h-[600px] z-0 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,0 L65,0 C30,20 15,50 0,85 Z" fill="#e2e8f0" opacity="0.6"/>
              <path d="M0,0 L45,0 C20,15 10,35 0,65 Z" fill="#60a5fa" opacity="0.3"/>
              <path d="M0,0 L30,0 C12,10 5,25 0,45 Z" fill="#243b67" />
            </svg>
          </div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] z-0 pointer-events-none opacity-15" style={{
              backgroundImage: 'radial-gradient(#243b67 1.5px, transparent 1.5px)',
              backgroundSize: '10px 10px',
              maskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)'
          }}></div>
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] z-0 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full transform rotate-180">
              <path d="M0,0 L65,0 C30,20 15,50 0,85 Z" fill="#e2e8f0" opacity="0.6"/>
              <path d="M0,0 L45,0 C20,15 10,35 0,65 Z" fill="#60a5fa" opacity="0.3"/>
              <path d="M0,0 L30,0 C12,10 5,25 0,45 Z" fill="#243b67" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 -mt-24">
            <div className="mb-16">
                <img src="/Logo_sf.png" alt="MCHAV Analytics" className="h-[280px] object-contain drop-shadow-sm" />
            </div>
            <h1 className="text-3xl font-black text-[#243b67] uppercase tracking-[0.15em] text-center mb-4 leading-snug max-w-2xl">
              {titleMap[reportType] || titleMap.general}
            </h1>
            <h2 className="text-sm text-gray-500 uppercase tracking-widest mb-20 font-medium">
              Reporte Generado por IA
            </h2>
            <div className="flex flex-col items-center justify-center gap-10 w-full">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Nombre del Proyecto</span>
                <span className="text-lg font-bold text-black">{projectName}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Período Evaluado</span>
                <span className="text-lg font-bold text-black">{dates}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Fecha de Emisión</span>
                <span className="text-lg font-bold text-black">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Generado Por</span>
                <span className="text-lg font-bold text-black">{user?.nombre || 'NUBI IA'}</span>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-8 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">CONFIDENCIAL · USO INTERNO</span>
          </div>
        </div>



        {/* ==========================================
            PÁGINAS DINÁMICAS: ANÁLISIS DE LA IA
           ========================================== */}
        <div className="relative w-[210mm] bg-white px-16 py-16 flex flex-col min-h-[297mm]">
            <header className="flex justify-between items-end border-b border-gray-300 pb-4 mb-10">
              <div>
                <h2 className="text-sm font-bold text-black uppercase tracking-widest">ANÁLISIS INTELIGENTE</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Generado por Gemini AI</p>
              </div>
              <img src="/Logo_sf.png" alt="Logo Pequeño" className="h-8 object-contain" />
            </header>

            {/* Aquí inyectamos el Markdown renderizado */}
            <div className="markdown-page-break prose prose-slate prose-sm max-w-none 
                            prose-headings:font-bold prose-headings:text-[#243b67] prose-headings:uppercase prose-headings:tracking-widest
                            prose-h1:text-xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-2 prose-h1:mb-6
                            prose-h2:text-sm prose-h2:mt-8 prose-h2:mb-4
                            prose-h3:text-xs prose-h3:mt-6 prose-h3:mb-2
                            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-justify prose-p:mb-4
                            prose-li:text-gray-700 prose-li:mb-1
                            prose-strong:text-black">
                {markdownText === "Generando análisis inteligente... Si ves este mensaje, la conexión con IA falló o los datos no cargaron." && (
                  <p className="text-red-500 font-bold mb-4">{markdownText}</p>
                )}
                <ReactMarkdown>
                  {markdownText}
                </ReactMarkdown>
            </div>
        </div>

      </div>
    </div>
  );
});

DynamicAIReportTemplate.displayName = 'DynamicAIReportTemplate';

export default DynamicAIReportTemplate;
