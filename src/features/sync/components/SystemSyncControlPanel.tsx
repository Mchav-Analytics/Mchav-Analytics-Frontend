import React from 'react';
import { Settings2, RefreshCcw, Play } from 'lucide-react';
import { SyncStatus } from '../hooks/useSystemSync';

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
  savedCronTime
}: SystemSyncControlPanelProps) {
  return (
    <div className="w-full bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Settings2 className="text-teal-600 dark:text-teal-500" size={22} />
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Sincronización Automática & Programación de Tareas (CRON)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control de actualización periódica de métricas de Jira Cloud e historial de ejecuciones.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualSync}
          disabled={syncStatus.status === 'SYNCING'}
          className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
        >
          {syncStatus.status === 'SYNCING' ? (
            <>
              <RefreshCcw size={15} className="animate-spin" />
              <span>Sincronizando en segundo plano...</span>
            </>
          ) : (
            <>
              <Play size={15} fill="currentColor" />
              <span>Sincronizar Manualmente Ahora</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta 1: Estado de la Conexión */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Estado de la Integración Jira
          </span>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${syncStatus.status === 'SYNCING' ? 'bg-amber-500 animate-ping' : (syncStatus.status === 'FAILED' ? 'bg-rose-500' : 'bg-emerald-500')}`} />
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {syncStatus.status === 'SYNCING' ? 'Sincronizando...' : (syncStatus.status === 'FAILED' ? 'Atención Requerida' : 'Conectado a Jira Cloud')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Última actualización: <strong>{syncStatus.lastSync}</strong>
          </p>
        </div>

        {/* Tarjeta 2: Switch Automático */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Sincronización Automática
            </span>
            <button
              onClick={() => setIsAutoSync(!isAutoSync)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${isAutoSync ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoSync ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            {isAutoSync ? '🟢 Programador Automático Activo' : '⚪ Programación Pausada'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Próxima ejecución: <strong>{syncStatus.nextScheduledSync}</strong>
          </p>
        </div>

        {/* Tarjeta 3: Configuración CRON */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Frecuencia y Horario CRON
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={cronSchedule}
              onChange={(e) => setCronSchedule(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="6h">Cada 6 Horas</option>
              <option value="12h">Cada 12 Horas</option>
              <option value="24h">Diario (24 Horas)</option>
            </select>

            <div className="flex items-center gap-1">
              <input
                type="time"
                value={cronTime}
                onChange={handleCronTimeChange}
                disabled={isSavingCron}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveCronTime}
                disabled={isSavingCron || cronTime === savedCronTime}
                className="bg-teal-600 text-white rounded-xl px-2 py-1.5 text-[10px] font-bold transition-all hover:bg-teal-700 disabled:opacity-40 cursor-pointer"
              >
                {isSavingCron ? '...' : 'Ok'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
