import React from 'react';
import { Settings, RefreshCcw, Play, Calendar, Hexagon, Info, ChevronRight, Edit3, Power, Sparkles, CheckCircle2 } from 'lucide-react';
import { SyncStatus } from '../hooks/useSystemSync';
import ContextMenu from '../../../components/ui/ContextMenu';

interface SystemSyncControlPanelProps {
  syncStatus: SyncStatus;
  handleManualSync: () => void;
  isAutoSync: boolean;
  setIsAutoSync: (val: boolean) => void;
  cronSchedule: string;
  setCronSchedule: (val: string) => void;
  cronTime: string;
  handleCronTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveCronTime: () => void;
  isSavingCron: boolean;
  savedCronTime: string;
  showSuccessAlert?: boolean;
  setShowSuccessAlert?: (val: boolean) => void;
}

export default function SystemSyncControlPanel({
  syncStatus,
  handleManualSync,
  isAutoSync,
  setIsAutoSync,
  cronSchedule,
  setCronSchedule,
  cronTime,
  handleCronTimeChange,
  handleSaveCronTime,
  isSavingCron,
  savedCronTime,
  showSuccessAlert,
  setShowSuccessAlert
}: SystemSyncControlPanelProps) {
  return (
    <div className="w-full h-full bg-white dark:bg-[#141738] border border-slate-200/80 dark:border-[#272b5c] rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-5">
      {/* HEADER SECTION */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0">
          <RefreshCcw size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-black text-slate-900 dark:text-white leading-tight">
              Sincronización Automática & CRON
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              Active
            </span>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            Control de actualización periódica de Jira Cloud.
          </p>
        </div>
      </div>

      {/* TARJETAS INTERNAS */}
      <div className="flex flex-col gap-4">
        {/* TARJETA 1: ESTADO DE LA INTEGRACIÓN JIRA */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#1a1e47]/60 border border-slate-200/70 dark:border-[#272b5c] space-y-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-sky-100 dark:bg-sky-950/60 rounded-lg text-sky-600 dark:text-sky-400">
                <Calendar size={13} />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ESTADO DE LA INTEGRACIÓN JIRA
              </span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </div>

          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${syncStatus.status === 'SYNCING' ? 'bg-amber-500 animate-ping' : (syncStatus.status === 'FAILED' ? 'bg-rose-500' : 'bg-emerald-500')}`} />
            <span className="text-[14px] font-extrabold text-slate-900 dark:text-white">
              {syncStatus.status === 'SYNCING' ? 'Sincronizando...' : (syncStatus.status === 'FAILED' ? 'Atención Requerida' : 'Conectado a Jira Cloud')}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Última actualización: <strong className="text-slate-700 dark:text-slate-300">{syncStatus.lastSync}</strong>
          </p>
        </div>

        {/* TARJETA 2: SINCRONIZACIÓN AUTOMÁTICA */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#1a1e47]/60 border border-slate-200/70 dark:border-[#272b5c] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-indigo-100 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Hexagon size={13} />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                SINCRONIZACIÓN AUTOMÁTICA
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAutoSync(!isAutoSync)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${isAutoSync ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoSync ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-[13px] font-extrabold text-slate-900 dark:text-white">
              {isAutoSync ? 'Programador Automático Activo' : 'Programación Pausada'}
            </span>
            <Info size={13} className="text-slate-400" />
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Próxima ejecución: <strong className="text-slate-700 dark:text-slate-300">{syncStatus.nextScheduledSync}</strong>
          </p>
        </div>

        {/* TARJETA 3: FRECUENCIA Y HORARIO CRON */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#1a1e47]/60 border border-slate-200/70 dark:border-[#272b5c] space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-sky-100 dark:bg-sky-950/60 rounded-lg text-sky-600 dark:text-sky-400">
              <Calendar size={13} />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              FRECUENCIA Y HORARIO CRON
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="text-[12px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Frecuencia</label>
              <div className="relative">
                <select
                  id="cronSelect"
                  value={cronSchedule}
                  onChange={(e) => setCronSchedule(e.target.value)}
                  className="w-full bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-xl px-3 py-2 text-[13px] font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer appearance-none"
                >
                  <option value="6h">Cada 6 Horas</option>
                  <option value="12h">Cada 12 Horas</option>
                  <option value="24h">Diario (24 Horas)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</div>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Hora de Ejecución</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="time"
                    value={cronTime}
                    onChange={handleCronTimeChange}
                    disabled={isSavingCron}
                    className="w-full bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-xl px-3 py-2 text-[13px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveCronTime}
                  disabled={isSavingCron || cronTime === savedCronTime}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-[13px] font-bold transition-all disabled:opacity-40 cursor-pointer shrink-0"
                >
                  {isSavingCron ? '...' : 'Ok'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÓN PRINCIPAL EN LA PARTE INFERIOR ESTILO INSIGNIA CELESTE */}
      <button
        type="button"
        onClick={handleManualSync}
        disabled={syncStatus.status === 'SYNCING'}
        className="w-full mt-auto px-4 py-3 rounded-2xl bg-sky-50 hover:bg-sky-100/80 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/60 text-[14px] font-extrabold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60 shadow-2xs active:scale-98"
      >
        {syncStatus.status === 'SYNCING' ? (
          <>
            <RefreshCcw size={16} className="animate-spin text-sky-600 dark:text-sky-400" />
            <span>Sincronizando en segundo plano...</span>
          </>
        ) : (
          <>
            <Play size={16} fill="currentColor" className="text-sky-600 dark:text-sky-400" />
            <span>Sincronizar Manualmente Ahora</span>
          </>
        )}
      </button>
    </div>
  );
}
