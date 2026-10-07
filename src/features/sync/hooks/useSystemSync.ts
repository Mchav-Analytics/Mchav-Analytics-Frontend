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

interface RawApiLog {
  id_log?: number | string;
  id?: number | string;
  fecha_ejecucion?: string;
  fecha_inicio?: string;
  tipo_sincronizacion?: string;
  issues_procesados?: number;
  registros_procesados?: number;
  tiempo_ejecucion_segundos?: number;
  resultado?: string;
  ejecutado_por?: string;
  detalle_error?: string;
}

const formatTimestamp = (ts: string) => {
  if (!ts) return 'Sin fecha';
  const dateString = ts.endsWith('Z') ? ts : `${ts}Z`;
  const dt = new Date(dateString);
  if (Number.isNaN(dt.getTime())) return ts.replace('T', ' ').substring(0, 19);
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

export const mapApiLogToSyncLog = (apiLog: RawApiLog): SyncLog => ({
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
      console.warn('Could not read mchav_is_auto_sync from localStorage', e);
      return true;
    }
  });

  const setIsAutoSync = (val: boolean) => {
    setIsAutoSyncState(val);
    try {
      localStorage.setItem('mchav_is_auto_sync', String(val));
    } catch (e) {
      console.warn('Could not save mchav_is_auto_sync to localStorage', e);
    }
    
    jiraService.toggleAutoSync(val).catch(err => {
      console.error("Error toggling auto sync on backend:", err);
    });
  };

  const [cronSchedule, setCronScheduleState] = useState(() => {
    try {
      return localStorage.getItem('mchav_cron_schedule') || '24h';
    } catch (e) {
      console.warn('Could not read mchav_cron_schedule from localStorage', e);
      return '24h';
    }
  });

  const setCronSchedule = (val: string) => {
    setCronScheduleState(val);
    try {
      localStorage.setItem('mchav_cron_schedule', val);
    } catch (e) {
      console.warn('Could not save mchav_cron_schedule to localStorage', e);
    }
  };

  const [isSavingCron, setIsSavingCron] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 8;

  const fetchLogsFromApi = () => {
    jiraService.getSyncLogs()
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          const mapped = data.map(mapApiLogToSyncLog);
          setLogs(mapped);
          if (mapped.length > 0) {
            const firstResult = data[0].resultado;
            setSyncStatus(prev => ({
              ...prev,
              lastSync: formatTimestamp(mapped[0].timestamp),
              status: firstResult === 'RUNNING' ? 'SYNCING' : (firstResult === 'FAILED' ? 'FAILED' : 'IDLE')
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
    
    const interval = setInterval(() => {
      fetchLogsFromApi();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLogPage(1);
  }, [timeFilter]);

  const [cronTime, setCronTime] = useState(() => {
    try {
      return localStorage.getItem('mchav_cron_time') || '23:00';
    } catch (e) {
      console.warn('Could not read mchav_cron_time from localStorage', e);
      return '23:00';
    }
  });
  const [savedCronTime, setSavedCronTime] = useState(cronTime);

  const handleCronTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCronTime(e.target.value);
  };

  const handleSaveCronTime = () => {
    setIsSavingCron(true);
    
    jiraService.updateCronTime(cronTime)
      .then(() => {
        try {
          localStorage.setItem('mchav_cron_time', cronTime);
          localStorage.setItem('mchav_cron_schedule', cronSchedule);
          localStorage.setItem('mchav_is_auto_sync', String(isAutoSync));
        } catch (e) {
          console.warn('Could not update cron settings in localStorage', e);
        }
        
        setSavedCronTime(cronTime);
        setIsSavingCron(false);
        const nextDate = syncStatus.nextScheduledSync.split(' ')[0] || 'Hoy';
        setSyncStatus(prev => ({
          ...prev,
          nextScheduledSync: `${nextDate} ${cronTime}:00`
        }));
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 4000);
      })
      .catch((err: unknown) => {
        console.error("Error saving cron time to backend:", err);
        setSyncErrorMsg("No se pudo guardar la configuración de horario en el servidor.");
        setIsSavingCron(false);
      });
  };

  const handlePollIteration = (attempts: number, interval: ReturnType<typeof setInterval>) => {
    jiraService.getSyncLogs()
      .then((logRes: unknown) => {
        if (!Array.isArray(logRes)) {
          clearInterval(interval);
          return;
        }

        const mapped = logRes.map(mapApiLogToSyncLog);
        setLogs(mapped);

        if (mapped.length === 0) return;

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
      })
      .catch(err => {
        console.error("Error polling logs:", err);
        clearInterval(interval);
        setSyncStatus(prev => ({ ...prev, status: 'FAILED' }));
      });
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
          attempts++;
          handlePollIteration(attempts, interval);
        }, 3000);
      })
      .catch((err: any) => {
        console.error("Error triggerSync:", err);
        if (err.response && err.response.status === 400) {
          setSyncErrorMsg("La sincronización automática ya se está ejecutando en segundo plano.");
          fetchLogsFromApi();
        } else {
          setSyncStatus(prev => ({ ...prev, status: 'FAILED' }));
          setSyncErrorMsg("No se pudo iniciar el proceso en segundo plano.");
        }
      });
  };

  const filteredLogs = logs.filter(log => {
    if (timeFilter === 'all') return true;
    const dateString = log.timestamp.endsWith('Z') ? log.timestamp : `${log.timestamp}Z`;
    const logDate = new Date(dateString);
    if (Number.isNaN(logDate.getTime())) return true;
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
