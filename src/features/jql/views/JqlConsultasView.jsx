// ============================================================================
// FEATURE JQL — VISTA DE CONSULTAS JQL & VALIDADOR SINTÁCTICO DEDICADO (SÓLO ADMIN)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  Download,
  Database,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Info,
  Sliders,
  Sparkles,
  FileCode2,
  Code2
} from 'lucide-react';
import { automationService, jqlService } from '../../../services/api';

// Diccionario explicativo de sintaxis JQL
const JQL_DICTIONARY = [
  { field: 'project', description: 'Filtra por clave o ID del proyecto.', example: 'project = "MCHAV" OR project = "PROJ-01"', type: 'Texto / ID' },
  { field: 'status', description: 'Estado del flujo (To Do, In Progress, Done).', example: 'status in ("In Progress", "Code Review")', type: 'Estado' },
  { field: 'assignee', description: 'Usuario asignado a la incidencia.', example: 'assignee = currentUser() OR assignee is EMPTY', type: 'Usuario' },
  { field: 'priority', description: 'Nivel de prioridad del ticket (Highest, High, Medium, Low).', example: 'priority in (High, Highest)', type: 'Prioridad' },
  { field: 'issuetype', description: 'Tipo de tarea (Story, Bug, Task, Epic).', example: 'issuetype in (Bug, Error)', type: 'Tipo Incidencia' },
  { field: 'updated', description: 'Fecha o antigüedad de la última actualización.', example: 'updated >= -7d ORDER BY updated DESC', type: 'Fecha' },
  { field: 'created', description: 'Rango de fechas de creación de la incidencia.', example: 'created >= "2026-01-01"', type: 'Fecha' },
  { field: 'story_points', description: 'Estimación en Puntos de Historia.', example: 'story_points > 3', type: 'Número' }
];

