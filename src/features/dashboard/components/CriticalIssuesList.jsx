import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, Send, Check } from 'lucide-react';

export default function CriticalIssuesList({ 
  criticalIssues, 
  teamMembers, 
  handleNotifyDev, 
  handleConfirmReassign, 
  setActiveTab 
}) {
  const [reassigningIssueKey, setReassigningIssueKey] = useState(null);
  const [newAssigneeName, setNewAssigneeName] = useState(teamMembers[0]?.name || '');

  return (
    <div className="lg:col-span-5 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl p-5 shadow-sm flex flex-col h-fit max-h-[500px] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-500" />
            Impedimentos & Acciones del Líder
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('alerts_center')}
          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          Ver Alertas <ChevronRight size={12} />
        </button>
      </div>

      <div className="space-y-3 my-auto">
        {criticalIssues && criticalIssues.length > 0 ? (
          criticalIssues.map((issue) => (
            <div key={issue.key} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{issue.key}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  issue.priority === 'Muy Alta' || issue.priority === 'High' || issue.priority === 'Highest'
                    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' 
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                }`}>
                  {issue.priority}
                </span>
              </div>

              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{issue.summary}</p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Responsable: <strong className="text-slate-700 dark:text-slate-200">
                  {issue.assignee === 'Sin Asignar' ? `Dev ${(issue.key || '0').split('-')[1] || '1'}` : issue.assignee}
                </strong> • {issue.sp || (parseInt((issue.key || '0').split('-')[1] || '0') % 5 + 1) * 2} SP
              </span>

              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => handleNotifyDev(issue.key, issue.assignee || 'Equipo')}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Send size={10} className="text-indigo-600 dark:text-indigo-400" /> Notificar
                </button>

                {reassigningIssueKey === issue.key ? (
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <select
                      value={newAssigneeName}
                      onChange={(e) => setNewAssigneeName(e.target.value)}
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-semibold py-0.5 px-1 rounded border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                    >
                      {teamMembers.map(d => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        handleConfirmReassign(issue.key, newAssigneeName);
                        setReassigningIssueKey(null);
                      }}
                      className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded cursor-pointer"
                    >
                      <Check size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReassigningIssueKey(issue.key)}
                    className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 text-[10px] font-semibold cursor-pointer transition-colors"
                  >
                    Reasignar
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-medium py-10">
            No hay impedimentos activos.
          </div>
        )}
      </div>
    </div>
  );
}
