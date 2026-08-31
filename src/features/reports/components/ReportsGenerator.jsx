import React from 'react';
import { Folder, Flag, User, FileText, Check } from 'lucide-react';

export function ReportsGenerator({
  reportType, setReportType,
  reportParam, setReportParam,
  customStartDate, setCustomStartDate,
  customEndDate, setCustomEndDate,
  isGenerating, handleGenerateLiveReport,
  dbProjects, dbUsers
}) {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full pt-4">
        
        {/* PASO 1 */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">1</div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">¿Qué quieres analizar?</h3>
              <p className="text-sm text-slate-500">Selecciona el enfoque del reporte que deseas generar.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ml-0 md:ml-12">
            {[
              { id: 'proyecto', icon: Folder, title: 'Proyecto', desc: 'Rendimiento completo', 
                theme: { bg: 'bg-gradient-to-br from-indigo-100/80 to-indigo-50/30 dark:from-indigo-900/40 dark:to-indigo-900/10', border: 'border-indigo-200/60 dark:border-indigo-500/20', iconBg: 'bg-indigo-500', iconShadow: 'shadow-indigo-500/30', activeBorder: 'border-indigo-500 dark:border-indigo-400', ring: 'ring-indigo-500/20' } 
              },
              { id: 'sprint', icon: Flag, title: 'Sprint', desc: 'Análisis de un sprint', 
                theme: { bg: 'bg-gradient-to-br from-emerald-100/80 to-emerald-50/30 dark:from-emerald-900/40 dark:to-emerald-900/10', border: 'border-emerald-200/60 dark:border-emerald-500/20', iconBg: 'bg-emerald-500', iconShadow: 'shadow-emerald-500/30', activeBorder: 'border-emerald-500 dark:border-emerald-400', ring: 'ring-emerald-500/20' } 
              },
              { id: 'desarrollador', icon: User, title: 'Desarrollador', desc: 'Productividad individual', 
                theme: { bg: 'bg-gradient-to-br from-fuchsia-100/80 to-fuchsia-50/30 dark:from-fuchsia-900/40 dark:to-fuchsia-900/10', border: 'border-fuchsia-200/60 dark:border-fuchsia-500/20', iconBg: 'bg-fuchsia-500', iconShadow: 'shadow-fuchsia-500/30', activeBorder: 'border-fuchsia-500 dark:border-fuchsia-400', ring: 'ring-fuchsia-500/20' } 
              },
              { id: 'general', icon: FileText, title: 'Resumen General', desc: 'Visión de alto nivel', 
                theme: { bg: 'bg-gradient-to-br from-amber-100/80 to-amber-50/30 dark:from-amber-900/40 dark:to-amber-900/10', border: 'border-amber-200/60 dark:border-amber-500/20', iconBg: 'bg-amber-500', iconShadow: 'shadow-amber-500/30', activeBorder: 'border-amber-500 dark:border-amber-400', ring: 'ring-amber-500/20' } 
              }
            ].map(item => (
              <div 
                key={item.id} onClick={() => setReportType(item.id)}
                className={`p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 text-center flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 relative overflow-hidden group ${item.theme.bg} ${reportType === item.id ? `${item.theme.activeBorder} ring-4 ${item.theme.ring} scale-[1.02]` : `${item.theme.border} hover:border-white/50`}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${item.theme.iconBg} ${item.theme.iconShadow} transition-transform duration-300 group-hover:scale-110`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
                
                {reportType === item.id && (
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm ${item.theme.iconBg} animate-in zoom-in duration-300`}>
                        <Check className="w-3.5 h-3.5" />
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="h-px w-full mb-12 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent opacity-70"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 ml-0 md:ml-12">
          {/* PASO 2 */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Configura tu reporte</h3>
                <p className="text-sm text-slate-500">Completa los filtros según el análisis.</p>
              </div>
            </div>

            <div className="space-y-6 ml-0 md:ml-12">
              {reportType !== 'general' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{reportType}</label>
                  <div className="relative">
                    <select 
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                      value={reportParam} onChange={(e) => setReportParam(e.target.value)}
                    >
                      <option value="">Selecciona un {reportType}...</option>
                      {reportType === 'proyecto' && dbProjects.map(p => <option key={p.id_proyecto} value={p.id_proyecto}>{p.nombre}</option>)}
                      {reportType === 'desarrollador' && dbUsers.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Periodo</label>
                <div className="flex items-center gap-2 border border-slate-200 dark:border-white/10 rounded-xl p-1 bg-white dark:bg-white/[0.03] shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none">
                  <input type="date" className="flex-1 px-3 py-2 outline-none text-sm bg-transparent text-slate-700 dark:text-slate-200" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
                  <span className="text-slate-400">&rarr;</span>
                  <input type="date" className="flex-1 px-3 py-2 outline-none text-sm bg-transparent text-slate-700 dark:text-slate-200" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* PASO 3 */}
          <div className="relative h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 rounded-full bg-indigo-400 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Contenido del reporte</h3>
                <p className="text-sm text-slate-500">Se incluirán las siguientes secciones:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 md:ml-12 mb-20 flex-1">
              {(reportType === 'proyecto' 
                ? ['Resumen ejecutivo', 'KPIs del proyecto', 'Velocidad por sprint', 'Distribución del trabajo', 'Calidad y bugs', 'Bloqueos y riesgos']
                : reportType === 'sprint'
                ? ['Resumen del sprint', 'Burnup del sprint', 'Tareas completadas vs pendientes', 'Distribución por desarrollador', 'Bugs reportados', 'Retrospectiva y mejoras']
                : reportType === 'desarrollador'
                ? ['Perfil del desarrollador', 'Story points completados', 'Velocidad y tendencia', 'Calidad del código', 'Tareas por estado', 'Comparativa con el equipo']
                : ['Resumen ejecutivo', 'Indicadores clave', 'Tendencia y evolución', 'Distribución del trabajo', 'Calidad y bugs', 'Bloqueos y riesgos']
              ).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={handleGenerateLiveReport} disabled={isGenerating}
              className="absolute bottom-0 right-0 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-3 transition-all"
            >
              Generar reporte &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
