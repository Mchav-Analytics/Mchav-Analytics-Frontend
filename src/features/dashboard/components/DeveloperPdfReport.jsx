import React, { forwardRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const DeveloperPdfReport = forwardRef(({ project, devName, kpis, assignedIssues }, ref) => {
  // Extract KPIs
  const cycleTimeKpi = kpis?.find(k => k.id === 'cycle-time') || { value: '3.2', trend: '↓ 0.3 días vs. sprint previo' };
  const wipKpi = kpis?.find(k => k.id === 'wip') || { value: '7', trend: '70% de capacidad' };
  const throughputKpi = kpis?.find(k => k.id === 'throughput') || { value: '14', trend: 'Promedio: 2.3/día' };
  const spKpi = kpis?.find(k => k.id === 'story-points') || { value: '65', trend: '81% de la meta' };

  // Calculate distribution (matching DeveloperView logic)
  const storyCount = assignedIssues?.filter(i => (i.tipo || '').toLowerCase().includes('historia') || (i.tipo || '').toLowerCase().includes('story')).length || 0;
  const bugCount = assignedIssues?.filter(i => (i.tipo || '').toLowerCase().includes('bug') || (i.tipo || '').toLowerCase().includes('defecto')).length || 0;
  const taskCount = assignedIssues?.filter(i => (i.tipo || '').toLowerCase().includes('tarea') || (i.tipo || '').toLowerCase().includes('deuda') || (i.tipo || '').toLowerCase().includes('task')).length || 0;
  const totalIssues = storyCount + bugCount + taskCount;

  const distributionData = [
    { name: 'Historias de Usuario', value: storyCount, color: '#4f46e5' }, // indigo-600
    { name: 'Bugs / Defectos', value: bugCount, color: '#e11d48' },        // rose-600
    { name: 'Tareas / Deuda Técnica', value: taskCount, color: '#0ea5e9' } // sky-500
  ].filter(d => d.value > 0);

  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="hidden">
      <div ref={ref} className="bg-white text-slate-900 font-sans p-6 pdf-content max-w-4xl mx-auto">
        {/* Estilos para impresión (A4) */}
        <style type="text/css" media="print">
          {`
            @page { size: A4 portrait; margin: 15mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
            .pdf-content { display: block !important; width: 100%; }
          `}
        </style>

        {/* TODO EL INFORME FLUYE NATURALMENTE SIN ALTURAS FIJAS */}
        
        {/* HEADER COMPACTO */}
        <div className="border-b-2 border-slate-800 pb-3 mb-5 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">MCHAV-ANALYTICS</h1>
            <h2 className="text-base font-bold text-slate-600 mt-0.5">Informe de desempeño del proyecto</h2>
          </div>
          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <p><strong className="text-slate-700">Proyecto:</strong> {project?.nombre || 'N/A'}</p>
            <p><strong className="text-slate-700">Desarrollador:</strong> {devName}</p>
            <p><strong className="text-slate-700">Rol:</strong> Developer</p>
            <p><strong className="text-slate-700">Fecha:</strong> {today}</p>
          </div>
        </div>

        {/* RESUMEN EJECUTIVO EN UNA FILA */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1 mb-3">Resumen Ejecutivo</h3>
          <div className="grid grid-cols-4 gap-3">
            
            {/* KPI 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cycle Time</span>
              <div className="text-xl font-black text-emerald-600">{cycleTimeKpi.value} <span className="text-xs font-bold">días</span></div>
              <span className="text-[9px] text-slate-500 mt-1 font-medium">{cycleTimeKpi.trend}</span>
            </div>
            
            {/* KPI 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tickets WIP</span>
              <div className="text-xl font-black text-purple-600">{wipKpi.value} <span className="text-xs font-bold">activos</span></div>
              <span className="text-[9px] text-slate-500 mt-1 font-medium">{wipKpi.trend}</span>
            </div>

            {/* KPI 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Throughput</span>
              <div className="text-xl font-black text-cyan-600">{throughputKpi.value} <span className="text-xs font-bold">tickets</span></div>
              <span className="text-[9px] text-slate-500 mt-1 font-medium">{throughputKpi.trend}</span>
            </div>

            {/* KPI 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Story Points</span>
              <div className="text-xl font-black text-pink-600">{spKpi.value} <span className="text-xs font-bold">SP</span></div>
              <span className="text-[9px] text-slate-500 mt-1 font-medium">{spKpi.trend}</span>
            </div>

          </div>
        </div>

        {/* DISTRIBUCIÓN DEL TRABAJO */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1 mb-3">Distribución del trabajo</h3>
          
          <div className="flex items-center justify-center gap-8 bg-slate-50 border border-slate-100 rounded-lg py-4 px-6">
            {/* Leyenda */}
            <div className="space-y-3">
              <div className="mb-4">
                <span className="block text-xs text-slate-500 font-medium">Total incidencias</span>
                <span className="text-2xl font-black text-slate-800">{totalIssues}</span>
              </div>
              
              {distributionData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{d.name}</span>
                    <span className="text-[10px] text-slate-500">{d.value} incidencias {totalIssues > 0 ? `(${(d.value / totalIssues * 100).toFixed(0)}%)` : ''}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Gráfico Compacto */}
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false} // IMPORTANTE PARA IMPRESIÓN
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TAREAS ASIGNADAS (Inmediatamente debajo) */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1 mb-3">Tareas asignadas</h3>

          <div className="w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-600">
                  <th className="py-2 px-2 font-bold w-20">Clave</th>
                  <th className="py-2 px-2 font-bold">Resumen</th>
                  <th className="py-2 px-2 font-bold w-28">Estado</th>
                  <th className="py-2 px-2 font-bold w-12 text-center">SP</th>
                  <th className="py-2 px-2 font-bold w-20 text-right">Cycle Time</th>
                </tr>
              </thead>
              <tbody>
                {assignedIssues?.map((issue, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 px-2 font-mono font-bold text-slate-800 text-[10px]">{issue.key_issue}</td>
                    <td className="py-2 px-2 text-slate-700 font-medium text-[11px] pr-2 truncate max-w-[200px]" title={issue.summary}>{issue.summary}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider
                        ${issue.status_actual === 'EN PROGRESO' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        issue.status_actual === 'BLOQUEADA' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        issue.status_actual === 'EN REVISIÓN' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        issue.status_actual === 'COMPLETADA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {issue.status_actual}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-slate-700 text-[11px]">{issue.story_points || '-'}</td>
                    <td className="py-2 px-2 text-right text-slate-500 font-medium text-[11px]">{issue.cycle_time_days > 0 ? `${issue.cycle_time_days}d` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-3 flex justify-between text-[9px] text-slate-400 font-semibold uppercase mt-8">
          <span>MCHAV-ANALYTICS | Informe de desempeño</span>
          <span>Impreso el {today}</span>
        </div>

      </div>
    </div>
  );
});
