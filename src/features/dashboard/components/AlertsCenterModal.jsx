import React from 'react';
import { X, UserCheck, ShieldAlert, Info } from 'lucide-react';

export const AlertsCenterModal = ({
  showCreateModal, setShowCreateModal,
  formTitle, setFormTitle, formSummary, setFormSummary,
  formCategory, setFormCategory, formPriority, setFormPriority, formProject, setFormProject,
  formRecipient, setFormRecipient, recipientsInfo = {},
  handleCreateFeedback, projectsList = []
}) => {
  if (!showCreateModal) return null;

  const recipientsList = recipientsInfo.recipients || [];
  const roleNotice = recipientsInfo.notice || '';
  const roleLabel = recipientsInfo.roleLabel || 'Usuario';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] rounded-2xl p-6 shadow-2xl space-y-5 text-left">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#252a4e] pb-3">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Nuevo Feedback / Revisión</span>
          </h3>
          <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreateFeedback} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400">Título del Feedback</label>
            <input
              type="text"
              required
              placeholder="Ej. Mejorar documentación de APIs"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500"
            />
          </div>

          {/* DESPLEGABLE DE DESTINATARIO (A QUIÉN VA DIRIGIDO) */}
          <div className="space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-[#181c3d] border border-slate-200/80 dark:border-[#2a2f5e] space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <UserCheck size={14} className="text-indigo-500" />
                <span>Destinatario (A quién va dirigido)</span>
              </label>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black border border-indigo-500/20">
                Rol: {roleLabel}
              </span>
            </div>

            <select
              value={formRecipient}
              onChange={e => setFormRecipient(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl outline-none focus:border-indigo-500 cursor-pointer"
            >
              {recipientsList.length === 0 ? (
                <option value="">No hay usuarios disponibles para tu rol</option>
              ) : (
                recipientsList.map(u => (
                  <option key={u.id} value={u.name} className="bg-white dark:bg-slate-900 font-semibold">
                    {u.name} ({u.role === 'ADMIN' ? 'Admin' : u.role === 'MANAGER' ? 'Líder Técnico' : 'Desarrollador'})
                  </option>
                ))
              )}
            </select>

            {/* NOTA ACLARATORIA SEGÚN EL ROL */}
            {roleNotice && (
              <div className="flex items-start gap-1.5 pt-0.5">
                <Info size={13} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                  {roleNotice}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400">Descripción / Detalles</label>
            <textarea
              required
              rows={3}
              placeholder="Describe la oportunidad de mejora o hallazgo..."
              value={formSummary}
              onChange={e => setFormSummary(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400">Tipo de Feedback</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500"
              >
                <option value="Código">Código</option>
                <option value="Documentación">Documentación</option>
                <option value="Procesos">Procesos</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Arquitectura">Arquitectura</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400">Prioridad</label>
              <select
                value={formPriority}
                onChange={e => setFormPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500"
              >
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400">Proyecto Asociado</label>
            <select
              value={formProject}
              onChange={e => setFormProject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500"
            >
              {projectsList && projectsList.length > 0 ? (
                projectsList.map(p => (
                  <option key={p.id_proyecto || p.id || p.nombre} value={p.nombre || p.id_proyecto}>
                    {p.nombre || p.id_proyecto}
                  </option>
                ))
              ) : (
                <>
                  <option value="Sistema Analytics MCHAV">Sistema Analytics MCHAV</option>
                  <option value="Portal de Clientes & Seguridad">Portal de Clientes & Seguridad</option>
                  <option value="API Gateway ETL">API Gateway ETL</option>
                </>
              )}
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#1a1e3b] text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-md shadow-indigo-600/20"
            >
              Guardar Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

