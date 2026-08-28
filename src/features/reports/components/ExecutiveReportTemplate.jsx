import React, { forwardRef } from 'react';
import Logo from '../../../components/layout/Logo';
import { Activity, Clock, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import LiderVelocityChart from '../../dashboard/components/LiderVelocityChart';
import { SprintBurnupChart } from '../../projects/components/SprintBurnupChart';
import CriticalIssuesList from '../../dashboard/components/CriticalIssuesList';

const ExecutiveReportTemplate = forwardRef(({ reportType, filters }, ref) => {
  // Datos de ejemplo basados en los KPIs estándar
  const stats = {
    velocity: 42,
    throughput: 38,
    cycleTime: 3.4,
    bugs: 12
  };

  const dates = "01 de julio — 31 de julio de 2026";
  const titleMap = {
    general: "REPORTE EJECUTIVO DE MÉTRICAS",
    proyecto: "REPORTE DE ESTADO DEL PROYECTO",
    sprint: "REPORTE DE CIERRE DE SPRINT",
    desarrollador: "REPORTE DE DESEMPEÑO INDIVIDUAL"
  };

  return (
    <div className="hidden">
      <div ref={ref} className="bg-white text-slate-900 p-12 w-[210mm] min-h-[297mm] mx-auto print:p-8 print:w-full font-sans">
        
        {/* ENCABEZADO */}
        <header className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <Logo size={48} className="print:shadow-none" />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Mchav Analytics</h1>
              <h2 className="text-lg font-bold text-indigo-600 uppercase">{titleMap[reportType] || titleMap.general}</h2>
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p><strong>Proyecto:</strong> MCHAV Analytics</p>
            <p><strong>Período analizado:</strong> {dates}</p>
            <p className="mt-2 text-xs uppercase bg-slate-100 px-3 py-1 rounded inline-block font-bold">
              Corte histórico: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>
        </header>

        {/* 1. INTRODUCCIÓN Y METODOLOGÍA */}
        <section className="mb-10">
          <div className="flex gap-6 mb-6">
            <div className="flex-1 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">1. Objetivo y Contexto</h3>
              <p className="text-sm text-slate-700">Evaluar el comportamiento mediante indicadores de rendimiento, flujo y calidad, identificando tendencias, fortalezas y puntos de atención. Los valores corresponden al estado histórico de la información durante el período analizado en Jira Cloud.</p>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-slate-500">Incidencias analizadas</span>
                <span className="text-sm font-bold">86</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-slate-500">Sprints incluidos</span>
                <span className="text-sm font-bold">2</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-slate-500">Story Points</span>
                <span className="text-sm font-bold">84 SP planificados</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. RESUMEN DE RESULTADOS */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-black text-slate-800">2. Resumen de resultados</h3>
            <span className="ml-auto flex items-center gap-1 text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              <CheckCircle className="w-3 h-3" /> ESTADO GENERAL: SALUDABLE
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-2 text-indigo-500"><Zap className="w-4 h-4" /><span className="text-xs font-bold uppercase">Velocity</span></div>
              <div className="text-2xl font-black">{stats.velocity} SP</div>
              <div className="text-xs font-bold text-emerald-600">↑ 12% vs. período anterior</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-2 text-indigo-500"><CheckCircle className="w-4 h-4" /><span className="text-xs font-bold uppercase">Throughput</span></div>
              <div className="text-2xl font-black">{stats.throughput}</div>
              <div className="text-xs font-bold text-emerald-600">↑ 8% vs. período anterior</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-2 text-indigo-500"><Clock className="w-4 h-4" /><span className="text-xs font-bold uppercase">Cycle Time</span></div>
              <div className="text-2xl font-black">{stats.cycleTime} d</div>
              <div className="text-xs font-bold text-emerald-600">↓ 8% vs. período anterior</div>
            </div>
            <div className="border border-red-100 rounded-lg p-4 bg-red-50/30">
              <div className="flex items-center gap-2 mb-2 text-red-500"><AlertTriangle className="w-4 h-4" /><span className="text-xs font-bold uppercase">Bugs</span></div>
              <div className="text-2xl font-black">{stats.bugs}</div>
              <div className="text-xs font-bold text-red-600">↑ 20% vs. período anterior</div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-100 text-slate-700">
            <strong>Lectura ejecutiva:</strong> El proyecto muestra una mejora en su capacidad de entrega y velocidad. Sin embargo, el incremento de bugs y del Lead Time requiere seguimiento.
          </div>
        </section>

        {/* 3. RENDIMIENTO Y FLUJO (Reutilizando gráficas existentes) */}
        <section className="mb-10" style={{ pageBreakInside: 'avoid' }}>
          <h3 className="text-lg font-black text-slate-800 mb-4">3. Rendimiento y Flujo</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="text-sm font-bold mb-4 text-center text-slate-600">Velocity Histórica</h4>
              <div className="h-[200px]">
                <LiderVelocityChart velocityData={[{ sprint: 'Sprint 1', expected: 40, completed: 35 }, { sprint: 'Sprint 2', expected: 45, completed: 45 }]} isDarkMode={false} />
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="text-sm font-bold mb-4 text-center text-slate-600">Burnup Sprint Actual</h4>
              <div className="h-[200px]">
                <SprintBurnupChart data={[
                  { fecha_real: '01/07', alcance_total: 50, trabajo_completado: 10, ritmo_ideal: 10, tareas_completadas: 2 },
                  { fecha_real: '05/07', alcance_total: 50, trabajo_completado: 25, ritmo_ideal: 25, tareas_completadas: 3 },
                  { fecha_real: '10/07', alcance_total: 50, trabajo_completado: 45, ritmo_ideal: 40, tareas_completadas: 4 }
                ]} />
              </div>
            </div>
          </div>
        </section>
        
        {/* 4. CALIDAD E INCIDENCIAS (Reutilizando CriticalIssuesList) */}
        <section className="mb-10" style={{ pageBreakInside: 'avoid' }}>
          <h3 className="text-lg font-black text-slate-800 mb-4">4. Calidad e Incidencias Críticas</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden p-4">
            <CriticalIssuesList criticalIssues={[{ key: 'MCHAV-101', priority: 'High', summary: 'Error de login', assignee: 'Dev 1', sp: 5 }]} teamMembers={[{ name: 'Dev 1' }, { name: 'Dev 2' }]} handleNotifyDev={() => {}} handleConfirmReassign={() => {}} />
          </div>
        </section>

        {/* 5. CONCLUSIONES */}
        <section style={{ pageBreakInside: 'avoid' }}>
          <h3 className="text-lg font-black text-slate-800 mb-4">5. Conclusiones y Recomendaciones</h3>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Recomendación</th>
                <th className="px-4 py-2">Acción sugerida</th>
                <th className="px-4 py-2 rounded-tr-lg">Prioridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium">01 · Priorizar bugs críticos</td>
                <td className="px-4 py-3 text-slate-600">Atender los defectos críticos antes de incrementar el volumen de trabajo.</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-red-100 text-red-700 font-bold rounded text-xs">ALTA</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">02 · Revisar tiempos de espera</td>
                <td className="px-4 py-3 text-slate-600">Analizar incidencias con mayor Lead Time para detectar cuellos de botella.</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 font-bold rounded text-xs">MEDIA</span></td>
              </tr>
            </tbody>
          </table>
          
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
            Generado por MCHAV Analytics · Reporte Interno Confidencial
          </div>
        </section>

      </div>
    </div>
  );
});

export default ExecutiveReportTemplate;
