import React from 'react';
import { Server, CheckCircle2, RefreshCcw, XCircle, Eye, RotateCw, Download, Play } from 'lucide-react';
import { SyncStatus, SyncLog } from '../hooks/useSystemSync';

interface SyncLogsViewerProps {
  syncStatus: SyncStatus;
  timeFilter: string;
  setTimeFilter: (val: string) => void;
  filteredLogs: SyncLog[];
  paginatedLogs: SyncLog[];
  logPage: number;
  setLogPage: React.Dispatch<React.SetStateAction<number>>;
  totalLogPages: number;
  logsPerPage: number;
  handleShowLogDetail: (log: SyncLog) => void;
  handleManualSync: () => void;
  handleDownloadLog: (log: SyncLog) => void;
}

export default function SyncLogsViewer({
  syncStatus,
  timeFilter,
  setTimeFilter,
  filteredLogs,
  paginatedLogs,
  logPage,
  setLogPage,
  totalLogPages,
  logsPerPage,
  handleShowLogDetail,
  handleManualSync,
  handleDownloadLog
}: SyncLogsViewerProps) {
  
  const formatTimestamp = (ts: string) => {
    if (!ts) return 'Sin fecha';
    const dateString = ts.endsWith('Z') ? ts : `${ts}Z`;
    const dt = new Date(dateString);
    if (isNaN(dt.getTime())) return ts.replace('T', ' ').substring(0, 19);
    const day = String(dt.getDate()).padStart(2, '0');
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const year = dt.getFullYear();
    let hours = dt.getHours();
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    return `${day}/${month}/${year}, ${hoursStr}:${minutes} ${ampm}`;
  };

  const formatDuration = (seconds: number, result?: string) => {
    if (result === 'RUNNING') return 'En curso...';
    if (seconds === undefined || seconds === null || seconds === 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="w-full bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-2xl shadow-sm overflow-hidden mt-6">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Server size={18} className="text-slate-500" />
            Historial de Ejecución de Tareas (Logs)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro inmutable de auditoría de sincronizaciones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtro Temporal */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">📅</span>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer border-0 p-0"
            >
              <option value="all" className="bg-white dark:bg-slate-900">Todos los tiempos</option>
              <option value="30d" className="bg-white dark:bg-slate-900">Últimos 30 días</option>
              <option value="60d" className="bg-white dark:bg-slate-900">Últimos 2 meses</option>
              <option value="90d" className="bg-white dark:bg-slate-900">Últimos 3 meses</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className={`h-2 w-2 rounded-full ${syncStatus.status === 'SYNCING' ? 'bg-amber-500 animate-ping' : 'bg-teal-500'}`} />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {syncStatus.status === 'SYNCING' ? 'Worker Activo' : 'Worker en Reposo'}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/70 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">ID Tarea</th>
              <th className="px-6 py-4">Fecha y Hora</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Issues Procesados</th>
              <th className="px-6 py-4 text-right">Duración</th>
              <th className="px-6 py-4">Iniciado Por</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                  No se encontraron registros de sincronización.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {log.id.replace('log-', '')}
                  </td>
                  <td className="px-6 py-4 font-semibold text-xs whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 text-xs whitespace-nowrap">
                    {log.executionType === 'AUTOMATIC' ? (
                      <span className="text-slate-500 font-medium">Sincronización Incremental Jira</span>
                    ) : (
                      <span className="text-teal-600 dark:text-teal-400 font-semibold">Sincronización Manual</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {log.result === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        <CheckCircle2 size={12} /> Completado
                      </span>
                    ) : log.result === 'RUNNING' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                        <RefreshCcw size={12} className="animate-spin" /> Procesando...
                      </span>
                    ) : (
                      <div className="relative group inline-block">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 cursor-pointer">
                          <XCircle size={12} /> Fallo
                        </span>
                        {log.detalleError && (
                          <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 dark:bg-slate-950 text-white text-[11px] rounded-xl p-3 shadow-xl z-20 hidden group-hover:block transition-all border border-slate-700 text-left font-sans">
                            <p className="font-semibold text-rose-400 mb-1">Detalle del Error:</p>
                            <p className="break-words line-clamp-4 leading-relaxed font-mono">
                              {log.detalleError}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-100 text-xs">
                    {log.processedIssues}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400 text-xs">
                    {formatDuration(log.durationSeconds, log.result)}
                  </td>
                  <td className="px-6 py-4 text-xs whitespace-nowrap font-medium">
                    {log.ejecutadoPor}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2.5">
                      <button
                        title="Ver detalles"
                        onClick={() => handleShowLogDetail(log)}
                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Eye size={15} className="text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" />
                      </button>
                      <button
                        title="Re-ejecutar"
                        onClick={handleManualSync}
                        disabled={syncStatus.status === 'SYNCING'}
                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <RotateCw size={15} className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
                      </button>
                      <button
                        title="Descargar log"
                        onClick={() => handleDownloadLog(log)}
                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Download size={15} className="text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleManualSync}
            disabled={syncStatus.status === 'SYNCING'}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold transition-colors shadow-sm disabled:opacity-75 cursor-pointer"
          >
            {syncStatus.status === 'SYNCING' ? (
              <>
                <RefreshCcw size={14} className="animate-spin" />
                Procesando en segundo plano...
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                Ejecutar Sincronización Manual Ahora
              </>
            )}
          </button>

          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Mostrando del {filteredLogs.length > 0 ? ((logPage - 1) * logsPerPage) + 1 : 0} al {Math.min(logPage * logsPerPage, filteredLogs.length)} de {filteredLogs.length} registros
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogPage(p => Math.max(p - 1, 1))}
            disabled={logPage === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Anterior
          </button>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2">
            Página {logPage} de {totalLogPages}
          </span>
          <button
            onClick={() => setLogPage(p => Math.min(p + 1, totalLogPages))}
            disabled={logPage === totalLogPages || filteredLogs.length === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
