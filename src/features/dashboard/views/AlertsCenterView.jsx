// ============================================================================
// VISTA: CENTRO DE ALERTAS Y SOLICITUDES DE AYUDA (FASE 8)
// ============================================================================

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
  X
} from 'lucide-react';
import { alertService } from '../../../services/api';

function AlertsCenterView({ selectedProjectId = 'PROJ-01' }) {
  const [activeTab, setActiveTab] = useState('system_alerts'); // 'system_alerts' | 'help_requests'
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [alertFilter, setAlertFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'DONE'
  const [requestFilter, setRequestFilter] = useState('ALL'); // 'ALL' | 'PENDIENTE' | 'EN_ATENCION' | 'RESUELTA'

  // Modal Estado
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    titulo: '',
    descripcion: '',
    key_issue: '',
    prioridad: 'MEDIA',
    solicitado_por_name: 'Desarrollador MCHAV',
    solicitado_por_email: 'dev@mchav.com',
    rol_usuario: 'DEVELOPER'
  });
  const [submitting, setSubmitting] = useState(false);

  // 1. Cargar Datos
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

  // Handler para marcar alerta como atendida
  const handleAcknowledgeAlert = (alertId) => {
    alertService.acknowledgeAlert(alertId).then(() => {
      setAlerts((prev) =>
        prev.map((a) => (a.id_alerta === alertId ? { ...a, atendida: true } : a))
      );
    });
  };

  // Handler para cambiar estado de solicitud
  const handleUpdateHelpStatus = (requestId, newStatus) => {
    alertService.updateHelpRequestStatus(requestId, newStatus, 'Michael Salamanca (Líder)').then(() => {
      setHelpRequests((prev) =>
        prev.map((r) =>
          r.id_solicitud === requestId
            ? { ...r, estado: newStatus, atendido_por_name: 'Michael Salamanca (Líder)' }
            : r
        )
      );
    });
  };

  // Handler submit formulario modal
  const handleCreateRequestSubmit = (e) => {
    e.preventDefault();
    if (!newRequest.titulo || !newRequest.descripcion) return;
    setSubmitting(true);

    const payload = {
      ...newRequest,
      id_proyecto: selectedProjectId
    };

    alertService.createHelpRequest(payload).then((res) => {
      setHelpRequests((prev) => [res, ...prev]);
      setShowModal(false);
      setSubmitting(false);
      setNewRequest({
        titulo: '',
        descripcion: '',
        key_issue: '',
        prioridad: 'MEDIA',
        solicitado_por_name: 'Desarrollador MCHAV',
        solicitado_por_email: 'dev@mchav.com',
        rol_usuario: 'DEVELOPER'
      });
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Escaneando Motor de Alertas & Solicitudes de Ayuda...</p>
        </div>
      </div>
    );
  }

  // Filtrado de alertas
  const filteredAlerts = alerts.filter((a) => {
    if (alertFilter === 'PENDING') return !a.atendida;
    if (alertFilter === 'DONE') return a.atendida;
    return true;
  });

  // Filtrado de solicitudes
  const filteredRequests = helpRequests.filter((r) => {
    if (requestFilter !== 'ALL') return r.estado === requestFilter;
    return true;
  });

  const getSeverityBadge = (severity) => {
    if (severity === 'HIGH') {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full flex items-center gap-1">
          <ShieldAlert size={12} /> Alta
        </span>
      );
    }
    if (severity === 'MEDIUM') {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1">
          <AlertTriangle size={12} /> Media
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full flex items-center gap-1">
        <Zap size={12} /> Baja
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'ALTA') return <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 rounded">Prioridad Alta</span>;
    if (priority === 'MEDIA') return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 rounded">Prioridad Media</span>;
    return <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 rounded">Prioridad Baja</span>;
  };

  const getRequestStatusBadge = (status) => {
    if (status === 'PENDIENTE') return <span className="px-2.5 py-1 text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg">PENDIENTE</span>;
    if (status === 'EN_ATENCION') return <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg">EN ATENCIÓN</span>;
    return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg">RESUELTA</span>;
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-left">
      
      {/* CABECERA CON BANNER Y BOTÓN DE ACCIÓN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#191c3d] p-6 rounded-2xl border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold bg-rose-50 dark:bg-rose-600/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 rounded-full flex items-center gap-1.5">
              <Bell size={12} className="animate-bounce" /> FASE 8 — ENGINE DE ALERTAS & SOLICITUDES
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Proyecto: {selectedProjectId}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Centro de Alertas & Solicitudes de Ayuda
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Monitoreo en tiempo real de bloqueos (&gt;48h), WIP excesivo y escalamiento directo de desarrolladores y líderes técnicos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus size={16} />
          <span>+ Nueva Solicitud de Ayuda</span>
        </button>
      </div>

      {/* PESTAÑAS PRINCIPALES (ALERTAS DEL SISTEMA vs SOLICITUDES DE AYUDA) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('system_alerts')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'system_alerts'
                ? 'bg-indigo-600 text-white shadow-lg border border-indigo-500'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <ShieldAlert size={16} className={activeTab === 'system_alerts' ? 'text-amber-300' : 'text-slate-400'} />
            <span>Alertas de Inactividad & Bloqueos ({alerts.filter((a) => !a.atendida).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('help_requests')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'help_requests'
                ? 'bg-indigo-600 text-white shadow-lg border border-indigo-500'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <HelpCircle size={16} className={activeTab === 'help_requests' ? 'text-emerald-300' : 'text-slate-400'} />
            <span>Solicitudes de Ayuda Devs ({helpRequests.filter((r) => r.estado !== 'RESUELTA').length})</span>
          </button>
        </div>

        {/* FILTROS DE PESTAÑA SELECCIONADA */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Filter size={14} className="text-indigo-500 dark:text-indigo-400" />
          <span>Filtrar por:</span>
          {activeTab === 'system_alerts' ? (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setAlertFilter('ALL')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                  alertFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todas ({alerts.length})
              </button>
              <button
                onClick={() => setAlertFilter('PENDING')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                  alertFilter === 'PENDING' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pendientes ({alerts.filter((a) => !a.atendida).length})
              </button>
              <button
                onClick={() => setAlertFilter('DONE')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                  alertFilter === 'DONE' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Atendidas ({alerts.filter((a) => a.atendida).length})
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setRequestFilter('ALL')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                  requestFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setRequestFilter('PENDIENTE')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                  requestFilter === 'PENDIENTE' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setRequestFilter('EN_ATENCION')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                  requestFilter === 'EN_ATENCION' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                En Atención
              </button>
              <button
                onClick={() => setRequestFilter('RESUELTA')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                  requestFilter === 'RESUELTA' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Resueltas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO 1: ALERTAS DEL MOTOR AUTOMÁTICO */}
      {activeTab === 'system_alerts' && (
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-12 rounded-2xl text-center space-y-3 shadow-sm">
              <CheckCircle2 size={40} className="text-emerald-500 dark:text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">¡No hay alertas pendientes!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                No se han detectado bloqueos prolongados o desviaciones severas en el proyecto activo.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id_alerta}
                className={`p-5 rounded-2xl border shadow-sm dark:shadow-lg transition-all space-y-3 ${
                  alert.atendida
                    ? 'bg-slate-50 dark:bg-[#191c3d]/50 border-slate-200 dark:border-[#33376b]/60 opacity-60'
                    : 'bg-white dark:bg-[#191c3d] border-slate-200 dark:border-[#33376b] hover:border-indigo-300 dark:hover:border-indigo-500/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    {getSeverityBadge(alert.severidad)}
                    {alert.key_issue && (
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 rounded">
                        {alert.key_issue}
                      </span>
                    )}
                    <span className="text-xs font-bold text-white">{alert.assignee_name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(alert.fecha_creacion).toLocaleString()}
                    </span>
                    {!alert.atendida ? (
                      <button
                        onClick={() => handleAcknowledgeAlert(alert.id_alerta)}
                        className="px-3 py-1 text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Marcar Atendida</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Atendida
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alert.mensaje}</p>
                  {alert.recomendacion && (
                    <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 p-3 rounded-xl flex items-start gap-2">
                      <Zap size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-indigo-900 dark:text-indigo-200">
                        <strong className="font-bold">Recomendación IA:</strong> {alert.recomendacion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CONTENIDO 2: SOLICITUDES DE AYUDA DE DESARROLLADORES Y LÍDERES */}
      {activeTab === 'help_requests' && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-12 rounded-2xl text-center space-y-3 shadow-sm">
              <MessageSquare size={40} className="text-indigo-500 dark:text-indigo-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No hay solicitudes en esta categoría</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Los desarrolladores y líderes técnicos pueden enviar solicitudes de apoyo utilizando el botón superior.
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id_solicitud}
                className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-4 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getRequestStatusBadge(req.estado)}
                      {getPriorityBadge(req.prioridad)}
                      {req.key_issue && (
                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 rounded">
                          {req.key_issue}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">{req.titulo}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.estado === 'PENDIENTE' && (
                      <button
                        onClick={() => handleUpdateHelpStatus(req.id_solicitud, 'EN_ATENCION')}
                        className="px-3 py-1.5 text-xs font-bold bg-amber-50 dark:bg-amber-600/30 hover:bg-amber-600 text-amber-700 dark:text-amber-200 hover:text-white border border-amber-200 dark:border-amber-500/40 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck size={14} />
                        <span>Atender Solicitud</span>
                      </button>
                    )}
                    {req.estado !== 'RESUELTA' && (
                      <button
                        onClick={() => handleUpdateHelpStatus(req.id_solicitud, 'RESUELTA')}
                        className="px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-600/30 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-200 hover:text-white border border-emerald-200 dark:border-emerald-500/40 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Marcar Resuelta</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {req.descripcion}
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                  <div className="flex items-center gap-4">
                    <span>
                      Solicitado por: <strong className="text-slate-800 dark:text-slate-200">{req.solicitado_por_name}</strong> ({req.rol_usuario})
                    </span>
                    <span>Email: <span className="text-indigo-600 dark:text-indigo-300">{req.solicitado_por_email}</span></span>
                  </div>

                  {req.atendido_por_name && (
                    <span className="text-amber-600 dark:text-amber-300 font-semibold flex items-center gap-1">
                      <UserCheck size={12} /> Atendido por: {req.atendido_por_name}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL INTERACTIVO: NUEVA SOLICITUD DE AYUDA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-indigo-500 dark:text-indigo-400" />
                Nueva Solicitud de Ayuda / Escalamiento
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRequestSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Título de la Solicitud *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Bloqueo por credenciales en API Staging"
                  value={newRequest.titulo}
                  onChange={(e) => setNewRequest({ ...newRequest, titulo: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ticket Requerido (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: MCHAV-105"
                    value={newRequest.key_issue}
                    onChange={(e) => setNewRequest({ ...newRequest, key_issue: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prioridad</label>
                  <select
                    value={newRequest.prioridad}
                    onChange={(e) => setNewRequest({ ...newRequest, prioridad: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="ALTA">🔴 Alta (Bloqueante)</option>
                    <option value="MEDIA">🟡 Media (En Espera)</option>
                    <option value="BAJA">🔵 Baja (Consulta)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Descripción Detallada *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe detalladamente el bloqueo o soporte que requieres del Líder Técnico o Manager..."
                  value={newRequest.descripcion}
                  onChange={(e) => setNewRequest({ ...newRequest, descripcion: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 leading-relaxed"
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
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg border border-indigo-400/30 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Enviando...' : 'Enviar Solicitud'}</span>
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
