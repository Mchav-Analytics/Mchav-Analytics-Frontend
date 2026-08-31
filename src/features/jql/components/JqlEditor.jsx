import React from 'react';
import { Terminal, CheckCircle2, AlertTriangle, Download, RefreshCcw, Play, BookOpen } from 'lucide-react';

export function JqlEditor({
  jqlQuery,
  setJqlQuery,
  isExecutingJql,
  jqlSuccess,
  jqlError,
  jqlIssues,
  showDictionaryTable,
  setShowDictionaryTable,
  handleExecuteJql,
  exportJqlToCsv
}) {
  return (
    <div className="bg-white/80 dark:bg-[#191c3d]/80 backdrop-blur-xl border border-slate-200/50 dark:border-[#33376b]/50 rounded-[2rem] p-8 shadow-2xl space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Terminal className="text-indigo-600 dark:text-indigo-400" size={22} />
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Consola JQL Real con Validador Sintáctico
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspecciona comillas, paréntesis y nombres de campo con el backend antes de consultar Jira.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
          POST /api/v1/jql/execute
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Consultas Recomendadas (Presets Rápidos)
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setJqlQuery('project = "10000"')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
          >
            Todas las Incidencias
          </button>
          <button
            type="button"
            onClick={() => setJqlQuery('project = "10000" AND status in ("In Progress", "En curso")')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
          >
            En Progreso
          </button>
          <button
            type="button"
            onClick={() => setJqlQuery('project = "10000" AND status in ("To Do", "Por hacer", "Pendiente")')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
          >
            Pendientes (To Do)
          </button>
          <button
            type="button"
            onClick={() => setJqlQuery('project = "10000" AND status in ("Done", "Finalizado", "Completado")')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
          >
            Completadas (Done)
          </button>
          <button
            type="button"
            onClick={() => setJqlQuery('project = "10000" AND priority in (High, Highest, Alta) AND status not in ("Done", "Finalizado", "Completado")')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            Alta Prioridad
          </button>
          <button
            type="button"
            onClick={() => setJqlQuery('project = "10000" AND assignee is EMPTY AND status not in ("Done", "Finalizado", "Completado")')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            Sin Asignar
          </button>
          <button
            type="button"
            onClick={() => setJqlQuery('project = "10000" AND issuetype in (Bug, Error) AND status not in ("Done", "Finalizado", "Completado")')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Bugs Activos
          </button>
          <button
            type="button"
            onClick={() => setJqlQuery('project = "10000" AND updated >= -7d ORDER BY updated DESC')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Actualizadas 7 días
          </button>
        </div>
      </div>

      <form onSubmit={handleExecuteJql} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Editor de Consulta JQL
          </label>
          <textarea
            id="jql-console-textarea"
            rows={4}
            value={jqlQuery}
            onChange={(e) => setJqlQuery(e.target.value)}
            placeholder='project = "MCHAV" AND assignee = currentUser() AND status = "In Progress"'
            className="w-full bg-slate-950 text-emerald-400 border border-slate-800 rounded-2xl p-4 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner leading-relaxed"
          />
        </div>

        {jqlSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>{jqlSuccess}</span>
            </div>
            {jqlIssues.length > 0 && (
              <button
                type="button"
                onClick={exportJqlToCsv}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold transition-all shadow cursor-pointer flex items-center gap-1.5"
              >
                <Download size={13} /> Exportar CSV
              </button>
            )}
          </div>
        )}

        {jqlError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0 text-rose-500" />
            <span className="break-all">{jqlError}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setShowDictionaryTable(!showDictionaryTable)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <BookOpen size={15} />
            <span>{showDictionaryTable ? 'Ocultar Guía de Sintaxis' : 'Ver Guía de Sintaxis JQL'}</span>
          </button>

          <button
            type="submit"
            disabled={isExecutingJql}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg hover:shadow-indigo-500/25 text-white font-extrabold px-5 py-2.5 text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isExecutingJql ? (
              <>
                <RefreshCcw size={15} className="animate-spin" /> Validando Sintaxis...
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" /> Validar y Ejecutar JQL
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
