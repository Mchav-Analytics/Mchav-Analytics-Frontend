import React from 'react';
import { Terminal } from 'lucide-react';

export function JqlResultsTable({
  jqlSuccess,
  jqlIssues,
  showJqlTable,
  setShowJqlTable,
  jqlCurrentPage,
  jqlPageSize
}) {
  if (!jqlSuccess) return null;

  const jqlTotalPages = Math.max(1, Math.ceil(jqlIssues.length / jqlPageSize));
  const startIdx = (jqlCurrentPage - 1) * jqlPageSize;
  const paginatedJqlIssues = jqlIssues.slice(startIdx, startIdx + jqlPageSize);

  return (
    <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/50 shadow-xs">
      <button
        type="button"
        onClick={() => setShowJqlTable(!showJqlTable)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Terminal size={15} className="text-indigo-500" /> Previsualización de Resultados
          <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
            {jqlIssues.length} {jqlIssues.length === 1 ? 'incidencia' : 'incidencias'}
          </span>
        </span>
      </button>

      {showJqlTable && (
        <div className="overflow-x-auto border-t border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3">Clave</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Resumen</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Asignado a</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedJqlIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    No se encontraron incidencias para esta consulta.
                  </td>
                </tr>
              ) : (
                paginatedJqlIssues.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                      {issue.key || issue.key_issue || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {issue.fields?.issuetype?.name || issue.issue_type || issue.tipo || 'Story'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {issue.fields?.summary || issue.summary || issue.resumen || 'Sin resumen'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {issue.fields?.status?.name || issue.status_actual || issue.estado || 'Abierto'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {issue.fields?.assignee?.displayName || issue.assignee_name || issue.asignado || 'Sin Asignar'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
