import React, { useState } from 'react';
import { 
  RefreshCcw, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Activity,
  Server,
  Zap,
  Settings2
} from 'lucide-react';

interface SyncStatus {
  lastSync: string;
  nextScheduledSync: string;
  status: 'IDLE' | 'SYNCING' | 'FAILED';
}

interface SyncLog {
  id: string;
  timestamp: string;
  executionType: 'AUTOMATIC' | 'MANUAL';
  processedIssues: number;
  durationSeconds: number;
  result: 'SUCCESS' | 'FAILED';
}

const initialLogs: SyncLog[] = [
  {
    id: 'log-1023',
    timestamp: '2026-07-06 23:00:00',
    executionType: 'AUTOMATIC',
    processedIssues: 342,
    durationSeconds: 45,
    result: 'SUCCESS'
  },
  {
    id: 'log-1022',
    timestamp: '2026-07-05 23:00:00',
    executionType: 'AUTOMATIC',
    processedIssues: 128,
    durationSeconds: 18,
    result: 'SUCCESS'
  },
  {
    id: 'log-1021',
    timestamp: '2026-07-05 14:15:22',
    executionType: 'MANUAL',
    processedIssues: 0,
    durationSeconds: 3,
    result: 'FAILED'
  }
];

export default function SystemSyncTab() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: '2026-07-06 23:00:00',
    nextScheduledSync: '2026-07-07 23:00:00',
    status: 'IDLE'
  });
  
  const [logs, setLogs] = useState<SyncLog[]>(initialLogs);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  
  // Configuración de Cron
  const [cronTime, setCronTime] = useState('23:00');
  const [savedCronTime, setSavedCronTime] = useState('23:00');
  const [isSavingCron, setIsSavingCron] = useState(false);

  const handleCronTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCronTime(e.target.value);
  };

  const handleSaveCronTime = () => {
    setIsSavingCron(true);
    setTimeout(() => {
      setSavedCronTime(cronTime);
      setIsSavingCron(false);
      
      // Actualizar la fecha de la próxima sincronización para reflejar la nueva hora
      const nextDate = syncStatus.nextScheduledSync.split(' ')[0];
      setSyncStatus(prev => ({
        ...prev,
        nextScheduledSync: `${nextDate} ${cronTime}:00`
      }));
    }, 800);
  };

  const handleManualSync = () => {
    if (syncStatus.status === 'SYNCING') return;
    
    setSyncStatus(prev => ({ ...prev, status: 'SYNCING' }));
    setShowSuccessAlert(false);

    // Simulate FastAPI Background Worker delay (3 seconds)
    setTimeout(() => {
      const now = new Date();
      const newTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);
      
      const newLog: SyncLog = {
        id: `log-${Date.now().toString().slice(-4)}`,
        timestamp: newTimestamp,
        executionType: 'MANUAL',
        processedIssues: Math.floor(Math.random() * 50) + 5,
        durationSeconds: 3,
        result: 'SUCCESS'
      };

      setLogs(prev => [newLog, ...prev]);
      setSyncStatus(prev => ({ 
        ...prev, 
        status: 'IDLE',
        lastSync: newTimestamp
      }));
      
      setShowSuccessAlert(true);
      
      // Hide alert after 4 seconds
      setTimeout(() => setShowSuccessAlert(false), 4000);
    }, 3000);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Control del Sincronizador
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configuración del sistema y auditoría de Background Workers (Cron Jobs).
          </p>
        </div>
      </div>

      {showSuccessAlert && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400">
          <CheckCircle2 size={18} />
          <p className="text-sm font-medium">Sincronización manual completada con éxito. Base de datos actualizada.</p>
        </div>
      )}

      {/* Sección Superior: Panel de Operación */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings2 size={18} className="text-slate-500" />
              Control de Sincronización Incremental (BFF / Jira API)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Monitoreo del servicio de ingesta ETL programado.
            </p>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Activity size={14} className={syncStatus.status === 'SYNCING' ? 'text-indigo-500 animate-pulse' : 'text-slate-400'} />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {syncStatus.status === 'SYNCING' ? 'Worker Activo' : 'Worker en Reposo'}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock size={14} /> Última sincronización nocturna
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {syncStatus.lastSync}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar size={14} /> Siguiente ejecución programada
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {syncStatus.nextScheduledSync}
                </p>
              </div>
            </div>

            <button
              onClick={handleManualSync}
              disabled={syncStatus.status === 'SYNCING'}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 px-6 py-2.5 text-sm font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed min-w-[240px]"
            >
              {syncStatus.status === 'SYNCING' ? (
                <>
                  <RefreshCcw size={16} className="mr-2 animate-spin" />
                  Procesando delta en segundo plano...
                </>
              ) : (
                <>
                  <Zap size={16} className="mr-2" />
                  Sincronizar Manualmente Ahora
                </>
              )}
            </button>
            
          </div>

          {/* Configuración de Cron */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Settings2 size={14} className="text-slate-500" />
                Horario de Ejecución Automática (Cron)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define la hora diaria en la que el worker extraerá nuevos datos desatendidamente.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="time" 
                value={cronTime}
                onChange={handleCronTimeChange}
                disabled={isSavingCron}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-60 transition-colors"
              />
              <button 
                onClick={handleSaveCronTime}
                disabled={isSavingCron || cronTime === savedCronTime}
                className="inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-1.5 text-sm font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
              >
                {isSavingCron ? (
                  <>
                    <RefreshCcw size={14} className="mr-1.5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Horario'
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Sección Inferior: Auditoría */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm mt-6">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Server size={18} className="text-slate-500" />
            Historial de Ejecución de Tareas (Background Workers)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registro inmutable de auditoría de sincronizaciones.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3 font-medium">ID Tarea</th>
                <th className="px-6 py-3 font-medium">Fecha/Hora</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium text-right">Issues Procesados (Delta)</th>
                <th className="px-6 py-3 font-medium text-right">Duración (seg)</th>
                <th className="px-6 py-3 font-medium text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {log.id}
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-medium">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex text-xs font-medium text-slate-700 dark:text-slate-300">
                      {log.executionType === 'AUTOMATIC' ? 'Automático (Cron)' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-900 dark:text-slate-200">
                    {log.processedIssues}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-900 dark:text-slate-200">
                    {log.durationSeconds}s
                  </td>
                  <td className="px-6 py-4 text-center">
                    {log.result === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        <CheckCircle2 size={12} /> Éxito
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                        <XCircle size={12} /> Error
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
