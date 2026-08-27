// ============================================================================
// SUB-VISTA 4: HISTORIAL Y LOGROS (CONEXIÓN BACKEND Y TIMELINE EN VIVO)
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  History, 
  Award, 
  ShieldCheck, 
  Zap, 
  Target, 
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  GitPullRequest,
  Flame,
  Bug,
  Lock,
  Sparkles,
  Trophy,
  X,
  TrendingUp,
  Check,
  Code2,
  Users2,
  BookOpen,
  Star,
  Activity,
  Layers
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { projectService } from '../../../services/api';

export default function ActivityHistoryView({ 
  projects = [],
  selectedProjectId,
  setSelectedProjectId
}) {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Segmented Tab Switcher: 'TIMELINE' o 'ACHIEVEMENTS'
  const [activeTab, setActiveTab] = useState('TIMELINE');

  // Filtros de Timeline
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL'); // 'ALL', 'DONE', 'REVIEW', 'IN_PROGRESS'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Filtros de Medallas
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL', 'Calidad', 'Velocidad', 'Colaboración', 'Rachas'
  const [badgeStatusFilter, setBadgeStatusFilter] = useState('ALL'); // 'ALL', 'UNLOCKED', 'IN_PROGRESS'
  const [selectedBadgeModal, setSelectedBadgeModal] = useState(null);

  useEffect(() => {
    if (!selectedProjectId) {
      setHistoryData(null);
      return;
    }
    setLoading(true);
    const fetchHistory = () => {
      const userEmail = user?.email || 'valentina1025m@gmail.com';
      const userName = user?.nombre || 'Valentina Montalvo';

      projectService.getKpiIssuesDetail(selectedProjectId, { assignee_email: userEmail, assignee_name: userName, limit: 30 })
        .then(res => {
          if (res && res.issues) {
            const feed = res.issues.map(issue => {
              const status = (issue.status_actual || 'Pendiente').toUpperCase();
              let actionText = `Has estado trabajando en esta tarea (${status})`;
              let category = 'IN_PROGRESS';
              if (['FINALIZADO', 'DONE', 'COMPLETADA', 'LISTO'].includes(status)) {
                actionText = `Completaste esta tarea (Done)`;
                category = 'DONE';
              } else if (['EN REVISIÓN', 'IN REVIEW', 'REVIEW', 'QA'].includes(status)) {
                actionText = `Enviaste a Code Review de Pares`;
                category = 'REVIEW';
              } else if (['EN CURSO', 'IN PROGRESS', 'EN PROGRESO'].includes(status)) {
                actionText = `Pasaste a En Desarrollo (In Progress)`;
                category = 'IN_PROGRESS';
              }

              let timeStr = 'Reciente';
              if (issue.resolved_at || issue.created_at) {
                const dateObj = new Date(issue.resolved_at || issue.created_at);
                timeStr = dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              }

              return {
                time: timeStr,
                key: issue.key_issue,
                action: actionText,
                category,
                points: `${issue.story_points || 1} SP`,
                numericPoints: parseFloat(issue.story_points) || 1,
                type: issue.issue_type || 'Story',
                rawDate: issue.resolved_at || issue.created_at || new Date().toISOString()
              };
            });
            
            feed.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

            setHistoryData({ activity_feed: feed });
          }
          setLoading(false);
        })
        .catch(err => {
          console.warn("Error cargando historial de actividad:", err);
          setLoading(false);
        });
    };

    fetchHistory();
    const timer = setInterval(() => {
      fetchHistory();
    }, 60000);

    return () => clearInterval(timer);
  }, [selectedProjectId, user?.email]);

  const customLogs = JSON.parse(localStorage.getItem('mchav_user_activity_log') || '[]');
  const activityFeed = [...customLogs, ...(historyData?.activity_feed || [])];

  // Catálogo Completo de 16 Logros y Medallas de Ingeniería de Software (en Español)
  const fullBadgesCatalog = [
    // -------------------------------------------------------------
    // 1. Calidad & Seguridad (4 Logros)
    // -------------------------------------------------------------
    { 
      id: "zero-defect", 
      title: "Entrega Cero Defectos", 
      tier: "Oro",
      tierIcon: "🥇",
      description: "2 Sprints consecutivos completados sin re-apertura de bugs en QA.", 
      status: "UNLOCKED",
      progress: 100,
      xp: 120,
      icon: ShieldCheck,
      gradient: "from-emerald-500 to-teal-600",
      category: "Calidad",
      reward: "+15 Pts en Calidad de Código · Reconocimiento QA Oro"
    },
    { 
      id: "clean-code", 
      title: "Maestro de Código Limpio", 
      tier: "Plata",
      tierIcon: "🥈",
      description: "Mantener 0 incidencias bloqueantes o deuda técnica durante 30 días.", 
      status: "IN_PROGRESS",
      progress: 40,
      currentCount: "12 de 30 días",
      xp: 80,
      icon: Sparkles,
      gradient: "from-teal-500 to-emerald-600",
      category: "Calidad",
      reward: "+15 Pts en Calidad · Mención de Excelencia Técnica"
    },
    { 
      id: "immunity-shield", 
      title: "Escudo de Inmunidad", 
      tier: "Diamante",
      tierIcon: "💎",
      description: "0 vulnerabilidades de seguridad reportadas en entregas del trimestre.", 
      status: "IN_PROGRESS",
      progress: 25,
      currentCount: "1 de 4 auditorías",
      xp: 150,
      icon: ShieldCheck,
      gradient: "from-cyan-500 to-blue-600",
      category: "Calidad",
      reward: "+20 Pts en Calidad · Certificación de Máxima Seguridad"
    },
    { 
      id: "test-coverage", 
      title: "Campeón de Cobertura", 
      tier: "Bronce",
      tierIcon: "🥉",
      description: "Cumplir al 100% los criterios de aceptación verificados en 10 tickets.", 
      status: "IN_PROGRESS",
      progress: 70,
      currentCount: "7 de 10 tickets",
      xp: 50,
      icon: CheckCircle2,
      gradient: "from-emerald-400 to-teal-500",
      category: "Calidad",
      reward: "+10 Pts en Calidad · Insignia de Verificación Total"
    },

    // -------------------------------------------------------------
    // 2. Velocidad & Flujo Ágil (4 Logros)
    // -------------------------------------------------------------
    { 
      id: "fast-delivery", 
      title: "Héroe de Entrega Ágil", 
      tier: "Oro",
      tierIcon: "🥇",
      description: "Tiempo de ciclo menor a 2.5 días en tickets de 5 Story Points.", 
      status: "UNLOCKED",
      progress: 100,
      xp: 120,
      icon: Zap,
      gradient: "from-indigo-500 to-purple-600",
      category: "Velocidad",
      reward: "+20 Pts en Velocidad · Insignia de Flujo Rápido"
    },
    { 
      id: "throughput-champion", 
      title: "Campeón de Rendimiento", 
      tier: "Plata",
      tierIcon: "🥈",
      description: "Completar más de 16 tareas en un único ciclo de sprint.", 
      status: "IN_PROGRESS",
      progress: 75,
      currentCount: "12 de 16 tareas",
      xp: 80,
      icon: Flame,
      gradient: "from-blue-500 to-indigo-600",
      category: "Velocidad",
      reward: "+25 Pts en Volumen · Top 1 en Entregas del Equipo"
    },
    { 
      id: "release-machine", 
      title: "Máquina de Entregas", 
      tier: "Diamante",
      tierIcon: "💎",
      description: "Alcanzar 50 Story Points entregados con éxito en un solo mes.", 
      status: "IN_PROGRESS",
      progress: 54,
      currentCount: "27 de 50 SP",
      xp: 150,
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-600",
      category: "Velocidad",
      reward: "+30 Pts en Velocidad · Reconocimiento de Alta Capacidad"
    },
    { 
      id: "sprint-starter", 
      title: "Arranque Imparable", 
      tier: "Bronce",
      tierIcon: "🥉",
      description: "Primer avance y commit registrado en las primeras 24h del sprint.", 
      status: "IN_PROGRESS",
      progress: 90,
      currentCount: "3 de 4 sprints",
      xp: 50,
      icon: Activity,
      gradient: "from-sky-400 to-blue-500",
      category: "Velocidad",
      reward: "+10 Pts en Agilidad · Insignia de Inicio Rápido"
    },

    // -------------------------------------------------------------
    // 3. Colaboración & Arquitectura (4 Logros)
    // -------------------------------------------------------------
    { 
      id: "peer-review-master", 
      title: "Maestro en Revisión de Pares", 
      tier: "Oro",
      tierIcon: "🥇",
      description: "Realizar más de 15 revisiones de código exhaustivas a compañeros.", 
      status: "IN_PROGRESS",
      progress: 80,
      currentCount: "12 de 15 revisiones",
      xp: 100,
      icon: GitPullRequest,
      gradient: "from-fuchsia-500 to-purple-600",
      category: "Colaboración",
      reward: "+15 Pts en Trabajo en Equipo · Rol Revisor Principal"
    },
    { 
      id: "bug-hunter", 
      title: "Cazador de Errores", 
      tier: "Plata",
      tierIcon: "🥈",
      description: "Resolver 5 incidencias críticas en menos de 24 horas cada una.", 
      status: "IN_PROGRESS",
      progress: 60,
      currentCount: "3 de 5 errores",
      xp: 80,
      icon: Bug,
      gradient: "from-rose-500 to-pink-600",
      category: "Colaboración",
      reward: "+10 Pts en Rendimiento · Certificado Eliminador de Errores"
    },
    { 
      id: "docs-specialist", 
      title: "Especialista en Documentación", 
      tier: "Bronce",
      tierIcon: "🥉",
      description: "Documentar la arquitectura y guías técnicas de 3 módulos del sistema.", 
      status: "IN_PROGRESS",
      progress: 66,
      currentCount: "2 de 3 módulos",
      xp: 50,
      icon: BookOpen,
      gradient: "from-amber-500 to-yellow-600",
      category: "Colaboración",
      reward: "+10 Pts en Calidad · Mención de Claridad Técnica"
    },
    { 
      id: "architecture-pioneer", 
      title: "Pionero en Arquitectura", 
      tier: "Diamante",
      tierIcon: "💎",
      description: "Refactorizar y optimizar la escalabilidad de un módulo principal.", 
      status: "IN_PROGRESS",
      progress: 33,
      currentCount: "1 de 3 mejoras",
      xp: 150,
      icon: Code2,
      gradient: "from-violet-500 to-indigo-600",
      category: "Colaboración",
      reward: "+25 Pts en Arquitectura · Insignia de Arquitecto Núcleo"
    },

    // -------------------------------------------------------------
    // 4. Compromiso & Equipo (4 Logros)
    // -------------------------------------------------------------
    { 
      id: "sprint-master", 
      title: "Maestro del Sprint", 
      tier: "Oro",
      tierIcon: "🥇",
      description: "Cumplimiento del 81% de Story Points comprometidos en Sprint 2.", 
      status: "UNLOCKED",
      progress: 100,
      xp: 120,
      icon: Target,
      gradient: "from-amber-500 to-orange-600",
      category: "Compromiso",
      reward: "+20 Pts en Compromiso · Cuadrante de Alto Desempeño"
    },
    { 
      id: "team-sync-hero", 
      title: "Héroe de Sincronía en Equipo", 
      tier: "Diamante",
      tierIcon: "💎",
      description: "Completar el 100% de los entregables colaborativos de sprint del equipo.", 
      status: "IN_PROGRESS",
      progress: 85,
      currentCount: "17 de 20 entregables",
      xp: 150,
      icon: Users2,
      gradient: "from-purple-500 to-pink-600",
      category: "Compromiso",
      reward: "+30 Pts en Desempeño Global · Insignia Legendaria de Equipo"
    },
    { 
      id: "iron-developer", 
      title: "Desarrollador de Hierro", 
      tier: "Diamante",
      tierIcon: "💎",
      description: "Racha ininterrumpida de 30 días consecutivos con entregas activas.", 
      status: "IN_PROGRESS",
      progress: 46,
      currentCount: "14 de 30 días",
      xp: 150,
      icon: Star,
      gradient: "from-orange-500 to-red-600",
      category: "Compromiso",
      reward: "+25 Pts en Consistencia · Insignia Legendaria"
    },
    { 
      id: "friday-finisher", 
      title: "Cierre Perfecto de Viernes", 
      tier: "Bronce",
      tierIcon: "🥉",
      description: "Cerrar todos los tickets asignados antes del cierre de cada viernes.", 
      status: "IN_PROGRESS",
      progress: 75,
      currentCount: "3 de 4 semanas",
      xp: 50,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-green-600",
      category: "Compromiso",
      reward: "+10 Pts en Agilidad · Insignia de Cierre a Tiempo"
    }
  ];

  // Cálculo de Rango e Insignia por XP
  const unlockedBadges = fullBadgesCatalog.filter(b => b.status === 'UNLOCKED');
  const currentXP = unlockedBadges.reduce((acc, curr) => acc + curr.xp, 0); // 360 XP
  const nextLevelXP = 600;
  const xpPercentage = Math.min(Math.round((currentXP / nextLevelXP) * 100), 100);

  const devRank = {
    level: 3,
    title: "Desarrollador Senior Oro",
    tier: "Nivel Oro III",
    icon: "🥇",
    badgeColor: "from-amber-400 via-orange-500 to-yellow-600",
    nextTitle: "Líder Técnico Diamante 💎"
  };

  const devName = user?.nombre || user?.name || 'Stephany León';
  const selectedProjectObj = projects.find(p => String(p.id_proyecto) === String(selectedProjectId));
  const projectName = selectedProjectObj?.nombre || (selectedProjectId ? `Proyecto ${selectedProjectId}` : 'MCHAV ANALYTICS');

  // Filtrado de Medallas
  const displayedBadges = useMemo(() => {
    return fullBadgesCatalog.filter(b => {
      if (categoryFilter !== 'ALL' && b.category !== categoryFilter) return false;
      if (badgeStatusFilter === 'UNLOCKED' && b.status !== 'UNLOCKED') return false;
      if (badgeStatusFilter === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return false;
      return true;
    });
  }, [categoryFilter, badgeStatusFilter]);

  const unlockedCount = fullBadgesCatalog.filter(b => b.status === 'UNLOCKED').length;
  const inProgressCount = fullBadgesCatalog.filter(b => b.status === 'IN_PROGRESS').length;

  // Filtrado del Timeline de Actividades
  const filteredFeed = useMemo(() => {
    return activityFeed.filter(item => {
      // 1. Filtro por búsqueda de texto
      if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        const matches = (item.action || '').toLowerCase().includes(lowerQ) || 
                        (item.key || '').toLowerCase().includes(lowerQ) || 
                        (item.type || '').toLowerCase().includes(lowerQ);
        if (!matches) return false;
      }

      // 2. Filtro por pestaña de acción
      if (actionFilter !== 'ALL') {
        if (actionFilter === 'DONE' && item.category !== 'DONE') return false;
        if (actionFilter === 'REVIEW' && item.category !== 'REVIEW') return false;
        if (actionFilter === 'IN_PROGRESS' && item.category !== 'IN_PROGRESS') return false;
      }

      return true;
    });
  }, [activityFeed, searchQuery, actionFilter]);

  // Conteos por categoría
  const countDone = activityFeed.filter(i => i.category === 'DONE').length;
  const countReview = activityFeed.filter(i => i.category === 'REVIEW').length;
  const countInProgress = activityFeed.filter(i => i.category === 'IN_PROGRESS').length;
  const totalSPDelivered = activityFeed
    .filter(i => i.category === 'DONE')
    .reduce((acc, curr) => acc + (curr.numericPoints || 1), 0);

  const totalPages = Math.ceil(filteredFeed.length / ITEMS_PER_PAGE) || 1;
  const paginatedFeed = filteredFeed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="w-full flex-1 flex flex-col space-y-5 text-left font-sans text-slate-800 dark:text-slate-100 pb-10">

      {/* 1. ENCABEZADO SOBRIO CON PROYECTO Y DESARROLLADOR (Siempre visible) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#272b5c]/70">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-sm shrink-0">
            <History size={22} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Desarrollador: <strong className="text-slate-800 dark:text-slate-200 font-bold">{devName}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Historial y Trayectoria
            </h1>
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Proyecto: <strong className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                  {activeTab === 'ACHIEVEMENTS' ? 'PERFIL GLOBAL' : (selectedProjectId ? projectName : 'Ninguno Seleccionado')}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs shrink-0 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 shadow-xs">
            <Trophy size={13} className="text-purple-600 dark:text-purple-400" />
            {unlockedCount} de {fullBadgesCatalog.length} Medallas Desbloqueadas
          </span>
        </div>
      </div>

      {/* 2. SELECTOR DE SECCIONES (SEGMENTED TAB SWITCHER) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#272b5c] shadow-xs">
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'TIMELINE'
                ? 'bg-white dark:bg-[#1a1e47] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock size={15} />
            <span>Timeline de Actividades</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'TIMELINE'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {activityFeed.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ACHIEVEMENTS')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'ACHIEVEMENTS'
                ? 'bg-white dark:bg-[#1a1e47] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award size={15} />
            <span>Logros y Medallas</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'ACHIEVEMENTS'
                ? 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {unlockedCount}/{fullBadgesCatalog.length}
            </span>
          </button>
        </div>

        {/* Sub-información del Tab */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
          {activeTab === 'TIMELINE' ? (
            <span>Registro cronológico de entregas y cambios de estado</span>
          ) : (
            <span>🏆 Tu Perfil Global de Desarrollador (Agrupa todos tus proyectos)</span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: TIMELINE DE ACTIVIDADES (Solo visible con proyecto seleccionado) */}
      {/* ========================================================================= */}
      {activeTab === 'TIMELINE' && (
        !selectedProjectId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#272b5c] text-center animate-in fade-in duration-200 mt-4">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
              <History size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Selecciona un Proyecto</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Para ver tu cronología de actividades, selecciona en qué proyecto deseas enfocarte usando el selector de la barra superior.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200 mt-4">
              
              {/* Barra de Resumen de Impacto en Timeline */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 py-2.5 px-3.5 sm:px-4 rounded-xl bg-white dark:bg-[#141738]/50 border border-slate-200 dark:border-[#272b5c]/60 shadow-xs text-xs">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Entregables:</span>
                  <strong className="text-slate-900 dark:text-white font-mono font-bold">{activityFeed.length} tareas</strong>
                </div>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Puntos entregados:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{totalSPDelivered} SP</strong>
                </div>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Efectividad QA:</span>
                  <strong className="text-indigo-700 dark:text-indigo-400 font-mono font-bold">98%</strong>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">Top</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Racha activa:</span>
                  <strong className="text-amber-700 dark:text-amber-400 font-mono font-bold">14 días</strong>
                  <span className="text-slate-500 dark:text-slate-400">consecutivos</span>
                </div>
              </div>

              {/* Contenedor del Timeline */}
              <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] shadow-xs overflow-hidden">
                
                {/* Header del Timeline con Filtros y Buscador */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-[#272b5c] bg-slate-50/70 dark:bg-[#0c0e21]/40">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Cronología de Entregas
                    </h2>
                  </div>

                  {/* Filtros Rápidos de 1 Clic */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-white dark:bg-[#141738] p-0.5 rounded-xl border border-slate-200 dark:border-[#272b5c] text-xs shadow-xs">
                      <button
                        onClick={() => { setActionFilter('ALL'); setCurrentPage(1); }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          actionFilter === 'ALL'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Todas ({activityFeed.length})
                      </button>
                      <button
                        onClick={() => { setActionFilter('DONE'); setCurrentPage(1); }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          actionFilter === 'DONE'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                        }`}
                      >
                        Completadas ({countDone})
                      </button>
                      <button
                        onClick={() => { setActionFilter('REVIEW'); setCurrentPage(1); }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          actionFilter === 'REVIEW'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-sky-600'
                        }`}
                      >
                        En Revisión ({countReview})
                      </button>
                      <button
                        onClick={() => { setActionFilter('IN_PROGRESS'); setCurrentPage(1); }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          actionFilter === 'IN_PROGRESS'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                        }`}
                      >
                        En Curso ({countInProgress})
                      </button>
                    </div>

                    {/* Input Buscador */}
                    <div className="relative w-full sm:w-60">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Buscar ticket o actividad..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#141738] text-xs text-slate-800 dark:text-white placeholder-slate-400 rounded-xl border border-slate-200 dark:border-[#272b5c] focus:outline-none focus:border-indigo-500 font-medium shadow-xs"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lista Cronológica con Línea Continua de Timeline */}
                <div className="p-4 sm:p-5 flex-1 relative">
                  {paginatedFeed.length > 0 ? (
                    <div className="relative pl-6 sm:pl-8 space-y-4">
                      {/* Línea vertical conectora */}
                      <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-[#272b5c]" />

                      {paginatedFeed.map((item, idx) => {
                        const isDone = item.category === 'DONE';
                        const isReview = item.category === 'REVIEW';
                        return (
                          <div key={idx} className="relative flex items-start gap-3.5 group">
                            {/* Nodo del Timeline */}
                            <div className={`absolute -left-6 sm:-left-8 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white dark:bg-[#141738] shadow-xs z-10 ${
                              isDone 
                                ? 'border-emerald-500 text-emerald-500' 
                                : isReview 
                                ? 'border-sky-500 text-sky-500' 
                                : 'border-indigo-500 text-indigo-500'
                            }`}>
                              {isDone ? (
                                <CheckCircle2 size={12} className="stroke-[2.5]" />
                              ) : isReview ? (
                                <GitPullRequest size={11} />
                              ) : (
                                <Clock size={11} />
                              )}
                            </div>

                            {/* Tarjeta de Evento */}
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-3.5 bg-slate-50/80 dark:bg-[#1c204d]/40 rounded-xl border border-slate-200/80 dark:border-[#272b5c]/60 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors">
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                                    {item.key}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                                    {item.action}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                                  {item.time}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                                <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-[#0c0e21] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                                  {item.points}
                                </span>
                                <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30 rounded-md">
                                  {item.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No se encontraron actividades registradas con el filtro actual.
                    </div>
                  )}
                </div>

                {/* Barra de Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-[#272b5c] bg-slate-50/50 dark:bg-[#0c0e21]/40 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-white dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c] rounded-lg text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all cursor-pointer text-xs shadow-xs"
                    >
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-white dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c] rounded-lg text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all cursor-pointer text-xs shadow-xs"
                    >
                      Siguiente <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* ========================================================================= */}
          {/* VISTA 2: LOGROS Y MEDALLAS DE DESEMPEÑO */}
          {/* ========================================================================= */}
          {activeTab === 'ACHIEVEMENTS' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Barra de Rango e Insignia de Nivel */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${devRank.badgeColor} text-white font-extrabold shadow-md shrink-0 ring-2 ring-amber-400/30`}>
                    <Trophy size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <span>{devRank.icon}</span> Rango Actual: Nivel {devRank.level}
                      </span>
                      <span className="px-2 py-0.2 rounded-md font-bold text-[10px] bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                        {devRank.tier}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {devRank.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>Progreso: <strong className="text-slate-800 dark:text-slate-200">{currentXP}</strong> / {nextLevelXP} XP</span>
                      <span>·</span>
                      <span>Siguiente: <strong className="text-purple-600 dark:text-purple-400">{devRank.nextTitle}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-[#272b5c]/60">
                  {/* Barra de XP */}
                  <div className="w-full sm:w-44 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span>Nivel {devRank.level}</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{xpPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500" 
                        style={{ width: `${xpPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Medallas</span>
                      <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {unlockedCount} / {fullBadgesCatalog.length}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Boost Score</span>
                      <strong className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        +55 Pts
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtros de Categoría y Estado de Medallas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#141738] p-3 rounded-xl border border-slate-200 dark:border-[#272b5c] shadow-xs">
                
                {/* Categorías */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
                  {['ALL', 'Calidad', 'Velocidad', 'Colaboración', 'Compromiso'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c204d]'
                      }`}
                    >
                      {cat === 'ALL' ? 'Todas las Categorías' : cat}
                    </button>
                  ))}
                </div>

                {/* Filtro Estado: Desbloqueadas / En Progreso */}
                <div className="flex items-center gap-1 shrink-0 text-xs">
                  <button
                    onClick={() => setBadgeStatusFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                      badgeStatusFilter === 'ALL'
                        ? 'bg-slate-200 dark:bg-[#1a1e47] text-slate-900 dark:text-white font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Todas ({fullBadgesCatalog.length})
                  </button>
                  <button
                    onClick={() => setBadgeStatusFilter('UNLOCKED')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                      badgeStatusFilter === 'UNLOCKED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200'
                        : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'
                    }`}
                  >
                    Desbloqueadas ({unlockedCount})
                  </button>
                  <button
                    onClick={() => setBadgeStatusFilter('IN_PROGRESS')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                      badgeStatusFilter === 'IN_PROGRESS'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200'
                        : 'text-slate-500 dark:text-slate-400 hover:text-amber-600'
                    }`}
                  >
                    En Progreso ({inProgressCount})
                  </button>
                </div>
              </div>

              {/* Grid Completo de Medallas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {displayedBadges.map((badge) => {
                  const IconComponent = badge.icon;
                  const isUnlocked = badge.status === 'UNLOCKED';
                  return (
                    <div
                      key={badge.id}
                      onClick={() => setSelectedBadgeModal(badge)}
                      className={`flex flex-col justify-between p-4 rounded-xl bg-white dark:bg-[#141738] border transition-all cursor-pointer group shadow-xs ${
                        isUnlocked
                          ? 'border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-400'
                          : 'border-slate-200 dark:border-[#272b5c] hover:border-indigo-400'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${badge.gradient} text-white shrink-0 shadow-xs`}>
                              <IconComponent size={20} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span title={`Tier ${badge.tier}`}>{badge.tierIcon}</span>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {badge.title}
                                </h3>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {badge.category} · Tier {badge.tier}
                              </span>
                            </div>
                          </div>

                          {isUnlocked ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                              Desbloqueada
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 shrink-0 flex items-center gap-1">
                              <Lock size={10} /> {badge.progress}%
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                          {badge.description}
                        </p>
                      </div>

                      {/* Barra de Progreso o Ver Requisito */}
                      {!isUnlocked ? (
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#272b5c]/50">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                            <span>Progreso actual</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">{badge.currentCount}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" 
                              style={{ width: `${badge.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#272b5c]/50 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span className="flex items-center gap-1"><Check size={12} /> Logro obtenido</span>
                          <span className="text-slate-400 group-hover:text-indigo-500 transition-colors">Ver impacto →</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      {/* 5. MODAL DE DETALLE DE MEDALLA / LOGRO */}
      {selectedBadgeModal && createPortal(
        <div 
          className="fixed top-0 bottom-0 right-0 left-0 md:left-64 z-[999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10, 12, 28, 0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedBadgeModal(null)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#272b5c] bg-slate-50 dark:bg-[#0c0e21]/50">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${selectedBadgeModal.gradient} text-white shadow-sm`}>
                  {React.createElement(selectedBadgeModal.icon, { size: 20 })}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span>{selectedBadgeModal.tierIcon}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedBadgeModal.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Insignia de {selectedBadgeModal.category} · Nivel {selectedBadgeModal.tier}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBadgeModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1c204d] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  Requisito de Desbloqueo
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-[#0c0e21]/40 p-3 rounded-xl border border-slate-200/80 dark:border-[#272b5c]/60">
                  {selectedBadgeModal.description}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  Impacto y Recompensa en tu Perfil
                </span>
                <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 font-semibold">
                  <TrendingUp size={15} className="shrink-0 mt-0.5" />
                  <span>{selectedBadgeModal.reward}</span>
                </div>
              </div>

              {/* Estado y Progreso */}
              <div>
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  Estado Actual
                </span>
                {selectedBadgeModal.status === 'UNLOCKED' ? (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold p-2.5 bg-slate-50 dark:bg-[#0c0e21] rounded-xl border border-slate-200 dark:border-[#272b5c]">
                    <CheckCircle2 size={16} />
                    <span>¡Medalla desbloqueada y activa en tu perfil de desarrollador!</span>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 bg-slate-50 dark:bg-[#0c0e21] rounded-xl border border-slate-200 dark:border-[#272b5c]">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-amber-600 dark:text-amber-400">Progreso: {selectedBadgeModal.progress}%</span>
                      <span className="text-slate-500">{selectedBadgeModal.currentCount}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" 
                        style={{ width: `${selectedBadgeModal.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-4 border-t border-slate-200 dark:border-[#272b5c] bg-slate-50 dark:bg-[#0c0e21]/50 flex justify-end">
              <button
                onClick={() => setSelectedBadgeModal(null)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
