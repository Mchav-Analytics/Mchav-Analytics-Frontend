import React, {useState, useEffect, useRef} from 'react';
import { Calendar, Search, AlertCircle, BarChart2, LayoutDashboard, Clock, History, Activity, GitMerge, Settings2, Play, Folder, Flag, User, FileText, CheckCircle2, ChevronRight, Check, Download, ArrowLeft, ChevronLeft, Trash2 } from 'lucide-react';
import api, { projectService, BACKEND_URL } from '../../../services/api';
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

  // ── Historial Persistente de Reportes ──
  const [savedReports, setSavedReports] = useState(() => {
    try {
      const stored = localStorage.getItem('mchav_generated_reports');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const saveReportToHistory = (reportItem) => {
    setSavedReports(prev => {
      const updated = [reportItem, ...prev];
      try {
        localStorage.setItem('mchav_generated_reports', JSON.stringify(updated));
      } catch (e) {
        console.error("Error al guardar reporte en localStorage:", e);
      }
      return updated;
    });
  };

  const deleteReportFromHistory = (reportId, e) => {
    if (e) e.stopPropagation();
    setSavedReports(prev => {
      const updated = prev.filter(r => r.id !== reportId);
      try {
        localStorage.setItem('mchav_generated_reports', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleOpenSavedReport = (report) => {
    if (report && report.reportData) {
      setReportData(report.reportData);
      setShouldPrint(true);
    }
  };

  const getReportBadge = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('proyecto')) return { icon: Folder, color: 'indigo', label: 'Proyecto' };
    if (t.includes('sprint')) return { icon: Flag, color: 'sky', label: 'Sprint' };
    if (t.includes('desarrollador')) return { icon: User, color: 'fuchsia', label: 'Desarrollador' };
    if (t.includes('equipo')) return { icon: User, color: 'emerald', label: 'Equipo' };
    return { icon: FileText, color: 'amber', label: 'General' };
  };

  const reportRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: "MCHAV_Reporte_Ejecutivo",
    pageStyle: "@page { size: A4; margin: 0 !important; } @media print { body { margin: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }"
  });
  const [reportData, setReportData] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);

  useEffect(() => {
    if (shouldPrint && reportData) {
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
  const [genProjectId, setGenProjectId] = useState(selectedProjectId || '');
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    setValidationError(null);
  }, [reportType, reportParam, genProjectId]);

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
  
  const { user, token } = useAuth();
  const userRoleStr = user?.rol || user?.role || user?.nombre_rol || '';
  const isLeader = String(userRoleStr).toUpperCase().includes('LIDER') || String(userRoleStr).toUpperCase().includes('MANAG') || userRoleStr === 'MANAGER';

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
            let projs = projRes.data || [];
            
            // Si el usuario es Líder Técnico y tiene asignaciones específicas de proyectos, filtrar estrictamente
            if (isLeader && user?.proyectos_asignados && user.proyectos_asignados.length > 0) {
                const assignedIds = user.proyectos_asignados.map(p => typeof p === 'string' ? p : (p.id_proyecto || p.key_proyecto));
                const filtered = projs.filter(p => assignedIds.includes(p.id_proyecto) || assignedIds.includes(p.key_proyecto));
                if (filtered.length > 0) {
                  projs = filtered;
                }
            }

            setDbProjects(projs);
            
            // Preseleccionar los proyectos activos por defecto para el reporte general
            const activeIds = projs.filter(p => p.estado && ['active', 'activo'].includes(p.estado.toLowerCase())).map(p => p.id_proyecto);
            setSelectedGeneralProjects(activeIds.length > 0 ? activeIds : projs.map(p => p.id_proyecto));

            // Autoseleccionar el proyecto activo del Líder
            if (selectedProjectId && projs.some(p => p.id_proyecto === selectedProjectId)) {
              setGenProjectId(selectedProjectId);
              setReportParam(selectedProjectId);
            } else if (projs.length > 0) {
              setGenProjectId(projs[0].id_proyecto);
              setReportParam(projs[0].id_proyecto);
            }
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
  }, [selectedProjectId, user, isLeader]);

  useEffect(() => {
    const fetchGen = async () => {
        if (genProjectId) {
            try {
                const sprintRes = await projectService.getSprints(genProjectId);
                setDbSprints(sprintRes || []);
            } catch (e) {}
        }
    };
    fetchGen();
  }, [genProjectId]);

  const handleGenerateLiveReport = async () => {
    setIsGenerating(true);
    
    try {
      if (reportType === 'general') {
        if (!selectedGeneralProjects || selectedGeneralProjects.length === 0) {
           setIsGenerating(false);
           alert("Por favor selecciona al menos un proyecto.");
           return;
        }
        
        let allKpis = [];
        let totalRecordsAgg = 0;
        let totalSpAgg = 0;
        let totalBugsAgg = 0;
        let totalBlockedDays = 0;
        let cycleTimeSum = 0;
        let cycleTimeCount = 0;
        
        for (const pId of selectedGeneralProjects) {
            const currentProj = dbProjects.find(p => p.id_proyecto === pId);
            const pName = currentProj ? (currentProj.nombre || currentProj.name) : pId;
            
            // Obtener el conteo
            const detailRes = await projectService.getKpiIssuesDetail(pId, {});
            const tRec = detailRes?.total_issues || detailRes?.issues?.length || 0;
            
            // Cargar KPIs
            const pKpis = await projectService.getKpis(pId, null);
            
            const sp = pKpis?.metrics?.completed_sp || 0;
            const bugs = pKpis?.metrics?.bugs_count || 0;
            const bd = pKpis?.metrics?.blocked_days || 0;
            const ct = pKpis?.metrics?.avg_cycle_time || 0;
            
            totalRecordsAgg += tRec;
            totalSpAgg += sp;
            totalBugsAgg += bugs;
            totalBlockedDays += bd;
            if (ct > 0) { cycleTimeSum += ct; cycleTimeCount++; }
            
            allKpis.push({
               projectId: pId,
               projectName: pName,
               throughput: tRec,
               velocity: sp,
               bugs: bugs,
               blockedDays: bd,
               cycleTime: ct
            });
        }
        
        const avgCt = cycleTimeCount > 0 ? cycleTimeSum / cycleTimeCount : 0;
        
        if (totalRecordsAgg < 3) {
            setValidationError({
              targetName: 'Resumen General',
              totalRecords: totalRecordsAgg,
              minimumRequired: 3
            });
            setIsGenerating(false);
            return;
        }
        
        let aiInsightsData = null;
        try {
            const metricsData = {
              reportType: 'general',
              projectMetrics: allKpis,
              velocity: totalSpAgg,
              throughput: totalRecordsAgg,
              cycleTime: avgCt,
              blockedDays: totalBlockedDays,
              bugs: totalBugsAgg,
              targetName: 'Resumen General'
            };
            const aiResponse = await api.post('/api/v1/ai/generate-report-insights', metricsData);
            if (aiResponse.data && aiResponse.data.data) {
              aiInsightsData = aiResponse.data.data;
            }
        } catch (e) {
            console.error("Error al generar AI insights:", e);
        }
        
        setIsGenerating(false);
        const finalReportData = {
            reportType: 'general',
            month: "Reporte en Vivo", 
            pointsCompleted: totalSpAgg, 
            totalIssues: totalRecordsAgg, 
            blockedDays: totalBlockedDays,
            targetName: 'Resumen General',
            projectName: 'Portafolio Multi-Proyecto',
            sprintName: 'N/A',
            projectMetrics: allKpis,
            aiInsights: { markdown: aiInsightsData }
        };
        setReportData(finalReportData);
        saveReportToHistory({
            id: `rep_${Date.now()}`,
            type: 'General',
            name: 'Resumen General',
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            timestamp: Date.now(),
            reportData: finalReportData
        });
        setShouldPrint(true);
        return;
      }

      // 1. Determinar el proyecto a consultar para reportes individuales
      const projectId = reportType === 'proyecto' ? reportParam : genProjectId;
        
      if (!projectId) {
        setIsGenerating(false);
        alert("Por favor selecciona un proyecto.");
        return;
      }

      // 2. Preparar parámetros de consulta según el tipo de reporte
      let params = {};
      let minimumRequired = 5;
      let targetName = 'General';

      // Extraer nombre del proyecto real siempre
      let realProjectName = 'MCHAV Analytics';
      const currentProj = dbProjects.find(p => p.id_proyecto === (reportType === 'proyecto' ? projectId : genProjectId));
      if (currentProj) {
        realProjectName = currentProj.nombre || currentProj.name || 'MCHAV Analytics';
      }

      let sprintName = 'Sprint Actual';

      if (reportType === 'sprint') {
        const sprint = dbSprints.find(s => String(s.id_sprint) === String(reportParam));
        if (sprint) {
          params.sprint_id = sprint.id_sprint;
          targetName = sprint.nombre_sprint || sprint.nombre || sprint.id_sprint;
          sprintName = targetName;
        }
        minimumRequired = 3;
      } else if (reportType === 'desarrollador') {
        const dev = dbUsers.find(u => String(u.id_usuario) === String(reportParam));
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
        setValidationError({
          targetName,
          totalRecords,
          minimumRequired
        });
        setIsGenerating(false);
        return;
      }
      // 5. Cargar KPIs reales
      const kpis = await projectService.getKpis(projectId, params.sprint_id);

      // 5b. Cargar datos reales de Burnup, CFD y Velocidad Histórica
      let realBurnupData = [];
      let realCfdData = [];
      let realVelocityData = [];

      try {
        const burnupRes = await projectService.getProjectBurnup(projectId, params.sprint_id || null);
        realBurnupData = burnupRes?.data || (Array.isArray(burnupRes) ? burnupRes : []);
      } catch (e) { console.warn('No se pudo cargar burnup:', e); }

      try {
        const cfdRes = await projectService.getProjectCFD(projectId, params.sprint_id || null);
        const cfdArr = cfdRes?.cfd || cfdRes?.data?.cfd || (Array.isArray(cfdRes) ? cfdRes : []);
        // Mapear al formato esperado por el componente
        realCfdData = cfdArr.map(d => ({
          fecha_real: d.date,
          completado: d.Done || 0,
          en_progreso: d.Active || 0,
          en_revision: d.Waiting || 0,
          por_hacer: (d['To Do'] || 0) + (d.Blocked || 0),
        }));
      } catch (e) { console.warn('No se pudo cargar CFD:', e); }

      try {
        const sprints = await projectService.getSprints(projectId);
        if (sprints && sprints.length > 0) {
          const sortedSprints = [...sprints].sort((a, b) => 
            a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: 'base' })
          ).slice(-5);

          for (const sp of sortedSprints) {
            const planned = Number(sp.sp_comprometidos || 0);
            const completed = Number(sp.sp_completados || 0);
            realVelocityData.push({
              sprint: sp.nombre,
              comprometido: planned,
              compromisos: planned,
              completado: completed,
              entregados: completed
            });
          }
        }
      } catch (e) { console.warn('No se pudo cargar velocidad histórica:', e); }

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
          sprintName: sprintName
        };
        const aiResponse = await api.post('/api/v1/ai/generate-report-insights', metricsData);
        if (aiResponse.data && aiResponse.data.data) {
          aiInsightsData = aiResponse.data.data;
        }
      } catch (e) {
        console.error("Error al generar AI insights:", e);
      }

      setIsGenerating(false);
      const finalReportData = {
          reportType: reportType,
          month: "Reporte en Vivo",
          pointsCompleted: kpis?.metrics?.completed_sp || 0,
          sprintHealth: kpis?.health_score || 0,
          totalIssues: totalRecords,
          blockedDays: kpis?.metrics?.blocked_days || 0,
          targetName: targetName,
          projectName: realProjectName,
          sprintName: sprintName,
          kpis: kpis,
          // ✅ Datos reales de gráficas
          realBurnupData,
          realCfdData,
          realVelocityData,
          aiInsights: { markdown: aiInsightsData }
      };

      setReportData(finalReportData);
      
      const reportTypeTitle = reportType === 'proyecto' ? 'Proyecto' : reportType === 'sprint' ? 'Sprint' : reportType === 'desarrollador' ? 'Desarrollador' : 'General';
      saveReportToHistory({
          id: `rep_${Date.now()}`,
          type: reportTypeTitle,
          name: targetName || realProjectName || 'Reporte Ejecutivo',
          date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          timestamp: Date.now(),
          reportData: finalReportData
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
                          value={reportType === 'proyecto' ? reportParam : genProjectId} 
                          onChange={(e) => reportType === 'proyecto' ? setReportParam(e.target.value) : setGenProjectId(e.target.value)}
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
                        <select 
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none"
                          value={reportParam} onChange={(e) => setReportParam(e.target.value)}
                        >
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
                        <select 
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none appearance-none"
                          value={reportParam} onChange={(e) => setReportParam(e.target.value)}
                        >
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
                ? ['Contexto General', 'Estado de Entrega y Burnup', 'Flujo Operativo (CFD)', 'Predictibilidad y Riesgos', 'Conclusiones Estratégicas', 'Plan de Acción']
                : reportType === 'sprint'
                ? ['KPIs de Rendimiento', 'Análisis de Cumplimiento', 'Sprint Burnup', 'Flujo Acumulado (CFD)', 'Predictibilidad (Scatter)', 'Veredicto del Sprint']
                : reportType === 'desarrollador'
                ? ['Perfil del desarrollador', 'Story points completados', 'Velocidad y tendencia', 'Calidad del código', 'Tareas por estado', 'Comparativa con el equipo']
                : ['Resumen ejecutivo', 'Indicadores clave', 'Tendencia y evolución', 'Distribución del trabajo', 'Defectos Escapados', 'Bloqueos y riesgos']
              ).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 mt-auto w-full max-w-full justify-between pb-4">
              <div className="flex-1">
                {validationError && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30">
                      <div className="p-2 bg-amber-100 dark:bg-amber-800/40 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">¡Ups! Datos insuficientes</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5 leading-relaxed">
                          {validationError.targetName} solo tiene {validationError.totalRecords} ticket{validationError.totalRecords !== 1 ? 's' : ''} registrado{validationError.totalRecords !== 1 ? 's' : ''}. Para poder generar el reporte se requiere al menos {validationError.minimumRequired === 3 ? '3 a 5' : validationError.minimumRequired} tickets. Por favor, selecciona un periodo con más movimiento o intenta sincronizar nuevamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-none shrink-0">
                <button 
                  onClick={handleGenerateLiveReport} 
                  disabled={isGenerating || (reportType === 'general' ? selectedGeneralProjects.length === 0 : reportParam === '')}
                  className={`px-10 py-4 ${isGenerating || (reportType === 'general' ? selectedGeneralProjects.length === 0 : reportParam === '') ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-70' : 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_20px_rgba(79,70,229,0.4)]'} text-white rounded-xl font-bold flex items-center gap-3 transition-all`}
                >
                  Generar reporte &rarr;
                </button>
              </div>
            </div>
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
        const url = `${BACKEND_URL}/api/v1/reports/historical?proyecto_id=${selectedProjectId}&month=${selectedYear}-${selectedMonth}`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }});
        if (!res.ok) throw new Error('Error al reconstruir el historial.');
        setReportData(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoadingHistory(false); }
  };

  const filteredReports = savedReports.filter(report => {
    const q = searchQuery.toLowerCase();
    return (report.name || '').toLowerCase().includes(q) || 
           (report.type || '').toLowerCase().includes(q) || 
           (report.date || '').toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
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

        {savedReports.length === 0 ? (
          <div className="p-8 rounded-[2rem] border border-dashed border-slate-300 dark:border-white/10 text-center bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Sin reportes generados aún</h4>
            <p className="text-xs text-slate-500 mt-1">Genera un nuevo reporte para que se guarde en tu historial.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {savedReports.slice(0, 3).map((report) => {
              const badge = getReportBadge(report.type);
              const IconComp = badge.icon;
              const theme = {
                indigo: { border: 'border-indigo-100 dark:border-indigo-500/20', bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/20', text: 'text-indigo-500', hoverText: 'hover:text-indigo-600' },
                emerald: { border: 'border-emerald-100 dark:border-emerald-500/20', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20', text: 'text-emerald-500', hoverText: 'hover:text-emerald-600' },
                sky: { border: 'border-sky-100 dark:border-sky-500/20', bg: 'bg-sky-500', shadow: 'shadow-sky-500/20', text: 'text-sky-500', hoverText: 'hover:text-sky-600' },
                fuchsia: { border: 'border-fuchsia-100 dark:border-fuchsia-500/20', bg: 'bg-fuchsia-500', shadow: 'shadow-fuchsia-500/20', text: 'text-fuchsia-500', hoverText: 'hover:text-fuchsia-600' },
                amber: { border: 'border-amber-100 dark:border-amber-500/20', bg: 'bg-amber-500', shadow: 'shadow-amber-500/20', text: 'text-amber-500', hoverText: 'hover:text-amber-600' }
              }[badge.color] || { border: 'border-indigo-100 dark:border-indigo-500/20', bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/20', text: 'text-indigo-500', hoverText: 'hover:text-indigo-600' };

              return (
                <div 
                  key={report.id} 
                  onClick={() => handleOpenSavedReport(report)}
                  className={`p-6 rounded-[2rem] border ${theme.border} bg-white dark:bg-white/[0.02] flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300 relative group`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${theme.bg} text-white flex items-center justify-center shadow-lg ${theme.shadow}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">Reporte de {report.type}</h4>
                      <p className={`text-xs font-semibold ${theme.text} mt-0.5 truncate`}>{report.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {report.date}
                    </p>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={(e) => deleteReportFromHistory(report.id, e)}
                        title="Eliminar reporte"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className={`text-slate-400 ${theme.hoverText} transition-colors`} title="Ver / Descargar PDF">
                        <Download className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                  {paginatedReports.map((report) => {
                    const badge = getReportBadge(report.type);
                    const IconComp = badge.icon;
                    const bgColors = {
                      indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
                      emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
                      sky: 'bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
                      amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
                      fuchsia: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400'
                    };
                    return (
                      <tr 
                        key={report.id} 
                        onClick={() => handleOpenSavedReport(report)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      >
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${bgColors[badge.color] || bgColors.indigo}`}>
                            <IconComp className="w-3.5 h-3.5" />
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
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              type="button"
                              onClick={(e) => deleteReportFromHistory(report.id, e)}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                              title="Eliminar reporte del historial"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleOpenSavedReport(report); }}
                              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
                              title="Ver / Descargar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 px-6 text-center text-sm font-medium text-slate-500">
                        {searchQuery ? `No se encontraron reportes con "${searchQuery}"` : 'No hay reportes guardados en el historial.'}
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

      {/* Plantilla dinámica con IA y gráficas integradas */}
      <DynamicAIReportTemplate ref={reportRef} reportType={reportType} filters={{}} user={useAuth().user} reportData={reportData} aiInsights={reportData?.aiInsights} />
    </div>
  );
}
