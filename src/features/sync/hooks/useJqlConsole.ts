import { useState, useRef } from 'react';
import { jqlService } from '../../../services/api';

export function useJqlConsole() {
  const [jqlQuery, setJqlQuery] = useState('project = "10000" AND status in ("In Progress", "En curso")');
  const [jqlError, setJqlError] = useState('');
  const [jqlSuccess, setJqlSuccess] = useState('');
  const [isExecutingJql, setIsExecutingJql] = useState(false);
  const [jqlIssues, setJqlIssues] = useState<any[]>([]);
  const [showJqlTable, setShowJqlTable] = useState(true);
  const [showDictionaryTable, setShowDictionaryTable] = useState(false);
  const [jqlCurrentPage, setJqlCurrentPage] = useState(1);
  const [jqlPageSize, setJqlPageSize] = useState(5);

  const dictScrollRef = useRef<HTMLDivElement>(null);
  const [copiedJqlIdx, setCopiedJqlIdx] = useState<number | null>(null);
  const [dictionarySearch, setDictionarySearch] = useState('');
  const [selectedDictCategory, setSelectedDictCategory] = useState('TODAS');

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

  const handleScrollLeft = () => {
    dictScrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    dictScrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' });
  };

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

  return {
    jqlQuery,
    setJqlQuery,
    jqlError,
    jqlSuccess,
    isExecutingJql,
    jqlIssues,
    showJqlTable,
    setShowJqlTable,
    showDictionaryTable,
    setShowDictionaryTable,
    jqlCurrentPage,
    setJqlCurrentPage,
    jqlPageSize,
    setJqlPageSize,
    dictScrollRef,
    copiedJqlIdx,
    dictionarySearch,
    setDictionarySearch,
    selectedDictCategory,
    setSelectedDictCategory,
    jqlDictionaryList,
    handleScrollLeft,
    handleScrollRight,
    handleCopyToClipboard,
    handleLoadIntoConsole,
    handleExecuteJql,
    exportJqlToCsv
  };
}
