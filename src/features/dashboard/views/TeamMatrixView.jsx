// ============================================================================
// VISTA: MATRIZ DE RENDIMIENTO Y 4 CUADRANTES DE EQUIPO (TEAM MATRIX VIEW)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  User,
  Users,
  Zap,
  Target,
  BarChart3,
  ShieldCheck,
  FileDown
} from 'lucide-react';
import { developerService } from '../../../services/api';
import FourQuadrantChart from '../components/FourQuadrantChart';
import LiderNotificationBell from '../components/LiderNotificationBell';

function TeamMatrixView({ selectedProjectId = 'PROJ-01', onSelectDevForScorecard, onNavigateToHealth, isDarkMode }) {
  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState(null);
  const [selectedDevDetail, setSelectedDevDetail] = useState(null);

  useEffect(() => {
    setLoading(true);
    developerService.getTeamMatrix(selectedProjectId)
      .then((data) => {
        setMatrixData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener la matriz de equipo:", err);
        setLoading(false);
      });
  }, [selectedProjectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Generando Matriz Comparativa de Equipo...</p>
        </div>
      </div>
    );
  }

  const teamSummary = matrixData?.team_summary || {};
  const developers = matrixData?.developers || [];
  const topPerformer = teamSummary.top_performer;
  const conteo = teamSummary.conteo_cuadrantes || {};

  return (
    <div className="space-y-6 pb-12 font-sans text-left">

      {/* BARRA SUPERIOR DE MATRIZ DE EQUIPO (ESTILO ADMIN RESUMEN) */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Lado Izquierdo: Ícono en Gradiente + Insignia + Título */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
            <Trophy size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Supervisión Ejecutiva
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                • Visión Consolidada: <strong className="text-slate-800 dark:text-slate-200 font-bold">10000</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Matriz de Rendimiento
            </h1>
          </div>
        </div>

        {/* Lado Derecho: Bell Popup + Exportar PDF */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LiderNotificationBell />

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-[#5b36f5] hover:bg-indigo-600 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
            title="Exportar reporte consolidado en PDF"
          >
            <FileDown size={15} />
            <span>Exportar PDF</span>
          </button>
        </div>

      </div>

      {/* BARRA DE NAVEGACIÓN Y ACCESO RÁPIDO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-3 px-4 rounded-xl shadow-sm dark:shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow border border-indigo-500 flex items-center gap-1.5 cursor-pointer">
            <span>Matriz 4 Cuadrantes</span>
          </button>
          {onNavigateToHealth && (
            <button
              onClick={onNavigateToHealth}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Salud del Sprint & Flow</span>
            </button>
          )}
          <button
            onClick={() => onSelectDevForScorecard && onSelectDevForScorecard(null)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Scorecards Desarrolladores</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          {topPerformer && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-[#12142e] px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-500/30 shadow-xs">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
                <Trophy size={13} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider">Top Performer</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">{topPerformer.nombre} ({topPerformer.performance_score} pts)</span>
              </div>
            </div>
          )}
          <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/40 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ETL Sync Activa
          </span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-600">|</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Proyecto: {selectedProjectId}</span>
        </div>
      </div>

      {/* TARJETAS DE KPIS COMPARATIVOS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* KPI 1: SCORE PROMEDIO */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Score Promedio Equipo</span>
            <TrendingUp size={18} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{teamSummary.promedio_score_equipo || 80.0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ 100 Pts</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Promedio móvil sobre {developers.length} desarrolladores.</p>
        </div>

        {/* KPI 2: DESARROLLADORES ESTRELLA */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cuadrante Estrella</span>
            <Award size={18} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{conteo.ESTRELLA || 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Devs Top Performance</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Cycle Time ágil y 0 devoluciones de QA.</p>
        </div>

        {/* KPI 3: METÓDICOS Y ALTO VOLUMEN */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Metódicos & Precisión</span>
            <Target size={18} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{conteo.METODICO || 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Devs de alta precisión</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Código robusto con enfoque en calidad.</p>
        </div>

        {/* KPI 4: CYCLE TIME PROMEDIO */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cycle Time Promedio</span>
            <Clock size={18} className="text-cyan-500 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">{teamSummary.team_avg_cycle_time || 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">días / ticket</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Promedio de entrega del equipo.</p>
        </div>

      </div>

      {/* SECCIÓN DEL GRÁFICO DE 4 CUADRANTES */}
      <div className="space-y-3">
        <FourQuadrantChart
          developers={developers}
          isDarkMode={isDarkMode}
          onSelectDev={(dev) => {
            setSelectedDevDetail(dev);
            if (onSelectDevForScorecard) onSelectDevForScorecard(dev.assignee_id);
          }}
        />
      </div>

      {/* TABLA DE LEADERBOARD DE EQUIPO CON EXPLICACIÓN DE RESULTADOS ("EL PORQUÉ DE LAS COSAS") */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy size={20} className="text-amber-500 dark:text-amber-400" />
            Ranking General & Explicación de Rendimiento por Desarrollador
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Puntuación ponderada de 0 a 100 puntos</span>
        </div>

        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#12142e] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-[#33376b]">
                <tr>
                  <th className="px-4 py-3 text-center">Rank</th>
                  <th className="px-4 py-3">Desarrollador</th>
                  <th className="px-4 py-3">Cuadrante Operativo</th>
                  <th className="px-4 py-3 text-center">Performance Score</th>
                  <th className="px-4 py-3 text-center">Throughput</th>
                  <th className="px-4 py-3 text-center">Cycle Time</th>
                  <th className="px-4 py-3 text-center">Calidad %</th>
                  <th className="px-4 py-3">Razones & Explicación del Puntaje</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {developers.map((dev) => {
                  const q = dev.cuadrante || {};

                  return (
                    <tr
                      key={dev.assignee_id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* RANK POSICIÓN */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${dev.rank_posicion === 1 ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40' :
                            dev.rank_posicion === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-400/20 dark:text-slate-300 border border-slate-300 dark:border-slate-400/40' :
                              dev.rank_posicion === 3 ? 'bg-amber-700/15 text-amber-800 dark:text-amber-500 border border-amber-700/40' :
                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                          {dev.rank_posicion}
                        </span>
                      </td>

                      {/* NOMBRE Y AVATAR */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                            {dev.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{dev.nombre}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{dev.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* CUADRANTE BADGE */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${q.codigo === 'ESTRELLA' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' :
                            q.codigo === 'METODICO' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30' :
                              q.codigo === 'ALTO_VOLUMEN' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' :
                                'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                          }`}>
                          {q.nombre || 'Desconocido'}
                        </span>
                      </td>

                      {/* SCORE (BARRA Y NÚMERO) */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{dev.performance_score} pts</span>
                          <div className="w-20 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                              style={{ width: `${Math.min(dev.performance_score, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* THROUGHPUT */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-slate-900 dark:text-white">{dev.throughput_issues}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">({dev.velocity_sp} SP)</span>
                      </td>

                      {/* CYCLE TIME */}
                      <td className="px-4 py-4 text-center font-medium">
                        <span className={dev.cycle_time_dias <= teamSummary.team_avg_cycle_time ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>
                          {dev.cycle_time_dias}d
                        </span>
                      </td>

                      {/* CALIDAD */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-cyan-600 dark:text-cyan-300">{dev.quality_pct}%</span>
                      </td>

                      {/* EXPLICACIÓN DE RESULTADOS */}
                      <td className="px-4 py-4 max-w-sm">
                        <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside">
                          {(dev.explicacion_razones || []).map((razon, idx) => (
                            <li key={idx} className="leading-snug">{razon}</li>
                          ))}
                        </ul>
                      </td>

                      {/* ACCIÓN: VER SCORECARD */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => onSelectDevForScorecard && onSelectDevForScorecard(dev.assignee_id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-indigo-200 dark:border-indigo-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Ver Scorecard</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamMatrixView;
