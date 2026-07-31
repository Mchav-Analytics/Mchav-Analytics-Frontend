// ============================================================================
// VISTA OFICIAL DE REPORTES — Generación PDF, métricas, KPIs e historial
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  FileText,
  Clock,
  CheckCircle2,
  Trash2,
  BarChart3,
  FolderKanban,
  CalendarRange,
  FileDown,
  Activity,
  AlertCircle,
  Loader2,
  Eye,
  X,
  Files,
  HardDrive,
  ChevronDown,
  Search
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const PROJECTS = [
  { id: 'pasd', code: 'PASD', name: 'PASD - Analytics Delivery' },
  { id: 'mchav', code: 'MCHAV', name: 'MCHAV - Core Platform' },
  { id: 'jira', code: 'JIRA', name: 'JIRA - Sync Workspace' }
];

const INITIAL_HISTORY = [
  {
    id: 'rep-001',
    fileName: 'Reporte_PASD_Q1_2026.pdf',
    generatedAt: '2026-03-12 14:32',
    projectCode: 'PASD',
    size: '2.4 MB',
    generatedBy: 'Stephany Leon',
    status: 'READY'
  },
  {
    id: 'rep-002',
    fileName: 'Throughput_MCHAV_Feb.pdf',
    generatedAt: '2026-02-28 09:15',
    projectCode: 'MCHAV',
    size: '1.8 MB',
    generatedBy: 'Mauricio Salamanca',
    status: 'READY'
  },
  {
    id: 'rep-003',
    fileName: 'CycleTime_PASD_Sprint4.pdf',
    generatedAt: '2026-02-18 16:40',
    projectCode: 'PASD',
    size: '3.1 MB',
    generatedBy: 'Clara Gómez',
    status: 'ERROR'
  }
];

const TREND_DATA = [
  { sprint: 'SP_1', value: 42 },
  { sprint: 'SP_2', value: 58 },
  { sprint: 'SP_3', value: 51 },
  { sprint: 'SP_4', value: 67 }
];

const METRICS = [
  { id: 'throughput', label: 'Throughput', value: 78 },
  { id: 'cycle', label: 'Cycle Time Promedio', value: 64 },
  { id: 'lead', label: 'Lead Time Promedio', value: 52 },
  { id: 'velocity', label: 'Velocidad del Equipo', value: 71 },
  { id: 'bugs', label: 'Bugs Críticos Resueltos', value: 45 }
];

function hashSeed(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

function StatusBadge({ status }) {
  if (status === 'GENERATING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300">
        <Loader2 size={11} className="animate-spin" /> Generando
      </span>
    );
  }
  if (status === 'ERROR') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300">
        <AlertCircle size={11} /> Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-700 dark:text-teal-300">
      <CheckCircle2 size={11} /> Listo
    </span>
  );
}

