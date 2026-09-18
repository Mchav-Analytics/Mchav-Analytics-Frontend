import React from 'react';
import { Plus, MessageSquare, Clock, CheckCircle2, TrendingUp, Calendar, Folder, Filter, History, Send, ChevronRight, Check, Search, Mail, Sparkles } from 'lucide-react';
import LastSyncBadge from './LastSyncBadge';
import { useAuth } from '../../auth/context/AuthContext';
import { reportService } from '../../../services/api';

export const AlertsCenterHeader = ({ 
  setShowCreateModal, 
  handleExportCSV, 
  pendingCount = 3, 
  resolvedCount = 12, 
  inProgressCount = 2,
  statusTab = 'ALL',
  setStatusTab,
  searchTerm,
  setSearchTerm,
  sidebarProject = 'ALL',
  setSidebarProject,
  sidebarCategory = 'ALL',
  setSidebarCategory,
  sidebarPriority = 'ALL',
  setSidebarPriority,
  projectsList = [],
  isDev: isDevProp,
  isAdmin: isAdminProp,
  isLeader: isLeaderProp
}) => {
  const { user } = useAuth();
  const roleRaw = (user?.rol || user?.role || '').toUpperCase();
  const isAdminCalculated = roleRaw.includes('ADMIN');
  const isLeaderCalculated = roleRaw.includes('MANAG') || roleRaw.includes('LIDER') || roleRaw.includes('LEAD');
  
  const isDev = isDevProp !== undefined ? isDevProp : (!isAdminCalculated && !isLeaderCalculated);
  const isAdmin = isAdminProp !== undefined ? isAdminProp : isAdminCalculated;
  const isLeader = isLeaderProp !== undefined ? isLeaderProp : (!isAdmin && !isDev);

  const [sendingEmails, setSendingEmails] = React.useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = React.useState('');

  const handleSendMonthlyEmails = async () => {
    setSendingEmails(true);
    setEmailStatusMsg('Generando reporte con Nubi AI y enviando correos...');
    try {
      const data = await reportService.sendMonthlyReports();
      setEmailStatusMsg(`¡Éxito! Correos enviados a Admins (${data.admins_notified || 1}) y Líderes (${data.leaders_notified || 1}).`);
    } catch (err) {
      console.error('Error enviando reportes:', err);
      setEmailStatusMsg(`Atención: ${err.response?.data?.detail || 'Verifique la conexión con el servidor'}`);
    } finally {
      setTimeout(() => {
        setSendingEmails(false);
        setEmailStatusMsg('');
      }, 6000);
    }
  };

  if (isDev) {
    // ── VISTA DESARROLLADOR: CENTRO DE ACTIVIDAD (3 TARJETAS - IMAGEN 3) ──
    return (
      <div className="space-y-6">
        {/* TOP HEADER ROW */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shrink-0 shadow-xs">
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Centro de Actividad
              </h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Revisa los feedback que has enviado, su estado y mantén el seguimiento desde aquí.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <LastSyncBadge />
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Nuevo Feedback</span>
            </button>
          </div>
        </div>

        {/* PROJECT SELECTOR DROPDOWN */}
        <div className="flex items-center justify-end gap-3 pb-1">
          <div className="flex items-center gap-2 bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs shrink-0">
            <Folder size={15} className="text-slate-400" />
            <select
              value={sidebarProject || 'ALL'}
              onChange={e => setSidebarProject && setSidebarProject(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900">Todos los proyectos</option>
              {projectsList && projectsList.map(p => (
                <option key={p.id_proyecto || p.id || p.nombre} value={p.nombre || p.id_proyecto} className="bg-white dark:bg-slate-900">
                  {p.nombre || p.id_proyecto}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 TARJETAS MÉTRICAS INDEPENDIENTES (IMAGEN 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CARD 1: ENVIADOS */}
          <div 
            onClick={() => setStatusTab && setStatusTab('ALL')}
            className={`bg-[#f8faff] dark:bg-[#14192b] border ${
              statusTab === 'ALL' || statusTab === 'PENDING' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
            } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-indigo-500/50 transition-all cursor-pointer`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100/70 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Send size={18} className="rotate-45" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">Enviados</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{pendingCount + inProgressCount + resolvedCount}</div>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Feedback enviados</p>
              </div>
            </div>
          </div>

          {/* CARD 2: EN PROCESO */}
          <div 
            onClick={() => setStatusTab && setStatusTab('IN_PROGRESS')}
            className={`bg-[#f8faff] dark:bg-[#14192b] border ${
              statusTab === 'IN_PROGRESS' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
            } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-blue-500/50 transition-all cursor-pointer`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <MessageSquare size={18} />
              </div>
              <div>
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">En proceso</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{inProgressCount}</div>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Con respuesta de líder</p>
              </div>
            </div>
          </div>

          {/* CARD 3: RESUELTOS */}
          <div 
            onClick={() => setStatusTab && setStatusTab('RESOLVED')}
            className={`bg-[#f8faff] dark:bg-[#14192b] border ${
              statusTab === 'RESOLVED' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
            } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-emerald-500/50 transition-all cursor-pointer`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check size={18} strokeWidth={3} />
              </div>
              <div>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Resueltos</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{resolvedCount}</div>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Cerrados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    // ── VISTA ADMINISTRADOR: CENTRO DE ACTIVIDAD (DISEÑO FOTOGRAFÍA ADMIN) ──
    return (
      <div className="space-y-6">
        {/* BREADCRUMB & TOP HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <span>Centro de Actividad</span>
              <span>&gt;</span>
              <span className="text-slate-600 dark:text-slate-300 font-bold">Feedback y revisiones</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shrink-0">
                <MessageSquare size={20} />
              </div>
              <span>Centro de Actividad</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Revisa el estado de los feedback recibidos de los líderes, gestiona su atención y mantén el seguimiento desde aquí.
            </p>
          </div>

          {/* TOP RIGHT CONTROLS: DATE DROPDOWN + SEARCH INPUT + FILTER BUTTON */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-end">
            <div className="flex items-center gap-2 bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs shrink-0">
              <Calendar size={15} className="text-slate-400" />
              <select
                value={sidebarPriority || '30'}
                onChange={e => setSidebarPriority && setSidebarPriority(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              >
                <option value="30" className="bg-white dark:bg-slate-900">Últimos 30 días</option>
                <option value="7" className="bg-white dark:bg-slate-900">Últimos 7 días</option>
                <option value="90" className="bg-white dark:bg-slate-900">Últimos 90 días</option>
              </select>
            </div>

            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm || ''}
                onChange={e => setSearchTerm && setSearchTerm(e.target.value)}
                placeholder="Buscar por título, proyecto o usuario..."
                className="w-full bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] pl-9 pr-3 py-2 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium outline-none focus:border-indigo-500 transition-colors shadow-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleSendMonthlyEmails}
              disabled={sendingEmails}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              title="Despachar reportes mensuales por correo a Administradores y Líderes"
            >
              <Mail size={15} className={sendingEmails ? 'animate-bounce' : ''} />
              <span>{sendingEmails ? 'Enviando...' : 'Enviar Reportes por Correo'}</span>
            </button>
          </div>
        </div>

        {emailStatusMsg && (
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-2 shadow-xs">
            <Sparkles size={14} className="animate-spin text-indigo-500" />
            <span>{emailStatusMsg}</span>
          </div>
        )}

        {/* SUBHEADER FILTER PILLS ROW */}
        <div className="flex items-center gap-2.5 pt-1 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setStatusTab && setStatusTab('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              statusTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setStatusTab && setStatusTab('PENDING')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              statusTab === 'PENDING'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Pendientes</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusTab && setStatusTab('IN_PROGRESS')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              statusTab === 'IN_PROGRESS'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>En conversación</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusTab && setStatusTab('RESOLVED')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              statusTab === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Resueltos</span>
          </button>
        </div>

        {/* 4 SUMMARY METRIC CARDS (DISEÑO MOSTRADO EN FOTOGRAFÍA ADMIN) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1: TOTAL DE FEEDBACK */}
          <div 
            onClick={() => setStatusTab && setStatusTab('ALL')}
            className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-2xl shadow-xs flex items-center gap-4 cursor-pointer hover:border-indigo-500/50 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100/70 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Send size={18} className="rotate-45" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">Total de feedback</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">18</div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Recibidos de líderes</p>
            </div>
          </div>

          {/* CARD 2: PENDIENTES */}
          <div 
            onClick={() => setStatusTab && setStatusTab('PENDING')}
            className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-2xl shadow-xs flex items-center gap-4 cursor-pointer hover:border-amber-500/50 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100/70 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">Pendientes</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">7</div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Requieren atención</p>
            </div>
          </div>

          {/* CARD 3: EN CONVERSACIÓN */}
          <div 
            onClick={() => setStatusTab && setStatusTab('IN_PROGRESS')}
            className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-2xl shadow-xs flex items-center gap-4 cursor-pointer hover:border-blue-500/50 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MessageSquare size={18} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">En conversación</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">5</div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Con comentarios</p>
            </div>
          </div>

          {/* CARD 4: RESUELTOS */}
          <div 
            onClick={() => setStatusTab && setStatusTab('RESOLVED')}
            className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-2xl shadow-xs flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Resueltos</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">6</div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Cerrados</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VISTA LÍDER TÉCNICO: CENTRO DE ACTIVIDAD (IMAGEN DE REFERENCIA LÍDER) ──
  return (
    <div className="space-y-6">
      {/* TOP HEADER ROW: TITLE + CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shrink-0 shadow-xs">
            <MessageSquare size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Centro de Actividad
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Revisa los feedback que has recibido de tu equipo y mantén la comunicación con el administrador.
            </p>
          </div>
        </div>

        {/* TOP CONTROLS: DATE FILTER + SEARCH + FILTER BTN + NUEVO FEEDBACK */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-end">
          <div className="flex items-center gap-2 bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs shrink-0">
            <Calendar size={15} className="text-slate-400" />
            <select
              value={sidebarPriority || '30'}
              onChange={e => setSidebarPriority && setSidebarPriority(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
            >
              <option value="30" className="bg-white dark:bg-slate-900">Últimos 30 días</option>
              <option value="7" className="bg-white dark:bg-slate-900">Últimos 7 días</option>
              <option value="90" className="bg-white dark:bg-slate-900">Últimos 90 días</option>
            </select>
          </div>

          <LastSyncBadge />

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nuevo Feedback</span>
          </button>
        </div>
      </div>



      {/* 4 SUMMARY METRIC CARDS (DISEÑO LÍDER) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: RECIBIDOS (DEV) */}
        <div 
          onClick={() => setStatusTab && setStatusTab('RECEIVED_DEV')}
          className={`bg-[#f8faff] dark:bg-[#14192b] border ${
            statusTab === 'RECEIVED_DEV' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
          } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-purple-500/50 transition-all cursor-pointer`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100/70 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Send size={18} className="rotate-45" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">Recibidos (Dev)</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{pendingCount + inProgressCount}</div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Feedback de desarrolladores</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors" />
        </div>

        {/* CARD 2: ENVIADOS (ADMIN) */}
        <div 
          onClick={() => setStatusTab && setStatusTab('SENT_ADMIN')}
          className={`bg-[#f8faff] dark:bg-[#14192b] border ${
            statusTab === 'SENT_ADMIN' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
          } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-blue-500/50 transition-all cursor-pointer`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Send size={18} className="rotate-45" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">Enviados (Admin)</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">3</div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Feedback al administrador</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
        </div>

        {/* CARD 3: EN CONVERSACIÓN */}
        <div 
          onClick={() => setStatusTab && setStatusTab('IN_PROGRESS')}
          className={`bg-[#f8faff] dark:bg-[#14192b] border ${
            statusTab === 'IN_PROGRESS' ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
          } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-yellow-500/50 transition-all cursor-pointer`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare size={18} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">En conversación</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{inProgressCount || 5}</div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Con respuesta pendiente</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
        </div>

        {/* CARD 4: RESUELTOS */}
        <div 
          onClick={() => setStatusTab && setStatusTab('RESOLVED')}
          className={`bg-[#f8faff] dark:bg-[#14192b] border ${
            statusTab === 'RESOLVED' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
          } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-emerald-500/50 transition-all cursor-pointer`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={18} strokeWidth={3} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Resueltos</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{resolvedCount || 6}</div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Cerrados</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
        </div>
      </div>
    </div>
  );
};
