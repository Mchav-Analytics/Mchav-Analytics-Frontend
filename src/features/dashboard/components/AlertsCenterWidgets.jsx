import React from 'react';
import { Info, Code, Layers, Layout, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TREND_DATA = [
  { name: '7 Jul', val: 4 },
  { name: '14 Jul', val: 9 },
  { name: '21 Jul', val: 6 },
  { name: '28 Jul', val: 8 },
  { name: '4 Ago', val: 11 },
];

export const AlertsCenterWidgets = ({ categoryCounts = {} }) => {
  return (
    <div className="lg:col-span-4 space-y-6">
      {/* ── WIDGET 1: TENDENCIA DE FEEDBACK ── */}
      <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Tendencia de feedback
            </h3>
            <div className="group relative cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <Info size={14} />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-44 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl z-50 text-center">
                Muestra la evolución semanal del feedback reportado.
              </div>
            </div>
          </div>

          <select className="bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1 outline-none cursor-pointer">
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>

        {/* Smooth Area Chart */}
        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 12]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke="#8b5cf6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#purpleGradient)" 
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── WIDGET 2: ÁREAS QUE REQUIEREN ATENCIÓN ── */}
      <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Áreas que requieren atención
            </h3>
            <div className="group relative cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <Info size={14} />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-44 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl z-50 text-center">
                Volumen de observaciones acumuladas por módulo.
              </div>
            </div>
          </div>

          <a href="#" onClick={e => e.preventDefault()} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Ver análisis completo
          </a>
        </div>

        <div className="space-y-3.5 pt-1">
          {/* Item 1: Código */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Code size={15} className="text-rose-500" />
                <span>Código</span>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white">5</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full w-[80%]"></div>
            </div>
          </div>

          {/* Item 2: Procesos */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Layers size={15} className="text-amber-500" />
                <span>Procesos</span>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white">3</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full w-[60%]"></div>
            </div>
          </div>

          {/* Item 3: UI/UX */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Layout size={15} className="text-emerald-500" />
                <span>UI/UX</span>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white">2</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-[40%]"></div>
            </div>
          </div>

          {/* Item 4: Documentación */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <FileText size={15} className="text-blue-500" />
                <span>Documentación</span>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white">1</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full w-[20%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
