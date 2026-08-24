// ============================================================================
// SUB-VISTA 4: HISTORIAL Y LOGROS (CONEXIÓN BACKEND Y TIMELINE EN VIVO)
// ============================================================================

import React, { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { projectService } from '../../../services/api';
import DeveloperProjectHeader from '../../../components/layout/DeveloperProjectHeader';

export default function ActivityHistoryView({ 
  projects = [],
  selectedProjectId,
  setSelectedProjectId,
  syncSuccessMsg
}) {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!selectedProjectId) {
      setHistoryData(null);
      return;
    }
    setLoading(true);
    const fetchHistory = () => {
      const userEmail = user?.email || 'valentina1025m@gmail.com';
      const userName = user?.nombre || 'Valentina Montalvo';

      projectService.getKpiIssuesDetail(selectedProjectId, { assignee_email: userEmail, assignee_name: userName, limit: 15 })
        .then(res => {
          if (res && res.issues) {
            const feed = res.issues.map(issue => {
              const status = (issue.status_actual || 'Pendiente').toUpperCase();
              let actionText = `Has estado trabajando en esta tarea (${status})`;
              if (['FINALIZADO', 'DONE', 'COMPLETADA', 'LISTO'].includes(status)) {
                actionText = `Completaste esta tarea (Done)`;
              } else if (['EN REVISIÓN', 'IN REVIEW'].includes(status)) {
                actionText = `Enviaste a Code Review de Pares`;
              } else if (['EN CURSO', 'IN PROGRESS', 'EN PROGRESO'].includes(status)) {
                actionText = `Pasaste a En Desarrollo (In Progress)`;
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
                points: `${issue.story_points || 1} SP`,
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
    }, 60000); // 60 seconds polling instead of 15 to avoid spamming the backend

    return () => clearInterval(timer);
  }, [selectedProjectId, user?.email]);

  const customLogs = JSON.parse(localStorage.getItem('mchav_user_activity_log') || '[]');
  const activityFeed = [...customLogs, ...(historyData?.activity_feed || [])];

  const badges = historyData?.badges || [
    { id: "zero-defect", title: "Zero Defect Delivery", description: "2 Sprints consecutivos completados sin re-apertura de bugs en QA.", status: "UNLOCKED" },
    { id: "fast-delivery", title: "Fast Delivery Hero", description: "Cycle Time menor a 2.5 días en tickets de 5 Story Points.", status: "UNLOCKED" },
    { id: "sprint-master", title: "Sprint Master", description: "Cumplimiento del 81% de Story Points comprometidos en Sprint 2.", status: "UNLOCKED" }
  ];

  const devName = user?.nombre || 'Valka Hoyos';
  const selectedProjectObj = projects.find(p => String(p.id_proyecto) === String(selectedProjectId));
  const projectName = selectedProjectObj?.nombre || `Proyecto ${selectedProjectId}`;

  // Filtro y Paginación
  const filteredFeed = activityFeed.filter(item => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return (item.action || '').toLowerCase().includes(lowerQ) || (item.key || '').toLowerCase().includes(lowerQ) || (item.description || '').toLowerCase().includes(lowerQ);
  });

  const totalPages = Math.ceil(filteredFeed.length / ITEMS_PER_PAGE) || 1;
  const paginatedFeed = filteredFeed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="w-full space-y-10 py-4 px-1 text-left font-sans min-h-[85vh] flex flex-col justify-between">
      

      {/* Si no hay proyecto seleccionado, mostrar prompt */}
      {!selectedProjectId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#272b5c] text-center">
          <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/30 text-purple-500 rounded-full flex items-center justify-center mb-4">
            <History size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Selecciona un Proyecto</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Para ver tu historial de actividad y logros, selecciona en qué proyecto deseas trabajar desde el selector superior.
          </p>
        </div>
      ) : (
        <>
          {/* ENCABEZADO CONSOLE DE HISTORIAL (ESTILO DESIGN SYSTEM) */}
          <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] shrink-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-md shrink-0">
                  <History size={24} />
                </div>
                <div className="space-y-0.5 text-left">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                      {badges.length} Medallas Desbloqueadas
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      • Cronología de Trabajo Individual
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Desarrollador: <strong className="text-slate-800 dark:text-slate-200 font-bold">{devName}</strong>
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Historial
                  </h1>
                  <div className="mt-1">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Proyecto: <strong className="text-indigo-600 dark:text-indigo-400 font-black text-base uppercase">{projectName}</strong>
                    </span>
                  </div>
              </div>
            </div>
          </div>
        </div>

      {/* MÓDULO DE LOGROS Y MEDALLAS ESPACIOSAS */}
      <div className="space-y-5">
        <h2 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Award size={18} className="text-purple-500 dark:text-purple-400" /> Mis Logros y Medallas de Desempeño
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Badge 1 */}
          <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-7 shadow-sm dark:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/20 border border-slate-200 dark:border-[#33376b] justify-between min-h-[190px]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-15 blur-sm transition-opacity duration-300 group-hover:opacity-30 pointer-events-none"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shrink-0 shadow-md">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{badges[0]?.title || "Zero Defect Delivery"}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{badges[0]?.description || "2 Sprints consecutivos completados sin re-apertura de bugs en QA."}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mt-4">
                  🏆 Medalla Desbloqueada
                </span>
              </div>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-7 shadow-sm dark:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/20 border border-slate-200 dark:border-[#33376b] justify-between min-h-[190px]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-15 blur-sm transition-opacity duration-300 group-hover:opacity-30 pointer-events-none"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shrink-0 shadow-md">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{badges[1]?.title || "Fast Delivery Hero"}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{badges[1]?.description || "Cycle Time menor a 2.5 días en tickets de 5 Story Points."}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mt-4">
                  ⚡ Medalla Desbloqueada
                </span>
              </div>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-7 shadow-sm dark:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-500/20 border border-slate-200 dark:border-[#33376b] justify-between min-h-[190px]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 opacity-15 blur-sm transition-opacity duration-300 group-hover:opacity-30 pointer-events-none"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shrink-0 shadow-md">
                <Target className="h-6 w-6 text-slate-950 fill-current" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{badges[2]?.title || "Sprint Master"}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{badges[2]?.description || "Cumplimiento del 81% de Story Points comprometidos en Sprint 2."}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 mt-4">
                  🎯 Medalla Desbloqueada
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* TIMELINE CRONOLÓGICO DE ACTIVIDAD ESPACIOSO */}
      <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-8 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#33376b] transition-all duration-300 flex-1 justify-between">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-sm opacity-20 pointer-events-none"></div>
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" /> Timeline de Actividades
            </h2>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar ticket o actividad..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>


          <div className="space-y-4">
            {paginatedFeed.map((item, idx) => (
              <div key={idx} className="flex items-start gap-5 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0 mt-0.5 shadow-sm">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{item.key}</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.action}</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">{item.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg">
                      {item.points}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-lg">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 flex items-center"
              >
                <ChevronLeft size={16} className="inline mr-1" /> Anterior
              </button>
              <span className="text-xs font-bold text-slate-500">
                Página {currentPage} de {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 flex items-center"
              >
                Siguiente <ChevronRight size={16} className="inline ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
      </>
      )}

    </div>
  );
}
