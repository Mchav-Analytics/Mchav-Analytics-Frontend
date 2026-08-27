import React from 'react';
import { 
  FolderKanban, 
  RotateCcw, 
  CheckCircle2, 
  PowerOff, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

export const ProjectCard = ({
  proj,
  idx,
  isExpanded,
  isAdmin,
  toggleExpand,
  handleToggleDeliveredProject,
  handleReactivateProject,
  handleOpenDeactivateModal
}) => {
  const isCompleted = proj.status === 'COMPLETED' || proj.status === 'DELIVERED';
  const isInactive = proj.status === 'INACTIVE';
  const isPurple = idx % 3 === 1;
  const isEmerald = idx % 3 === 2;

  const colorClasses = isCompleted
    ? {
      borderActive: 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/20',
      borderInactive: 'border-indigo-200 dark:border-[#33376b] hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl',
      iconBox: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20',
      subtitle: 'text-indigo-700 dark:text-indigo-300/80',
      button: 'bg-indigo-100 dark:bg-indigo-500/25 border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-200 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/40'
    }
    : isPurple
      ? {
        borderActive: 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 shadow-lg shadow-purple-500/20',
        borderInactive: 'border-purple-200 dark:border-[#33376b] hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-purple-500/15',
        iconBox: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 ring-purple-500/20',
        subtitle: 'text-purple-700 dark:text-purple-300/80',
        button: 'bg-purple-100 dark:bg-purple-500/25 border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-200 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/40'
      }
      : isEmerald
        ? {
          borderActive: 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/20',
          borderInactive: 'border-emerald-200 dark:border-[#33376b] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-emerald-500/15',
          iconBox: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
          subtitle: 'text-emerald-700 dark:text-emerald-300/80',
          button: 'bg-emerald-100 dark:bg-emerald-500/25 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-200 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/40'
        }
        : {
          borderActive: 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/20',
          borderInactive: 'border-indigo-200 dark:border-[#33376b] hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-indigo-500/15',
          iconBox: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20',
          subtitle: 'text-indigo-700 dark:text-indigo-300/80',
          button: 'bg-indigo-100 dark:bg-indigo-500/25 border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-200 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/40'
        };

  return (
    <div
      onClick={() => toggleExpand(proj.id)}
      className={`group relative bg-white dark:bg-[#191c3d] backdrop-blur-xl border rounded-2xl p-5 sm:px-6 sm:py-5 shadow-sm dark:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.01] cursor-pointer flex flex-col justify-between ${isExpanded ? colorClasses.borderActive : colorClasses.borderInactive}`}
    >
      <div className="flex items-start justify-between gap-4 min-w-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner ring-1 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${colorClasses.iconBox}`}>
            <FolderKanban size={26} />
          </div>

          <div className="space-y-1 min-w-0 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${isCompleted
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40'
                  : isInactive
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                }`}>
                {isCompleted ? 'Entregado' : isInactive ? 'Desactivado' : 'Activo'}
              </span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{proj.key}</span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
              {proj.name}
            </h3>

            <div className="flex items-center gap-1.5 pt-1">
              {proj.leader && (
                <div title={`Líder: ${proj.leader.name}`} className="w-5 h-5 rounded-full bg-purple-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md">
                  {proj.leader.avatar}
                </div>
              )}
              {proj.developers?.map(dev => (
                <div key={dev.id} title={`Dev: ${dev.name}`} className="w-5 h-5 rounded-full bg-blue-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md">
                  {dev.avatar}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center shrink-0" style={{ gap: 8 }}>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={isCompleted ? "Reabrir proyecto a Activo" : "Marcar proyecto como Entregado / Finalizado"}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleDeliveredProject(proj);
              }}
              className={`w-8 h-8 rounded-xl inline-flex items-center justify-center transition-all cursor-pointer border ${isCompleted
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/30'
                  : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/30'
                }`}
            >
              {isCompleted ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
            </button>

            {isAdmin && (
              isInactive ? (
                <button
                  type="button"
                  title="Reactivar proyecto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReactivateProject(proj);
                  }}
                  className="w-8 h-8 rounded-xl inline-flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  title="Desactivar proyecto (Solo Admin)"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDeactivateModal(proj);
                  }}
                  className="w-8 h-8 rounded-xl inline-flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 transition-colors cursor-pointer"
                >
                  <PowerOff size={14} />
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(proj.id);
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-black flex items-center justify-center shadow-xs group-hover:scale-105 transition-all duration-300 cursor-pointer ${colorClasses.button}`}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
