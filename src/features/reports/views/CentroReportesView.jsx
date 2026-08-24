import React, { useState, useEffect } from 'react';
import { Calendar, Search, AlertCircle, BarChart2, LayoutDashboard, Clock, History, Activity, GitMerge, Settings2, Play, Folder, Flag, User, FileText, CheckCircle2, ChevronRight, Check, Download } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../auth/context/AuthContext';

export default function CentroReportesView({ selectedProjectId }) {
  const [activeTab, setActiveTab] = useState('generacion');
  const [reportType, setReportType] = useState('proyecto');
  const [reportParam, setReportParam] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [compareMonth, setCompareMonth] = useState('');
  const [compareYear, setCompareYear] = useState(new Date().getFullYear().toString());
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  
  const { token } = useAuth();
  const [dbProjects, setDbProjects] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  
  const months = [
    { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' }, { value: '03', label: 'Marzo' }, 
    { value: '04', label: 'Abril' }, { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Septiembre' }, 
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
  ];
  const years = React.useMemo(() => {
    const y = new Date().getFullYear();
    return [y.toString(), (y-1).toString(), (y-2).toString(), (y-3).toString(), (y-4).toString()];
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const projRes = await api.get('/api/v1/projects');
            setDbProjects(projRes.data || []);
        } catch (e) { console.error("Error fetching projects", e); }
        
        try {
            const userRes = await api.get('/api/v1/users');
            setDbUsers(userRes.data || []);
        } catch (e) { console.error("Error fetching users", e); }
    };
    fetchData();
  }, []);

  const handleGenerateLiveReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportData({
          month: "Reporte en Vivo", pointsCompleted: 145, sprintHealth: 92, totalIssues: 42, blockedDays: 2
      });
    }, 1500);
  };

  const renderGeneracion = () => (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* WIZARD SIN TARJETA (Integrado al fondo principal) */}
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
                
                {/* Indicador de selección estilo medalla/check */}
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
              {['Resumen ejecutivo', 'Indicadores clave', 'Tendencia y evolución', 'Distribución del trabajo', 'Calidad y bugs', 'Bloqueos y riesgos'].map((item, idx) => (
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
      
      {/* ELIMINADA EL ÁREA DE RESULTADOS */}

    </div>
  );

  const handleFetchHistory = async () => {
    if (!selectedMonth || !selectedProjectId) return setError("Faltan parámetros.");
    setLoadingHistory(true);
    try {
        const url = `http://localhost:8000/api/v1/reports/historical?proyecto_id=${selectedProjectId}&month=${selectedYear}-${selectedMonth}`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }});
        if (!res.ok) throw new Error('Error al reconstruir el historial.');
        setReportData(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoadingHistory(false); }
  };

  const renderHistorial = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pt-2">
      
      {/* Controles del Historial - Transformado en un Command Bar Premium */}
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
            
            {/* Tarjeta 1 - Indigo Theme */}
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

            {/* Tarjeta 2 - Emerald Theme */}
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

            {/* Tarjeta 3 - Sky Theme */}
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

  return (
    <div className="w-full min-h-[calc(100vh-110px)] bg-gradient-to-br from-slate-50 to-white dark:from-transparent dark:to-transparent shadow-sm dark:shadow-none border border-slate-200/60 dark:border-transparent rounded-3xl p-8 md:p-12 flex flex-col gap-8 relative overflow-hidden">
      
      {/* HEADER Y TABS */}
      {/* Luces decorativas de fondo (Soft Glassmorphism effect) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/10 dark:bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-sky-400/10 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 relative z-20">
        <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
                <BarChart2 className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Centro de Reportes</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">Genera, consulta y compara el rendimiento de tus proyectos y equipos.</p>
        </div>
        
        <div className="flex p-1.5 bg-slate-100/80 dark:bg-[#141738]/50 backdrop-blur-md rounded-[1.25rem] border border-slate-200/80 dark:border-white/5 w-full md:w-auto mt-6 md:mt-0 shadow-inner">
            <button 
                onClick={() => setActiveTab('generacion')} 
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[13px] transition-all duration-300 ${activeTab === 'generacion' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(99,102,241,0.3)] ring-1 ring-slate-200 dark:ring-0 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
            >
                <LayoutDashboard className="w-4 h-4" />
                Generación de Reportes
            </button>
            <button 
                onClick={() => setActiveTab('historial')} 
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[13px] transition-all duration-300 ${activeTab === 'historial' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(99,102,241,0.3)] ring-1 ring-slate-200 dark:ring-0 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
            >
                <History className="w-4 h-4" />
                Historial Inmutable
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full relative z-20">
        {activeTab === 'generacion' ? renderGeneracion() : renderHistorial()}
      </div>
      
    </div>
  );
}
