import React from 'react';
import { Sparkles, TrendingUp, ShieldCheck, Loader2 } from 'lucide-react';
import owlMascot from '../../../assets/owl_mascot.png';

export default function AiDevCoach({ 
  message = null, 
  tip = null,
  efficiencyGain = 14, 
  cleanDeliveries = 100, 
  loading = false,
  className = ""
}) {
  const displayTip = tip || message || "Tu tiempo de ciclo personal en tareas de 5 SP ha mejorado un +14% respecto al sprint anterior. Te recomendamos resolver primero las incidencias en curso antes de avanzar en nuevas tareas.";

  return (
    <div className={`w-full shrink-0 rounded-3xl bg-white/60 dark:bg-[#141738]/60 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-500/20 p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 shadow-sm dark:shadow-xl relative overflow-hidden group ${className}`}>
      {/* GLOW DE FONDO */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-500/30 transition-all duration-500 pointer-events-none"></div>
      
      {/* MASCOTA BÚHO */}
      <div className="flex flex-col items-center justify-center shrink-0">
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-xl -z-10"></div>
          <img 
            src={owlMascot || '/owl_mascot.png'} 
            alt="Nubi Coach" 
            className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300"
            onError={(e) => {
              if (!e.target.dataset.triedPublic) {
                e.target.dataset.triedPublic = "true";
                e.target.src = "/owl_mascot.png";
              }
            }}
          />
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 w-full flex flex-col justify-center space-y-3 relative z-10 text-center sm:text-left">
        {/* HEADER DEL ASISTENTE */}
        <div className="flex items-center justify-center sm:justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 border border-indigo-200/50 dark:border-indigo-500/30 shadow-sm">
              <Sparkles size={12} className="animate-pulse" /> NUBI
            </span>
          </div>
          {loading && (
            <span className="text-[10px] sm:text-[11px] font-bold text-indigo-500/70 flex items-center gap-1.5 mt-2 sm:mt-0">
              <Loader2 size={12} className="animate-spin" /> Analizando...
            </span>
          )}
        </div>

        {/* MENSAJE PRINCIPAL */}
        <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
          <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">👋 ¡Hola! Soy Nubi y este es mi diagnóstico de hoy:</span>
          <span className="italic opacity-90">"{displayTip}"</span>
        </p>

        {/* PIE CON MÉTRICAS DE RITMO Y CALIDAD */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 px-2.5 py-1.5 rounded-lg shadow-sm">
            <TrendingUp size={14} />
            <span>Ritmo: +{efficiencyGain}% Eficiencia</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 px-2.5 py-1.5 rounded-lg shadow-sm">
            <ShieldCheck size={14} />
            <span>Calidad: {cleanDeliveries}% Entregas Limpias</span>
          </div>
        </div>
      </div>
    </div>
  );
}
