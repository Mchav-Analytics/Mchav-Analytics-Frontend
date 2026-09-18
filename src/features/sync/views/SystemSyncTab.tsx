// ============================================================================
// FEATURE SYNC — VISTA DE AUDITORÍA DE SINCRONIZACIÓN ETL CON JIRA
// Diseño Refactorizado - Fase 4
// ============================================================================
// Permite auditar las ejecuciones del motor ETL, programar horarios CRON,
// lanzar sincronizaciones manuales en segundo plano y descargar logs JSON.

import React from 'react';
import { RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useSystemSync } from '../hooks/useSystemSync';

// Componentes extraídos
import SystemSyncControlPanel from '../components/SystemSyncControlPanel';
import SyncLogsViewer from '../components/SyncLogsViewer';
import LastSyncBadge from '../../dashboard/components/LastSyncBadge';

export default function SystemSyncTab() {
  const {
    syncStatus,
    logs,
    filteredLogs,
    paginatedLogs,
    showSuccessAlert,
    setShowSuccessAlert,
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
      <div className="w-full rounded-3xl bg-[#f8faff] dark:bg-[#14192b] p-5 sm:p-6 shadow-2xs border border-indigo-100/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        {/* Lado Izquierdo: Ícono y Título */}
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

        {/* Lado Derecho: Tarjeta Bonita de Éxito */}
        {showSuccessAlert && (
          <div className="flex items-center gap-3 self-end md:self-auto shrink-0 flex-wrap sm:flex-nowrap">
            <div className="p-2.5 px-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 shadow-2xs animate-in zoom-in-95 fade-in duration-200 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 size={14} strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <h4 className="text-[12px] font-black text-emerald-900 dark:text-emerald-100 leading-tight">
                    ¡Sincronizado con Éxito!
                  </h4>
                  <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    Base de datos y Jira actualizados.
                  </p>
                </div>
                {setShowSuccessAlert && (
                  <button 
                    type="button" 
                    onClick={() => setShowSuccessAlert(false)}
                    className="ml-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ESTRUCTURA PRINCIPAL DE 2 COLUMNAS (IZQUIERDA: PANEL DE CONTROL | DERECHA: HISTORIAL DE LOGS CON MAYOR MARGEN H) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* COLUMNA IZQUIERDA: PANEL DE CONTROL DE SINCRONIZACIÓN Y PROGRAMACIÓN CRON */}
        <div className="md:col-span-4 lg:col-span-4 xl:col-span-3 flex flex-col h-full">
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
            showSuccessAlert={showSuccessAlert}
            setShowSuccessAlert={setShowSuccessAlert}
          />
        </div>

        {/* COLUMNA DERECHA: HISTORIAL DE EJECUCIÓN DE TAREAS (LOGS) - ANCHO EXPANDIDO Y MARGEN H AUMENTADO */}
        <div className="md:col-span-8 lg:col-span-8 xl:col-span-9 flex flex-col h-full">
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
      </div>
    </div>
  );
}
