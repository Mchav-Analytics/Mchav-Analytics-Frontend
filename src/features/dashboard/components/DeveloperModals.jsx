import React from 'react';
import { X, ExternalLink, Send, Bell, AlertTriangle } from 'lucide-react';

export const DeveloperModals = ({
  replyModalOpen, activeReplyIssue, setReplyModalOpen, quickReplyText, setQuickReplyText, handleSendQuickReply, sendingQuickReply,
  selectedIssueModal, setSelectedIssueModal,
  alertsModalOpen, setAlertsModalOpen, alertsTab, setAlertsTab, submittedHelpRequests, showHelpSuccessToast,
  handleSubmitHelpRequest, helpIssueKey, setHelpIssueKey, assignedIssuesList, helpType, setHelpType, helpMessage, setHelpMessage,
  alerts
}) => {
  return (
    <>
      {/* MODAL RÁPIDO DE RESPUESTA */}
      {replyModalOpen && activeReplyIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {activeReplyIssue.key_issue || 'MCHAV-128'}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Responder solicitud
                </h3>
              </div>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Carlos Pérez</span>
                <span className="text-[10px] text-slate-400">Hace 15m</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "{activeReplyIssue.message || activeReplyIssue.detail}"
              </p>
            </div>

            <form onSubmit={handleSendQuickReply} className="space-y-3">
              <textarea
                required
                rows={3}
                value={quickReplyText}
                onChange={(e) => setQuickReplyText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <a
                  href={`https://beltrancamilo592.atlassian.net/browse/${activeReplyIssue.key_issue || 'MCHAV-128'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Abrir en Jira</span>
                  <ExternalLink size={12} />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={sendingQuickReply}
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>{sendingQuickReply ? 'Enviando...' : 'Enviar respuesta'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE DE TAREA */}
      {selectedIssueModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] w-[95vw] sm:max-w-3xl rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-400 border border-slate-700 rounded">
                  {selectedIssueModal.key_issue}
                </span>
                <span className="px-2 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded">
                  {selectedIssueModal.status_actual}
                </span>
              </div>
              <button
                onClick={() => setSelectedIssueModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedIssueModal.summary}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {selectedIssueModal.descripcion || 'Sin descripción detallada de Jira.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Prioridad</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{selectedIssueModal.prioridad || 'Media'}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Story Points</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{selectedIssueModal.story_points || 0} SP</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Tiempo de Ciclo</span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {selectedIssueModal.cycle_time_days > 0 ? `${selectedIssueModal.cycle_time_days} días` : 'En progreso / Reciente'}
                  </strong>
                </div>
              </div>

              {/* INFORMACIÓN DE SOLO LECTURA / HISTORIAL */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1a1d40]/60 border border-slate-200 dark:border-[#33376b] flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Tipo: <strong className="text-slate-800 dark:text-slate-200">{selectedIssueModal.tipo || 'Historia'}</strong>
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Estado actual en Jira: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedIssueModal.status_actual}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <a
                href={`https://beltrancamilo592.atlassian.net/browse/${selectedIssueModal.key_issue}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Abrir en Jira ↗</span>
              </a>
              <button
                onClick={() => setSelectedIssueModal(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ALERTAS Y SOLICITAR AYUDA */}
      {alertsModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="text-amber-400 fill-amber-400" size={18} />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Centro de Alertas & Solicitar Ayuda (Dev Workspace)
                </h3>
              </div>
              <button
                onClick={() => setAlertsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
              <button
                onClick={() => setAlertsTab('request_form')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${alertsTab === 'request_form'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                + Nueva Solicitud
              </button>
              <button
                onClick={() => setAlertsTab('sent_requests')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${alertsTab === 'sent_requests'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Mis Solicitudes ({submittedHelpRequests.length})
              </button>
              <button
                onClick={() => setAlertsTab('alerts')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${alertsTab === 'alerts'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Mis Alertas ({alerts?.length || 0})
              </button>
            </div>

            {showHelpSuccessToast && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold text-center animate-in fade-in">
                ✨ Solicitud enviada exitosamente al Líder Técnico.
              </div>
            )}

            {alertsTab === 'request_form' && (
              <form onSubmit={handleSubmitHelpRequest} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Incidencia Relacionada</label>
                    <select
                      value={helpIssueKey}
                      onChange={(e) => setHelpIssueKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {assignedIssuesList.slice(0, 5).map(i => (
                        <option key={i.key_issue} value={i.key_issue}>{i.key_issue} - {i.summary.substring(0, 25)}...</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Tipo de Apoyo Requerido</label>
                    <select
                      value={helpType}
                      onChange={(e) => setHelpType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Bloqueo Técnico">Bloqueo Técnico</option>
                      <option value="Aprobación de Pull Request">Aprobación de Pull Request</option>
                      <option value="Aclaración de Requerimiento">Aclaración de Requerimiento</option>
                      <option value="Problemas de Ambiente / Credenciales">Problemas de Ambiente / Credenciales</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Mensaje Detallado para el Líder</label>
                  <textarea
                    rows={3}
                    required
                    value={helpMessage}
                    onChange={(e) => setHelpMessage(e.target.value)}
                    placeholder="Describe el bloqueo o duda técnica requerida..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAlertsModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>Enviar a Líder</span>
                  </button>
                </div>
              </form>
            )}

            {alertsTab === 'sent_requests' && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {submittedHelpRequests.map(r => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-indigo-400 font-mono">{r.issueKey} ({r.type})</span>
                      <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 italic">"{r.message}"</p>
                    <span className="text-[10px] text-slate-500 block">{r.date}</span>
                  </div>
                ))}
              </div>
            )}

            {alertsTab === 'alerts' && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {alerts && alerts.length > 0 ? alerts.map(a => (
                  <div key={a.id || Math.random()} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                    <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">{a.description || a.title || a.text}</p>
                  </div>
                )) : (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-center">
                    <p className="text-xs text-slate-400">No hay alertas recientes.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
