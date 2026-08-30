import React from 'react';

export default function LoginStreetlamps() {
  return (
    <div className="hidden xl:block absolute inset-0 pointer-events-none z-20">

      {/* Farola 1: Sincronización (Farol Lejano Izquierdo junto a la tarjeta) */}
      <div
        className="real-streetlamp-target left-[34.6%] top-[49.5%]"
        style={{ '--lamp-glow': '#06b6d4' }}
      >
        <div className="lamp-beacon-pulse" />
        <div className="lamp-light-bloom" />
        <div className="lamp-tooltip-card border border-cyan-500/40 shadow-[0_12px_30px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.35)]">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1.5">
            <svg className="w-4 h-4 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            <span>Sincronización</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug font-normal">
            Sincroniza datos automáticamente y mantén tus métricas siempre actualizadas.
          </p>
        </div>
      </div>

      {/* Farola 2: Integración Segura (Farol Centro Medio en la imagen de fondo) */}
      <div
        className="real-streetlamp-target left-[38.6%] top-[36.8%]"
        style={{ '--lamp-glow': '#a855f7' }}
      >
        <div className="lamp-beacon-pulse" />
        <div className="lamp-light-bloom" />
        <div className="lamp-tooltip-card border border-purple-500/40 shadow-[0_12px_30px_rgba(0,0,0,0.85),0_0_20px_rgba(168,85,247,0.35)]">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1.5">
            <svg className="w-4 h-4 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span>Integración Segura</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug font-normal">
            Conéctate de forma segura con Jira Cloud mediante OAuth 2.0 y protege tus datos.
          </p>
        </div>
      </div>

      {/* Farola 3: Métricas y KPIs (Farol Alto Centro-Derecha en la imagen de fondo) */}
      <div
        className="real-streetlamp-target left-[55.6%] top-[26.5%]"
        style={{ '--lamp-glow': '#c084fc' }}
      >
        <div className="lamp-beacon-pulse" />
        <div className="lamp-light-bloom" />
        <div className="lamp-tooltip-card border border-purple-500/40 shadow-[0_12px_30px_rgba(0,0,0,0.85),0_0_20px_rgba(192,132,252,0.35)]">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-xs mb-1.5">
            <svg className="w-4 h-4 text-purple-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <span>Métricas y KPIs</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug font-normal">
            Calcula y monitorea KPIs ágiles para medir el rendimiento de tu equipo y proyectos.
          </p>
        </div>
      </div>

    </div>
  );
}
