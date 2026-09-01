import React from 'react';
import { Info } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

const RESOLUTION_TIME_DATA = [
  { name: '7 Jul', val: 5 },
  { name: '14 Jul', val: 3 },
  { name: '21 Jul', val: 4 },
  { name: '28 Jul', val: 2 },
  { name: '4 Ago', val: 4.2 },
];

export const AlertsCenterBottomWidgets = ({ setStatusTab, setSidebarCategory, onNavigateTab }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
      {/* ── CARD 1: ACTIVIDAD RECIENTE ── */}
      <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
            Actividad reciente
          </h3>

          <div className="space-y-3 pt-1">
            {/* Action 1 */}
            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                CC
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-slate-700 dark:text-slate-200 font-medium line-clamp-1">
                  <strong className="font-extrabold">Camila C.</strong> comentó en "Refactorizar módulo..."
                </p>
                <span className="text-[10px] text-slate-400 font-semibold">Hace 1h</span>
              </div>
            </div>

            {/* Action 2 */}
            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                MA
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-slate-700 dark:text-slate-200 font-medium line-clamp-1">
                  <strong className="font-extrabold">Mike A.</strong> marcó como resuelto "Optimizar..."
                </p>
                <span className="text-[10px] text-slate-400 font-semibold">Hace 2h</span>
              </div>
            </div>

            {/* Action 3 */}
            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                VH
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-slate-700 dark:text-slate-200 font-medium line-clamp-1">
                  <strong className="font-extrabold">Valentina H.</strong> creó "Mejorar documentación..."
                </p>
                <span className="text-[10px] text-slate-400 font-semibold">Hace 5h</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => {
            if (setStatusTab) setStatusTab('ALL');
            if (setSidebarCategory) setSidebarCategory('ALL');
            if (onNavigateTab) {
              onNavigateTab('activity_history');
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }} 
          className="text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-2 cursor-pointer"
        >
          Ver toda la actividad
        </button>
      </div>

      {/* ── CARD 2: TIEMPO PROMEDIO DE RESOLUCIÓN ── */}
      <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
              Tiempo promedio de resolución
            </h3>
            <Info size={13} className="text-slate-400" />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              4.2 días
            </span>
            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
              ↑ 39% vs. período anterior
            </span>
          </div>

          {/* Mini Bar Chart */}
          <div className="h-20 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RESOLUTION_TIME_DATA} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Bar dataKey="val" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
