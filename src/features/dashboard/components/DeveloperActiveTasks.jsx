import React from 'react';
import { User, Bug, FileText, PieChart as PieChartIcon, ListTodo, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '0.75rem',
  color: '#f8fafc',
  fontSize: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
};

export default function DeveloperActiveTasks({
  totalCount,
  donutData,
  typeFilter,
  setTypeFilter,
  setCurrentPage,
  filteredTasks,
  ITEMS_PER_PAGE,
  currentPage,
  taskFilter,
  setTaskFilter,
  setSelectedIssueModal
}) {
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
      {/* TARJETA IZQUIERDA (5 COLUMNAS): DISTRIBUCIÓN DE MI TRABAJO CON GRÁFICA Y LEYENDAS LADO A LADO */}
      <div className="xl:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon size={16} className="text-indigo-400" />
              Distribución de mi trabajo
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proporción de tiempo y esfuerzo asignado por tipo de incidencia personal.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 shrink-0 ml-2">Total: {totalCount} incidencias</span>
        </div>

        {/* CONTENIDO CENTRADO Y NATIVO LADO A LADO */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">

            {/* GRÁFICA CIRCULAR DE DONA */}
            <div className="h-44 w-full relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="pct"
                  >
                    {donutData.map((entry, index) => {
                      const tMap = { 'Historias de Usuario': 'Historia', 'Bugs / Defectos': 'Bug', 'Tareas / Deuda Técnica': 'Tarea' };
                      const isSelected = typeFilter === tMap[entry.name];
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          opacity={typeFilter === 'ALL' || isSelected ? 1 : 0.3}
                          className="cursor-pointer transition-all hover:opacity-80 outline-none"
                          onClick={() => {
                            const newType = tMap[entry.name];
                            setTypeFilter(prev => prev === newType ? 'ALL' : newType);
                            setCurrentPage(1);
                          }}
                        />
                      );
                    })}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Mis Tareas</span>
              </div>
            </div>

            {/* LEYENDAS LADO A LADO */}
            <div className="space-y-2.5">
              {donutData.map((item, idx) => {
                const tMap = { 'Historias de Usuario': 'Historia', 'Bugs / Defectos': 'Bug', 'Tareas / Deuda Técnica': 'Tarea' };
                const IconMap = { 'Historias de Usuario': User, 'Bugs / Defectos': Bug, 'Tareas / Deuda Técnica': FileText };
                const ItemIcon = IconMap[item.name] || FileText;
                const isSelected = typeFilter === tMap[item.name];
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => {
                      const newType = tMap[item.name];
                      setTypeFilter(prev => prev === newType ? 'ALL' : newType);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border ${isSelected ? 'bg-slate-100 dark:bg-slate-800 border-indigo-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <ItemIcon size={14} className={`${isSelected ? 'text-indigo-500' : 'text-slate-400'} shrink-0`} />
                      <span className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{item.name}</span>
                    </div>
                    <span className={`text-xs font-black shrink-0 ml-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                      {item.count} <span className="text-slate-400 text-[10px]">({item.pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* TARJETA DERECHA (7 COLUMNAS): MIS TAREAS ASIGNADAS CON PAGINACIÓN */}
      <div className="xl:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ListTodo size={18} className="text-indigo-400" />
              Mis Tareas Asignadas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Listado completo de tus tareas asignadas con estado y esfuerzo.
            </p>
          </div>

          {/* FILTROS DE ESTADO */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            {[
              { key: 'ALL', label: 'Todas' },
              { key: 'IN_PROGRESS', label: 'En progreso' },
              { key: 'PENDING', label: 'Pendientes' },
              { key: 'BLOCKED', label: 'Bloqueadas' },
              { key: 'COMPLETED', label: 'Completadas' }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setTaskFilter(f.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer shrink-0 ${taskFilter === f.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* TABLA DE TAREAS ASIGNADAS */}
        <div className="overflow-x-auto flex-1 min-h-[220px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400">
                <th className="py-2.5 px-3">Clave</th>
                <th className="py-2.5 px-3">Resumen</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-center">SP</th>
                <th className="py-2.5 px-3 text-center">Cycle</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map((t) => (
                  <tr key={t.key_issue} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-300">
                      {t.key_issue}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {t.summary}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {(() => {
                        const st = (t.status_actual || 'POR HACER').toUpperCase();
                        if (st.includes('LISTO') || st.includes('DONE') || st.includes('COMPLETADA') || st.includes('FINALIZADO')) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                              <CheckCircle2 size={12} className="text-emerald-500" />
                              Listo
                            </span>
                          );
                        }
                        if (st.includes('PROGRESO') || st.includes('PROGRESS') || st.includes('CURSO')) {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                              En Progreso
                            </span>
                          );
                        }
                        if (st.includes('BLOQUEADA') || st.includes('BLOCKED')) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40">
                              <AlertTriangle size={12} className="text-rose-500" />
                              Bloqueada
                            </span>
                          );
                        }
                        if (st.includes('REVISI') || st.includes('REVIEW')) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                              <Clock size={12} className="text-amber-500" />
                              En Revisión
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                            Por Hacer
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                      {t.story_points} SP
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-400 text-[11px]">
                      {t.cycle_time_days > 0 ? `${t.cycle_time_days}d` : '--'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedIssueModal(t)}
                        className="px-3 py-1 text-[11px] font-extrabold rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No hay tareas que coincidan con este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
          <span className="text-slate-400 font-medium">
            Mostrando {filteredTasks.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length)} de {filteredTasks.length} tareas
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
            >
              Anterior
            </button>

            <span className="text-slate-400 font-bold text-xs px-1">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
