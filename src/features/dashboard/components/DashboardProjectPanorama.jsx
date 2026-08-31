import React from 'react';
import { ChevronRight } from 'lucide-react';
import { MetricInfoTooltip } from '../../../components/ui/MetricInfoTooltip';

export default function DashboardProjectPanorama({ 
  projectsHealthList, 
  setActiveTab, 
  carouselRef, 
  handleScrollCarouselRight,
  hoveredProject,
  setHoveredProject
}) {
  return (
    <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
      
      {/* CABECERA DEL SECTOR 1 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Panorama de proyectos</span>
            <MetricInfoTooltip text="Estado consolidado de salud, avance y total de incidencias de todos los proyectos activos en Jira." />
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('proyectos')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Ver todos los proyectos</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* CONTENEDOR CARRUSEL CON BOTÓN DE DESPLAZAMIENTO REUTILIZABLE */}
      <div className="relative">
        <div 
          ref={carouselRef}
          className="flex items-center gap-4 overflow-x-auto scrollbar-none pb-1 scroll-smooth pr-10"
        >
          {projectsHealthList.map((proj) => {
            const isGreen = proj.statusColor === 'teal';
            const isAmber = proj.statusColor === 'amber';
            const statusBadgeBg = isGreen
              ? 'border'
              : isAmber
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';

            const ringColor  = isGreen ? '#00c896' : isAmber ? '#f59e0b' : '#f43f5e';
            const blockColor = isGreen ? '' : isAmber ? 'bg-amber-500' : 'bg-rose-500';
            const badgeStyle = isGreen
              ? { background: 'rgba(0,200,150,0.12)', color: '#00b386', border: '1px solid rgba(0,200,150,0.3)' }
              : {};
            const dotStyle = isGreen ? { backgroundColor: '#00c896' } : {};

            const isHovered = hoveredProject === proj.id;
            const glowColor = isGreen ? 'rgba(0,200,150,0.25)' : isAmber ? 'rgba(245,158,11,0.25)' : 'rgba(244,63,94,0.25)';
            const borderHoverColor = isGreen ? 'rgba(0,200,150,0.5)' : isAmber ? 'rgba(245,158,11,0.5)' : 'rgba(244,63,94,0.5)';

            return (
              <div
                key={proj.id}
                onMouseEnter={() => setHoveredProject(proj.id)}
                onMouseLeave={() => setHoveredProject(null)}
                className="min-w-[260px] sm:min-w-[280px] flex-1 bg-slate-50 dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 cursor-pointer group hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${isGreen ? '' : statusBadgeBg}`}
                      style={isGreen ? badgeStyle : {}}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${isGreen ? '' : blockColor}`}
                        style={isGreen ? dotStyle : {}}
                      />
                      {proj.status}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      {proj.name}
                    </h3>
                  </div>

                  {/* MEDIDOR ANILLO SVG DE SALUD */}
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg
                      className="w-12 h-12 transform -rotate-90"
                      style={{ filter: isHovered ? `drop-shadow(0 0 6px ${ringColor})` : 'none', transition: 'filter 0.25s ease' }}
                    >
                      <circle cx="24" cy="24" r="19" stroke={isGreen ? '#e2e8f0' : '#334155'} strokeWidth="3.5" fill="transparent" />
                      <circle
                        cx="24"
                        cy="24"
                        r="19"
                        stroke={ringColor}
                        strokeWidth={isHovered ? 4.5 : 3.5}
                        fill="transparent"
                        strokeDasharray={119}
                        strokeDashoffset={119 - (119 * proj.health) / 100}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-width 0.25s ease' }}
                      />
                    </svg>
                    <span className="absolute font-black text-xs text-slate-900 dark:text-white">{proj.health}%</span>
                  </div>
                </div>

                {/* BARRA DE PROGRESO ÚNICA CON DEGRADADO */}
                <div className="pt-1">
                  <div className="relative h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        width: `${proj.health}%`,
                        background: isGreen
                          ? 'linear-gradient(90deg, #06b6d4 0%, #14b8a6 50%, #34d399 100%)'
                          : isAmber
                          ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 60%, #fcd34d 100%)'
                          : 'linear-gradient(90deg, #f43f5e 0%, #fb7185 60%, #fda4af 100%)',
                        transition: 'width 1s ease-out',
                        boxShadow: isHovered ? `0 0 8px 1px ${ringColor}` : 'none'
                      }}
                    >
                      {/* Shimmer overlay — más rápido en hover */}
                      <span
                        className="absolute inset-0 opacity-40"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                          animation: `shimmer ${isHovered ? '0.8s' : '1.8s'} infinite`,
                          backgroundSize: '200% 100%'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* PIE DE TARJETA CON ISSUES Y SPRINT */}
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span>{proj.issues} issues</span>
                  <span>{proj.sprint}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTÓN DESPLAZAR FLECHA DER */}
        <button
          type="button"
          onClick={handleScrollCarouselRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/90 dark:bg-slate-800 text-white flex items-center justify-center shadow-lg border border-slate-700 hover:scale-110 transition-all cursor-pointer z-10"
          title="Siguiente proyecto"
        >
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}
