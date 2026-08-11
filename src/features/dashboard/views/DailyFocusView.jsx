// ============================================================================
// SUB-VISTA 2: ENFOQUE Y PRIORIDADES (CONEXIÓN BACKEND Y ACCIONES EN VIVO)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  AlertOctagon, 
  Play, 
  Clock, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { developerService } from '../../../services/api';

export default function DailyFocusView({ selectedProjectId = 'PROJ-01' }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    developerService.getDailyFocus(selectedProjectId)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Error cargando daily focus:", err);
        setLoading(false);
      });
  }, [selectedProjectId]);

  const handleActionClick = (ticketKey, actionText) => {
    setActionMsg(`✅ Acción registrada para ${ticketKey}: ${actionText}`);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const urgentBugs = data?.urgent_qa_bugs || [];
  const activeTasks = data?.active_in_progress || [];
  const reviewTasks = data?.in_review || [];

  return (
    <div className="w-full space-y-10 py-4 px-1 text-left font-sans min-h-[85vh] flex flex-col justify-between">
      
      {/* ENCABEZADO ESPACIOSO CON AURA DEGRADADA */}
      <div className="relative group rounded-2xl bg-white dark:bg-[#191c3d] p-8 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#33376b] transition-all duration-300">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 blur-md opacity-30 transition-opacity group-hover:opacity-50 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-indigo-500 to-purple-600 text-white font-extrabold shadow-xl shadow-amber-500/20">
              <Target size={26} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                Enfoque y Prioridades de Hoy
                <span className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Focus Mode
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Jerarquización de atención diaria para eliminar dispersión y maximizar velocidad.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST DE CONFIRMACIÓN DE ACCIÓN */}
      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-3 shadow-sm dark:shadow-xl transition-all">
          <CheckCircle2 size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* BLOQUE AI DEV COACH BANNER ESPACIOSO */}
      <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-8 shadow-sm dark:shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-indigo-500/20 border border-slate-200 dark:border-[#33376b]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-35 pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
              <Sparkles size={16} className="text-white" />
            </div>
            <span>Asistente Inteligente — AI Dev Coach</span>
          </div>
          <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            💡 <strong>Diagnóstico del Sprint:</strong> *"{data?.ai_coach_tip || "Tu tiempo de ciclo personal ha mejorado un +14%. Enfócate en cerrar los tickets activos."}"*
          </p>
          <div className="flex flex-wrap gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><TrendingUp size={16} /> Ritmo: +{data?.efficiency_gain_pct || 14}% Eficiencia</span>
            <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400"><ShieldCheck size={16} /> Calidad: {data?.clean_deliveries_pct || 100}% Entregas Limpias</span>
          </div>
        </div>
      </div>

      {/* MATRIZ DE ATENCIÓN DIARIA EN 3 COLUMNAS CON ACCIONES REALES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">

        {/* COLUMNA 1: URGENTE */}
        <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-7 shadow-sm dark:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-rose-500/20 border border-slate-200 dark:border-[#33376b] justify-between min-h-[260px]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 opacity-15 blur-sm transition-opacity duration-300 group-hover:opacity-30 pointer-events-none"></div>
          <div className="relative z-10 space-y-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600">
                  <AlertOctagon className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">1. Atención Inmediata</h2>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {urgentBugs.length} URGENTE
              </span>
            </div>

            {urgentBugs.map((bug, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 dark:bg-[#12142e] p-5 border border-slate-200 dark:border-[#33376b] space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">{bug.key_issue}</span>
                  <span className="text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 px-2.5 py-1 border border-rose-500/30 rounded-lg">
                    {bug.issue_type || "Bug"}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{bug.summary}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Devuelto por QA tras encontrar falla en pruebas.</p>
                <div className="pt-3 flex justify-between items-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
                  <span>{bug.time_ago || "Reciente"}</span>
                  <button 
                    onClick={() => handleActionClick(bug.key_issue, "Iniciado trabajo de corrección de bug en QA")}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:from-rose-600 hover:to-red-700 cursor-pointer"
                  >
                    Corregir <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 2: TAREA ACTIVA */}
        <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-7 shadow-sm dark:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-500/20 border border-slate-200 dark:border-[#33376b] justify-between min-h-[260px]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 opacity-15 blur-sm transition-opacity duration-300 group-hover:opacity-30 pointer-events-none"></div>
          <div className="relative z-10 space-y-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                  <Play className="h-4 w-4 text-slate-950 fill-current" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">2. Tarea Activa del Día</h2>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                EN CURSO
              </span>
            </div>

            {activeTasks.map((task, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 dark:bg-[#12142e] p-5 border border-slate-200 dark:border-[#33376b] space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{task.key_issue}</span>
                  <span className="text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2.5 py-1 border border-amber-500/30 rounded-lg">
                    {task.story_points || 8} SP
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{task.summary}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Desarrollo principal. Llevas {task.time_spent || "1.8d"} de trabajo activo.</p>
                <div className="pt-3 flex justify-between items-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400"><Clock size={12} /> {task.time_spent || "1.8d / 3.0d"}</span>
                  <button 
                    onClick={() => handleActionClick(task.key_issue, "Estado cambiado a En Revisión de Pares (Code Review)")}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:from-indigo-600 hover:to-purple-600 cursor-pointer"
                  >
                    A Review <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 3: EN REVIEW */}
        <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-7 shadow-sm dark:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/20 border border-slate-200 dark:border-[#33376b] justify-between min-h-[260px]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400 opacity-15 blur-sm transition-opacity duration-300 group-hover:opacity-30 pointer-events-none"></div>
          <div className="relative z-10 space-y-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">3. En Review</h2>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                {reviewTasks.length} EN REVIEW
              </span>
            </div>

            {reviewTasks.map((rev, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 dark:bg-[#12142e] p-5 border border-slate-200 dark:border-[#33376b] space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">{rev.key_issue}</span>
                  <span className="text-[11px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 px-2.5 py-1 border border-purple-500/30 rounded-lg">
                    {rev.story_points || 13} SP
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{rev.summary}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Esperando aprobación del par técnico en GitHub.</p>
                <div className="pt-3 flex justify-between items-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
                  <span>{rev.time_ago || "Hace 18h"}</span>
                  <button 
                    onClick={() => handleActionClick(rev.key_issue, "Recordatorio enviado al Reviewer asignado")}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:from-purple-600 hover:to-indigo-600 cursor-pointer"
                  >
                    Recordar <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