export default function ReportsView({ projects = [], isDarkMode }) {
  const projectOptions = useMemo(() => {
    if (!projects.length) return PROJECTS;
    return projects.map((p, idx) => {
      const code = (p.key_proyecto || p.key || p.nombre || p.name || `P${idx + 1}`)
        .toString()
        .slice(0, 8)
        .toUpperCase();
      const name = p.nombre || p.name || p.key_proyecto || p.key || `Proyecto ${idx + 1}`;
      return {
        id: String(p.id_proyecto ?? p.id ?? idx),
        code,
        name: `${code} - ${name}`
      };
    });
  }, [projects]);

  const [selectedProject, setSelectedProject] = useState(projectOptions[0]?.id || '');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [historyProject, setHistoryProject] = useState('ALL');
  const [historyStatus, setHistoryStatus] = useState('ALL');
  const [historySearch, setHistorySearch] = useState('');

  useEffect(() => {
    if (!projectOptions.length) return;
    const stillValid = projectOptions.some(p => p.id === selectedProject);
    if (!stillValid) setSelectedProject(projectOptions[0].id);
  }, [projectOptions, selectedProject]);

  const selectedMeta = projectOptions.find(p => p.id === selectedProject) || projectOptions[0];

  const projectMetrics = useMemo(() => {
    const seed = hashSeed(selectedMeta?.code || 'REP');
    return METRICS.map((m, idx) => ({
      ...m,
      value: 35 + ((seed + idx * 17) % 55)
    }));
  }, [selectedMeta?.code]);

  const projectTrend = useMemo(() => {
    const seed = hashSeed(selectedMeta?.code || 'REP');
    return TREND_DATA.map((t, idx) => ({
      ...t,
      value: 30 + ((seed + idx * 23) % 50)
    }));
  }, [selectedMeta?.code]);

  const readyCount = history.filter(h => h.status === 'READY').length;
  const errorCount = history.filter(h => h.status === 'ERROR').length;
  const lastReport = history.find(h => h.status === 'READY') || history[0];
  const avgSize = useMemo(() => {
    const nums = history
      .map(h => parseFloat(h.size))
      .filter(n => !Number.isNaN(n));
    if (!nums.length) return '0 MB';
    return `${(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)} MB`;
  }, [history]);

  const filteredHistory = history.filter(row => {
    const q = historySearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      row.fileName.toLowerCase().includes(q) ||
      row.generatedBy.toLowerCase().includes(q) ||
      row.projectCode.toLowerCase().includes(q);
    const matchProject = historyProject === 'ALL' || row.projectCode === historyProject;
    const matchStatus = historyStatus === 'ALL' || row.status === historyStatus;
    return matchSearch && matchProject && matchStatus;
  });

  const historyProjects = useMemo(
    () => Array.from(new Set(history.map(h => h.projectCode))),
    [history]
  );

  const downloadProjectPdf = (code, fileName) => {
    const content = [
      'MCHAV Analytics — Reporte consolidado',
      `Proyecto: ${code}`,
      `Periodo: ${startDate} a ${endDate}`,
      '',
      'Métricas incluidas:',
      ...projectMetrics.map(m => `- ${m.label}: ${m.value}%`),
      '',
      'Documento generado desde la vista Reportes.'
    ].join('\n');

    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const runGenerate = () => {
    if (!selectedProject || !startDate || !endDate || !selectedMeta) return;
    setShowPreview(false);
    setGenerating(true);
    setProgress(12);
    setSuccessMsg('');

    const code = selectedMeta.code;
    const fileName = `Reporte_${code}_${startDate}_a_${endDate}.pdf`;
    const tempId = `rep-${Date.now()}`;
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

    setHistory(prev => [
      {
        id: tempId,
        fileName,
        generatedAt: stamp,
        projectCode: code,
        size: '—',
        generatedBy: 'Stephany Leon',
        status: 'GENERATING'
      },
      ...prev
    ]);

    const tick = window.setInterval(() => {
      setProgress(p => Math.min(p + 18, 90));
    }, 180);

    window.setTimeout(() => {
      window.clearInterval(tick);
      setProgress(100);
      const size = `${(1.5 + Math.random() * 2).toFixed(1)} MB`;
      setHistory(prev =>
        prev.map(r =>
          r.id === tempId
            ? { ...r, status: 'READY', size }
            : r
        )
      );
      downloadProjectPdf(code, fileName);
      setGenerating(false);
      setProgress(0);
      setSuccessMsg(`PDF de ${code} generado y descargado.`);
      window.setTimeout(() => setSuccessMsg(''), 3500);
    }, 1400);
  };

  const handleDelete = (id) => {
    setHistory(prev => prev.filter(r => r.id !== id));
  };

  const fieldClass =
    'w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm leading-normal text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/35 focus:border-teal-500 transition-shadow';
  const labelClass =
    'text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider';

  return (
    <div className="w-full flex flex-col gap-10 animate-in fade-in duration-300 pb-12">
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-800 dark:text-teal-300 shadow-sm animate-in slide-in-from-top-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <p className="text-sm font-semibold">{successMsg}</p>
          </div>
        )}

        {/* KPIs Superior */}
        <section className="grid grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
          {[
            {
              label: 'Reportes listos',
              value: String(readyCount),
              hint: `${history.length} en total`,
              icon: <Files size={18} />,
              tone: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/15 border-teal-200 dark:border-teal-500/30'
            },
            {
              label: 'Último PDF',
              value: lastReport?.projectCode || '—',
              hint: lastReport?.generatedAt || 'Sin registros',
              icon: <FileText size={18} />,
              tone: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30'
            },
            {
              label: 'Proyecto activo',
              value: selectedMeta?.code || '—',
              hint: selectedMeta?.name?.split(' - ')[0]?.trim() || 'Selecciona uno',
              icon: <FolderKanban size={18} />,
              tone: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/15 border-sky-200 dark:border-sky-500/30'
            },
            {
              label: 'Tamaño promedio',
              value: avgSize,
              hint: errorCount ? `${errorCount} con error` : 'Sin fallos',
              icon: <HardDrive size={18} />,
              tone: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }
          ].map(kpi => (
            <div
              key={kpi.label}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-50 tracking-tight">{kpi.value}</p>
                  <p className="text-xs text-slate-400 font-medium truncate max-w-[140px]">{kpi.hint}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${kpi.tone}`}>
                  {kpi.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Parámetros */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
              <CalendarRange size={18} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Parámetros del reporte</h2>
              <p className="text-xs text-slate-400">Define proyecto y rango de fechas antes de generar el PDF.</p>
            </div>
          </div>

          <div className="space-y-8" style={{ padding: '2rem 2rem 2rem' }}>
            <div
              className="border-b border-slate-100 dark:border-slate-800"
              style={{ paddingTop: 12, paddingBottom: 36 }}
            >
              <label
                className={`${labelClass} block text-center`}
                style={{ marginBottom: 20, letterSpacing: '0.08em' }}
              >
                Cambiar proyecto para el PDF
              </label>
              <div
                className="flex flex-wrap items-center justify-center"
                style={{ gap: 14 }}
              >
                {projectOptions.map(p => {
                  const active = p.id === selectedProject;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProject(p.id)}
                      disabled={generating}
                      style={{ padding: '0.8rem 1.4rem', minHeight: 44, margin: 0 }}
                      className={`inline-flex items-center justify-center rounded-xl text-xs font-bold border transition-all leading-none cursor-pointer ${
                        active
                          ? 'bg-teal-600 text-white border-teal-500 shadow-sm shadow-teal-600/20'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500/50'
                      }`}
                    >
                      {p.code}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-end gap-6 xl:gap-8">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-3 min-w-0">
                  <label className={labelClass}>Seleccionar Proyecto</label>
                  <div className="flex items-center min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-teal-500/35 focus-within:border-teal-500 transition-shadow overflow-hidden">
                    <span className="pl-3 pr-2 text-slate-400 shrink-0 pointer-events-none">
                      <FolderKanban size={15} />
                    </span>
                    <div className="relative flex-1 min-w-0">
                      <select
                        value={selectedProject}
                        onChange={e => setSelectedProject(e.target.value)}
                        className="w-full min-h-[44px] appearance-none bg-transparent border-0 pl-1 pr-9 py-2.5 text-sm leading-normal text-slate-700 dark:text-slate-200 outline-none cursor-pointer truncate"
                      >
                        {projectOptions.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className={labelClass}>Fecha Inicio</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={fieldClass} />
                </div>

                <div className="space-y-3">
                  <label className={labelClass}>Fecha Fin</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={fieldClass} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  disabled={generating}
                  style={{ padding: '0.75rem 1.25rem', minHeight: 46 }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold transition-all cursor-pointer"
                >
                  <Eye size={16} className="text-teal-600 dark:text-teal-400" />
                  Vista previa
                </button>
                <button
                  type="button"
                  onClick={runGenerate}
                  disabled={generating || !selectedProject}
                  style={{ padding: '0.75rem 1.5rem', minHeight: 46, minWidth: 260 }}
                  className="relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-80 text-white text-sm font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                >
                  {generating && (
                    <span
                      className="absolute inset-y-0 left-0 bg-teal-400/40 transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  <span className="relative inline-flex items-center gap-2">
                    {generating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                    {generating
                      ? `Generando ${selectedMeta?.code || ''}… ${progress}%`
                      : `Descargar PDF · ${selectedMeta?.code || 'Proyecto'}`}
                  </span>
                </button>
              </div>
            </div>

            <div 
              className="rounded-xl border border-teal-200 dark:border-teal-500/20 bg-teal-50/70 dark:bg-teal-500/10 px-5 py-4 text-xs font-semibold text-teal-800 dark:text-teal-300 flex flex-wrap items-center gap-2"
              style={{ marginTop: '1.5rem' }}
            >
              <FolderKanban size={14} className="shrink-0" />
              El PDF se generará para <strong>{selectedMeta?.code}</strong>
              <span className="text-teal-700/80 dark:text-teal-400/80 font-medium">
                ({startDate} → {endDate})
              </span>
            </div>
          </div>
        </section>

        {/* Métricas + Tendencias */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col">
            <div className="px-6 sm:px-7 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                <Activity size={18} />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Métricas consolidadas</h2>
                <p className="text-xs text-slate-400">Indicadores incluidos en el PDF.</p>
              </div>
            </div>

            <div className="p-6 sm:p-7 flex-1 flex flex-col gap-6">
              <div className="space-y-5">
                {projectMetrics.map(m => (
                  <div key={m.id} className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{m.label}</span>
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-300 tabular-nums bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 rounded-md">
                        {m.value}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-500 dark:bg-teal-400 transition-all duration-500"
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-start gap-2.5 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 p-4 text-teal-800 dark:text-teal-300">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <p className="text-xs font-semibold leading-relaxed">
                  Métricas de <strong>{selectedMeta?.code}</strong> del {startDate} al {endDate}.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col">
            <div className="px-6 sm:px-7 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <BarChart3 size={18} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Tendencias de rendimiento</h2>
                  <p className="text-xs text-slate-400">Evolución por sprint en el periodo seleccionado.</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                Por sprint
              </span>
            </div>

            <div className="p-6 sm:p-7 flex-1">
              <div className="h-[300px] w-full rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 p-5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" vertical={false} />
                    <XAxis dataKey="sprint" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: 12,
                        fontSize: 12,
                        color: '#e2e8f0'
                      }}
                    />
                    <Bar dataKey="value" name="Rendimiento" fill="#0d9488" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Historial */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                <Clock size={18} />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Historial de descargas</h2>
                <p className="text-xs text-slate-400">Archivos PDF generados recientemente en la plataforma.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center min-h-[40px] w-full sm:w-[240px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-500 transition-shadow">
                <span className="pl-3 text-slate-400 shrink-0 pointer-events-none">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  placeholder="Buscar archivo..."
                  className="w-full bg-transparent border-0 px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none"
                />
                {historySearch && (
                  <button
                    type="button"
                    onClick={() => setHistorySearch('')}
                    className="pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <select
                value={historyProject}
                onChange={e => setHistoryProject(e.target.value)}
                style={{ padding: '0.55rem 0.85rem', minHeight: 40 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="ALL">Todos los proyectos</option>
                {historyProjects.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <select
                value={historyStatus}
                onChange={e => setHistoryStatus(e.target.value)}
                style={{ padding: '0.55rem 0.85rem', minHeight: 40 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="ALL">Todos los estados</option>
                <option value="READY">Listo</option>
                <option value="GENERATING">Generando</option>
                <option value="ERROR">Error</option>
              </select>
              <span
                style={{ padding: '0.55rem 0.85rem', minHeight: 40 }}
                className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                {filteredHistory.length} archivo{filteredHistory.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <FileText size={24} />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No hay reportes con esos filtros</p>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
                Ajusta la búsqueda o los filtros, o genera un nuevo PDF desde los parámetros superiores.
              </p>
              <button
                type="button"
                onClick={() => { setHistorySearch(''); setHistoryProject('ALL'); setHistoryStatus('ALL'); }}
                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[960px]">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
                    <th className="px-6 py-3.5">Nombre de archivo</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5">Fecha de generación</th>
                    <th className="px-6 py-3.5">Código proyecto</th>
                    <th className="px-6 py-3.5">Tamaño</th>
                    <th className="px-6 py-3.5">Generado por</th>
                    <th className="px-6 py-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHistory.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/90 dark:hover:bg-slate-950/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 flex items-center justify-center shrink-0">
                            <FileText size={15} className="text-teal-600 dark:text-teal-400" />
                          </span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {row.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        {row.generatedAt}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 text-[11px] font-bold">
                          {row.projectCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {row.size}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {row.generatedBy}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title={`Descargar PDF de ${row.projectCode}`}
                            disabled={row.status !== 'READY'}
                            onClick={() => downloadProjectPdf(row.projectCode, row.fileName)}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-teal-700 hover:border-teal-300 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={() => handleDelete(row.id)}
                            disabled={row.status === 'GENERATING'}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      {/* Modal vista previa */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Eye size={18} className="text-teal-600 dark:text-teal-400" />
                Vista previa del reporte
              </h3>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400 font-medium">Proyecto</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{selectedMeta?.name}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400 font-medium">Periodo</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{startDate} → {endDate}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400 font-medium">Métricas</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{projectMetrics.length} indicadores</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400 font-medium">Formato</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">PDF consolidado</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Se exportarán throughput, cycle/lead time, velocidad y bugs críticos, junto con el gráfico de tendencias por sprint.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={runGenerate}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <FileDown size={14} /> Confirmar y generar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
