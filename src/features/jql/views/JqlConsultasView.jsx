import React from 'react';
import { Code2 } from 'lucide-react';
import { useJqlConsole } from '../hooks/useJqlConsole';
import { JqlEditor } from '../components/JqlEditor';
import { JqlResultsTable } from '../components/JqlResultsTable';
import { JqlDictionary } from '../components/JqlDictionary';

export default function JqlConsultasView() {
  const {
    jqlQuery,
    setJqlQuery,
    isExecutingJql,
    jqlSuccess,
    jqlError,
    jqlIssues,
    showJqlTable,
    setShowJqlTable,
    jqlCurrentPage,
    jqlPageSize,
    showDictionaryTable,
    setShowDictionaryTable,
    dictionarySearch,
    setDictionarySearch,
    jqlAuditLog,
    handleExecuteJql,
    exportJqlToCsv
  } = useJqlConsole();

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in duration-200 pb-10">
      
      {/* ENCABEZADO DE SECCIÓN DEDICADA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shadow-inner">
              <Code2 size={22} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">Consola de Consultas JQL & Sintaxis Jira</h1>
          </div>
          <p className="text-xs text-indigo-200/80 pl-11">
            Motor de consulta analítica en tiempo real con validador sintáctico del backend de FastAPI para Jira Cloud.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            ADMIN ACCESS ONLY
          </span>
        </div>
      </div>

      {/* GRID PRINCIPAL DE CONSOLA Y DICCIONARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA (8 COLS): CONSOLA DE CONSULTA JQL REAL */}
        <div className="lg:col-span-8 space-y-6">
          <JqlEditor
            jqlQuery={jqlQuery}
            setJqlQuery={setJqlQuery}
            isExecutingJql={isExecutingJql}
            jqlSuccess={jqlSuccess}
            jqlError={jqlError}
            jqlIssues={jqlIssues}
            showDictionaryTable={showDictionaryTable}
            setShowDictionaryTable={setShowDictionaryTable}
            handleExecuteJql={handleExecuteJql}
            exportJqlToCsv={exportJqlToCsv}
          />

          <JqlResultsTable
            jqlSuccess={jqlSuccess}
            jqlIssues={jqlIssues}
            showJqlTable={showJqlTable}
            setShowJqlTable={setShowJqlTable}
            jqlCurrentPage={jqlCurrentPage}
            jqlPageSize={jqlPageSize}
          />
        </div>

        {/* COLUMNA DERECHA (4 COLS): DICCIONARIO & AUDITORÍA DE CONSULTAS JQL */}
        <JqlDictionary
          dictionarySearch={dictionarySearch}
          setDictionarySearch={setDictionarySearch}
          setJqlQuery={setJqlQuery}
          jqlAuditLog={jqlAuditLog}
        />

      </div>

    </div>
  );
}
