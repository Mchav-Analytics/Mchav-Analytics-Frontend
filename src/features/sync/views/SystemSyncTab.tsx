// ============================================================================
// FEATURE SYNC — VISTA DE AUDITORÍA DE SINCRONIZACIÓN ETL CON JIRA
// Diseño Refactorizado - Fase 4
// ============================================================================
// Permite auditar las ejecuciones del motor ETL, programar horarios CRON,
// lanzar sincronizaciones manuales en segundo plano y descargar logs JSON.

import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { useSystemSync } from '../hooks/useSystemSync';

// Componentes extraídos
import SystemSyncControlPanel from '../components/SystemSyncControlPanel';
import SyncLogsViewer from '../components/SyncLogsViewer';

export default function SystemSyncTab() {
  const {
    syncStatus,
    logs,
    filteredLogs,
    paginatedLogs,
    showSuccessAlert,
    syncErrorMsg,
    setSyncErrorMsg,
    isAutoSync,
    setIsAutoSync,
    cronSchedule,
    setCronSchedule,
    cronTime,
    savedCronTime,
    isSavingCron,
    timeFilter,
    setTimeFilter,
    logPage,
    setLogPage,
    totalLogPages,
    logsPerPage,
    handleCronTimeChange,
    handleSaveCronTime,
    handleManualSync
  } = useSystemSync();

  return (
    <div className="w-full space-y-6 font-sans text-left">
      {/* Alertas */}
      {showSuccessAlert && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 flex items-center gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-800 dark:text-teal-400">
          <RefreshCcw size={18} />
          <p className="text-sm font-semibold">Sincronización manual completada con éxito. Base de datos actualizada.</p>
        </div>
      )}

      {syncErrorMsg && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 flex items-center justify-between gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400">
          <div className="flex items-center gap-3">
            <RefreshCcw size={18} />
            <p className="text-sm font-semibold text-left break-all">{syncErrorMsg}</p>
          </div>
          <button
            onClick={() => setSyncErrorMsg('')}
            className="text-xs font-bold underline hover:no-underline whitespace-nowrap ml-2 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* BARRA SUPERIOR */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
            <RefreshCcw size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Supervisión Ejecutiva
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                • Motor de Sincronización Jira ETL
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sincronización del Sistema
            </h1>
          </div>
        </div>
      </div>

      {/* COMPONENTES EXTRAÍDOS */}
      <SystemSyncControlPanel 
        syncStatus={syncStatus}
        handleManualSync={handleManualSync}
        isAutoSync={isAutoSync}
        setIsAutoSync={setIsAutoSync}
        cronSchedule={cronSchedule}
        setCronSchedule={setCronSchedule}
        cronTime={cronTime}
        handleCronTimeChange={handleCronTimeChange}
        handleSaveCronTime={handleSaveCronTime}
        isSavingCron={isSavingCron}
        savedCronTime={savedCronTime}
      />

      <SyncLogsViewer 
        syncStatus={syncStatus}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        filteredLogs={filteredLogs}
        paginatedLogs={paginatedLogs}
        logPage={logPage}
        setLogPage={setLogPage}
        totalLogPages={totalLogPages}
        logsPerPage={logsPerPage}
        handleShowLogDetail={(log) => setSyncErrorMsg(log.detalleError || `Tarea completada con éxito. ID: ${log.id.replace('log-', '')} | Issues Procesados: ${log.processedIssues}`)}
        handleManualSync={handleManualSync}
        handleDownloadLog={(log) => {
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(log, null, 2));
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", `sync-log-${log.id.replace('log-', '')}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
        }}
      />
    </div>
  );
}
