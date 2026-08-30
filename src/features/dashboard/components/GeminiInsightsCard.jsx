import React from 'react';
import { Sparkles, BarChart2, AlertTriangle, Lightbulb } from 'lucide-react';

export default function GeminiInsightsCard({ geminiInsights }) {
  if (!geminiInsights) return null;

  return (
    <div className="w-full rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 p-5 border border-indigo-500/30 shadow-xl backdrop-blur-md space-y-3.5 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-indigo-300 font-black text-xs uppercase tracking-wider">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <Sparkles size={16} />
          </div>
          <span>Diagnóstico Ejecutivo de Inteligencia Artificial (Gemini Engine)</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          ⚡ Modelo gemini-2.5-flash
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
            <BarChart2 size={14} /> Evaluaciones de Salud
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {geminiInsights.diagnostico_ejecutivo}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-rose-500/30 space-y-1">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
            <AlertTriangle size={14} /> Principal Riesgo
          </div>
          <p className="text-xs text-rose-200 leading-relaxed font-medium">
            {geminiInsights.principal_riesgo}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-emerald-500/30 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <Lightbulb size={14} /> Acción Sugerida
          </div>
          <p className="text-xs text-emerald-200 leading-relaxed font-medium">
            {geminiInsights.recomendacion_lider}
          </p>
        </div>
      </div>
    </div>
  );
}
