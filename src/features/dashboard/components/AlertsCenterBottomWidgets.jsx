import React, { useMemo } from 'react';
import { TrendingUp, Info, Code, Layers, Layout, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AlertsCenterBottomWidgets = ({
  categoryCounts = {},
  trendData = [],
  trendTimeframe = 'weekly',
  setTrendTimeframe,
  sidebarCategory = 'ALL',
  setSidebarCategory,
  setStatusTab
}) => {
  const [localTimeframe, setLocalTimeframe] = React.useState('weekly');
  const activeTimeframe = trendTimeframe || localTimeframe;

  const handleTimeframeChange = (val) => {
    if (setTrendTimeframe) {
      setTrendTimeframe(val);
    }
    setLocalTimeframe(val);
  };

  const chartData = useMemo(() => {
    if (trendData && trendData.length > 0) return trendData;
    return [
      { name: '10 sep', val: 4 },
      { name: '12 sep', val: 8 },
      { name: '14 sep', val: 6 },
      { name: '16 sep', val: 14 },
      { name: '18 sep', val: 9 },
      { name: '20 sep', val: 18 }
    ];
  }, [trendData, activeTimeframe]);

  const maxVal = Math.max(1, ...chartData.map(d => d.val || 0));

  const maxCategoryCount = Math.max(
    1,
    categoryCounts['Código'] || 0,
    categoryCounts['Procesos'] || 0,
    categoryCounts['UI/UX'] || 0,
    categoryCounts['Documentación'] || 0
  );

  const getWidthPct = (count) => {
    if (!count) return 0;
    return Math.max(12, Math.round((count / maxCategoryCount) * 100));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
      {/* ── CARD 1: TENDENCIA DE FEEDBACK GENERAL ── */}
      <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Tendencia de feedback general
            </h3>
          </div>

          <select
            value={activeTimeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            className="bg-white dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1 outline-none cursor-pointer"
          >
            <option value="monthly">Últimos 30 días</option>
            <option value="weekly">Últimos 7 días</option>
          </select>
        </div>

        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="purpleGradientBottom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, Math.ceil(maxVal * 1.1)]} />
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
                stroke="#7c3aed"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#purpleGradientBottom)"
                dot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── CARD 2: ÁREAS QUE REQUIEREN ATENCIÓN ── */}
      <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Áreas que requieren atención</span>
            <Info size={14} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer" />
          </h3>
          <button
            type="button"
            onClick={() => {
              if (setSidebarCategory) setSidebarCategory('ALL');
              if (setStatusTab) setStatusTab('ALL');
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Ver todas
          </button>
        </div>

        <div className="space-y-4 pt-1">
          {/* Item 1: Código */}
          <div
            onClick={() => setSidebarCategory && setSidebarCategory(sidebarCategory === 'Código' ? 'ALL' : 'Código')}
            className="space-y-1.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100">
                <Code size={15} className="text-rose-500" />
                <span>Código</span>
              </div>
              <span className="text-slate-900 dark:text-white font-black">{categoryCounts['Código'] ?? 0}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full transition-all duration-300" style={{ width: `${getWidthPct(categoryCounts['Código'] || 0)}%` }}></div>
            </div>
          </div>

          {/* Item 2: Procesos */}
          <div
            onClick={() => setSidebarCategory && setSidebarCategory(sidebarCategory === 'Procesos' ? 'ALL' : 'Procesos')}
            className="space-y-1.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100">
                <Layers size={15} className="text-amber-500" />
                <span>Procesos</span>
              </div>
              <span className="text-slate-900 dark:text-white font-black">{categoryCounts['Procesos'] ?? 0}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${getWidthPct(categoryCounts['Procesos'] || 0)}%` }}></div>
            </div>
          </div>

          {/* Item 3: UI/UX */}
          <div
            onClick={() => setSidebarCategory && setSidebarCategory(sidebarCategory === 'UI/UX' ? 'ALL' : 'UI/UX')}
            className="space-y-1.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100">
                <Layout size={15} className="text-emerald-500" />
                <span>UI/UX</span>
              </div>
              <span className="text-slate-900 dark:text-white font-black">{categoryCounts['UI/UX'] ?? 0}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${getWidthPct(categoryCounts['UI/UX'] || 0)}%` }}></div>
            </div>
          </div>

          {/* Item 4: Documentación */}
          <div
            onClick={() => setSidebarCategory && setSidebarCategory(sidebarCategory === 'Documentación' ? 'ALL' : 'Documentación')}
            className="space-y-1.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100">
                <FileText size={15} className="text-blue-500" />
                <span>Documentación</span>
              </div>
              <span className="text-slate-900 dark:text-white font-black">{categoryCounts['Documentación'] ?? 0}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${getWidthPct(categoryCounts['Documentación'] || 0)}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

