import React from 'react';
import { Trophy, Lock, Check } from 'lucide-react';

export const ActivityAchievements = ({
  devRank, currentXP, nextLevelXP, xpPercentage, unlockedCount, fullBadgesCatalog,
  categoryFilter, setCategoryFilter, badgeStatusFilter, setBadgeStatusFilter,
  inProgressCount, displayedBadges, setSelectedBadgeModal
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-200 mt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${devRank.badgeColor} text-white font-extrabold shadow-md shrink-0 ring-2 ring-amber-400/30`}>
            <Trophy size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>{devRank.icon}</span> Rango Actual: Nivel {devRank.level}
              </span>
              <span className="px-2 py-0.2 rounded-md font-bold text-[10px] bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                {devRank.tier}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {devRank.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Progreso: <strong className="text-slate-800 dark:text-slate-200">{currentXP}</strong> / {nextLevelXP} XP</span>
              <span>·</span>
              <span>Siguiente: <strong className="text-purple-600 dark:text-purple-400">{devRank.nextTitle}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-[#272b5c]/60">
          <div className="w-full sm:w-44 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>Nivel {devRank.level}</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{xpPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500" 
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Medallas</span>
              <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">
                {unlockedCount} / {fullBadgesCatalog.length}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Boost Score</span>
              <strong className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +55 Pts
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#141738] p-3 rounded-xl border border-slate-200 dark:border-[#272b5c] shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['ALL', 'Calidad', 'Velocidad', 'Colaboración', 'Compromiso'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c204d]'
              }`}
            >
              {cat === 'ALL' ? 'Todas las Categorías' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-xs">
          <button
            onClick={() => setBadgeStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
              badgeStatusFilter === 'ALL'
                ? 'bg-slate-200 dark:bg-[#1a1e47] text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Todas ({fullBadgesCatalog.length})
          </button>
          <button
            onClick={() => setBadgeStatusFilter('UNLOCKED')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
              badgeStatusFilter === 'UNLOCKED'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200'
                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'
            }`}
          >
            Desbloqueadas ({unlockedCount})
          </button>
          <button
            onClick={() => setBadgeStatusFilter('IN_PROGRESS')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
              badgeStatusFilter === 'IN_PROGRESS'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200'
                : 'text-slate-500 dark:text-slate-400 hover:text-amber-600'
            }`}
          >
            En Progreso ({inProgressCount})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayedBadges.map((badge) => {
          const IconComponent = badge.icon;
          const isUnlocked = badge.status === 'UNLOCKED';
          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadgeModal(badge)}
              className={`flex flex-col justify-between p-4 rounded-xl bg-white dark:bg-[#141738] border transition-all cursor-pointer group shadow-xs ${
                isUnlocked
                  ? 'border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-400'
                  : 'border-slate-200 dark:border-[#272b5c] hover:border-indigo-400'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${badge.gradient} text-white shrink-0 shadow-xs`}>
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span title={`Tier ${badge.tier}`}>{badge.tierIcon}</span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {badge.title}
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {badge.category} · Tier {badge.tier}
                      </span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                      Desbloqueada
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 shrink-0 flex items-center gap-1">
                      <Lock size={10} /> {badge.progress}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                  {badge.description}
                </p>
              </div>

              {!isUnlocked ? (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#272b5c]/50">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                    <span>Progreso actual</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{badge.currentCount}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" 
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#272b5c]/50 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1"><Check size={12} /> Logro obtenido</span>
                  <span className="text-slate-400 group-hover:text-indigo-500 transition-colors">Ver impacto →</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
