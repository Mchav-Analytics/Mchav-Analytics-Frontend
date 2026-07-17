import React, { useState, useEffect } from 'react';
import { 
  RefreshCcw, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Activity,
  Server,
  Zap,
  Settings2,
  Lock,
  Play,
  Eye,
  RotateCw,
  Download
} from 'lucide-react';
import { jiraService } from '../../services/api';

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
  result: 'SUCCESS' | 'FAILED' | 'RUNNING';
  ejecutadoPor: string;
  detalleError?: string;
}

export default function SystemSyncTab() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: 'Sin registros',
    nextScheduledSync: 'Hoy 23:00:00',
    status: 'IDLE'
  });
  
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [syncErrorMsg, setSyncErrorMsg] = useState('');
  
  // Configuración de Cron
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [cronSchedule, setCronSchedule] = useState('6h');
  const [cronTime, setCronTime] = useState('23:00');
  const [savedCronTime, setSavedCronTime] = useState('23:00');
  const [isSavingCron, setIsSavingCron] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');

  const mapApiLogToSyncLog = (apiLog: any): SyncLog => ({
    id: `log-${apiLog.id_log}`,
    timestamp: apiLog.fecha_ejecucion.replace('T', ' ').substring(0, 19),
    executionType: apiLog.tipo_sincronizacion === 'AUTOMATIC' ? 'AUTOMATIC' : 'MANUAL',
    processedIssues: apiLog.issues_procesados,
    durationSeconds: apiLog.tiempo_ejecucion_segundos,
    result: apiLog.resultado as 'SUCCESS' | 'FAILED' | 'RUNNING',
    ejecutadoPor: apiLog.ejecutado_por || 'Sistema',
    detalleError: apiLog.detalle_error
  });

  const fetchLogsFromApi = () => {
    jiraService.getSyncLogs()
      .then((data: any[]) => {
        const mapped = data.map(mapApiLogToSyncLog);
        setLogs(mapped);
        if (mapped.length > 0) {
          setSyncStatus(prev => ({
            ...prev,
            lastSync: formatTimestamp(mapped[0].timestamp),
            status: data[0].resultado === 'RUNNING' ? 'SYNCING' : (data[0].resultado === 'FAILED' ? 'FAILED' : 'IDLE')
          }));
        }
      })
      .catch(err => {
        console.error("Error fetching sync logs on SystemSyncTab:", err);
      });
  };

  useEffect(() => {
    fetchLogsFromApi();
  }, []);

  const handleCronTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCronTime(e.target.value);
  };

  const handleSaveCronTime = () => {
    setIsSavingCron(true);
    setTimeout(() => {
      setSavedCronTime(cronTime);
      setIsSavingCron(false);
      
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
    setSyncErrorMsg('');

    jiraService.triggerSync()
      .then(() => {
        let attempts = 0;
        const interval = setInterval(() => {
          jiraService.getSyncLogs()
            .then((logRes: any[]) => {
              const mapped = logRes.map(mapApiLogToSyncLog);
              setLogs(mapped);
              attempts++;
              
              if (logRes.length > 0) {
                const latestLog = logRes[0];
                if (latestLog.resultado !== 'RUNNING' || attempts > 15) {
                  clearInterval(interval);
                  setSyncStatus(prev => ({
                    ...prev,
                    status: latestLog.resultado === 'SUCCESS' ? 'IDLE' : 'FAILED',
                    lastSync: formatTimestamp(mapped[0].timestamp)
                  }));
                  
                  if (latestLog.resultado === 'SUCCESS') {
                    setShowSuccessAlert(true);
                    setTimeout(() => setShowSuccessAlert(false), 5000);
                  } else {
                    setSyncErrorMsg(latestLog.detalle_error || "Error durante la ejecución del job.");
                  }
                }
              }
            })
            .catch(err => {
              console.error("Error polling logs:", err);
              clearInterval(interval);
              setSyncStatus(prev => ({ ...prev, status: 'FAILED' }));
            });
        }, 3000);
      })
      .catch(err => {
        console.error("Error triggerSync:", err);
        setSyncStatus(prev => ({ ...prev, status: 'FAILED' }));
        setSyncErrorMsg("No se pudo iniciar el proceso en segundo plano.");
      });
  };

  const handleDownloadLog = (log: SyncLog) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(log, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sync-log-${log.id.replace('log-', '')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleShowLogDetail = (log: SyncLog) => {
    if (log.detalleError) {
      setSyncErrorMsg(log.detalleError);
    } else {
      setSyncErrorMsg(`Tarea completada con éxito. ID: ${log.id.replace('log-', '')} | Issues Procesados: ${log.processedIssues}`);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === undefined || seconds === null) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const formatTimestamp = (tsStr: string) => {
    try {
      const d = new Date(tsStr.replace(/-/g, '/'));
      if (isNaN(d.getTime())) return tsStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      return `${day}.${month}.${year} ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return tsStr;
    }
  };

  // Filtrado temporal
  const filteredLogs = logs.filter(log => {
    if (timeFilter === 'all') return true;
    const logDate = new Date(log.timestamp.replace(/-/g, '/'));
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - logDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (timeFilter === '30d') return diffDays <= 30;
    if (timeFilter === '60d') return diffDays <= 60;
    if (timeFilter === '90d') return diffDays <= 90;
    return true;
  });

  return (
    <main className="main-content">
      {/* Topbar maquetada */}
      <header className="topbar flex items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: '0px' }}>
            Auditoría de ETL 🔄
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0px' }}>
            Historial de sincronización y estado de los datos.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 12px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>📅</span>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{ borderWidth: 'medium', borderStyle: 'none', borderColor: 'currentcolor', borderImage: 'none', background: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <option value="all">Todos los tiempos</option>
              <option value="30d">Últimos 30 días</option>
              <option value="60d">Últimos 2 meses</option>
              <option value="90d">Últimos 3 meses</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="user-profile-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                salamancamai12
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                Administrador
              </span>
            </div>
            <div 
              title="salamancamai12 (Administrador)" 
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgb(30, 58, 138) 0%, rgb(13, 148, 136) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem' }}
            >
              SA
            </div>
          </div>
        </div>
      </header>

      {/* Alertas */}
      {showSuccessAlert && (
        <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300 flex items-center gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-800 dark:text-teal-400">
          <CheckCircle2 size={18} />
          <p className="text-sm font-semibold">Sincronización manual completada con éxito. Base de datos actualizada.</p>
        </div>
      )}

      {syncErrorMsg && (
        <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300 flex items-center justify-between gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400">
          <div className="flex items-center gap-3">
            <XCircle size={18} />
            <p className="text-sm font-semibold text-left break-all">{syncErrorMsg}</p>
          </div>
          <button 
            onClick={() => setSyncErrorMsg('')}
            className="text-xs font-bold underline hover:no-underline whitespace-nowrap ml-2"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="dashboard-inner">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA: CONTROL Y CRON (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Card 1: Configuración Manual de Cron */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                <Settings2 className="text-teal-600 dark:text-teal-500" size={20} />
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Configuración Manual de Cron
                </h2>
              </div>

              <div className="space-y-6">
                {/* Sincronización Automática */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      Sincronización Automática
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-400">
                      Sincronización automática is Automática.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsAutoSync(!isAutoSync)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAutoSync ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoSync ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Programación CRON */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Programación CRON
                  </label>
                  <select 
                    value={cronSchedule}
                    onChange={(e) => setCronSchedule(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-teal-500/50"
                  >
                    <option value="6h">Cada 6 Horas</option>
                    <option value="12h">Cada 12 Horas</option>
                    <option value="24h">Diario (Cada 24 Horas)</option>
                  </select>
                </div>

                {/* Horario de Ejecución */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Horario de Ejecución Diaria
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={cronTime}
                      onChange={handleCronTimeChange}
                      disabled={isSavingCron}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    />
                    <button 
                      onClick={handleSaveCronTime}
                      disabled={isSavingCron || cronTime === savedCronTime}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {isSavingCron ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>

                {/* Botón Ejecutar Sincronización Manual */}
                <button
                  onClick={handleManualSync}
                  disabled={syncStatus.status === 'SYNCING'}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-3.5 text-sm font-bold transition-colors shadow-md shadow-teal-600/10 disabled:opacity-75"
                >
                  {syncStatus.status === 'SYNCING' ? (
                    <>
                      <RefreshCcw size={16} className="animate-spin" />
                      Procesando en segundo plano...
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" className="mr-1" />
                      Ejecutar Sincronización Manual Ahora
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: Disparadores de Sincronización */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <Activity className="text-slate-500" size={20} />
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Disparadores de Sincronización
                </h2>
              </div>
              
              <div className="space-y-3">
                <button disabled className="w-full flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-400 px-4 py-3 text-sm font-semibold cursor-not-allowed">
                  <span className="flex items-center gap-2"><Lock size={14} /> Completa</span>
                </button>
                <button disabled className="w-full flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-400 px-4 py-3 text-sm font-semibold cursor-not-allowed">
                  <span className="flex items-center gap-2"><Lock size={14} /> Incremental</span>
                </button>
                <button disabled className="w-full flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-400 px-4 py-3 text-sm font-semibold cursor-not-allowed">
                  <span className="flex items-center gap-2"><Lock size={14} /> Re-indexación</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center font-medium">
                  Requiere Privilegios de Admin
                </p>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: TABLA DE LOGS (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
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
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className={`h-2 w-2 rounded-full ${syncStatus.status === 'SYNCING' ? 'bg-amber-500 animate-ping' : 'bg-teal-500'}`} />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {syncStatus.status === 'SYNCING' ? 'Worker Activo' : 'Worker en Reposo'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
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
                      filteredLogs.map((log) => (
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
                                  <XCircle size={12} /> Fallido
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
                            {formatDuration(log.durationSeconds)}
                          </td>
                          <td className="px-6 py-4 text-xs whitespace-nowrap font-medium">
                            {log.ejecutadoPor}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2.5">
                              <button 
                                title="Ver detalles"
                                onClick={() => handleShowLogDetail(log)}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Eye size={15} className="text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" />
                              </button>
                              <button 
                                title="Re-ejecutar"
                                onClick={handleManualSync}
                                disabled={syncStatus.status === 'SYNCING'}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                              >
                                <RotateCw size={15} className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
                              </button>
                              <button 
                                title="Descargar log"
                                onClick={() => handleDownloadLog(log)}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