export default function JqlConsultasView() {
  const [jqlQuery, setJqlQuery] = useState('project = "10000"');
  const [isExecutingJql, setIsExecutingJql] = useState(false);
  const [jqlSuccess, setJqlSuccess] = useState(null);
  const [jqlError, setJqlError] = useState(null);
  const [jqlIssues, setJqlIssues] = useState([]);
  const [showJqlTable, setShowJqlTable] = useState(true);
  const [jqlCurrentPage, setJqlCurrentPage] = useState(1);
  const [showDictionaryTable, setShowDictionaryTable] = useState(false);
  const [dictionarySearch, setDictionarySearch] = useState('');
  const jqlPageSize = 5;

  // Historial de auditoría de consultas JQL ejecutadas
  const [jqlAuditLog, setJqlAuditLog] = useState([
    { id: 1, query: 'project = "10000" AND status = "In Progress"', status: 'Exitoso', count: 8, timeMs: 142, date: 'Hoy, 08:30 AM' },
    { id: 2, query: 'project = "10000" AND issuetype = Bug', status: 'Exitoso', count: 3, timeMs: 98, date: 'Ayer, 04:15 PM' },
    { id: 3, query: 'project = "10000" AND assignee is EMPTY', status: 'Exitoso', count: 4, timeMs: 110, date: '12 Ago, 02:40 PM' }
  ]);

  // Ejecutar consulta JQL contra el backend
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

  // Exportar resultados de JQL a archivo CSV
  const exportJqlToCsv = () => {
    if (jqlIssues.length === 0) return;
    const headers = ['Clave', 'Tipo', 'Resumen', 'Estado', 'Asignado'];
    const rows = jqlIssues.map(i => [
      `"${i.key || i.key_issue || 'N/A'}"`,
      `"${i.issue_type || i.tipo || 'Story'}"`,
      `"${(i.summary || i.resumen || '').replace(/"/g, '""')}"`,
      `"${i.status_actual || i.estado || 'Abierto'}"`,
      `"${i.assignee_name || i.asignado || 'Sin Asignar'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,﻿' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `consultas_jql_resultados_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDictionary = JQL_DICTIONARY.filter(item =>
    item.field.toLowerCase().includes(dictionarySearch.toLowerCase()) ||
    item.description.toLowerCase().includes(dictionarySearch.toLowerCase()) ||
    item.type.toLowerCase().includes(dictionarySearch.toLowerCase())
  );

  const [showAuditDrawer, setShowAuditDrawer] = useState(false);

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in duration-200 pb-10">
      
      {/* 1. ENCABEZADO ORGÁNICO E INTEGRADO (Sin fondo de tarjeta azul) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="text-indigo-600 dark:text-indigo-400">
              <Code2 size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              Consultas JQL
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Motor de consulta analítica y validación en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => setShowAuditDrawer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <RefreshCcw size={14} /> Historial de Consultas
          </button>
        </div>
      </div>

      {/* ÁREA SUPERIOR: CONSOLA FULL WIDTH */}
      <div className="bg-white/80 dark:bg-[#191c3d]/80 backdrop-blur-xl border border-slate-200/50 dark:border-[#33376b]/50 rounded-[2rem] p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Terminal className="text-indigo-600 dark:text-indigo-400" size={22} />
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                CONSULTA JQL
              </h2>
            </div>
          </div>
          <button 
            onClick={() => setJqlQuery('')}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            [Limpiar]
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Presets Rápidos
          </label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setJqlQuery('project = "10000"')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-800/50">[Incidencias]</button>
            <button onClick={() => setJqlQuery('project = "10000" AND status in ("In Progress", "En curso")')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-800/50">[En progreso]</button>
            <button onClick={() => setJqlQuery('project = "10000" AND issuetype in (Bug, Error) AND status != Done')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-800/50">[Bugs]</button>
            <button onClick={() => setJqlQuery('project = "10000" AND priority in (High, Highest)')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-800/50">[Alta prioridad]</button>
          </div>
        </div>

        <form onSubmit={handleExecuteJql} className="space-y-4">
          <textarea
            id="jql-console-textarea"
            rows={5}
            value={jqlQuery}
            onChange={(e) => setJqlQuery(e.target.value)}
            placeholder='project = "10000" AND status = "In Progress"'
            className="w-full bg-slate-950 text-emerald-400 border-2 border-slate-800 rounded-2xl p-5 text-sm font-mono outline-none focus:border-indigo-500 shadow-inner leading-relaxed resize-none"
          />

          {jqlSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 size={16} />
              ✓ Sintaxis válida ({jqlIssues.length} resultados)
            </div>
          )}
          
          {jqlError && (
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
              <AlertTriangle size={16} />
              ✕ {jqlError}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isExecutingJql}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isExecutingJql ? (
                <><RefreshCcw size={16} className="animate-spin" /> Ejecutando...</>
              ) : (
                <><Play size={16} fill="currentColor" /> ▶ Ejecutar consulta</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ÁREA INFERIOR: DICCIONARIO Y RESULTADOS (SIDE-BY-SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* DICCIONARIO DE CAMPOS JQL (IZQUIERDA, 4 COLUMNAS) */}
        <div className="lg:col-span-4 bg-white/80 dark:bg-[#191c3d]/80 backdrop-blur-xl border border-slate-200/50 dark:border-[#33376b]/50 rounded-[2rem] p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <BookOpen className="text-indigo-600 dark:text-indigo-400" size={18} />
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Diccionario JQL
            </h3>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={dictionarySearch}
              onChange={(e) => setDictionarySearch(e.target.value)}
              placeholder="Buscar campo (ej. assignee)..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {filteredDictionary.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => setJqlQuery(item.example)}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-pointer group"
                title="Clic para probar este ejemplo"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    {item.field}
                  </span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{item.description}</p>
                <code className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1.5 truncate">
                  {item.example}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* RESULTADOS O ESTADO VACÍO (DERECHA, 8 COLUMNAS) */}
        <div className="lg:col-span-8 bg-white/80 dark:bg-[#191c3d]/80 backdrop-blur-xl border border-slate-200/50 dark:border-[#33376b]/50 rounded-[2rem] shadow-2xl p-8 min-h-[500px]">
          
          {!jqlSuccess && !jqlError ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-10 opacity-70">
               <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Database size={24} />
               </div>
               <div>
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">Tu consulta aparecerá aquí</h3>
                  <p className="text-xs text-slate-500">Ejecuta una consulta JQL para explorar las incidencias encontradas.</p>
               </div>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                 <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                   RESULTADOS DE LA CONSULTA
                 </h3>
                 <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500">{jqlIssues.length} incidencias</span>
                    <button onClick={exportJqlToCsv} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 transition-colors">
                       <Download size={16} />
                    </button>
                 </div>
               </div>

               <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <span className="text-indigo-600 dark:text-indigo-400">{jqlIssues.length} resultados</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>● {jqlIssues.filter(i => (i.status_actual || i.estado)?.toLowerCase().includes('do')).length} To Do</span>
                  <span>● {jqlIssues.filter(i => (i.status_actual || i.estado)?.toLowerCase().includes('progress')).length} Progress</span>
                  <span>● {jqlIssues.filter(i => (i.status_actual || i.estado)?.toLowerCase().includes('done')).length} Done</span>
               </div>

               <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-700">
                       <th className="px-4 py-3">KEY</th>
                       <th className="px-4 py-3">RESUMEN</th>
                       <th className="px-4 py-3">ESTADO</th>
                       <th className="px-4 py-3">PRIORIDAD</th>
                     </tr>
                   </thead>
                   <tbody className="text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800/50">
                     {jqlIssues.slice(0, 15).map((issue, idx) => (
                       <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                         <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                           {issue.key || issue.key_issue || 'N/A'}
                         </td>
                         <td className="px-4 py-3 font-medium max-w-sm truncate text-slate-900 dark:text-slate-100">
                           {issue.summary || issue.resumen || 'Sin resumen'}
                         </td>
                         <td className="px-4 py-3">
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                             {issue.status_actual || issue.estado || 'Abierto'}
                           </span>
                         </td>
                         <td className="px-4 py-3 font-medium text-slate-500">
                           {issue.priority || 'Media'}
                         </td>
                       </tr>
                     ))}
                     {jqlIssues.length === 0 && (
                       <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No hay incidencias.</td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
               {jqlIssues.length > 15 && <p className="text-xs text-center text-slate-500 mt-2">Mostrando los primeros 15 resultados.</p>}
            </div>
          )}
        </div>

      </div>

      {/* MODAL / DRAWER DE HISTORIAL DE CONSULTAS */}
      {showAuditDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setShowAuditDrawer(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-[#191c3d] h-full shadow-2xl border-l border-slate-200 dark:border-[#33376b] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-[#33376b] flex items-center gap-3">
              <button onClick={() => setShowAuditDrawer(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <ChevronLeft size={20} className="text-slate-500" />
              </button>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                HISTORIAL DE CONSULTAS
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">RECIENTES</h4>
                {jqlAuditLog.map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2 cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => { setJqlQuery(item.query); setShowAuditDrawer(false); }}>
                    <code className="block text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 break-all">
                      {item.query}
                    </code>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="text-emerald-600 dark:text-emerald-400">{item.count} resultados · {item.timeMs}ms</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
