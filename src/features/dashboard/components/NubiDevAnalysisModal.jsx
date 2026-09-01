import React from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, Lightbulb, Trophy, ShieldCheck, ChevronRight, BarChart3, Bot } from 'lucide-react';

function NubiDevAnalysisModal({ isOpen, onClose, developer, onSelectDevForScorecard }) {
  if (!isOpen || !developer) return null;

  const ai = developer.analisis_ia || {};
  const desglose = developer.desglose_score || {};
  const cuadrante = developer.cuadrante || {};

  const fortalezas = ai.fortalezas || developer.explicacion_razones || [];
  const oportunidades = ai.oportunidades || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-left">
        
        {/* ENCABEZADO MODAL CON DEGRADADO NUBI IA */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-900/90 via-[#1e1b4b] to-purple-900/90 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl shadow-md border border-white/20">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Diagnóstico Nubi IA
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-0.5">
                Análisis de Rendimiento Personalizado
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CUERPO DEL MODAL (SCROLL) */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          
          {/* TARJETA DE PERFIL DEL DESARROLLADOR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
                {developer.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{developer.nombre}</h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Posición #{developer.rank_posicion}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{developer.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                cuadrante.codigo === 'ESTRELLA' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                cuadrante.codigo === 'METODICO' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' :
                cuadrante.codigo === 'ALTO_VOLUMEN' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {cuadrante.nombre || 'Sin Cuadrante'}
              </span>

              <div className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20">
                {developer.performance_score} pts
              </div>
            </div>
          </div>

          {/* RESUMEN EJECUTIVO NUBI IA */}
          {ai.resumen_ejecutivo && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Resumen de Evaluación IA
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {ai.resumen_ejecutivo}
              </p>
            </div>
          )}

          {/* SECCIÓN DE FORTALEZAS Y OPORTUNIDADES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* FORTALEZAS */}
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Fortalezas Destacadas
              </div>
              <ul className="space-y-2">
                {fortalezas.map((f, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* OPORTUNIDADES / CUELLOS DE BOTELLA */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                Oportunidades de Mejora
              </div>
              {oportunidades.length > 0 ? (
                <ul className="space-y-2">
                  {oportunidades.map((op, i) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                      <span>{op}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  No se detectan cuellos de botella críticos en este período.
                </p>
              )}
            </div>

          </div>

          {/* RECOMENDACIÓN PARA EL LÍDER TÉCNICO */}
          {ai.recomendacion_lider && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 space-y-1.5">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-extrabold text-xs uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-purple-500" />
                Recomendación de Coaching para el Líder Técnico
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {ai.recomendacion_lider}
              </p>
            </div>
          )}

          {/* DESGLOSE MATEMÁTICO DE LOS 5 PILARES */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Desglose de los 5 Pilares de Rendimiento
              </span>
              <span className="text-[11px] font-bold text-slate-400">Contribución al Score</span>
            </div>

            <div className="space-y-2.5">
              {/* Throughput */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">1. Throughput ({developer.throughput_issues} tickets)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{desglose.tp_score || 0} / 100</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(desglose.tp_score || 0, 100)}%` }}></div>
                </div>
              </div>

              {/* Velocity SP */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">2. Velocidad ({developer.velocity_sp} SP)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{desglose.sp_score || 0} / 100</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(desglose.sp_score || 0, 100)}%` }}></div>
                </div>
              </div>

              {/* Cycle Time */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">3. Cycle Time ({developer.cycle_time_dias}d)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{desglose.ct_score || 0} / 100</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(desglose.ct_score || 0, 100)}%` }}></div>
                </div>
              </div>

              {/* Commitment */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">4. Cumplimiento Sprint ({developer.commitment_pct || 0}%)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{desglose.com_score || 0} / 100</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(desglose.com_score || 0, 100)}%` }}></div>
                </div>
              </div>

              {/* Quality */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">5. Calidad QA ({developer.quality_pct || 0}%)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{desglose.quality_score || 0} / 100</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(desglose.quality_score || 0, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* PIE DEL MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#141738]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
          >
            Cerrar
          </button>
          
          <button
            onClick={() => {
              onClose();
              if (onSelectDevForScorecard) onSelectDevForScorecard(developer.assignee_id);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <span>Ver Scorecard Completo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default NubiDevAnalysisModal;
