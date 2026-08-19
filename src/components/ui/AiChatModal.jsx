// ============================================================================
// COMPONENTE: VENTANA CONVERSACIONAL DE IA (AI CHAT MODAL - GEMINI ENGINE)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Bot, User, RefreshCw, MessageSquare, Lightbulb } from 'lucide-react';
import owlMascotImg from '../../assets/owl_mascot.png';
import { aiService } from '../../services/api';

export default function AiChatModal({ isOpen, onClose, selectedProjectId = 'PROJ-01' }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '¡Hola! 🦉 Soy tu **AI Dev Coach** impulsado por el motor de **Google Gemini**. ¿En qué puedo ayudarte hoy sobre el rendimiento, métricas o agilidad de tus proyectos?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "¿Cuál es la salud actual de nuestro sprint?",
    "¿Quiénes son los desarrolladores con mayor WIP?",
    "¿Qué cuellos de botella tenemos activos en QA o Review?",
    "¿Cómo podemos reducir el Cycle Time en el equipo?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend = null) => {
    const queryText = (textToSend || inputText).trim();
    if (!queryText || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Historial para enviar al backend
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

      setMessages(prev => [...prev, aiReplyMessage]);
    } catch (err) {
      console.error("Error en chat Gemini AI:", err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "⚠️ Tuve un inconveniente al conectar con el motor de IA. Verifica tu API Key en el `.env` o intenta nuevamente.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[650px] max-h-[90vh] rounded-3xl bg-[#0e122b] border border-indigo-500/40 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* ── HEADER DEL CHAT DE IA ── */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#14183b] via-[#1c1f4e] to-[#14183b] border-b border-indigo-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={owlMascotImg}
                alt="Mascota Búho AI Coach"
                className="w-10 h-10 object-contain drop-shadow-md"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                  AI Dev Coach — Conversación Inteligente
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  ⚡ Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Responde preguntas en tiempo real sobre métricas, velocidad y agilidad del proyecto {selectedProjectId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            title="Cerrar ventana de chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── ÁREA DE MENSAJES CON SCROLL ── */}
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
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed space-y-1 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                    : 'bg-slate-900/90 border border-slate-700/70 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-medium">
                  {msg.text}
                </div>
                <div
                  className={`text-[9px] font-semibold text-right ${
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
              <span className="italic font-medium">AI Coach pensando respuesta con Gemini API...</span>
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
            placeholder="Pregúntale lo que quieras sobre tus métricas o proyectos a la IA..."
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
  );
}
