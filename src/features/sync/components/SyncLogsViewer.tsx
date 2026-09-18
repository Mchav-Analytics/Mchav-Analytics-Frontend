import React from 'react';
import { Database, CheckCircle2, RefreshCcw, XCircle, Eye, RotateCw, Download, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { SyncStatus, SyncLog } from '../hooks/useSystemSync';
import ContextMenu from '../../../components/ui/ContextMenu';

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
    <div className="w-full h-full bg-white dark:bg-[#141738] border border-slate-200/80 dark:border-[#272b5c] rounded-3xl shadow-xs overflow-hidden flex flex-col justify-between">
      {/* HEADER */}
      <div className="p-6 border-b border-slate-100 dark:border-[#272b5c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Database size={20} className="text-slate-700 dark:text-slate-300 mt-1 shrink-0" />
          <div>
            <h2 className="text-[18px] font-black text-slate-900 dark:text-white leading-tight">
              Historial de Ejecución de Tareas (Logs)
            </h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Registro inmutable de auditoría de sincronizaciones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtro Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c] text-[12px] font-bold text-slate-600 dark:text-slate-300">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent text-[12px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer border-0 p-0 pr-4 appearance-none"
              >
                <option value="all" className="bg-white dark:bg-slate-900">Todos los estados</option>
                <option value="30d" className="bg-white dark:bg-slate-900">Últimos 30 días</option>
                <option value="60d" className="bg-white dark:bg-slate-900">Últimos 2 meses</option>
                <option value="90d" className="bg-white dark:bg-slate-900">Últimos 3 meses</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c]">
            <span className={`h-2 w-2 rounded-full ${syncStatus.status === 'SYNCING' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
              {syncStatus.status === 'SYNCING' ? 'Worker Activo' : 'Worker en Reposo'}
            </span>
          </div>
        </div>
      </div>

      {/* TABLA DE LOGS */}
      <div className="overflow-x-auto w-full custom-scrollbar flex-1">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50/70 dark:bg-[#1a1e47]/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#272b5c] text-[11px] uppercase tracking-wider font-extrabold">
            <tr>
              <th className="px-5 py-3.5">ID TAREA</th>
              <th className="px-5 py-3.5">FECHA Y HORA ⇅</th>
              <th className="px-5 py-3.5">TIPO</th>
              <th className="px-5 py-3.5 text-center">ESTADO</th>
              <th className="px-5 py-3.5 text-center">ISSUES PROCESADOS</th>
              <th className="px-5 py-3.5 text-center">DURACIÓN</th>
              <th className="px-5 py-3.5">INICIADO POR</th>
              <th className="px-5 py-3.5 text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#272b5c] bg-white dark:bg-[#141738] text-slate-700 dark:text-slate-300">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-[13px]">
                  No se encontraron registros de sincronización.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 font-mono text-[13px] text-slate-400 dark:text-slate-500 font-medium">
                    {log.id.replace('log-', '')}
                  </td>
                  <td className="px-5 py-4 font-bold text-[13px] text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-5 py-4 text-[12px] whitespace-nowrap">
                    {log.executionType === 'AUTOMATIC' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
                        Sincronización Automática
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/40">
                        Sincronización Manual
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    {log.result === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
                        <CheckCircle2 size={12} /> Completado
                      </span>
                    ) : log.result === 'RUNNING' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40">
                        <RefreshCcw size={12} className="animate-spin" /> Procesando...
                      </span>
                    ) : (
                      <div className="relative group inline-block">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/40 cursor-pointer">
                          <XCircle size={12} /> Fallo
                        </span>
                        {log.detalleError && (
                          <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 dark:bg-slate-950 text-white text-[12px] rounded-xl p-3 shadow-xl z-20 hidden group-hover:block transition-all border border-slate-700 text-left font-sans">
                            <p className="font-semibold text-rose-400 mb-1">Detalle del Error:</p>
                            <p className="break-words line-clamp-4 leading-relaxed font-mono">
                              {log.detalleError}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center font-black text-slate-900 dark:text-white text-[13px]">
                    {log.processedIssues}
                  </td>
                  <td className="px-5 py-4 text-center font-medium text-slate-500 dark:text-slate-400 text-[13px]">
                    {formatDuration(log.durationSeconds, log.result)}
                  </td>
                  <td className="px-5 py-4 text-[13px] whitespace-nowrap font-bold text-slate-700 dark:text-slate-300">
                    {log.ejecutadoPor}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        title="Ver detalles"
                        onClick={() => handleShowLogDetail(log)}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        title="Descargar log"
                        onClick={() => handleDownloadLog(log)}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Download size={15} />
                      </button>
                      <ContextMenu actions={[
                        { label: 'Ver detalles', icon: Eye, onClick: () => handleShowLogDetail(log) },
                        { label: 'Re-ejecutar esta tarea', icon: RotateCw, onClick: () => handleManualSync(), hidden: syncStatus.status === 'SYNCING' },
                        { label: 'Descargar log JSON', icon: Download, onClick: () => handleDownloadLog(log) }
                      ]} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* BARRA DE PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-[#272b5c] bg-slate-50/50 dark:bg-[#1a1e47]/30 text-[13px]">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          Mostrando del {filteredLogs.length > 0 ? ((logPage - 1) * logsPerPage) + 1 : 0} al {Math.min(logPage * logsPerPage, filteredLogs.length)} de {filteredLogs.length} registros
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLogPage(p => Math.max(p - 1, 1))}
            disabled={logPage === 1}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#272b5c] bg-white dark:bg-[#141738] text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          
          {Array.from({ length: totalLogPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setLogPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-all shadow-xs ${
                logPage === i + 1
                  ? 'bg-indigo-600 text-white shadow-indigo-500/30'
                  : 'bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setLogPage(p => Math.min(p + 1, totalLogPages))}
            disabled={logPage === totalLogPages || filteredLogs.length === 0}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#272b5c] bg-white dark:bg-[#141738] text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
