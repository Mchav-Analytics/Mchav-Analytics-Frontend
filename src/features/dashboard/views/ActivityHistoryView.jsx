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
  Clock
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { developerService } from '../../../services/api';

export default function ActivityHistoryView({ selectedProjectId = 'PROJ-01' }) {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    developerService.getActivityHistory(selectedProjectId)
      .then(res => {
        setHistoryData(res);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Error cargando historial de actividad:", err);
        setLoading(false);
      });
  }, [selectedProjectId]);

  const activityFeed = historyData?.activity_feed || [
    { time: 'Hoy 09:30 AM', key: 'MCHAV-101', action: 'Pasaste a En Desarrollo (In Progress)', points: '8 SP', type: 'Story' },
    { time: 'Ayer 04:15 PM', key: 'MCHAV-105', action: 'Resolviste e hiciste entrega a QA (Done)', points: '5 SP', type: 'Bug' },
    { time: 'Hace 2 días', key: 'MCHAV-112', action: 'Enviaste a Code Review de Pares', points: '13 SP', type: 'Story' },
    { time: 'Hace 3 días', key: 'MCHAV-118', action: 'Completaste optimización de consultas SQL (Done)', points: '7 SP', type: 'Task' },
    { time: 'Hace 4 días', key: 'MCHAV-120', action: 'Completaste pruebas de integración (Done)', points: '8 SP', type: 'Task' }
  ];

  const badges = historyData?.badges || [
    { id: "zero-defect", title: "Zero Defect Delivery", description: "2 Sprints consecutivos completados sin re-apertura de bugs en QA.", status: "UNLOCKED" },
    { id: "fast-delivery", title: "Fast Delivery Hero", description: "Cycle Time menor a 2.5 días en tickets de 5 Story Points.", status: "UNLOCKED" },
    { id: "sprint-master", title: "Sprint Master", description: "Cumplimiento del 81% de Story Points comprometidos en Sprint 2.", status: "UNLOCKED" }
  ];

  return (
    <div className="w-full space-y-10 py-4 px-1 text-left font-sans min-h-[85vh] flex flex-col justify-between">
      
      {/* ENCABEZADO ESPACIOSO CON AURA DEGRADADA */}
      <div className="relative group rounded-2xl bg-white dark:bg-[#191c3d] p-8 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#33376b] transition-all duration-300">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-pink-500/20 blur-md opacity-30 transition-opacity group-hover:opacity-50 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-600 text-white font-extrabold shadow-xl shadow-purple-500/20">
              <History size={26} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                Historial de Actividad y Logros
                <span className="flex items-center gap-2 rounded-full bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
                  {badges.length} Medallas Desbloqueadas
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Cronología de cambios para tus reuniones diarias (Standups) y reconocimientos de calidad.
              </p>
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
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" /> Timeline de Actividades Recientes (Para Standups)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Últimos 7 días</span>
          </div>

          <div className="space-y-4">
            {activityFeed.map((item, idx) => (
              <div key={idx} className="flex items-start gap-5 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0 mt-0.5 shadow-sm">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-indigo-400 text-sm">{item.key}</span>
                      <span className="text-sm font-semibold text-slate-200">{item.action}</span>
                    </div>
                    <span className="text-xs text-slate-400 block">{item.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg">
                      {item.points}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-lg">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
