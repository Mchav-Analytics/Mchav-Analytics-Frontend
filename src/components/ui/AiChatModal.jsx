// ============================================================================
// COMPONENTE: VENTANA CONVERSACIONAL DE IA CON HISTORIAL DE CHATS (GEMINI ENGINE)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  User,
  Plus,
  Trash2,
  History,
  MessageSquare,
  PanelLeft,
  Lightbulb,
  Check,
  ChevronRight
} from 'lucide-react';
import owlMascotImg from '../../assets/owl_mascot.png';
import { aiService } from '../../services/api';

const DEFAULT_WELCOME_MESSAGE = {
  id: 1,
  sender: 'ai',
  text: '¡Hola! 🦉 Soy **NubI IA**, tu asistente inteligente y analista de agilidad impulsado por el motor de **Google Gemini**. ¿En qué puedo ayudarte hoy sobre el rendimiento, métricas o desarrolladores de tus proyectos?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export default function AiChatModal({ isOpen, onClose, selectedProjectId = 'PROJ-01' }) {
  // ── ESTADOS DE HISTORIAL Y SESIONES DE CHAT ──
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('mchav_ai_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error cargando historial de chats:", e);
    }
    const initId = `chat-${Date.now()}`;
    return [
      {
        id: initId,
        title: 'Nueva Conversación',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: [DEFAULT_WELCOME_MESSAGE]
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    try {
      const saved = localStorage.getItem('mchav_ai_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
    } catch (e) {}
    return sessions[0]?.id || `chat-${Date.now()}`;
  });

  const [showHistorySidebar, setShowHistorySidebar] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "¿Cuál es el desempeño individual de cada desarrollador?",
    "¿Cuál es la salud actual de nuestro sprint?",
    "¿Quiénes son los desarrolladores con mayor WIP?",
    "¿Qué cuellos de botella tenemos activos en QA o Review?",
    "¿Cómo podemos reducir el Cycle Time en el equipo?"
  ];

  // Guardar en localStorage ante cualquier cambio de sesiones
  useEffect(() => {
    try {
      localStorage.setItem('mchav_ai_chat_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn("Error guardando sesiones en localStorage:", e);
    }
  }, [sessions]);

  // Sesión activa actual
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = currentSession ? currentSession.messages : [DEFAULT_WELCOME_MESSAGE];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, activeSessionId]);

  if (!isOpen) return null;

  // ── CREAR NUEVO HILO DE CHAT ──
  const handleCreateNewSession = () => {
    const newId = `chat-${Date.now()}`;
    const newSession = {
      id: newId,
      title: 'Nueva Conversación',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          ...DEFAULT_WELCOME_MESSAGE,
          id: Date.now()
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  // ── ELIMINAR SESIÓN ──
  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (filtered.length === 0) {
        const freshId = `chat-${Date.now()}`;
        const freshSession = {
          id: freshId,
          title: 'Nueva Conversación',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: [DEFAULT_WELCOME_MESSAGE]
        };
        setActiveSessionId(freshId);
        return [freshSession];
      }
      if (sessionId === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // ── LIMPIAR TODO EL HISTORIAL ──
  const handleClearAllHistory = () => {
    if (window.confirm("¿Deseas borrar todo el historial de conversaciones guardadas?")) {
      const freshId = `chat-${Date.now()}`;
      const freshSession = {
        id: freshId,
        title: 'Nueva Conversación',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: [DEFAULT_WELCOME_MESSAGE]
      };
      setSessions([freshSession]);
      setActiveSessionId(freshId);
      localStorage.removeItem('mchav_ai_chat_sessions');
    }
  };

  // ── ENVIAR MENSAJE A LA IA ──
  const handleSendMessage = async (textToSend = null) => {
    const queryText = (textToSend || inputText).trim();
    if (!queryText || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Actualizar el título de la sesión si es la primera pregunta
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const isDefaultTitle = s.title === 'Nueva Conversación';
        const newTitle = isDefaultTitle ? queryText.slice(0, 32) + (queryText.length > 32 ? '...' : '') : s.title;
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, userMessage]
        };
      }
      return s;
    }));

    setInputText('');
    setIsLoading(true);

    try {
      // Historial para context de Gemini
      const historyPayload = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await aiService.chat(queryText, selectedProjectId, historyPayload);

      const aiReplyMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.reply || "He procesado tu consulta pero no pude generar una respuesta detallada.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, aiReplyMessage]
          };
        }
        return s;
      }));
    } catch (err) {
      console.error("Error en chat Gemini AI:", err);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "⚠️ Tuve un inconveniente al conectar con el motor de IA. Verifica tu API Key en el `.env` o intenta nuevamente.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, errorMessage]
          };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── PARSER DE MARKDOWN ENRIQUECIDO (CON SOPORTE PARA TABLAS, LÍNEAS Y LISTAS) ──
  const renderFormattedMarkdown = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    let inTable = false;
    let tableRows = [];
    const elements = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Detectar filas de tablas markdown | col1 | col2 |
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        // Ignorar separadores | --- | --- |
        if (trimmed.includes('---')) return;
        
        const cols = trimmed.split('|').filter(c => c !== '').map(c => c.trim());
        tableRows.push(cols);
        return;
      } else if (inTable) {
        // Renderizar la tabla acumulada
        if (tableRows.length > 0) {
          const header = tableRows[0];
          const body = tableRows.slice(1);
          elements.push(
            <div key={`table-${idx}`} className="my-3 overflow-x-auto rounded-xl border border-indigo-500/30 bg-slate-950/70 p-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-indigo-500/30 bg-indigo-950/50 text-indigo-300 font-extrabold">
                    {header.map((h, i) => (
                      <th key={i} className="p-2">{h.replace(/\*\*/g, '')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-800/60 hover:bg-slate-900/60">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2 font-medium text-slate-200">
                          {cell.replace(/\*\*/g, '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          tableRows = [];
        }
        inTable = false;
      }

      // Encabezados markdown ### / ## / #
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        const titleText = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
        elements.push(
          <h4 key={idx} className="font-extrabold text-sm text-indigo-300 pt-3 pb-1 border-b border-indigo-500/20 flex items-center gap-2">
            <span>{titleText}</span>
          </h4>
        );
        return;
      }

      // Separadores horizontal ---
      if (trimmed === '---') {
        elements.push(<hr key={idx} className="my-3 border-indigo-500/20" />);
        return;
      }

      // Viñetas * o -
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const bulletText = trimmed.substring(2);
        elements.push(
          <div key={idx} className="flex items-start gap-2 text-slate-200 text-xs sm:text-sm pl-2 py-0.5">
            <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
            <span>{renderBoldInline(bulletText)}</span>
          </div>
        );
        return;
      }

      // Párrafo standard
      if (trimmed !== '') {
        elements.push(
          <p key={idx} className="text-xs sm:text-sm leading-relaxed text-slate-200">
            {renderBoldInline(line)}
          </p>
        );
      } else {
        elements.push(<div key={idx} className="h-1.5" />);
      }
    });

    // Si la tabla quedó pendiente al final
    if (inTable && tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(1);
      elements.push(
        <div key="table-end" className="my-3 overflow-x-auto rounded-xl border border-indigo-500/30 bg-slate-950/70 p-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-indigo-500/30 bg-indigo-950/50 text-indigo-300 font-extrabold">
                {header.map((h, i) => (
                  <th key={i} className="p-2">{h.replace(/\*\*/g, '')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-800/60 hover:bg-slate-900/60">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2 font-medium text-slate-200">
                      {cell.replace(/\*\*/g, '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  // Helper para renderizar negritas **texto** dentro de líneas
  const renderBoldInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full ${showHistorySidebar ? 'max-w-5xl' : 'max-w-3xl'} h-[700px] max-h-[92vh] rounded-3xl bg-[#0e122b] border border-indigo-500/40 shadow-2xl flex overflow-hidden text-slate-100 transition-all duration-300`}>
        
        {/* ── PANEL LATERAL IZQUIERDO: HISTORIAL DE CONVERSACIONES ── */}
        {showHistorySidebar && (
          <div className="w-72 bg-[#090b1c] border-r border-indigo-500/20 flex flex-col justify-between shrink-0 animate-in slide-in-from-left duration-200">
            
            {/* Header del Panel de Historial */}
            <div className="p-4 border-b border-indigo-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <History size={15} /> Historial de Chats
                </span>
                <button
                  type="button"
                  onClick={() => setShowHistorySidebar(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Ocultar historial"
                >
                  <PanelLeft size={16} />
                </button>
              </div>

              {/* Botón Nuevo Chat */}
              <button
                type="button"
                onClick={handleCreateNewSession}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Nuevo Chat ➕</span>
              </button>
            </div>

            {/* Lista de Sesiones / Hilos de Chat */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-left">
              {sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/50 border-indigo-500/60 shadow-md text-white'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-indigo-500/30 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <MessageSquare size={14} className={isActive ? 'text-indigo-300 shrink-0' : 'text-slate-500 shrink-0'} />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-extrabold truncate leading-snug">{s.title}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{s.createdAt} • {s.messages.length} mensajes</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      title="Eliminar esta conversación"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer del Historial */}
            <div className="p-3 border-t border-indigo-500/20 bg-slate-950/60 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400">{sessions.length} conversaciones</span>
              <button
                type="button"
                onClick={handleClearAllHistory}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={12} /> Borrar todo
              </button>
            </div>

          </div>
        )}

        {/* ── SECCIÓN PRINCIPAL: VENTANA DEL CHAT ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── HEADER DEL CHAT DE IA ── */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#14183b] via-[#1c1f4e] to-[#14183b] border-b border-indigo-500/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {!showHistorySidebar && (
                <button
                  type="button"
                  onClick={() => setShowHistorySidebar(true)}
                  className="p-2 rounded-xl text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 hover:bg-indigo-900/80 transition-all cursor-pointer mr-1"
                  title="Ver historial de chats"
                >
                  <History size={16} />
                </button>
              )}

              <div className="relative">
                <img
                  src={owlMascotImg}
                  alt="Mascota Búho NubI IA"
                  className="w-10 h-10 object-contain drop-shadow-md"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                    NubI IA — Conversación Inteligente
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    ⚡ Gemini Engine
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {currentSession.title} • Proyecto: <strong className="text-slate-200 font-bold">{selectedProjectId}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreateNewSession}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hidden sm:flex"
                title="Iniciar nuevo chat"
              >
                <Plus size={14} /> Nuevo Chat
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
                title="Cerrar ventana de chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── ÁREA DE MENSAJES CON SCROLL Y FORMATEO MARKDOWN ── */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 text-left">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-1 shadow-sm">
                    <Sparkles size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed space-y-2 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                      : 'bg-slate-900/90 border border-slate-700/70 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="space-y-1">
                    {msg.sender === 'ai' ? renderFormattedMarkdown(msg.text) : <div className="whitespace-pre-wrap font-medium">{msg.text}</div>}
                  </div>
                  <div
                    className={`text-[9px] font-semibold text-right pt-1 ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-2xl bg-purple-600/40 border border-purple-500/40 flex items-center justify-center text-purple-200 shrink-0 mt-1 shadow-sm">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center text-slate-400 text-xs animate-pulse">
                <div className="w-8 h-8 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <Sparkles size={16} className="animate-spin" />
                </div>
                <span className="italic font-medium">NubI IA analizando datos reales con Gemini...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── PREGUNTAS SUGERIDAS (CHIPS) ── */}
          <div className="px-6 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-left">
            <Lightbulb size={14} className="text-amber-400 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Sugerencias:</span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 transition-all whitespace-nowrap cursor-pointer hover:border-indigo-400"
              >
                {q}
              </button>
            ))}
          </div>

          {/* ── FOOTER DE ENTRADA DE TEXTO ── */}
          <div className="p-4 bg-[#111433] border-t border-indigo-500/20 flex items-center gap-2 shrink-0">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregúntale lo que quieras sobre tus métricas o desarrolladores a la IA..."
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none resize-none"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="h-10 w-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              title="Enviar mensaje"
            >
              <Send size={16} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
