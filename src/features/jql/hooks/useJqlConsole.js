import { useState } from 'react';
import { automationService, jqlService } from '../../../services/api';

export function useJqlConsole() {
  const [jqlQuery, setJqlQuery] = useState('project = "10000"');
  const [isExecutingJql, setIsExecutingJql] = useState(false);
  const [jqlSuccess, setJqlSuccess] = useState(null);
  const [jqlError, setJqlError] = useState(null);
  const [jqlIssues, setJqlIssues] = useState([]);
  const [showJqlTable, setShowJqlTable] = useState(true);
  const [jqlCurrentPage, setJqlCurrentPage] = useState(1);
  const [showDictionaryTable, setShowDictionaryTable] = useState(false);
  const [dictionarySearch, setDictionarySearch] = useState('');
  
  // Historial de auditoría de consultas JQL ejecutadas
  const [jqlAuditLog, setJqlAuditLog] = useState([
    { id: 1, query: 'project = "10000" AND status = "In Progress"', status: 'Exitoso', count: 8, timeMs: 142, date: 'Hoy, 08:30 AM' },
    { id: 2, query: 'project = "10000" AND issuetype = Bug', status: 'Exitoso', count: 3, timeMs: 98, date: 'Ayer, 04:15 PM' },
    { id: 3, query: 'project = "10000" AND assignee is EMPTY', status: 'Exitoso', count: 4, timeMs: 110, date: '12 Ago, 02:40 PM' }
  ]);

  const jqlPageSize = 5;

  const handleExecuteJql = async (e) => {
    if (e) e.preventDefault();
    if (!jqlQuery.trim()) {
      setJqlError('Por favor ingresa una consulta JQL válida.');
      return;
    }

    setIsExecutingJql(true);
    setJqlError(null);
    setJqlSuccess(null);

    const startTime = performance.now();

    try {
      let result;
      if (jqlService && typeof jqlService.executeJql === 'function') {
        result = await jqlService.executeJql(jqlQuery.trim());
      } else {
        result = await automationService.executeJqlQuery(jqlQuery.trim());
      }
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);

      if (result.success !== false) {
        const issuesList = result.issues || result.incidencias || [];
        setJqlIssues(issuesList);
        setJqlSuccess(`Sintaxis JQL válida. ${issuesList.length} incidencias encontradas (${elapsed}ms).`);
        setShowJqlTable(true);
        setJqlCurrentPage(1);

        // Agregar al historial de auditoría
        setJqlAuditLog(prev => [
          {
            id: Date.now(),
            query: jqlQuery.trim(),
            status: 'Exitoso',
            count: issuesList.length,
            timeMs: elapsed,
            date: 'Justo ahora'
          },
          ...prev.slice(0, 9)
        ]);
      } else {
        setJqlError(result.detail || result.error || 'La consulta JQL contiene errores sintácticos.');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error al conectar con el motor validador JQL.';
      setJqlError(msg);
    } finally {
      setIsExecutingJql(false);
    }
  };

  const exportJqlToCsv = () => {
    if (jqlIssues.length === 0) return;
    const headers = ['Clave', 'Tipo', 'Resumen', 'Estado', 'Asignado'];
    const rows = jqlIssues.map(i => [
      `"${i.key || i.key_issue || 'N/A'}"`,
      `"${i.fields?.issuetype?.name || i.issue_type || i.tipo || 'Story'}"`,
      `"${(i.fields?.summary || i.summary || i.resumen || '').replace(/"/g, '""')}"`,
      `"${i.fields?.status?.name || i.status_actual || i.estado || 'Abierto'}"`,
      `"${i.fields?.assignee?.displayName || i.assignee_name || i.asignado || 'Sin Asignar'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `consultas_jql_resultados_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    jqlQuery,
    setJqlQuery,
    isExecutingJql,
    jqlSuccess,
    jqlError,
    jqlIssues,
    showJqlTable,
    setShowJqlTable,
    jqlCurrentPage,
    setJqlCurrentPage,
    showDictionaryTable,
    setShowDictionaryTable,
    dictionarySearch,
    setDictionarySearch,
    jqlAuditLog,
    jqlPageSize,
    handleExecuteJql,
    exportJqlToCsv
  };
}
