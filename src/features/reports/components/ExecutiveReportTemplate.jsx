import React, { forwardRef } from 'react';
import { Activity, Clock, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import LiderVelocityChart from '../../dashboard/components/LiderVelocityChart';
import { SprintBurndownChart } from '../../projects/components/SprintBurndownChart';

const ExecutiveReportTemplate = forwardRef(({ reportType, filters, user, projectName = "MCHAV Analytics" }, ref) => {
  // Datos de ejemplo basados en los KPIs estándar
  const stats = {
    velocity: 42,
    throughput: 38,
    cycleTime: 3.4,
    bugs: 12
  };

  const dates = "2026-08-25 al 2026-08-25";
  const titleMap = {
    general: "REPORTE EJECUTIVO DE MÉTRICAS",
    proyecto: "REPORTE DE ESTADO DEL PROYECTO",
    sprint: "REPORTE DE CIERRE DE SPRINT",
    desarrollador: "REPORTE DE DESEMPEÑO INDIVIDUAL"
  };

  return (
    <div className="hidden">
      <div ref={ref} className="bg-white text-slate-900 w-[210mm] mx-auto print:w-[210mm] font-sans relative">
        
        {/* RESET MARGINS FOR PRINT */}
        <style type="text/css" media="print">
          {`
            @page {
              size: A4;
              margin: 0 !important;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          `}
        </style>
        
        {/* ==========================================
            PÁGINA 1: PORTADA
           ========================================== */}
        <div className="relative w-[210mm] h-[297mm] overflow-hidden break-after-page flex flex-col items-center justify-center bg-white">
          
          {/* ONDAS SUPERIOR IZQUIERDA (Tres capas) */}
          <div className="absolute top-0 left-0 w-[800px] h-[600px] z-0 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              {/* Capa 1: Gris/Azul claro (más exterior) */}
              <path d="M0,0 L65,0 C30,20 15,50 0,85 Z" fill="#e2e8f0" opacity="0.6"/>
              {/* Capa 2: Azul medio */}
              <path d="M0,0 L45,0 C20,15 10,35 0,65 Z" fill="#60a5fa" opacity="0.3"/>
              {/* Capa 3: Azul oscuro MCHAV */}
              <path d="M0,0 L30,0 C12,10 5,25 0,45 Z" fill="#243b67" />
            </svg>
          </div>

          {/* DOTS TOP RIGHT (Tramado de puntos) */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] z-0 pointer-events-none opacity-15" style={{
              backgroundImage: 'radial-gradient(#243b67 1.5px, transparent 1.5px)',
              backgroundSize: '10px 10px',
              maskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)'
          }}></div>

          {/* ONDAS INFERIOR DERECHA (Tres capas) */}
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] z-0 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full transform rotate-180">
              {/* Capa 1: Gris/Azul claro */}
              <path d="M0,0 L65,0 C30,20 15,50 0,85 Z" fill="#e2e8f0" opacity="0.6"/>
              {/* Capa 2: Azul medio */}
              <path d="M0,0 L45,0 C20,15 10,35 0,65 Z" fill="#60a5fa" opacity="0.3"/>
              {/* Capa 3: Azul oscuro MCHAV */}
              <path d="M0,0 L30,0 C12,10 5,25 0,45 Z" fill="#243b67" />
            </svg>
          </div>

          {/* CONTENIDO DE LA PORTADA */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 -mt-20">
            
            {/* LOGO */}
            <div className="mb-20">
                <img src="/Logo_sf.png" alt="MCHAV Analytics" className="h-[280px] object-contain drop-shadow-sm" />
            </div>

            {/* TÍTULO DEL REPORTE */}
            <h1 className="text-3xl font-black text-[#243b67] uppercase tracking-[0.15em] text-center mb-24 leading-snug max-w-2xl">
              {titleMap[reportType] || titleMap.general}
            </h1>

            {/* METADATA */}
            <div className="flex flex-col items-center justify-center gap-10 w-full">
              
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nombre del Proyecto</span>
                <span className="text-lg font-bold text-[#1e293b]">{projectName}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Período Evaluado</span>
                <span className="text-lg font-bold text-[#1e293b]">{dates}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Fecha de Emisión</span>
                <span className="text-lg font-bold text-[#1e293b]">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Generado Por</span>
                <span className="text-lg font-bold text-[#1e293b]">{user?.nombre || 'Administrador del Sistema'}</span>
              </div>

            </div>

          </div>
        </div>

        {/* ==========================================
            PÁGINA 2+: CONTENIDO DEL REPORTE
           ========================================== */}
        <div className="relative w-[210mm] min-h-[297mm] bg-white px-16 py-16 flex flex-col">
            
            {/* ENCABEZADO SIMPLE PÁGINAS INTERNAS */}
            <header className="flex justify-between items-center border-b border-slate-200 pb-6 mb-10">
              <div className="flex items-center gap-4">
                <img src="/Logo_sf.png" alt="Logo Pequeño" className="h-10 object-contain" />
                <div>
                  <h2 className="text-sm font-black text-[#243b67] uppercase tracking-widest">{titleMap[reportType] || titleMap.general}</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{projectName}</p>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right">
                Período: {dates}<br/>
                Emitido: {new Date().toLocaleDateString('es-ES')}
              </div>
            </header>

            {/* 1. INTRODUCCIÓN Y METODOLOGÍA */}
            <section className="mb-10">
              <div className="flex gap-8">
                <div className="flex-1">
                  <h3 className="text-xs font-black uppercase text-[#243b67] tracking-widest mb-3 border-b border-slate-100 pb-2">1. Objetivo y Contexto</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Evaluación del comportamiento mediante indicadores de rendimiento, flujo y calidad, identificando tendencias, fortalezas y puntos de atención. Los valores corresponden al estado histórico de la información durante el período analizado.
                  </p>
                </div>
                <div className="flex-[0.8] flex flex-col justify-center gap-3 border-l border-slate-100 pl-8">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Incidencias analizadas</span>
                    <span className="text-sm font-black text-slate-800">86</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sprints incluidos</span>
                    <span className="text-sm font-black text-slate-800">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Story Points</span>
                    <span className="text-sm font-black text-slate-800">84 planificados</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. RESUMEN DE RESULTADOS */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">2. Resumen de resultados</h3>
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="flex items-center gap-1.5 text-[10px] font-black tracking-wider px-3 py-1.5 border border-slate-300 text-slate-700 rounded uppercase">
                  Estado: Saludable
                </span>
              </div>
              
              <table className="w-full text-sm text-left border-b border-slate-200">
                <thead className="border-b-2 border-slate-800 text-slate-800 uppercase text-[10px] tracking-widest font-black">
                  <tr>
                    <th className="px-2 py-3">Métrica</th>
                    <th className="px-2 py-3">Valor Actual</th>
                    <th className="px-2 py-3">Variación vs. Ant.</th>
                    <th className="px-2 py-3">Tendencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-2 py-3 font-bold text-slate-700">Velocity</td>
                    <td className="px-2 py-3 font-black text-slate-900">{stats.velocity} SP</td>
                    <td className="px-2 py-3 font-bold text-slate-700">↑ 12%</td>
                    <td className="px-2 py-3 text-slate-500 text-xs">Mejora continua</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-3 font-bold text-slate-700">Throughput</td>
                    <td className="px-2 py-3 font-black text-slate-900">{stats.throughput}</td>
                    <td className="px-2 py-3 font-bold text-slate-700">↑ 8%</td>
                    <td className="px-2 py-3 text-slate-500 text-xs">Estable</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-3 font-bold text-slate-700">Cycle Time</td>
                    <td className="px-2 py-3 font-black text-slate-900">{stats.cycleTime} d</td>
                    <td className="px-2 py-3 font-bold text-slate-700">↓ 8%</td>
                    <td className="px-2 py-3 text-slate-500 text-xs">Optimizado</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-3 font-bold text-slate-700">Bugs Detectados</td>
                    <td className="px-2 py-3 font-black text-slate-900">{stats.bugs}</td>
                    <td className="px-2 py-3 font-bold text-slate-700">↑ 20%</td>
                    <td className="px-2 py-3 text-slate-500 text-xs">Requiere atención en QA</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 3. RENDIMIENTO Y FLUJO (Reutilizando gráficas existentes) */}
            <section className="mb-10" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex items-center gap-3 mb-5">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">3. Rendimiento y Flujo</h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-slate-200 p-5">
                  <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 text-center text-slate-700">Velocity Histórica</h4>
                  <div className="h-[200px]">
                    <LiderVelocityChart velocityData={[{ sprint: 'Sprint 1', expected: 40, completed: 35 }, { sprint: 'Sprint 2', expected: 45, completed: 45 }]} isDarkMode={false} />
                  </div>
                </div>
                <div className="border border-slate-200 p-5">
                  <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 text-center text-slate-700">Burndown Sprint Actual</h4>
                  <div className="h-[200px]">
                    <SprintBurndownChart data={[{ date: '01/07', ideal: 50, actual: 50 }, { date: '05/07', ideal: 40, actual: 42 }, { date: '10/07', ideal: 30, actual: 35 }]} />
                  </div>
                </div>
              </div>
            </section>
            
            {/* 4. CONCLUSIONES */}
            <section className="mt-auto" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex items-center gap-3 mb-5">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">4. Conclusiones y Recomendaciones</h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              <table className="w-full text-sm text-left border-b border-slate-200">
                <thead className="border-b-2 border-slate-800 text-slate-800 uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-2 py-3 font-bold">Recomendación</th>
                    <th className="px-2 py-3 font-bold">Acción sugerida</th>
                    <th className="px-2 py-3 font-bold">Prioridad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-2 py-3.5 font-bold text-slate-800">01 · Priorizar bugs críticos</td>
                    <td className="px-2 py-3.5 text-slate-600 text-xs">Atender los defectos críticos antes de incrementar el volumen de trabajo.</td>
                    <td className="px-2 py-3.5"><span className="font-black text-slate-800 text-[10px] tracking-wider uppercase">Alta</span></td>
                  </tr>
                  <tr>
                    <td className="px-2 py-3.5 font-bold text-slate-800">02 · Revisar tiempos de espera</td>
                    <td className="px-2 py-3.5 text-slate-600 text-xs">Analizar incidencias con mayor Lead Time para detectar cuellos de botella.</td>
                    <td className="px-2 py-3.5"><span className="font-black text-slate-800 text-[10px] tracking-wider uppercase">Media</span></td>
                  </tr>
                </tbody>
              </table>
            </section>

        </div>
      </div>
    </div>
  );
});

export default ExecutiveReportTemplate;
