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
  ChevronRight
} from 'lucide-react';
import { jiraService, authService, jqlService } from '../../../services/api';

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
  return ts.replace('T', ' ').substring(0, 19);
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
  const [jqlQuery, setJqlQuery] = useState('project = "SCRUM" AND status = "In Progress"');
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
        setJqlSuccess(`Consulta JQL validada por el backend. ${count} incidencias encontradas.`);
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
    timestamp: (apiLog.fecha_ejecucion || apiLog.fecha_inicio || '').replace('T', ' ').substring(0, 19),
    executionType: apiLog.tipo_sincronizacion === 'AUTOMATIC' ? 'AUTOMATIC' : 'MANUAL',
    processedIssues: apiLog.issues_procesados || apiLog.registros_procesados || 0,
    durationSeconds: apiLog.tiempo_ejecucion_segundos || 12,
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
                  if (latestLog.result !== 'RUNNING' || attempts > 6) {
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
    <div className="w-full space-y-6">

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

      {/* SECCIÓN SUPERIOR: GRID DE CONFIGURACIÓN Y CONSOLA JQL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN MANUAL DE CRON (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-2xl p-6 shadow-sm">
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
                    Sincronización automática periódica.
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
            </div>
          </div>

          {/* DICCIONARIO DE CONSULTAS JQL (UBICADO EN LA COLUMNA IZQUIERDA PARA OCUPAR EL ESPACIO JUNTO A LOS RESULTADOS) */}
          {showDictionaryTable && (
            <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-2xl p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
              <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Database size={16} className="text-indigo-500" />
                    Diccionario de Consultas JQL
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowDictionaryTable(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    title="Cerrar Diccionario"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Catálogo de consultas predefinidas. Haz clic en "⚡ Cargar" para probar cualquier sintaxis.
                </p>
              </div>

              {/* BUSCADOR */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={dictionarySearch}
                  onChange={(e) => setDictionarySearch(e.target.value)}
                  placeholder="Buscar consulta..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* FILTROS POR CATEGORÍA */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {['TODAS', 'Consultas Básicas', 'Control Operativo', 'Calidad y Bugs', 'Tiempos'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedDictCategory(cat === 'Tiempos' ? 'Tiempos y Recientes' : cat)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                      (selectedDictCategory === cat || (cat === 'Tiempos' && selectedDictCategory === 'Tiempos y Recientes'))
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* LISTA DE TARJETAS COMPACTAS (MAX ALTURA CON SCROLLBAR ELEGANTE) */}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-indigo-500/30">
                {jqlDictionaryList
                  .filter(item => {
                    const matchesCategory = selectedDictCategory === 'TODAS' || item.category === selectedDictCategory;
                    const matchesQuery = !dictionarySearch || 
                      item.title.toLowerCase().includes(dictionarySearch.toLowerCase()) || 
                      item.jql.toLowerCase().includes(dictionarySearch.toLowerCase()) ||
                      item.description.toLowerCase().includes(dictionarySearch.toLowerCase());
                    return matchesCategory && matchesQuery;
                  })
                  .map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${item.categoryBadge}`}>
                          {item.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyToClipboard(item.jql, idx)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                          title="Copiar JQL"
                        >
                          {copiedJqlIdx === idx ? (
                            <span className="text-emerald-500 font-bold text-[9px] flex items-center gap-0.5">
                              <CheckCircle2 size={11} /> ¡Copiado!
                            </span>
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                        <code className="text-[10px] font-mono text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 truncate flex-1" title={item.jql}>
                          {item.jql}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleLoadIntoConsole(item.jql)}
                          className="py-1 px-2.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:text-indigo-400 dark:hover:text-white border border-indigo-500/20 font-bold text-[10px] transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Terminal size={11} /> ⚡ Cargar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: CONSOLA JQL REAL (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Terminal className="text-indigo-600 dark:text-indigo-400" size={20} />
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    Consola JQL Real con Validador Sintáctico (HU-009)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Valida sintaxis JQL (paréntesis, comillas y campos) con el backend de FastAPI antes de consultar Jira Cloud.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                POST /api/v1/jql/execute
              </span>
            </div>

            {/* DICCIONARIO DE CONSULTAS JQL RECOMENDADAS (PRESETS) */}
            <div className="mb-4 text-left">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Diccionario de Consultas Recomendadas (Presets)
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setJqlQuery('project = "SCRUM"')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                >
                  Todas las Incidencias
                </button>
                <button
                  type="button"
                  onClick={() => setJqlQuery('project = "SCRUM" AND status = "In Progress"')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                >
                  En Progreso
                </button>
                <button
                  type="button"
                  onClick={() => setJqlQuery('project = "SCRUM" AND status = "To Do"')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                >
                  Pendientes (To Do)
                </button>
                <button
                  type="button"
                  onClick={() => setJqlQuery('project = "SCRUM" AND status = "Done"')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                >
                  Completadas (Done)
                </button>
                <button
                  type="button"
                  onClick={() => setJqlQuery('project = "SCRUM" AND priority in (High, Highest) AND status != "Done"')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Alta Prioridad
                </button>
                <button
                  type="button"
                  onClick={() => setJqlQuery('project = "SCRUM" AND assignee is EMPTY AND status != "Done"')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Sin Asignar
                </button>
                <button
                  type="button"
                  onClick={() => setJqlQuery('project = "SCRUM" AND issuetype = Bug AND status != "Done"')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  Bugs Activos
                </button>
                <button
                  type="button"
                  onClick={() => setJqlQuery('project = "SCRUM" AND updated >= -7d ORDER BY updated DESC')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Actualizadas 7 días
                </button>
              </div>
            </div>

            <form onSubmit={handleExecuteJql} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Consulta JQL a Validar
                </label>
                <textarea
                  id="jql-console-textarea"
                  rows={3}
                  value={jqlQuery}
                  onChange={(e) => setJqlQuery(e.target.value)}
                  placeholder='project = "MCHAV" AND assignee = currentUser() AND status = "In Progress"'
                  className="w-full bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
                />
              </div>

              {jqlSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{jqlSuccess}</span>
                  </div>
                  {jqlIssues.length > 0 && (
                    <button
                      type="button"
                      onClick={exportJqlToCsv}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Download size={12} /> Exportar CSV
                    </button>
                  )}
                </div>
              )}

              {jqlError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span className="break-all">{jqlError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* BOTÓN DESPLEGAR DICCIONARIO DE CONSULTAS (A LA IZQUIERDA EN LA PARTE DE ABAJO) */}
                <button
                  type="button"
                  onClick={() => setShowDictionaryTable(!showDictionaryTable)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Database size={15} />
                  <span>{showDictionaryTable ? '📖 Ocultar Diccionario JQL' : '📖 Ver Diccionario de Consultas JQL'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isExecutingJql}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isExecutingJql ? (
                    <>
                      <RefreshCcw size={14} className="animate-spin" /> Validando Sintaxis...
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" /> Validar y Ejecutar JQL
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* PREVISUALIZACION DE INCIDENCIAS EN TABLA CON PAGINACIÓN */}
            {jqlSuccess && (() => {
              const jqlTotalPages = Math.max(1, Math.ceil(jqlIssues.length / jqlPageSize));
              const startIdx = (jqlCurrentPage - 1) * jqlPageSize;
              const paginatedJqlIssues = jqlIssues.slice(startIdx, startIdx + jqlPageSize);
              const startItem = jqlIssues.length > 0 ? startIdx + 1 : 0;
              const endItem = Math.min(startIdx + jqlPageSize, jqlIssues.length);

              return (
                <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 transition-all duration-300 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setShowJqlTable(!showJqlTable)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Terminal size={14} className="text-indigo-500" /> Previsualización de Resultados
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${jqlIssues.length > 0 ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                        {jqlIssues.length} {jqlIssues.length === 1 ? 'incidencia' : 'incidencias'}
                      </span>
                    </span>
                    <div className={`text-slate-400 transition-transform duration-300 ${showJqlTable ? 'rotate-180' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </button>

                  {showJqlTable && (
                    <>
                      <div className="overflow-x-hidden overflow-y-auto max-h-[350px] border-t border-slate-200 dark:border-slate-700/50">
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider shadow-sm">
                              <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Clave</th>
                              <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Tipo</th>
                              <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Resumen</th>
                              <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Estado</th>
                              <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Asignado a</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs text-slate-700 dark:text-slate-300">
                            {paginatedJqlIssues.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                  No se encontraron incidencias para esta consulta JQL.
                                </td>
                              </tr>
                            ) : (
                              paginatedJqlIssues.map((issue: any, idx: number) => {
                                const issueKey = issue.key || issue.key_issue || 'N/A';
                                const summary = issue.fields?.summary || issue.summary || 'Sin Resumen';
                                const statusName = issue.fields?.status?.name || issue.status_actual || 'Desconocido';
                                const assigneeName = issue.fields?.assignee?.displayName || issue.assignee || 'Sin asignar';
                                const issueTypeName = issue.fields?.issuetype?.name || issue.issue_type || 'Issue';
                                const iconUrl = issue.fields?.issuetype?.iconUrl;

                                return (
                                  <tr key={issue.id || issueKey || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                                    <td className="px-4 py-2.5 font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                      {issueKey}
                                    </td>
                                    <td className="px-4 py-2.5 whitespace-nowrap flex items-center gap-2">
                                      {iconUrl && (
                                        <img src={iconUrl} alt="icon" className="w-3.5 h-3.5 rounded-sm" />
                                      )}
                                      <span>{issueTypeName}</span>
                                    </td>
                                    <td className="px-4 py-2.5 truncate max-w-[200px]" title={summary}>
                                      {summary}
                                    </td>
                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        {statusName}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                                      {assigneeName}
                                    </td>
                                  </tr>
                                )
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* BARRA DE PAGINACIÓN INTERACTIVA */}
                      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                          <span>Filas por página:</span>
                          <select
                            value={jqlPageSize}
                            onChange={(e) => {
                              setJqlPageSize(Number(e.target.value));
                              setJqlCurrentPage(1);
                            }}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                          <span className="ml-2 font-medium">
                            {startItem}-{endItem} de {jqlIssues.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={jqlCurrentPage === 1}
                            onClick={() => setJqlCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-[11px]"
                          >
                            ◀ Anterior
                          </button>

                          <span className="px-3 py-1 font-bold text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded border border-indigo-200 dark:border-indigo-800/60">
                            {jqlCurrentPage} / {jqlTotalPages || 1}
                          </span>

                          <button
                            type="button"
                            disabled={jqlCurrentPage >= jqlTotalPages}
                            onClick={() => setJqlCurrentPage(prev => Math.min(prev + 1, jqlTotalPages))}
                            className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-[11px]"
                          >
                            Siguiente ▶
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        </div>      </div>

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
