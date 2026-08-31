import React from 'react';
import { History, GitMerge, Clock, ChevronRight, Folder, Calendar, Download, User, Flag } from 'lucide-react';

export function ReportsHistory({
  selectedMonth, setSelectedMonth,
  selectedYear, setSelectedYear,
  compareMonth, setCompareMonth,
  compareYear, setCompareYear,
  handleFetchHistory,
  months, years
}) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pt-2">
      
      {/* Controles del Historial */}
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 px-2">Reconstruir Histórico</h3>
        <div className="bg-white dark:bg-white/[0.02] rounded-2xl p-3 pl-6 shadow-sm border border-slate-200 dark:border-white/10 relative z-10 backdrop-blur-xl flex flex-col md:flex-row items-center gap-4 justify-between">
            
            <div className="flex items-center gap-4 flex-1 w-full">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:block">Base</span>
                <div className="flex gap-2 w-full md:w-auto">
                    <select className="w-full md:w-32 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.05] text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                        <option value="">Mes...</option>
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select className="w-24 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.05] text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="hidden md:flex items-center justify-center px-4">
                <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-full text-slate-400">
                    <GitMerge className="w-4 h-4" />
                </div>
            </div>

            <div className="flex items-center gap-4 flex-1 w-full">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:block">Comparar</span>
                <div className="flex gap-2 w-full md:w-auto">
                    <select className="w-full md:w-32 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.05] text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500" value={compareMonth} onChange={e => setCompareMonth(e.target.value)}>
                        <option value="">Opcional...</option>
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select className="w-24 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.05] text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500" value={compareYear} onChange={e => setCompareYear(e.target.value)}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
            
            <button onClick={handleFetchHistory} className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:-translate-y-0.5 whitespace-nowrap">
                <History className="w-4 h-4" /> Generar
            </button>
        </div>
      </div>

      {/* SECCIÓN DE REPORTES RECIENTES */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-500/30">
                    <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Reportes recientes</h3>
            </div>
            <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group">
                Ver historial completo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-[1.5rem] border-2 border-indigo-100/50 dark:border-indigo-500/20 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/20 dark:to-transparent cursor-pointer group transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                        <Folder className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Reporte de Proyecto</h4>
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">MCHAV Analytics</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-indigo-100 dark:border-indigo-500/20">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 01/07 - 31/07</p>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-[1.5rem] border-2 border-emerald-100/50 dark:border-emerald-500/20 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/20 dark:to-transparent cursor-pointer group transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Reporte de Equipo</h4>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Equipo Backend</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-emerald-100 dark:border-emerald-500/20">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 01/07 - 31/07</p>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-[1.5rem] border-2 border-sky-100/50 dark:border-sky-500/20 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-sky-50/50 to-white dark:from-sky-900/20 dark:to-transparent cursor-pointer group transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform duration-300">
                        <Flag className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Reporte de Sprint</h4>
                        <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mt-0.5">Sprint 04</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-sky-100 dark:border-sky-500/20">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 30/06 - 13/07</p>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 group-hover:text-sky-600 group-hover:border-sky-200 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
