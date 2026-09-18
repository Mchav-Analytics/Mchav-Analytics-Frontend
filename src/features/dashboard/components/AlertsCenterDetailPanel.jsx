import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Folder, AlertCircle, User, Calendar, Send, Sparkles, Check, TrendingUp } from 'lucide-react';

export const AlertsCenterDetailPanel = ({ item, onClose, onAddComment, onToggleStatus }) => {
  const [text, setText] = useState('');

  if (!item) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (onAddComment) {
      onAddComment(item.id, text.trim());
    }
    setText('');
  };

  const isResolved = item.status === 'RESUELTO';
  const isInProgress = item.status === 'EN_PROCESO';

  const totalComments = 1 + (item.comments ? item.comments.length : 0);

  return (
    <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] rounded-3xl p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
      {/* ── HEADER DE DETALLE: BOTÓN ATRÁS + TÍTULO + BADGE ESTADO + BOTÓN MARCAR RESUELTO ── */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Volver"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
            {item.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${
            isResolved
              ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-500/30'
              : isInProgress
              ? 'bg-yellow-50 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-200/80 dark:border-yellow-500/40'
              : 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-500/30'
          }`}>
            {isResolved ? (
              <>
                <Check size={13} strokeWidth={2.5} />
                <span>Resuelto</span>
              </>
            ) : isInProgress ? (
              <>
                <TrendingUp size={13} strokeWidth={2.5} />
                <span>En proceso</span>
              </>
            ) : (
              <>
                <MessageSquare size={13} strokeWidth={2.5} />
                <span>Pendiente</span>
              </>
            )}
          </span>

          {onToggleStatus && (
            <button
              type="button"
              onClick={() => onToggleStatus(item.id, isResolved ? 'PENDIENTE' : 'RESUELTO')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                isResolved
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/25'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
              }`}
              title={isResolved ? "Reabrir este feedback" : "Marcar este feedback como resuelto"}
            >
              <Check size={14} strokeWidth={2.5} />
              <span>{isResolved ? 'Reabrir' : 'Marcar Resuelto'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── METADATOS: PROYECTO, PRIORIDAD, PARA, FECHA ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-[#1a1e3b]/50 border border-slate-100 dark:border-slate-800/80 text-xs">
        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 flex items-center gap-1 mb-1">
            <Folder size={13} className="text-indigo-500" />
            <span>Proyecto</span>
          </span>
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{item.project || 'Sistema Analytics MCHAV'}</span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 flex items-center gap-1 mb-1">
            <AlertCircle size={13} className="text-amber-500" />
            <span>Prioridad</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold">
            {item.priority || 'Media'}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 flex items-center gap-1 mb-1">
            <User size={13} className="text-purple-500" />
            <span>Para</span>
          </span>
          <span className="font-extrabold text-slate-700 dark:text-slate-200">{item.recipient || 'Camilo Corredor (Líder Técnico)'}</span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 flex items-center gap-1 mb-1">
            <Calendar size={13} className="text-slate-400" />
            <span>Fecha</span>
          </span>
          <span className="font-semibold text-slate-600 dark:text-slate-400">{item.timeAgo || 'Reciente'}</span>
        </div>
      </div>

      {/* ── SECCIÓN DESCRIPCIÓN ── */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Descripción
        </h3>
        <div className="bg-slate-50 dark:bg-[#1a1e3b]/80 border border-slate-200/60 dark:border-slate-800 p-4.5 rounded-2xl text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed shadow-xs">
          {item.summary}
        </div>
      </div>

      {/* ── HILO DE CONVERSACIÓN & COMENTARIOS ── */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
          <span>Conversación & Comentarios ({totalComments})</span>
        </h3>

        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
          {/* Mensaje Inicial del Autor */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              {item.avatar || (item.author ? item.author[0] : 'U')}
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white">{item.author || 'Valentina Montalvo'}</span>
                <span className="text-[10px] font-semibold text-slate-400">{item.timeAgo || '16 sep 2026, 10:24 a. m.'}</span>
              </div>
              <div className="bg-blue-50/70 dark:bg-indigo-950/30 border border-blue-100 dark:border-indigo-900/40 p-4 rounded-2xl text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                {item.summary}
              </div>
            </div>
          </div>

          {/* Comentarios subsecuentes */}
          {item.comments && item.comments.length > 0 && item.comments.map((com, idx) => (
            <div key={com.id || idx} className="flex items-start gap-3 pl-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                {(com.author || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{com.author}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{com.time || 'Reciente'}</span>
                </div>
                <div className="bg-blue-50/70 dark:bg-indigo-950/30 border border-blue-100 dark:border-indigo-900/40 p-4 rounded-2xl text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                  {com.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INPUT PARA RESPONDER / COMENTAR (IMAGEN 2) ── */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe una respuesta o aclaración..."
          className="flex-1 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all shadow-xs"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
          title="Enviar respuesta"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
