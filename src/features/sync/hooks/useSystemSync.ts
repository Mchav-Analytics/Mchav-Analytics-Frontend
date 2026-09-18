import { useState, useEffect } from 'react';
import { jiraService } from '../../../services/api';

export interface SyncStatus {
  lastSync: string;
  nextScheduledSync: string;
  status: 'IDLE' | 'SYNCING' | 'FAILED';
}

export interface SyncLog {
  id: string;
  timestamp: string;
  executionType: 'AUTOMATIC' | 'MANUAL';
  processedIssues: number;
  durationSeconds: number;
  result: 'SUCCESS' | 'FAILED' | 'RUNNING';
  ejecutadoPor: string;
  detalleError?: string;
}

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

export const mapApiLogToSyncLog = (apiLog: any): SyncLog => ({
  id: `log-${apiLog.id_log || apiLog.id}`,
  timestamp: apiLog.fecha_ejecucion || apiLog.fecha_inicio || '',
  executionType: apiLog.tipo_sincronizacion === 'AUTOMATIC' ? 'AUTOMATIC' : 'MANUAL',
  processedIssues: apiLog.issues_procesados || apiLog.registros_procesados || 0,
  durationSeconds: apiLog.tiempo_ejecucion_segundos || 0,
  result: (apiLog.resultado === 'ERROR' ? 'FAILED' : apiLog.resultado) as 'SUCCESS' | 'FAILED' | 'RUNNING',
  ejecutadoPor: apiLog.ejecutado_por || 'Sistema',
  detalleError: apiLog.detalle_error
});

export function useSystemSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: 'Sin registros',
    nextScheduledSync: 'Hoy 23:00:00',
    status: 'IDLE'
  });

  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [syncErrorMsg, setSyncErrorMsg] = useState('');

  // Configuración de Cron con persistencia en localStorage
  const [isAutoSync, setIsAutoSyncState] = useState(() => {
    try {
      const saved = localStorage.getItem('mchav_is_auto_sync');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const setIsAutoSync = (val: boolean) => {
    setIsAutoSyncState(val);
    try {
      localStorage.setItem('mchav_is_auto_sync', String(val));
    } catch (e) {}
  };

  const [cronSchedule, setCronScheduleState] = useState(() => {
    try {
      return localStorage.getItem('mchav_cron_schedule') || '24h';
    } catch (e) {
      return '24h';
    }
  });

  const setCronSchedule = (val: string) => {
    setCronScheduleState(val);
    try {
      localStorage.setItem('mchav_cron_schedule', val);
    } catch (e) {}
  };

  const [isSavingCron, setIsSavingCron] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 8;

  const fetchLogsFromApi = () => {
    jiraService.getSyncLogs()
      .then((data: any) => {
        if (Array.isArray(data)) {
          const mapped = data.map(mapApiLogToSyncLog);
          setLogs(mapped);
          if (mapped.length > 0) {
            setSyncStatus(prev => ({
              ...prev,
              lastSync: formatTimestamp(mapped[0].timestamp),
              status: data[0].resultado === 'RUNNING' ? 'SYNCING' : (data[0].resultado === 'FAILED' ? 'FAILED' : 'IDLE')
            }));
          }
        }
      })
      .catch(err => {
        console.error("Error fetching sync logs on SystemSyncTab:", err);
      });
  };

  useEffect(() => {
    fetchLogsFromApi();
  }, []);

  useEffect(() => {
    setLogPage(1);
  }, [timeFilter]);

  // Cargar preferencia de hora guardada en localStorage
  const [cronTime, setCronTime] = useState(() => {
    try {
      return localStorage.getItem('mchav_cron_time') || '23:00';
    } catch (e) {
      return '23:00';
    }
  });
  const [savedCronTime, setSavedCronTime] = useState(cronTime);

  const handleCronTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCronTime(e.target.value);
  };

  const handleSaveCronTime = () => {
    setIsSavingCron(true);
    try {
      localStorage.setItem('mchav_cron_time', cronTime);
      localStorage.setItem('mchav_cron_schedule', cronSchedule);
      localStorage.setItem('mchav_is_auto_sync', String(isAutoSync));
    } catch (e) {}

    setTimeout(() => {
      setSavedCronTime(cronTime);
      setIsSavingCron(false);
      const nextDate = syncStatus.nextScheduledSync.split(' ')[0] || 'Hoy';
      setSyncStatus(prev => ({
        ...prev,
        nextScheduledSync: `${nextDate} ${cronTime}:00`
      }));
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
    }, 600);
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
            .then((logRes: any) => {
              if (Array.isArray(logRes)) {
                const mapped = logRes.map(mapApiLogToSyncLog);
                setLogs(mapped);
                attempts++;

                if (mapped.length > 0) {
                  const latestLog = mapped[0];
                  if (latestLog.result !== 'RUNNING' || attempts > 20) {
                    clearInterval(interval);
                    setSyncStatus(prev => ({
                      ...prev,
                      status: latestLog.result === 'SUCCESS' ? 'IDLE' : (latestLog.result === 'RUNNING' ? 'SYNCING' : 'FAILED'),
                      lastSync: formatTimestamp(latestLog.timestamp)
                    }));

                    if (latestLog.result === 'SUCCESS') {
                      setShowSuccessAlert(true);
                      window.dispatchEvent(new CustomEvent('mchav-sync-completed'));
                      setTimeout(() => setShowSuccessAlert(false), 5000);
                    } else if (latestLog.result === 'RUNNING') {
                      setSyncErrorMsg("La sincronización está tomando más tiempo del habitual, pero sigue ejecutándose en segundo plano.");
                    } else {
                      setSyncErrorMsg(latestLog.detalleError || "Error durante la ejecución del job.");
                    }
                  }
                }
              } else {
                clearInterval(interval);
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

  const filteredLogs = logs.filter(log => {
    if (timeFilter === 'all') return true;
    const dateString = log.timestamp.endsWith('Z') ? log.timestamp : `${log.timestamp}Z`;
    const logDate = new Date(dateString);
    if (isNaN(logDate.getTime())) return true;
    const now = new Date();
    const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);

    if (timeFilter === '30d') return diffDays <= 30;
    if (timeFilter === '60d') return diffDays <= 60;
    if (timeFilter === '90d') return diffDays <= 90;
    return true;
  });

  const totalLogPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (logPage - 1) * logsPerPage,
    logPage * logsPerPage
  );

  return {
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
  };
}
