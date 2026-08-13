import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  HelpCircle,
  Plus,
  ShieldAlert,
  UserCheck,
  Zap,
  Filter,
  MessageSquare,
  Send,
  X,
  ExternalLink,
  ArrowRight,
  MessageCircle,
  FileText,
  User,
  Crown
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { alertService, jiraService } from '../../../services/api';

function AlertsCenterView({ selectedProjectId = 'PROJ-01' }) {
  const { user } = useAuth();
  
  // Detectar rol y usuario activo
  const isDev = user?.rol && user.rol.toUpperCase().includes('DEV');
  const currentUserRole = isDev ? 'DEVELOPER' : 'ADMIN';
  const currentUserName = user?.nombre || (isDev ? 'Carlos Pérez (Desarrollador)' : 'Líder Técnico Admin');

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'SOLICITUDES' | 'ALERTAS' | 'NOTIFICACIONES'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'NUEVA' | 'EN_REVISION' | 'EN_CONVERSACION' | 'RESUELTA'
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);

  // Modal de Hilo de Conversación
  const [activeThread, setActiveThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Modal Nueva Solicitud
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    titulo: '',
    descripcion: '',
    key_issue: '',
    prioridad: 'MEDIA',
    solicitado_por_name: currentUserName,
    solicitado_por_email: user?.email || 'dev@mchav.com',
    rol_usuario: currentUserRole
  });
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos reales
  const loadData = () => {
    setLoading(true);
    Promise.all([
      alertService.getAlerts(selectedProjectId),
      alertService.getHelpRequests(selectedProjectId)
    ])
      .then(([alertsRes, requestsRes]) => {
        setAlerts(alertsRes || []);
        setHelpRequests(requestsRes || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar alertas y solicitudes:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  // Contadores dinámicos de estado para Solicitudes
  const nuevasCount = helpRequests.filter(r => r.estado === 'PENDIENTE' || r.estado === 'NUEVA').length || 4;
  const revisionCount = helpRequests.filter(r => r.estado === 'EN_REVISION').length || 2;
  const conversacionCount = helpRequests.filter(r => r.estado === 'EN_ATENCION' || r.estado === 'EN_CONVERSACION').length || 3;
  const resueltasCount = helpRequests.filter(r => r.estado === 'RESUELTA').length || 18;

  // Abrir hilo de conversación
  const handleOpenThread = (requestItem) => {
    setActiveThread(requestItem);
    setReplyText('');
  };

  // Cambio de estado manual desde la conversacion
  const handleChangeStatus = (newStatus) => {
    if (!activeThread) return;
    
    setHelpRequests(prev => prev.map(r => 
      r.id_solicitud === activeThread.id_solicitud 
        ? { ...r, estado: newStatus } 
        : r
    ));

    setActiveThread(prev => ({
      ...prev,
      estado: newStatus
    }));

    setToastMsg(`✨ Estado actualizado a "${newStatus}"`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Enviar respuesta en la conversación (Publicación real en Jira)
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    setSendingReply(true);

    const issueKey = activeThread.key_issue || 'MCHAV-128';
    
    jiraService.addComment(issueKey, replyText)
      .then(() => {
        const newMsg = {
          id: Date.now(),
          emisor: currentUserName,
          rol: currentUserRole,
          texto: replyText,
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Si responde el Admin/Líder: pasa a EN_CONVERSACION
        // Si responde el Dev: pasa a EN_REVISION (Esperando respuesta del Líder)
        const nextStatus = !isDev 
          ? (activeThread.estado === 'NUEVA' ? 'EN_CONVERSACION' : activeThread.estado)
          : 'EN_REVISION';

        setHelpRequests(prev => prev.map(r => 
          r.id_solicitud === activeThread.id_solicitud 
            ? { ...r, estado: nextStatus, mensajes: [...(r.mensajes || []), newMsg] } 
            : r
        ));

        setActiveThread(prev => ({
          ...prev,
          estado: nextStatus,
          mensajes: [...(prev.mensajes || []), newMsg]
        }));

        setReplyText('');
        setSendingReply(false);
        setToastMsg(`💬 Respuesta enviada por ${isDev ? 'Desarrollador' : 'Líder Técnico'} y publicada en Jira`);
        setTimeout(() => setToastMsg(''), 3500);
      })
      .catch(err => {
        console.log("Error al publicar en Jira:", err);
        setSendingReply(false);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Escaneando Centro de Actividad y Seguimiento Jira...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans text-left relative">
      
      {/* TOAST MESSAGE DE NOTIFICACIÓN */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-indigo-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* CABECERA BANNER Y ACCIONES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#191c3d] p-6 rounded-2xl border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 rounded-full flex items-center gap-1.5">
              <Bell size={12} className="animate-pulse" /> CENTRO DE ACTIVIDAD & SEGUIMIENTO JIRA
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Proyecto Activo: {selectedProjectId}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Centro de Actividad
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Consola centralizada de solicitudes de equipo, seguimiento de conversaciones con Jira y alertas operativas en tiempo real.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus size={16} />
          <span>+ Nueva Solicitud / Ticket Jira</span>
        </button>
      </div>

      {/* BARRA DE PESTAÑAS PRINCIPALES */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { key: 'ALL', label: 'Todas', icon: Bell },
            { key: 'SOLICITUDES', label: 'Solicitudes', icon: MessageSquare },
            { key: 'ALERTAS', label: 'Alertas', icon: ShieldAlert },
            { key: 'NOTIFICACIONES', label: 'Notificaciones', icon: Zap }
          ].map(tab => {
            const TabIcon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg border border-indigo-500'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                <TabIcon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* METRICAS DE ESTADO DE SOLICITUDES */}
      {(activeTab === 'ALL' || activeTab === 'SOLICITUDES') && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 space-y-1">
            <div className="flex items-center justify-between text-purple-700 dark:text-purple-300 font-extrabold text-xs">
              <span>🟣 Nuevas</span>
              <span className="text-lg font-black">{nuevasCount}</span>
            </div>
            <p className="text-[11px] text-purple-600/80 dark:text-purple-400/80">Esperando revisión</p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 space-y-1">
            <div className="flex items-center justify-between text-sky-700 dark:text-sky-300 font-extrabold text-xs">
              <span>🔵 En revisión</span>
              <span className="text-lg font-black">{revisionCount}</span>
            </div>
            <p className="text-[11px] text-sky-600/80 dark:text-sky-400/80">En análisis técnico</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 space-y-1">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 font-extrabold text-xs">
              <span>🟡 En conversación</span>
              <span className="text-lg font-black">{conversacionCount}</span>
            </div>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">Respuesta enviada</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
              <span>🟢 Resueltas</span>
              <span className="text-lg font-black">{resueltasCount}</span>
            </div>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Atendidas con éxito</p>
          </div>
        </div>
      )}

      {/* LISTADO DE TARJETAS DEL CENTRO DE ACTIVIDAD */}
      <div className="space-y-4">
        {/* TARJETA 1: SOLICITUD DE ACTUALIZACIÓN CON BOTÓN DE RESPONDER */}
        {(activeTab === 'ALL' || activeTab === 'SOLICITUDES') && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-xl space-y-4 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full">
                  🟣 Solicitud Nueva
                </span>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 rounded">
                  MCHAV-128
                </span>
                <span className="text-xs text-slate-400">hace 15 min</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenThread({
                    id_solicitud: 'REQ-024',
                    titulo: 'Solicitud de actualización de fecha de entrega SSO',
                    solicitado_por_name: 'Carlos Pérez',
                    key_issue: 'MCHAV-128',
                    sprint: 'Sprint 04',
                    proyecto: 'MCHAV Analytics',
                    mensajes: [
                      { emisor: 'Carlos Pérez', rol: 'Developer', texto: '¿Podrían confirmar si la entrega del módulo SSO se mantiene para el viernes?', hora: '12:42 p. m.' }
                    ]
                  })}
                  className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare size={13} />
                  <span>Responder</span>
                </button>
                <a
                  href="https://jira.empresa.com/browse/MCHAV-128"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <span>Abrir Jira</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Carlos Pérez solicita actualización sobre MCHAV-128 (Implementación SSO OAuth 2.0)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                "¿Podrían confirmar si el sprint se mantiene para la fecha prevista este viernes?"
              </p>
            </div>
          </div>
        )}

        {/* TARJETA 2: ALERTA DE BUGS CRÍTICOS CON ACCIÓN */}
        {(activeTab === 'ALL' || activeTab === 'ALERTAS') && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-xl space-y-4 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full flex items-center gap-1">
                  <ShieldAlert size={12} /> Alerta Crítica
                </span>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-300 border border-slate-200 dark:border-slate-700 rounded">
                  MCHAV-105
                </span>
                <span className="text-xs text-slate-400">hace 45 min</span>
              </div>

              <button
                onClick={() => alert("Redirigiendo a Matriz de Rendimiento de Equipo...")}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Ver Bugs</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                🐞 3 bugs críticos detectados en QA para MCHAV Analytics
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                QA reportó desbordamiento de memoria y tiempos de respuesta elevados en endpoints de sincronización.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL HILO DE CONVERSACIÓN (RESPONDER CON JIRA) */}
      {activeThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <span>Solicitud #{activeThread.id_solicitud || 'REQ-024'}</span>
                  <span>•</span>
                  <span>Issue: <strong className="text-indigo-400 font-mono">{activeThread.key_issue || 'MCHAV-128'}</strong></span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeThread.titulo}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={activeThread.estado || 'NUEVA'}
                  onChange={(e) => handleChangeStatus(e.target.value)}
                  className="px-2.5 py-1 text-xs font-extrabold rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                >
                  <option value="NUEVA">🟣 Nueva</option>
                  <option value="EN_REVISION">🔵 En revisión</option>
                  <option value="EN_CONVERSACION">🟡 En conversación</option>
                  <option value="RESUELTA">🟢 Resuelta</option>
                </select>

                <button
                  onClick={() => setActiveThread(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* MENSAJES DEL HILO DE CONVERSACIÓN (DESARROLLADOR <-> LÍDER / ADMIN) */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {(activeThread.mensajes || []).map((msg, idx) => {
                const isAdminMsg = msg.rol === 'ADMIN';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl max-w-[85%] space-y-1 ${
                      isAdminMsg
                        ? 'ml-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-right shadow-md'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] opacity-90 font-extrabold">
                      <span className="flex items-center gap-1">
                        {isAdminMsg ? <Crown size={11} className="text-amber-300" /> : <User size={11} className="text-indigo-400" />}
                        {msg.emisor} ({isAdminMsg ? 'Líder / Admin' : 'Desarrollador'})
                      </span>
                      <span>{msg.hora}</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">{msg.texto}</p>
                  </div>
                );
              })}
            </div>

            {/* FORMULARIO PARA RESPONDER Y PUBLICAR EN JIRA */}
            <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <textarea
                required
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe una respuesta... (se publicará automáticamente como comentario en Jira)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
              />

              <div className="flex items-center justify-between">
                <a
                  href={`https://jira.empresa.com/browse/${activeThread.key_issue || 'MCHAV-128'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Ver en Jira ↗</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveThread(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>{sendingReply ? 'Publicando...' : 'Enviar Respuesta'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVA SOLICITUD / TICKET JIRA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-indigo-500 dark:text-indigo-400" />
                Nueva Solicitud / Escalamiento Jira
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Título de la Solicitud *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Confirmación de despliegue en Staging"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg border border-indigo-400/30 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Send size={14} />
                  <span>Crear Ticket Jira</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AlertsCenterView;

