import React, {useState, useEffect, useRef} from 'react';
import { Calendar, Search, AlertCircle, BarChart2, LayoutDashboard, Clock, History, Activity, GitMerge, Settings2, Play, Folder, Flag, User, FileText, CheckCircle2, ChevronRight, Check, Download, ArrowLeft, ChevronLeft } from 'lucide-react';
import api, { projectService } from '../../../services/api';
import { useReactToPrint } from 'react-to-print';
import DynamicAIReportTemplate from '../components/DynamicAIReportTemplate';
import { useAuth } from '../../auth/context/AuthContext';

export default function CentroReportesView({ selectedProjectId }) {
  const [activeTab, setActiveTab] = useState('generacion');
  const [reportType, setReportType] = useState('proyecto');
  const [reportParam, setReportParam] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNubi, setShowNubi] = useState(false);
  
  const nubiPhrases = [
    "¡Hola! Soy Nubi. Echemos un vistazo a cómo va todo.",
    "¡Hola! Soy Nubi. Revisé tus métricas y encontré algunos puntos importantes.",
    "¡Hola! Soy Nubi. Esto es lo que encontré en tu proyecto.",
    "¡Hola! Soy Nubi. Vamos a ver cómo va tu proyecto.",
    "¡Hola! Soy Nubi. Esto es lo más importante que deberías saber."
  ];
  const [currentNubiPhrase, setCurrentNubiPhrase] = useState(nubiPhrases[0]);

  useEffect(() => {
    if (showNubi) {
      setCurrentNubiPhrase(nubiPhrases[Math.floor(Math.random() * nubiPhrases.length)]);
    }
  }, [showNubi]);

  const reportRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: "MCHAV_Reporte_Ejecutivo",
    pageStyle: "@page { size: A4; margin: 0 !important; } @media print { body { margin: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }",
    onAfterPrint: () => setShowNubi(true)
  });
  const [reportData, setReportData] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);

  useEffect(() => {
    if (shouldPrint && reportData) {
      // Damos un respiro largo (1500ms) para garantizar renderizado
      const timer = setTimeout(() => {
        handlePrint();
        setShouldPrint(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldPrint, reportData, handlePrint]);
  
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [cierreReportType, setCierreReportType] = useState('Resumen General');
  const [cierreReportParam, setCierreReportParam] = useState('');
  const [cierreProject, setCierreProject] = useState('');
  const [rangoReportType, setRangoReportType] = useState('Resumen General');
  const [rangoReportParam, setRangoReportParam] = useState('');
  const [rangoProject, setRangoProject] = useState('');
  const [isFullHistory, setIsFullHistory] = useState(false);
  const [isComparingSprints, setIsComparingSprints] = useState(false);
  const [rangoCompareSprint, setRangoCompareSprint] = useState('');
  const [showAllReportsView, setShowAllReportsView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedGeneralProjects, setSelectedGeneralProjects] = useState([]);
  const [searchGeneralQuery, setSearchGeneralQuery] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  const getIconColor = (type) => {
    switch(type) {
      case 'Proyecto': return 'bg-indigo-400';
      case 'Sprint': return 'bg-emerald-400';
      case 'Desarrollador': return 'bg-fuchsia-400';
      case 'Resumen General': return 'bg-amber-400';
      default: return 'bg-indigo-400';
    }
  };

  const [compareMonth, setCompareMonth] = useState('');
  const [compareYear, setCompareYear] = useState(new Date().getFullYear().toString());
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  
  const { token } = useAuth();
  const [dbProjects, setDbProjects] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [dbSprints, setDbSprints] = useState([]);
  
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
            const projs = projRes.data || [];
            setDbProjects(projs);
            
            // Preseleccionar los proyectos activos por defecto para el reporte general
            const activeIds = projs.filter(p => p.estado && ['active', 'activo'].includes(p.estado.toLowerCase())).map(p => p.id_proyecto);
            setSelectedGeneralProjects(activeIds);
        } catch (e) { console.error("Error fetching projects", e); }
        
        try {
            const userRes = await api.get('/api/v1/users');
            setDbUsers(userRes.data || []);
        } catch (e) { console.error("Error fetching users", e); }
        
        try {
            if (selectedProjectId) {
                const sprintRes = await projectService.getSprints(selectedProjectId);
                setDbSprints(sprintRes || []);
            }
        } catch (e) { console.error("Error fetching sprints", e); }
    };
    fetchData();
  }, []);

  const handleGenerateLiveReport = async () => {
    setIsGenerating(true);
    
    try {
      // 1. Determinar el proyecto a consultar
      const projectId = reportType === 'general' 
        ? (selectedGeneralProjects.length > 0 ? selectedGeneralProjects[0] : null) 
        : reportParam;
        
      if (!projectId) {
        throw new Error("Por favor selecciona un proyecto.");
      }

      // 2. Preparar parámetros de consulta según el tipo de reporte
      let params = {};
      let minimumRequired = 5;
      let targetName = 'General';

      // Extraer nombre del proyecto real siempre
      let realProjectName = 'MCHAV Analytics';
      const currentProj = dbProjects.find(p => p.id_proyecto === (reportType === 'proyecto' ? projectId : selectedProjectId));
      if (currentProj) {
        realProjectName = currentProj.nombre || currentProj.name || 'MCHAV Analytics';
      }

      let sprintName = 'Sprint Actual';

      if (reportType === 'sprint') {
        const sprint = dbSprints.find(s => s.id_sprint === reportParam);
        if (sprint) {
          params.sprint_id = sprint.id_sprint;
          targetName = sprint.nombre_sprint || sprint.nombre || sprint.id_sprint;
          sprintName = targetName;
        }
        minimumRequired = 3;
      } else if (reportType === 'desarrollador') {
        const dev = dbUsers.find(u => u.id_usuario === reportParam);
        if (dev) {
          params.assignee_id = dev.id_usuario;
          targetName = dev.nombre;
        }
        minimumRequired = 2;
      } else if (reportType === 'proyecto') {
        targetName = realProjectName;
        minimumRequired = 5;
      }

      // 3. Obtener el conteo de tickets (issues-detail)
      const detailRes = await projectService.getKpiIssuesDetail(projectId, params);
      const totalRecords = detailRes?.total_issues || detailRes?.issues?.length || 0;

      // 4. Validar las reglas de negocio
      if (totalRecords < minimumRequired) {
        alert(`No hay suficientes registros para este reporte.\n\nSe requieren al menos ${minimumRequired} tickets, pero solo se encontraron ${totalRecords} para ${targetName}.\n\nIntenta sincronizar nuevamente o selecciona otro filtro.`);
        setIsGenerating(false);
        return;
      }

      // 5. Cargar KPIs reales
      const kpis = await projectService.getKpis(projectId, params.sprint_id);
      
      // 6. Generar Insights con IA
      let aiInsightsData = null;
      try {
        const metricsData = {
          reportType: reportType || 'sprint',
          velocity: kpis?.metrics?.completed_sp || 0,
          throughput: totalRecords,
          cycleTime: kpis?.metrics?.avg_cycle_time || 0,
          blockedDays: kpis?.metrics?.blocked_days || 0,
          bugs: kpis?.metrics?.bugs_count || 0,
          totalScope: Math.max(kpis?.metrics?.completed_sp || 0, 40),
          sprintHealth: kpis?.health_score || 0,
          p50: kpis?.metrics?.avg_cycle_time > 0 ? kpis?.metrics?.avg_cycle_time : 2.5,
          p85: (kpis?.metrics?.avg_cycle_time > 0 ? kpis?.metrics?.avg_cycle_time : 2.5) * 1.5,
          p95: (kpis?.metrics?.avg_cycle_time > 0 ? kpis?.metrics?.avg_cycle_time : 2.5) * 2.0
        };
        const aiResponse = await api.post('/api/v1/ai/generate-report-insights', metricsData);
        if (aiResponse.data && aiResponse.data.data) {
          aiInsightsData = aiResponse.data.data;
        }
      } catch (e) {
        console.error("Error al generar AI insights:", e);
      }

      setIsGenerating(false);
      setReportData({
          month: "Reporte en Vivo", 
          pointsCompleted: kpis?.metrics?.completed_sp || 0, 
          sprintHealth: kpis?.health_score || 0, 
          totalIssues: totalRecords, 
          blockedDays: kpis?.metrics?.blocked_days || 0,
          targetName: targetName,
          projectName: realProjectName,
          sprintName: sprintName,
          kpis: kpis,
          aiInsights: aiInsightsData
      });
      
      setShouldPrint(true);
      
    } catch (error) {
      console.error("Error al generar reporte:", error);
      alert(error.message || "Error al conectar con el servidor. Intenta de nuevo.");
      setIsGenerating(false);
    }
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
                key={item.id} 
                onClick={() => {
                  setReportType(item.id);
                  setReportParam('');
                }}
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
              
              {/* Selector Múltiple para Reporte General */}
              {reportType === 'general' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Selecciona los proyectos a incluir
                      </label>
                      <p className="text-xs text-slate-500 mt-1">Marca únicamente los proyectos que deseas sumar en el resumen global.</p>
                    </div>

                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Buscar proyecto..." 
                        value={searchGeneralQuery}
                        onChange={(e) => setSearchGeneralQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm transition-shadow" 
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="flex flex-wrap gap-2.5 max-h-52 overflow-y-auto custom-scrollbar pr-2 py-1">
                      {dbProjects.filter(p => p.nombre.toLowerCase().includes(searchGeneralQuery.toLowerCase())).map(p => {
                        const isSelected = selectedGeneralProjects.includes(p.id_proyecto);
                        return (
                          <button
                            key={p.id_proyecto}
                            onClick={() => {
                              setSelectedGeneralProjects(prev => 
                                isSelected 
                                  ? prev.filter(id => id !== p.id_proyecto)
                                  : [...prev, p.id_proyecto]
                              );
                            }}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${isSelected ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/50 ring-2 ring-amber-500/20 scale-[1.02]' : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          >
                            <div className={`w-4 h-4 rounded-[4px] flex items-center justify-center border transition-colors ${isSelected ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <span className="truncate max-w-[200px]">{p.nombre}</span>
                          </button>
                        );
                      })}
                      {dbProjects.filter(p => p.nombre.toLowerCase().includes(searchGeneralQuery.toLowerCase())).length === 0 && (
                        <p className="text-sm font-medium text-slate-500 py-4 text-center w-full">No se encontraron proyectos.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {reportType !== 'general' && (
                <div className="space-y-4">
                  {/* Selector de Proyecto (Aplica para Proyecto, Sprint y Desarrollador) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {reportType === 'proyecto' ? 'Selecciona el Proyecto' : '1. Selecciona el Proyecto'}
                    </label>
                    <div className="relative">
                      <select 
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                        value={reportParam} onChange={(e) => setReportParam(e.target.value)}
                      >
                        <option value="">Selecciona un proyecto...</option>
                        {dbProjects.map(p => <option key={p.id_proyecto} value={p.id_proyecto}>{p.nombre}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</div>
                    </div>
                  </div>

                  {/* Selector de Sprint */}
                  {reportType === 'sprint' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">2. Selecciona el Sprint</label>
                      <div className="relative">
                        <select className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none">
                          <option value="">Selecciona un sprint...</option>
                          {dbSprints.map(s => <option key={s.id_sprint} value={s.id_sprint}>{s.nombre_sprint || s.nombre || s.id_sprint}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</div>
                      </div>
                    </div>
                  )}

                  {/* Selector de Desarrollador */}
                  {reportType === 'desarrollador' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">2. Selecciona el Desarrollador</label>
                      <div className="relative">
                        <select className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none appearance-none">
                          <option value="">Selecciona un desarrollador...</option>
                          {dbUsers.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                ? ['Resumen del sprint', 'Burndown del sprint', 'Tareas completadas vs pendientes', 'Distribución por desarrollador', 'Bugs reportados', 'Retrospectiva y mejoras']
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
              onClick={handleGenerateLiveReport} 
              disabled={isGenerating || (reportType === 'general' ? selectedGeneralProjects.length === 0 : reportParam === '')}
              className={`absolute bottom-0 right-0 px-10 py-4 ${isGenerating || (reportType === 'general' ? selectedGeneralProjects.length === 0 : reportParam === '') ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-70' : 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_20px_rgba(79,70,229,0.4)]'} text-white rounded-xl font-bold flex items-center gap-3 transition-all`}
            >
              Generar reporte (V3) &rarr;
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

  const allReportsData = [
    { type: 'Proyecto', name: 'MCHAV Analytics', date: '01/07 - 31/07', icon: Folder, color: 'indigo' },
    { type: 'Equipo', name: 'Equipo Backend', date: '01/07 - 31/07', icon: User, color: 'emerald' },
    { type: 'Sprint', name: 'Sprint 04', date: '30/06 - 13/07', icon: Flag, color: 'sky' },
    { type: 'General', name: 'Resumen Mensual', date: 'Junio 2026', icon: FileText, color: 'amber' },
    { type: 'Proyecto', name: 'App Móvil iOS', date: '01/06 - 30/06', icon: Folder, color: 'indigo' },
    { type: 'Desarrollador', name: 'Camilo Corredor', date: '15/06 - 30/06', icon: User, color: 'fuchsia' },
    { type: 'Sprint', name: 'Sprint 03', date: '16/06 - 29/06', icon: Flag, color: 'sky' },
    { type: 'General', name: 'Q2 2026 Resumen', date: 'Abr - Jun', icon: FileText, color: 'amber' },
    { type: 'Proyecto', name: 'Plataforma B2B', date: '01/05 - 31/05', icon: Folder, color: 'indigo' },
    { type: 'Equipo', name: 'Equipo Frontend', date: '01/05 - 31/05', icon: User, color: 'emerald' }
  ];

  const filteredReports = allReportsData.filter(report => {
    const q = searchQuery.toLowerCase();
    return report.name.toLowerCase().includes(q) || 
           report.type.toLowerCase().includes(q) || 
           report.date.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderHistorial = () => (
    <div className="w-full pt-2 relative">
      
      {!showAllReportsView ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 px-1">Consultar Historial</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarjeta 1: CIERRE MENSUAL */}
          <div className="rounded-[2rem] p-6 bg-gradient-to-b from-indigo-100/80 to-transparent dark:from-indigo-900/40 dark:to-transparent flex flex-col gap-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-indigo-400 dark:bg-indigo-500 text-white shadow-sm rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-wide">CIERRE MENSUAL</h4>
                <p className="text-xs font-medium text-indigo-700/80 dark:text-indigo-300/80 mt-1">Selecciona el periodo que quieres consultar.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Reporte</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400/50 appearance-none transition-all shadow-sm"
                    value={cierreReportType} 
                    onChange={(e) => {
                      setCierreReportType(e.target.value);
                      setCierreReportParam('');
                      setCierreProject('');
                    }}
                  >
                    <option value="Resumen General">Resumen General</option>
                    <option value="Proyecto">Proyecto</option>
                    <option value="Sprint">Sprint</option>
                    <option value="Desarrollador">Desarrollador</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">▼</div>
                </div>
              </div>

              {cierreReportType !== 'Resumen General' && (
                <div className={`grid gap-3 ${cierreReportType === 'Proyecto' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {cierreReportType === 'Proyecto' ? 'Proyecto' : '1. Proyecto'}
                    </label>
                    <div className="relative">
                      <select 
                        className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400/50 appearance-none transition-all shadow-sm"
                        value={cierreReportType === 'Proyecto' ? cierreReportParam : cierreProject} 
                        onChange={(e) => cierreReportType === 'Proyecto' ? setCierreReportParam(e.target.value) : setCierreProject(e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {dbProjects.map(p => <option key={p.id_proyecto} value={p.id_proyecto}>{p.nombre}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">▼</div>
                    </div>
                  </div>

                  {cierreReportType === 'Sprint' && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">2. Sprint</label>
                      <div className="relative">
                        <select 
                          className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400/50 appearance-none transition-all shadow-sm"
                          value={cierreReportParam} onChange={(e) => setCierreReportParam(e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {dbSprints.map(s => <option key={s.id_sprint} value={s.id_sprint}>{s.nombre_sprint || s.nombre || s.id_sprint}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">▼</div>
                      </div>
                    </div>
                  )}

                  {cierreReportType === 'Desarrollador' && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">2. Desarrollador</label>
                      <div className="relative">
                        <select 
                          className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400/50 appearance-none transition-all shadow-sm"
                          value={cierreReportParam} onChange={(e) => setCierreReportParam(e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {dbUsers.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">▼</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <select className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400/50 appearance-none transition-all shadow-sm" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                    <option value="">Mes...</option>
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">▼</div>
                </div>
                <div className="relative w-32">
                  <select className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400/50 appearance-none transition-all shadow-sm" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">▼</div>
                </div>
              </div>
            </div>

            <button onClick={handleFetchHistory} className="w-full mt-auto py-3.5 bg-indigo-400 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
              Cargar mes &rarr;
            </button>
          </div>

          {/* Tarjeta 2: RANGO PERSONALIZADO */}
          <div className="rounded-[2rem] p-6 bg-gradient-to-b from-emerald-100/80 to-transparent dark:from-emerald-900/40 dark:to-transparent flex flex-col gap-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-emerald-400 dark:bg-emerald-500 text-white shadow-sm rounded-xl">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-wide">RANGO PERSONALIZADO</h4>
                <p className="text-xs font-medium text-emerald-700/80 dark:text-emerald-300/80 mt-1">Consulta información entre fechas específicas.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Reporte</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-400/50 appearance-none transition-all shadow-sm"
                    value={rangoReportType} 
                    onChange={(e) => {
                      setRangoReportType(e.target.value);
                      setRangoReportParam('');
                      setRangoProject('');
                      setIsComparingSprints(false);
                      setRangoCompareSprint('');
                    }}
                  >
                    <option value="Resumen General">Resumen General</option>
                    <option value="Proyecto">Proyecto</option>
                    <option value="Sprint">Sprint</option>
                    <option value="Desarrollador">Desarrollador</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">▼</div>
                </div>
              </div>

              {rangoReportType !== 'Resumen General' && (
                <div className="space-y-4">
                  <div className={`grid gap-3 ${rangoReportType === 'Proyecto' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                        {rangoReportType === 'Proyecto' ? 'Proyecto' : '1. Proyecto'}
                      </label>
                      <div className="relative">
                        <select 
                          className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-400/50 appearance-none transition-all shadow-sm"
                          value={rangoReportType === 'Proyecto' ? rangoReportParam : rangoProject} 
                          onChange={(e) => rangoReportType === 'Proyecto' ? setRangoReportParam(e.target.value) : setRangoProject(e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {dbProjects.map(p => <option key={p.id_proyecto} value={p.id_proyecto}>{p.nombre}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">▼</div>
                      </div>
                    </div>

                    {rangoReportType === 'Sprint' && !isComparingSprints && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">2. Sprint</label>
                        <div className="relative">
                          <select 
                            className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-400/50 appearance-none transition-all shadow-sm"
                            value={rangoReportParam} onChange={(e) => setRangoReportParam(e.target.value)}
                          >
                            <option value="">Seleccionar...</option>
                            {dbSprints.map(s => <option key={s.id_sprint} value={s.id_sprint}>{s.nombre_sprint || s.nombre || s.id_sprint}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">▼</div>
                        </div>
                      </div>
                    )}

                    {rangoReportType === 'Desarrollador' && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">2. Desarrollador</label>
                        <div className="relative">
                          <select 
                            className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-400/50 appearance-none transition-all shadow-sm"
                            value={rangoReportParam} onChange={(e) => setRangoReportParam(e.target.value)}
                          >
                            <option value="">Seleccionar...</option>
                            {dbUsers.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">▼</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {rangoReportType === 'Sprint' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isComparingSprints}
                          onClick={() => setIsComparingSprints(!isComparingSprints)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${isComparingSprints ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isComparingSprints ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer" onClick={() => setIsComparingSprints(!isComparingSprints)}>
                          Comparar con otro Sprint
                        </label>
                      </div>

                      {isComparingSprints && (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-300">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">2. Sprint Base</label>
                            <div className="relative">
                              <select 
                                className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-400/50 appearance-none transition-all shadow-sm"
                                value={rangoReportParam} onChange={(e) => setRangoReportParam(e.target.value)}
                              >
                                <option value="">Seleccionar...</option>
                                {dbSprints.map(s => <option key={s.id_sprint} value={s.id_sprint}>{s.nombre_sprint || s.nombre || s.id_sprint}</option>)}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">▼</div>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">3. Sprint a Comparar</label>
                            <div className="relative">
                              <select 
                                className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-400/50 appearance-none transition-all shadow-sm"
                                value={rangoCompareSprint} onChange={(e) => setRangoCompareSprint(e.target.value)}
                              >
                                <option value="">Seleccionar...</option>
                                {dbSprints.map(s => <option key={s.id_sprint} value={s.id_sprint}>{s.nombre_sprint || s.nombre || s.id_sprint}</option>)}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">▼</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFullHistory}
                  onClick={() => setIsFullHistory(!isFullHistory)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${isFullHistory ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isFullHistory ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer" onClick={() => setIsFullHistory(!isFullHistory)}>Consultar Historial Completo</label>
              </div>

              {!isFullHistory && (
                  <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative flex-1">
                      <input type="date" className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all shadow-sm" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
                    </div>
                    <span className="text-emerald-500 font-bold">&rarr;</span>
                    <div className="relative flex-1">
                      <input type="date" className="w-full p-3 rounded-xl border-0 bg-white/70 dark:bg-[#0f172a]/60 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all shadow-sm" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
                    </div>
                  </div>
              )}
            </div>

            <button className="w-full mt-auto py-3.5 bg-emerald-400 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
              {isFullHistory ? 'Consultar historial completo \u2192' : (isComparingSprints && rangoReportType === 'Sprint' ? 'Comparar sprints \u2192' : 'Consultar rango \u2192')}
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE REPORTES RECIENTES */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Reportes recientes</h3>
            </div>
            <button onClick={() => setShowAllReportsView(true)} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group">
                Ver historial completo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tarjeta 1 - Proyecto (Indigo) */}
            <div className="p-6 rounded-[2rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/[0.02] flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Folder className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Reporte de Proyecto</h4>
                        <p className="text-xs font-semibold text-indigo-500 mt-0.5">MCHAV Analytics</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 01/07 - 31/07</p>
                    <div className="text-slate-400 hover:text-indigo-500 transition-colors">
                        <Download className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Tarjeta 2 - Equipo (Emerald) */}
            <div className="p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-500/20 bg-white dark:bg-white/[0.02] flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Reporte de Equipo</h4>
                        <p className="text-xs font-semibold text-emerald-500 mt-0.5">Equipo Backend</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-emerald-50 dark:border-white/5">
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 01/07 - 31/07</p>
                    <div className="text-slate-400 hover:text-emerald-500 transition-colors">
                        <Download className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Tarjeta 3 - Sprint (Sky) */}
            <div className="p-6 rounded-[2rem] border border-sky-100 dark:border-sky-500/20 bg-white dark:bg-white/[0.02] flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
                        <Flag className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Reporte de Sprint</h4>
                        <p className="text-xs font-semibold text-sky-500 mt-0.5">Sprint 04</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-sky-50 dark:border-white/5">
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 30/06 - 13/07</p>
                    <div className="text-slate-400 hover:text-sky-500 transition-colors">
                        <Download className="w-4 h-4" />
                    </div>
                </div>
            </div>

        </div>
      </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowAllReportsView(false)} 
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Historial Completo</h3>
                <p className="text-xs font-semibold text-slate-500">Todos los reportes generados ordenados por fecha</p>
              </div>
            </div>
            
            {/* Pequeño buscador visual para la cuadrícula */}
            <div className="relative w-full max-w-sm hidden sm:block">
              <input 
                type="text" 
                placeholder="Buscar reporte..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50" 
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* TABLA COMPLETA DE REPORTES */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-200/60 dark:border-white/5">
                    <th className="py-4 px-6 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre del Reporte</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha / Periodo</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {paginatedReports.map((report, idx) => {
                    const bgColors = {
                      indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
                      emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
                      sky: 'bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
                      amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
                      fuchsia: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400'
                    };
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${bgColors[report.color]}`}>
                            <report.icon className="w-3.5 h-3.5" />
                            {report.type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{report.name}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                            <Calendar className="w-4 h-4" />
                            {report.date}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 px-6 text-center text-sm font-medium text-slate-500">
                        No se encontraron reportes con "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Controles de Paginación */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/10">
                <span className="text-sm text-slate-500 text-center sm:text-left">
                  Mostrando <span className="font-bold text-slate-700 dark:text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(currentPage * itemsPerPage, filteredReports.length)}</span> de <span className="font-bold text-slate-700 dark:text-slate-300">{filteredReports.length}</span> resultados
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all shadow-sm ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500/50'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-[calc(100vh-32px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-slate-50 to-white dark:from-transparent dark:to-transparent shadow-sm dark:shadow-none border border-slate-200/60 dark:border-transparent rounded-3xl p-8 md:p-12 flex flex-col gap-8 relative">
      
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
                Historial
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full relative z-20">
        {activeTab === 'generacion' ? renderGeneracion() : renderHistorial()}
      </div>
      {/* Nubi AI Popover */}
      {showNubi && (
        <div className="fixed bottom-8 right-8 z-50 flex items-end animate-in slide-in-from-bottom-8 fade-in duration-500">
          
          {/* Mascot Image */}
          <div className="relative mr-4 mb-4 flex flex-col items-center animate-float">
             <img src="/owl_mascot.png" alt="Nubi" className="w-24 h-24 object-contain z-20 relative drop-shadow-xl" />
             <div className="bg-white dark:bg-slate-800 text-[10px] font-black px-3 py-1 rounded-full text-center tracking-widest shadow-md border border-slate-100 dark:border-slate-700 relative z-30 -mt-3">
                NUBI
             </div>
          </div>
          
          {/* Speech Bubble */}
          <div className="relative max-w-sm w-full animate-float-delayed">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-white/10 relative overflow-hidden">
              
              {/* Speech bubble pointer pointing LEFT */}
              <div className="absolute -left-3 bottom-12 w-6 h-6 bg-white dark:bg-slate-900 border-b border-l border-slate-100 dark:border-white/10 rotate-45"></div>

              {/* Close button */}
              <button onClick={() => setShowNubi(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-indigo-700 dark:text-indigo-400 tracking-tight leading-tight">
                    {currentNubiPhrase}
                  </h3>
                </div>
              </div>

              <div className="mb-5 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                <p>
                  <span className="font-bold text-slate-900 dark:text-white mr-1">💡 Diagnóstico del Desarrollador:</span> 
                  <span className="italic text-slate-600 dark:text-slate-400">"Tu tiempo de ciclo personal en tareas de 5 SP ha mejorado un +14% respecto al periodo anterior, sin embargo, el volumen de bugs detectados aumentó ligeramente. Te recomendamos estabilizar la calidad antes de tomar nuevas tareas complejas."</span>
                </p>
              </div>

              <div className="bg-indigo-50/80 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl p-4 relative z-10">
                <div className="flex items-start gap-3 mb-3">
                  <Activity className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                    ¿Quieres que elabore un plan estructurado para estabilizar la calidad de tus entregas?
                  </p>
                </div>
                <button onClick={() => setShowNubi(false)} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]">
                  Sí, generar plan de mejora <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plantilla oculta para el PDF */}
      <DynamicAIReportTemplate ref={reportRef} reportType={reportType} filters={{}} user={useAuth().user} reportData={reportData} aiInsights={reportData?.aiInsights} />
    </div>
  );
}
