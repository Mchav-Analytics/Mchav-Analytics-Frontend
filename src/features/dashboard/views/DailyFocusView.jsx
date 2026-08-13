// ============================================================================
// SUB-VISTA: MI AGENDA DE HOY (ESTILO NOTION / MICROSOFT TO-DO PULIDO Y ALTO CONTRASTE)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  CheckSquare, 
  Pin,
  RotateCcw,
  Zap,
  Tag,
  Play,
  ArrowRight,
  X,
  TrendingUp,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { developerService } from '../../../services/api';
import owlMascotImg from '../../../assets/owl_mascot.png';

const DEFAULT_AGENDA_ITEMS = [
  { id: 1, text: 'MCHAV-101: Implementar autenticación SSO y OAuth 2.0', done: false, priority: 'Alta', category: 'Desarrollo', estTime: '4h', key: 'MCHAV-101' },
  { id: 2, text: 'MCHAV-105: Corregir desbordamiento en API de transacciones', done: false, priority: 'Alta', category: 'Bug QA', estTime: '2h', key: 'MCHAV-105' },
  { id: 3, text: 'MCHAV-108: Configuración de alertas de inactividad', done: false, priority: 'Media', category: 'Historia', estTime: '3h', key: 'MCHAV-108' },
  { id: 4, text: 'MCHAV-112: Dar seguimiento al PR #42 en GitHub (Code Review)', done: false, priority: 'Media', category: 'Code Review', estTime: '1h', key: 'MCHAV-112' },
  { id: 5, text: 'MCHAV-137: Actualizar dependencias de seguridad e imágenes Docker', done: true, priority: 'Baja', category: 'DevOps', estTime: '1.5h', completedAt: '11:30 AM', key: 'MCHAV-137' },
  { id: 6, text: 'MCHAV-141: Corregir desalineación de tarjetas en modo oscuro', done: true, priority: 'Baja', category: 'Frontend', estTime: '1h', completedAt: '09:15 AM', key: 'MCHAV-141' }
];

const DEFAULT_NOTES = [
  { id: 101, text: '📌 Standup de sincronización con el equipo de desarrollo a las 10:00 AM.' },
  { id: 102, text: '📌 Recordar notificar al equipo de QA tan pronto se suba la corrección de MCHAV-105.' },
  { id: 103, text: '📌 Revisar credenciales del entorno Sandbox para la próxima integración.' }
];

