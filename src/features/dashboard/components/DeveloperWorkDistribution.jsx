import React from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '0.75rem',
  color: '#f8fafc',
  fontSize: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
};

export const DeveloperWorkDistribution = ({ donutData, totalCount, typeFilter, setTypeFilter, setCurrentPage }) => {
  return (
    <div className="lg:col-span-5 p-5 sm:p-7 rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md border border-slate-200/80 dark:border-[#272b5c]/80 shadow-sm space-y-4 flex flex-col justify-between relative overflow-hidden group h-full">
      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] -z-10 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity"></div>
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="space-y-0.5">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <PieChartIcon size={16} className="text-indigo-400" />
            Distribución de mi trabajo
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Proporción de esfuerzo asignado por tipo de incidencia.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-400 shrink-0 ml-2">Total: {totalCount}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 items-center gap-4 py-2">
          {/* GRÁFICA CIRCULAR DE DONA */}
          <div className="h-40 w-full relative flex items-center justify-center shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={60}
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

          {/* LEYENDAS */}
          <div className="space-y-2">
            {donutData.map((item, idx) => {
              const ItemIcon = item.icon || PieChartIcon;
              const tMap = { 'Historias de Usuario': 'Historia', 'Bugs / Defectos': 'Bug', 'Tareas / Deuda Técnica': 'Tarea' };
              const isSelected = typeFilter === tMap[item.name];
              
              return (
                <div 
                  key={idx} 
                  onClick={() => {
                    const newType = tMap[item.name];
                    setTypeFilter(prev => prev === newType ? 'ALL' : newType);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${isSelected ? 'bg-slate-100 dark:bg-slate-800 border-indigo-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <ItemIcon size={13} className={`${isSelected ? 'text-indigo-500' : 'text-slate-400'} shrink-0`} />
                    <span className={`text-[11px] font-semibold truncate ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{item.name}</span>
                  </div>
                  <span className={`text-[11px] font-black shrink-0 ml-1.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                    {item.count} <span className="text-slate-400 text-[10px]">({item.pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
