import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { projectService } from '../../../services/api';
import { 
  ShieldCheck, Zap, GitPullRequest, Bug, BookOpen, 
  Code2, Target, Users2, Star, CheckCircle2, Activity, Flame, TrendingUp, Sparkles
} from 'lucide-react';

export const useActivityHistory = ({ projects, selectedProjectId }) => {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('TIMELINE');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [badgeStatusFilter, setBadgeStatusFilter] = useState('ALL');
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

  const fullBadgesCatalog = [
    { id: "zero-defect", title: "Entrega Cero Defectos", tier: "Oro", tierIcon: "🥇", description: "2 Sprints consecutivos completados sin re-apertura de bugs en QA.", status: "UNLOCKED", progress: 100, xp: 120, icon: ShieldCheck, gradient: "from-emerald-500 to-teal-600", category: "Calidad", reward: "+15 Pts en Calidad de Código · Reconocimiento QA Oro" },
    { id: "clean-code", title: "Maestro de Código Limpio", tier: "Plata", tierIcon: "🥈", description: "Mantener 0 incidencias bloqueantes o deuda técnica durante 30 días.", status: "IN_PROGRESS", progress: 40, currentCount: "12 de 30 días", xp: 80, icon: Sparkles, gradient: "from-teal-500 to-emerald-600", category: "Calidad", reward: "+15 Pts en Calidad · Mención de Excelencia Técnica" },
    { id: "immunity-shield", title: "Escudo de Inmunidad", tier: "Diamante", tierIcon: "💎", description: "0 vulnerabilidades de seguridad reportadas en entregas del trimestre.", status: "IN_PROGRESS", progress: 25, currentCount: "1 de 4 auditorías", xp: 150, icon: ShieldCheck, gradient: "from-cyan-500 to-blue-600", category: "Calidad", reward: "+20 Pts en Calidad · Certificación de Máxima Seguridad" },
    { id: "test-coverage", title: "Campeón de Cobertura", tier: "Bronce", tierIcon: "🥉", description: "Cumplir al 100% los criterios de aceptación verificados en 10 tickets.", status: "IN_PROGRESS", progress: 70, currentCount: "7 de 10 tickets", xp: 50, icon: CheckCircle2, gradient: "from-emerald-400 to-teal-500", category: "Calidad", reward: "+10 Pts en Calidad · Insignia de Verificación Total" },
    { id: "fast-delivery", title: "Héroe de Entrega Ágil", tier: "Oro", tierIcon: "🥇", description: "Tiempo de ciclo menor a 2.5 días en tickets de 5 Story Points.", status: "UNLOCKED", progress: 100, xp: 120, icon: Zap, gradient: "from-indigo-500 to-purple-600", category: "Velocidad", reward: "+20 Pts en Velocidad · Insignia de Flujo Rápido" },
    { id: "throughput-champion", title: "Campeón de Rendimiento", tier: "Plata", tierIcon: "🥈", description: "Completar más de 16 tareas en un único ciclo de sprint.", status: "IN_PROGRESS", progress: 75, currentCount: "12 de 16 tareas", xp: 80, icon: Flame, gradient: "from-blue-500 to-indigo-600", category: "Velocidad", reward: "+25 Pts en Volumen · Top 1 en Entregas del Equipo" },
    { id: "release-machine", title: "Máquina de Entregas", tier: "Diamante", tierIcon: "💎", description: "Alcanzar 50 Story Points entregados con éxito en un solo mes.", status: "IN_PROGRESS", progress: 54, currentCount: "27 de 50 SP", xp: 150, icon: TrendingUp, gradient: "from-purple-500 to-pink-600", category: "Velocidad", reward: "+30 Pts en Velocidad · Reconocimiento de Alta Capacidad" },
    { id: "sprint-starter", title: "Arranque Imparable", tier: "Bronce", tierIcon: "🥉", description: "Primer avance y commit registrado en las primeras 24h del sprint.", status: "IN_PROGRESS", progress: 90, currentCount: "3 de 4 sprints", xp: 50, icon: Activity, gradient: "from-sky-400 to-blue-500", category: "Velocidad", reward: "+10 Pts en Agilidad · Insignia de Inicio Rápido" },
    { id: "peer-review-master", title: "Maestro en Revisión de Pares", tier: "Oro", tierIcon: "🥇", description: "Realizar más de 15 revisiones de código exhaustivas a compañeros.", status: "IN_PROGRESS", progress: 80, currentCount: "12 de 15 revisiones", xp: 100, icon: GitPullRequest, gradient: "from-fuchsia-500 to-purple-600", category: "Colaboración", reward: "+15 Pts en Trabajo en Equipo · Rol Revisor Principal" },
    { id: "bug-hunter", title: "Cazador de Errores", tier: "Plata", tierIcon: "🥈", description: "Resolver 5 incidencias críticas en menos de 24 horas cada una.", status: "IN_PROGRESS", progress: 60, currentCount: "3 de 5 errores", xp: 80, icon: Bug, gradient: "from-rose-500 to-pink-600", category: "Colaboración", reward: "+10 Pts en Rendimiento · Certificado Eliminador de Errores" },
    { id: "docs-specialist", title: "Especialista en Documentación", tier: "Bronce", tierIcon: "🥉", description: "Documentar la arquitectura y guías técnicas de 3 módulos del sistema.", status: "IN_PROGRESS", progress: 66, currentCount: "2 de 3 módulos", xp: 50, icon: BookOpen, gradient: "from-amber-500 to-yellow-600", category: "Colaboración", reward: "+10 Pts en Calidad · Mención de Claridad Técnica" },
    { id: "architecture-pioneer", title: "Pionero en Arquitectura", tier: "Diamante", tierIcon: "💎", description: "Refactorizar y optimizar la escalabilidad de un módulo principal.", status: "IN_PROGRESS", progress: 33, currentCount: "1 de 3 mejoras", xp: 150, icon: Code2, gradient: "from-violet-500 to-indigo-600", category: "Colaboración", reward: "+25 Pts en Arquitectura · Insignia de Arquitecto Núcleo" },
    { id: "sprint-master", title: "Maestro del Sprint", tier: "Oro", tierIcon: "🥇", description: "Cumplimiento del 81% de Story Points comprometidos en Sprint 2.", status: "UNLOCKED", progress: 100, xp: 120, icon: Target, gradient: "from-amber-500 to-orange-600", category: "Compromiso", reward: "+20 Pts en Compromiso · Cuadrante de Alto Desempeño" },
    { id: "team-sync-hero", title: "Héroe de Sincronía en Equipo", tier: "Diamante", tierIcon: "💎", description: "Completar el 100% de los entregables colaborativos de sprint del equipo.", status: "IN_PROGRESS", progress: 85, currentCount: "17 de 20 entregables", xp: 150, icon: Users2, gradient: "from-purple-500 to-pink-600", category: "Compromiso", reward: "+30 Pts en Desempeño Global · Insignia Legendaria de Equipo" },
    { id: "iron-developer", title: "Desarrollador de Hierro", tier: "Diamante", tierIcon: "💎", description: "Racha ininterrumpida de 30 días consecutivos con entregas activas.", status: "IN_PROGRESS", progress: 46, currentCount: "14 de 30 días", xp: 150, icon: Star, gradient: "from-orange-500 to-red-600", category: "Compromiso", reward: "+25 Pts en Consistencia · Insignia Legendaria" },
    { id: "friday-finisher", title: "Cierre Perfecto de Viernes", tier: "Bronce", tierIcon: "🥉", description: "Cerrar todos los tickets asignados antes del cierre de cada viernes.", status: "IN_PROGRESS", progress: 75, currentCount: "3 de 4 semanas", xp: 50, icon: CheckCircle2, gradient: "from-emerald-500 to-green-600", category: "Compromiso", reward: "+10 Pts en Agilidad · Insignia de Cierre a Tiempo" }
  ];

  const unlockedBadges = fullBadgesCatalog.filter(b => b.status === 'UNLOCKED');
  const currentXP = unlockedBadges.reduce((acc, curr) => acc + curr.xp, 0);
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

  const displayedBadges = useMemo(() => {
    return fullBadgesCatalog.filter(b => {
      if (categoryFilter !== 'ALL' && b.category !== categoryFilter) return false;
      if (badgeStatusFilter === 'UNLOCKED' && b.status !== 'UNLOCKED') return false;
      if (badgeStatusFilter === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return false;
      return true;
    });
  }, [categoryFilter, badgeStatusFilter]);

  const unlockedCount = unlockedBadges.length;
  const inProgressCount = fullBadgesCatalog.filter(b => b.status === 'IN_PROGRESS').length;

  const filteredFeed = useMemo(() => {
    return activityFeed.filter(item => {
      if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        const matches = (item.action || '').toLowerCase().includes(lowerQ) || 
                        (item.key || '').toLowerCase().includes(lowerQ) || 
                        (item.type || '').toLowerCase().includes(lowerQ);
        if (!matches) return false;
      }
      if (actionFilter !== 'ALL') {
        if (actionFilter === 'DONE' && item.category !== 'DONE') return false;
        if (actionFilter === 'REVIEW' && item.category !== 'REVIEW') return false;
        if (actionFilter === 'IN_PROGRESS' && item.category !== 'IN_PROGRESS') return false;
      }
      return true;
    });
  }, [activityFeed, searchQuery, actionFilter]);

  const countDone = activityFeed.filter(i => i.category === 'DONE').length;
  const countReview = activityFeed.filter(i => i.category === 'REVIEW').length;
  const countInProgress = activityFeed.filter(i => i.category === 'IN_PROGRESS').length;
  const totalSPDelivered = activityFeed
    .filter(i => i.category === 'DONE')
    .reduce((acc, curr) => acc + (curr.numericPoints || 1), 0);

  const totalPages = Math.ceil(filteredFeed.length / ITEMS_PER_PAGE) || 1;
  const paginatedFeed = filteredFeed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
    loading,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    actionFilter, setActionFilter,
    currentPage, setCurrentPage,
    categoryFilter, setCategoryFilter,
    badgeStatusFilter, setBadgeStatusFilter,
    selectedBadgeModal, setSelectedBadgeModal,
    activityFeed,
    filteredFeed,
    paginatedFeed,
    totalPages,
    countDone, countReview, countInProgress, totalSPDelivered,
    fullBadgesCatalog, displayedBadges, unlockedCount, inProgressCount,
    currentXP, nextLevelXP, xpPercentage, devRank, devName, projectName
  };
};
