// ============================================================================
// FEATURE SYNC — VISTA DE AUDITORÍA DE SINCRONIZACIÓN ETL CON JIRA
// ============================================================================
// Permite auditar las ejecuciones del motor ETL, programar horarios CRON,
// lanzar sincronizaciones manuales en segundo plano y descargar logs JSON.

import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCcw,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Server,
  Zap,
  Settings2,
  Play,
  Eye,
  RotateCw,
  Download,
  Terminal,
  AlertTriangle,
  Database,
  Search,
  Copy,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileDown
} from 'lucide-react';
import { jiraService, authService, jqlService } from '../../../services/api';
import LiderNotificationBell from '../../dashboard/components/LiderNotificationBell';

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

const formatTimestamp = (ts: string) => {
  if (!ts) return 'Sin fecha';
  
  const dateString = ts.endsWith('Z') ? ts : `${ts}Z`;
  const dt = new Date(dateString);
  
  if (isNaN(dt.getTime())) {
    return ts.replace('T', ' ').substring(0, 19);
  }

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

export default function SystemSyncTab() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: 'Sin registros',
    nextScheduledSync: 'Hoy 23:00:00',
    status: 'IDLE'
  });

  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [syncErrorMsg, setSyncErrorMsg] = useState('');

  // Estado Consola JQL Real con Validador Sintáctico Backend (HU-009)
  const [jqlQuery, setJqlQuery] = useState('project = "10000" AND status in ("In Progress", "En curso")');
  const [jqlError, setJqlError] = useState('');
  const [jqlSuccess, setJqlSuccess] = useState('');
  const [isExecutingJql, setIsExecutingJql] = useState(false);
  const [jqlIssues, setJqlIssues] = useState<any[]>([]);
  const [showJqlTable, setShowJqlTable] = useState(true);
  const [showDictionaryTable, setShowDictionaryTable] = useState(false);
  const [jqlCurrentPage, setJqlCurrentPage] = useState(1);
  const [jqlPageSize, setJqlPageSize] = useState(5);

  // Estado Diccionario JQL para Admin (Vista Horizontal)
  const dictScrollRef = useRef<HTMLDivElement>(null);
  const [copiedJqlIdx, setCopiedJqlIdx] = useState<number | null>(null);
  const [dictionarySearch, setDictionarySearch] = useState('');
  const [selectedDictCategory, setSelectedDictCategory] = useState('TODAS');

  const handleScrollLeft = () => {
    dictScrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    dictScrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' });
  };

  const jqlDictionaryList = [
    {
      category: 'Consultas Básicas',
      categoryBadge: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      title: 'Todas las Incidencias del Proyecto',
      description: 'Obtiene el catálogo completo de tareas registradas sin ningún filtro.',
      jql: 'project = "10000"'
    },
    {
      category: 'Consultas Básicas',
      categoryBadge: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      title: 'Incidencias En Progreso (Trabajo Activo)',
      description: 'Filtra las tareas actualmente en desarrollo activo por el equipo.',
      jql: 'project = "10000" AND status in ("In Progress", "En curso")'
    },
    {
      category: 'Consultas Básicas',
      categoryBadge: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      title: 'Incidencias Completadas (Done)',
      description: 'Muestra todas las tareas finalizadas y entregadas con éxito.',
      jql: 'project = "10000" AND status in ("Done", "Finalizado", "Completado")'
    },
    {
      category: 'Consultas Básicas',
      categoryBadge: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      title: 'Incidencias Pendientes (To Do)',
      description: 'Muestra el trabajo acumulado en Backlog aún no iniciado.',
      jql: 'project = "10000" AND status in ("To Do", "Por hacer", "Pendiente")'
    },
    {
      category: 'Control Operativo',
      categoryBadge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      title: 'Alta Prioridad / Críticos Pendientes',
      description: 'Detecta tareas bloqueantes o de alta prioridad sin resolver.',
      jql: 'project = "10000" AND priority in (High, Highest, Alta) AND status not in ("Done", "Finalizado", "Completado")'
    },
    {
      category: 'Control Operativo',
      categoryBadge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      title: 'Incidencias Sin Asignar',
      description: 'Identifica tareas huérfanas sin desarrollador asignado.',
      jql: 'project = "10000" AND assignee is EMPTY AND status not in ("Done", "Finalizado", "Completado")'
    },
    {
      category: 'Calidad y Bugs',
      categoryBadge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      title: 'Bugs y Errores Activos',
      description: 'Lista todas las fallas o bugs reportados que siguen pendientes.',
      jql: 'project = "10000" AND issuetype in (Bug, Error) AND status not in ("Done", "Finalizado", "Completado")'
    },
    {
      category: 'Tiempos y Recientes',
      categoryBadge: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      title: 'Actualizadas en los Últimos 7 Días',
      description: 'Muestra los cambios y actividad más reciente del proyecto.',
      jql: 'project = "10000" AND updated >= -7d ORDER BY updated DESC'
    }
  ];

  const handleCopyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedJqlIdx(idx);
    setTimeout(() => setCopiedJqlIdx(null), 2000);
  };

  const handleLoadIntoConsole = (jql: string) => {
    setJqlQuery(jql);
    const textareaEl = document.getElementById('jql-console-textarea');
    if (textareaEl) {
      textareaEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textareaEl.focus();
    }
  };

  // Configuración de Cron
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [cronSchedule, setCronSchedule] = useState('6h');
  const [cronTime, setCronTime] = useState('23:00');
  const [savedCronTime, setSavedCronTime] = useState('23:00');
  const [isSavingCron, setIsSavingCron] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');

  const handleExecuteJql = (e: React.FormEvent) => {
    e.preventDefault();
    setJqlError('');
    setJqlSuccess('');
    setJqlIssues([]);
    setJqlCurrentPage(1);
    setIsExecutingJql(true);

    jqlService.executeJql(jqlQuery)
      .then((res: any) => {
        setIsExecutingJql(false);
        const count = res.total !== undefined ? res.total : (res.issues ? res.issues.length : 0);
        const timeNow = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        setJqlSuccess(`Consulta JQL ejecutada a las ${timeNow}. ${count} incidencias encontradas.`);
        if (res.issues && Array.isArray(res.issues)) {
          setJqlIssues(res.issues);
          setJqlCurrentPage(1);
          setShowJqlTable(true);
        }
      })
      .catch((err: any) => {
        setIsExecutingJql(false);
        const detail = err?.response?.data?.detail || err?.message || 'Error de sintaxis o consulta JQL.';
        setJqlError(detail);
      });
  };

  const exportJqlToCsv = () => {
    if (!jqlIssues || jqlIssues.length === 0) return;
    const headers = ['Clave', 'Tipo', 'Resumen', 'Estado', 'Asignado a'];
    const rows = jqlIssues.map(issue => [
      `"${issue.key || ''}"`,
      `"${issue.fields?.issuetype?.name || 'Issue'}"`,
      `"${(issue.fields?.summary || '').replace(/"/g, '""')}"`,
      `"${issue.fields?.status?.name || 'Desconocido'}"`,
      `"${issue.fields?.assignee?.displayName || 'Sin asignar'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jql_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mapApiLogToSyncLog = (apiLog: any): SyncLog => ({
    id: `log-${apiLog.id_log || apiLog.id}`,
    timestamp: apiLog.fecha_ejecucion || apiLog.fecha_inicio || '',
    executionType: apiLog.tipo_sincronizacion === 'AUTOMATIC' ? 'AUTOMATIC' : 'MANUAL',
    processedIssues: apiLog.issues_procesados || apiLog.registros_procesados || 0,
    durationSeconds: apiLog.tiempo_ejecucion_segundos || 0,
    result: (apiLog.resultado === 'ERROR' ? 'FAILED' : apiLog.resultado) as 'SUCCESS' | 'FAILED' | 'RUNNING',
    ejecutadoPor: apiLog.ejecutado_por || 'Sistema',
    detalleError: apiLog.detalle_error
  });

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

  const formatDuration = (seconds: number, result?: string) => {
    if (result === 'RUNNING') return 'En curso...';
    if (seconds === undefined || seconds === null || seconds === 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };



  // Filtrado temporal
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

  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 5;

  useEffect(() => {
    setLogPage(1);
  }, [timeFilter]);

  const totalLogPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage);

  return (
    <div className="w-full space-y-6 font-sans text-left">

      {/* Alertas */}
      {showSuccessAlert && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 flex items-center gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-800 dark:text-teal-400">
          <CheckCircle2 size={18} />
          <p className="text-sm font-semibold">Sincronización manual completada con éxito. Base de datos actualizada.</p>
        </div>
      )}

      {syncErrorMsg && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 flex items-center justify-between gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400">
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

      {/* BARRA SUPERIOR DE SINCRONIZACIÓN DEL SISTEMA (ESTILO ADMIN RESUMEN) */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        
        {/* Lado Izquierdo: Ícono en Gradiente + Insignia + Título */}
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
                • Motor de Sincronización Jira ETL & Consola JQL
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sincronización del Sistema
            </h1>
          </div>
        </div>

        {/* Lado Derecho: Bell Popup + Exportar PDF */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LiderNotificationBell />

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-[#5b36f5] hover:bg-indigo-600 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
            title="Exportar reporte de sincronización"
          >
            <FileDown size={15} />
            <span>Exportar Reporte</span>
          </button>
        </div>

      </div>

      {/* SECCIÓN SUPERIOR COMPLETA (100% ANCHO): PANEL DE SINCRONIZACIÓN AUTOMÁTICA Y PROGRAMADA */}
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

      {/* SECCIÓN INFERIOR COMPLETA (100% ANCHO): TABLA DE HISTORIAL DE TAREAS (LOGS) */}
      <div className="w-full bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-2xl shadow-sm overflow-hidden">
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

        {/* Barra de Paginación para Tabla de Logs con Botón de Sincronización a la Izquierda */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* BOTÓN EJECUTAR SINCRONIZACIÓN MANUAL AHORA */}
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
    </div>
  );
}