export default function DailyFocusView({ data: propData }) {
  const { user } = useAuth();

  const data = propData || {
    ai_coach_tip: "Tu tiempo de ciclo personal en tareas de 5 SP ha mejorado un +14% respecto al sprint anterior. Te recomendamos resolver primero el bug MCHAV-105 en QA antes de avanzar en MCHAV-101.",
    efficiency_gain_pct: 14,
    clean_deliveries_pct: 100
  };

  const [items, setItems] = useState(DEFAULT_AGENDA_ITEMS);
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState('Media');
  const [newEstTime, setNewEstTime] = useState('1h');
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedModalItem, setSelectedModalItem] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const devName = user?.nombre || 'Valka Hoyos';
  const todayDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Conmutar estado completado [x] / [ ]
  const toggleDone = (id) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextDone = !item.done;
        return {
          ...item,
          done: nextDone,
          completedAt: nextDone ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
        };
      }
      return item;
    }));
  };

  // Agregar nueva tarea a la agenda
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newItem = {
      id: Date.now(),
      text: newText,
      done: false,
      priority: newPriority,
      category: 'General',
      estTime: newEstTime,
      key: `MCHAV-${Math.floor(160 + Math.random() * 40)}`
    };

    setItems(prev => [newItem, ...prev]);
    setNewText('');
    showToast('✨ Nueva tarea agregada a tu agenda de hoy');
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setNotes(prev => [...prev, { id: Date.now(), text: `📌 ${newNoteText}` }]);
    setNewNoteText('');
    showToast('📌 Nota guardada');
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const pendingItems = items.filter(i => !i.done);
  const completedItems = items.filter(i => i.done);
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((completedItems.length / totalCount) * 100) : 0;

  return (
    <div className="w-full max-w-full flex-1 flex flex-col justify-between space-y-4 text-left font-sans transition-colors duration-300 text-slate-100">

      {/* 1. CABECERA LIMPIAN Y DIRECTA ESTILO NOTION */}
      <div className="rounded-2xl bg-[#141738] p-5 shadow-2xl border border-[#272b5c] shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black shadow-md shrink-0">
              <CheckSquare size={24} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl font-extrabold text-white flex items-center gap-2 flex-wrap">
                Mi Agenda de Hoy
                <span className="capitalize text-xs font-bold text-indigo-300 bg-indigo-500/20 px-3 py-0.5 rounded-full border border-indigo-500/30">
                  {todayDate}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Lista de tareas, prioridades y notas personales de {devName} para la jornada de hoy.
              </p>
            </div>
          </div>

          {/* BARRA DE PROGRESO DE METAS DE HOY */}
          <div className="p-3 bg-[#0c0e21] rounded-xl border border-[#232752] flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">METAS DE HOY</span>
              <span className="text-xs font-black text-[#00f5d4]">{completedItems.length} de {totalCount} Hechas ({progressPct}%)</span>
            </div>
            <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-[#00f5d4] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>

        </div>
      </div>

      {/* TOAST DE NOTIFICACIÓN RÁPIDA */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-2 shadow-lg shrink-0 animate-in fade-in">
          <Sparkles size={16} className="text-indigo-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SECCIÓN AI DEV COACH CON MASCOTA LIBRE Y BOCADILLO ADAPTATIVO */}
      <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8 px-1 py-1">
        
        {/* MASCOTA BÚHO MÁS GRANDE SALIENDO DIRECTAMENTE */}
        <div className="relative shrink-0 flex flex-col items-center group/mascot">
          <img 
            src={owlMascotImg} 
            alt="Mascota Búho AI Dev Coach" 
            className="relative w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-xl transition-transform duration-300 group-hover/mascot:scale-105" 
          />
          <span className="mt-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs">
            🦉 AI Coach
          </span>
        </div>

        {/* BOCADILLO DE DIÁLOGO ADAPTATIVO MODO CLARO / OSCURO */}
        <div className="relative flex-1 rounded-3xl bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-white dark:from-[#191c3d] dark:via-[#241e54] dark:to-[#191c3d] p-7 shadow-lg dark:shadow-2xl border border-indigo-200/80 dark:border-indigo-500/30 space-y-4 group transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-400/50">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10 dark:opacity-20 blur-md transition-opacity duration-300 group-hover:opacity-25 pointer-events-none"></div>

          {/* Flecha del bocadillo hacia la mascota (izquierda) */}
          <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[14px] border-r-indigo-50/90 dark:border-r-[#191c3d]"></div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                <Sparkles size={16} />
              </div>
              <span>Asistente Inteligente — AI Dev Coach</span>
            </div>

            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
              💡 <strong>Diagnóstico del Sprint:</strong> *"{data?.ai_coach_tip || "Tu tiempo de ciclo personal en tareas de 5 SP ha mejorado un +14% respecto al sprint anterior. Te recomendamos resolver primero el bug MCHAV-105 en QA antes de avanzar en MCHAV-101."}"*
            </p>

            <div className="flex flex-wrap gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300 pt-4 border-t border-indigo-200/60 dark:border-slate-700/60">
              <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold">
                <TrendingUp size={16} /> Ritmo: +{data?.efficiency_gain_pct || 14}% Eficiencia
              </span>
              <span className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold">
                <ShieldCheck size={16} /> Calidad: {data?.clean_deliveries_pct || 100}% Entregas Limpias
              </span>
            </div>
          </div>
        </div>

      </div>


      <form onSubmit={handleAddItem} className="rounded-2xl bg-[#141738] p-3.5 shadow-2xl border border-[#272b5c] flex flex-col sm:flex-row items-center gap-3 shrink-0">
        <div className="relative flex-1 w-full">
          <Plus size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Escribe una nueva tarea para agregar a tu agenda de hoy..."
            className="w-full pl-10 pr-4 py-2 bg-[#0c0e21] text-xs text-white placeholder-slate-400 rounded-xl border border-[#232752] focus:outline-none focus:border-indigo-500 font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="px-3 py-2 bg-[#0c0e21] text-xs text-indigo-300 font-bold rounded-xl border border-[#232752] focus:outline-none cursor-pointer"
          >
            <option value="Alta">Prioridad: Alta</option>
            <option value="Media">Prioridad: Media</option>
            <option value="Baja">Prioridad: Baja</option>
          </select>

          <select
            value={newEstTime}
            onChange={(e) => setNewEstTime(e.target.value)}
            className="px-3 py-2 bg-[#0c0e21] text-xs text-purple-300 font-bold rounded-xl border border-[#232752] focus:outline-none cursor-pointer"
          >
            <option value="30m">⏱️ Est: 30m</option>
            <option value="1h">⏱️ Est: 1h</option>
            <option value="2h">⏱️ Est: 2h</option>
            <option value="4h">⏱️ Est: 4h</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all shrink-0"
          >
            Agregar
          </button>
        </div>
      </form>

      {/* 3. CONTENIDO EN 2 COLUMNAS (LISTA DE TAREAS + NOTAS Y RECORDATORIOS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">

        {/* COLUMNA IZQUIERDA (8 COLS): LISTADO DE TAREAS (PENDIENTES + COMPLETADAS) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4 rounded-2xl bg-[#141738] p-5 shadow-2xl border border-[#272b5c]">
          
          {/* TAREAS PENDIENTES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#232752]">
              <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Clock size={15} />
                <span>TAREAS PLANIFICADAS PARA HOY ({pendingItems.length})</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {pendingItems.length > 0 ? (
                pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="group p-3.5 rounded-xl bg-[#0e112a] border border-[#232752] hover:border-indigo-500/60 transition-all flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <button
                        onClick={() => toggleDone(item.id)}
                        className="text-slate-500 hover:text-[#00f5d4] transition-colors cursor-pointer shrink-0"
                        title="Marcar como completado"
                      >
                        <Circle size={19} />
                      </button>

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="text-xs font-extrabold text-white block leading-snug truncate">
                          {item.text}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                          <span className="text-indigo-400 font-mono">{item.key || 'MCHAV'}</span>
                          <span>·</span>
                          <span className="text-purple-300">Categoría: {item.category}</span>
                          <span>·</span>
                          <span className="text-slate-200">Tiempo Est: {item.estTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                        item.priority === 'Alta' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                        item.priority === 'Media' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {item.priority}
                      </span>

                      <button
                        onClick={() => setSelectedModalItem(item)}
                        className="px-2.5 py-1 text-[11px] font-extrabold bg-[#181c45] hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg border border-indigo-500/30 transition-all cursor-pointer"
                        title="Ver detalles de la tarea"
                      >
                        Ver
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Eliminar de la agenda"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs font-semibold bg-[#0c0e21] rounded-xl border border-[#232752]">
                  🎉 ¡Felicidades! No tienes tareas pendientes en tu agenda de hoy.
                </div>
              )}
            </div>
          </div>

          {/* TAREAS COMPLETADAS HOY */}
          {completedItems.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#232752]">
              <div className="flex items-center justify-between pb-2 border-b border-[#232752]">
                <h3 className="text-xs font-extrabold text-[#00f5d4] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  <span>COMPLETADAS HOY ({completedItems.length})</span>
                </h3>
              </div>

              <div className="space-y-2">
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#064e3b]/25 border border-[#00f5d4]/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleDone(item.id)}
                        className="text-[#00f5d4] cursor-pointer shrink-0"
                        title="Desmarcar completado"
                      >
                        <CheckCircle2 size={18} />
                      </button>

                      <span className="font-bold text-slate-200 line-through truncate">
                        {item.text}
                      </span>
                    </div>

                    <span className="text-[10px] font-extrabold text-[#00f5d4] bg-[#00f5d4]/10 px-2.5 py-0.5 rounded border border-[#00f5d4]/30 shrink-0">
                      Listo {item.completedAt && `· ${item.completedAt}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* COLUMNA DERECHA (4 COLS): NOTAS Y RECORDATORIOS DEL DÍA */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4 rounded-2xl bg-[#141738] p-5 shadow-2xl border border-[#272b5c]">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#232752]">
              <h3 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Pin size={15} />
                <span>NOTAS & RECORDATORIOS</span>
              </h3>
            </div>

            {/* Formulario rápido para notas */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Añadir nota rápida..."
                className="w-full px-3 py-1.5 bg-[#0c0e21] text-xs text-white placeholder-slate-400 rounded-xl border border-[#232752] focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                +
              </button>
            </form>

            <div className="space-y-2 pt-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group p-3 rounded-xl bg-[#0e112a] border border-[#232752] flex items-start justify-between gap-2 text-xs font-bold text-slate-100 leading-relaxed shadow-sm"
                >
                  <span className="text-slate-100">{note.text}</span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#0c0e21] rounded-xl border border-[#232752] text-[11px] text-slate-300 font-semibold leading-relaxed">
            💡 <strong>Tip Notion:</strong> Haz clic en el círculo vació <code>◯</code> para marcar cualquier tarea como completada.
          </div>

        </div>

      </div>

      {/* MODAL DETALLE DE TAREA DE AGENDA */}
      {selectedModalItem && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#141738] p-6 shadow-2xl border border-[#272b5c] space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#232752]">
              <span className="font-mono font-black text-sm px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                {selectedModalItem.key || 'MCHAV'}
              </span>
              <button 
                onClick={() => setSelectedModalItem(null)} 
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white">
                {selectedModalItem.text}
              </h3>
              <div className="p-3 bg-[#0c0e21] rounded-xl border border-[#232752] space-y-1.5 text-slate-200">
                <div className="flex justify-between"><span className="text-slate-400">Prioridad:</span> <span className="font-bold text-rose-400">{selectedModalItem.priority}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Estimación:</span> <span className="font-bold text-purple-400">{selectedModalItem.estTime}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Categoría:</span> <span className="font-bold text-indigo-400">{selectedModalItem.category}</span></div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#232752] flex items-center justify-between">
              <button 
                onClick={() => { toggleDone(selectedModalItem.id); setSelectedModalItem(null); }} 
                className="px-4 py-2 text-xs font-bold bg-[#064e3b] text-[#00f5d4] hover:bg-[#047857] rounded-xl transition-colors cursor-pointer"
              >
                ✓ Marcar como Listo
              </button>
              <button 
                onClick={() => setSelectedModalItem(null)} 
                className="px-4 py-2 text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
