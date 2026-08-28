import React, { useState } from 'react';
import { X, Sliders, CheckCircle2, Minus, UserPlus, Activity } from 'lucide-react';
import { ManagementUser } from '../hooks/useAdminUsers';

interface AdminUserModalsProps {
  showConfigModal: boolean;
  setShowConfigModal: (show: boolean) => void;
  isInviteOpen: boolean;
  setIsInviteOpen: (open: boolean) => void;
  handleInviteUser: (name: string, email: string, role: 'ADMIN' | 'MANAGER' | 'DEVELOPER') => void;
  selectedLogUser?: ManagementUser;
  setExpandedUserId: (id: string | null) => void;
  logSpecificDate: string;
  setLogSpecificDate: (date: string) => void;
  logFilterDate: string;
  setLogFilterDate: (date: string) => void;
  setLogPage: React.Dispatch<React.SetStateAction<number>>;
  loadingLogs: boolean;
  paginatedLogs: any[];
  logPage: number;
  totalLogPages: number;
  filteredLogs: any[];
  formatTimestamp: (ts: string) => string;
}

export default function AdminUserModals({
  showConfigModal,
  setShowConfigModal,
  isInviteOpen,
  setIsInviteOpen,
  handleInviteUser,
  selectedLogUser,
  setExpandedUserId,
  logSpecificDate,
  setLogSpecificDate,
  logFilterDate,
  setLogFilterDate,
  setLogPage,
  loadingLogs,
  paginatedLogs,
  logPage,
  totalLogPages,
  filteredLogs,
  formatTimestamp
}: AdminUserModalsProps) {

  // Local state for invite form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'MANAGER' | 'DEVELOPER'>('DEVELOPER');
  const [inviteError, setInviteError] = useState('');

  const onSubmitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');

    if (!newName.trim() || !newEmail.trim()) {
      setInviteError('Todos los campos son obligatorios.');
      return;
    }

    handleInviteUser(newName, newEmail, newRole);
    setNewName('');
    setNewEmail('');
    setNewRole('DEVELOPER');
    setIsInviteOpen(false);
  };

  const formatAuditLog = (log: any) => {
    let title = log.action_path;
    let desc = log.description;
    let type = log.type || 'SYSTEM';
    const path = log.action_path || '';
    const method = log.method || 'GET';
    
    if (path.includes('/api/v1/users')) {
      title = method === 'GET' ? 'Consulta de Usuarios' : 'Gestión de Usuarios';
      desc = method === 'GET' ? 'Visualizó el listado de usuarios y métricas generales del sistema.' : 'Realizó modificaciones en los perfiles o configuraciones de seguridad.';
      type = 'SYSTEM';
    } else if (path.includes('/burnup') || path.includes('/burndown')) {
      title = 'Consulta de Salud Operativa';
      desc = 'Revisó el gráfico de Burnup y el progreso general del proyecto actual.';
      type = 'PROJECT';
    } else if (path.includes('/sprints/sync') || path.includes('/sync')) {
      title = 'Sincronización de Entorno';
      desc = 'Forzó una sincronización manual para obtener las últimas métricas desde Jira.';
      type = 'SYNC';
    } else if (path.includes('/api/v1/projects')) {
      title = 'Exploración de Tableros';
      desc = 'Visualizó el estado y avance de los diferentes proyectos activos.';
      type = 'PROJECT';
    } else if (path.includes('/api/v1/jql')) {
      title = 'Búsqueda Avanzada JQL';
      desc = 'Ejecutó una consulta de incidencias y tickets en el explorador avanzado.';
      type = 'SEARCH';
    } else if (path.includes('/auth')) {
      title = 'Sesión del Sistema';
      desc = 'El usuario inició o cerró su sesión en la plataforma.';
      type = 'LOGIN';
    } else {
      title = 'Actividad del Sistema';
      desc = 'Ejecutó una acción rutinaria en la plataforma.';
    }
    return { title, desc, type };
  };

  return (
    <>
      {/* MODAL CONFIGURACIÓN RBAC */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                <Sliders size={20} className="text-purple-600 dark:text-purple-400" /> Matriz de Permisos Efectivos RBAC
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Definición y control granular de accesos por rol para los módulos funcionales de la plataforma MCHAV Analytics.
            </p>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-black text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-4 px-5">Módulo de Plataforma</th>
                    <th className="py-4 px-5 text-center text-purple-600 dark:text-purple-400">ADMIN</th>
                    <th className="py-4 px-5 text-center text-blue-600 dark:text-blue-400">MANAGER</th>
                    <th className="py-4 px-5 text-center text-emerald-600 dark:text-emerald-400">DEVELOPER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300">
                    <td className="py-3.5 px-5 font-extrabold">Dashboards & KPIs Consolidados</td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-purple-500 dark:text-purple-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><Minus className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300">
                    <td className="py-3.5 px-5 font-extrabold">Consola JQL y Tareas Personales</td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-purple-500 dark:text-purple-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300">
                    <td className="py-3.5 px-5 font-extrabold">Gestión de Usuarios & Roles (RBAC)</td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-purple-500 dark:text-purple-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><Minus className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><Minus className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300">
                    <td className="py-3.5 px-5 font-extrabold">Auditoría ETL & Sincronización Jira</td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-purple-500 dark:text-purple-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><Minus className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-black text-xs hover:bg-purple-500 transition-all shadow-lg cursor-pointer"
              >
                Guardar & Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INVITAR NUEVO USUARIOS */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus size={18} className="text-indigo-600 dark:text-indigo-400" /> Invitar Nuevo Usuario
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            {inviteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {inviteError}
              </div>
            )}
            <form onSubmit={onSubmitInvite} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-extrabold mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ej. Laura Restrepo"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-extrabold mb-1.5">Correo Electrónico</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="lrestrepo@mchav.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-extrabold mb-1.5">Rol Jerárquico Inicial</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as 'ADMIN' | 'MANAGER' | 'DEVELOPER')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 font-semibold outline-none cursor-pointer"
                >
                  <option value="DEVELOPER">DESARROLLADOR (Developer)</option>
                  <option value="MANAGER">PLANIFICADOR (Manager)</option>
                  <option value="ADMIN">ADMINISTRADOR (Admin)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-lg hover:bg-indigo-500 cursor-pointer"
                >
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VENTANA FLOTANTE DE AUDITORIA */}
      {selectedLogUser && (
        <>
          <div 
            className="fixed inset-0 z-[40] bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setExpandedUserId(null)} 
          />
          <div className="fixed inset-0 z-[50] flex items-center justify-end p-4 sm:pr-8 pointer-events-none">
            <div className="w-full max-w-xl bg-white dark:bg-[#151832] border border-slate-200 dark:border-[#33376b] shadow-2xl rounded-3xl flex flex-col pointer-events-auto animate-in zoom-in-95 duration-200 overflow-hidden max-h-[85vh]">
              
              <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/20">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                  <Activity size={20} className="text-indigo-600 dark:text-indigo-400" /> 
                  Auditoría
                </h3>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-2.5 py-1.5 shadow-sm">
                    <input
                      type="date"
                      value={logSpecificDate}
                      onChange={(e) => { setLogSpecificDate(e.target.value); setLogPage(1); }}
                      className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:dark:invert"
                      title="Buscar por fecha exacta"
                    />
                    {logSpecificDate && (
                      <button onClick={() => { setLogSpecificDate(''); setLogPage(1); }} className="ml-1 text-slate-400 hover:text-rose-500">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <select
                    value={logFilterDate}
                    onChange={(e) => { setLogFilterDate(e.target.value); setLogPage(1); }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none shadow-sm"
                  >
                    <option value="ALL">Todo el Historial</option>
                    <option value="7D">Últimos 7 días</option>
                    <option value="30D">Mes Cerrado</option>
                  </select>
                  <button onClick={() => setExpandedUserId(null)} className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-sm">
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/30 dark:bg-transparent">
                  {loadingLogs ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                          <Activity className="w-8 h-8 animate-spin text-indigo-500" />
                          <span className="text-sm font-bold text-slate-500">Analizando registros...</span>
                      </div>
                  ) : paginatedLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                          <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                          <span className="text-sm font-bold text-slate-500">Sin actividad registrada.</span>
                      </div>
                  ) : (
                      <div className="flex flex-col gap-4 relative">
                        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800/60 rounded-full" />
                        
                        {paginatedLogs.map((log: any, idx: number) => {
                          const formatted = formatAuditLog(log);
                          return (
                          <div key={idx} className="relative pl-10">
                            <div className={`absolute left-[11px] top-4 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#151832] ${formatted.type === 'LOGIN' ? 'bg-emerald-500 shadow-emerald-500/50' : formatted.type === 'SYNC' ? 'bg-amber-500 shadow-amber-500/50' : formatted.type === 'PROJECT' ? 'bg-cyan-500 shadow-cyan-500/50' : formatted.type === 'SEARCH' ? 'bg-fuchsia-500 shadow-fuchsia-500/50' : 'bg-indigo-500 shadow-indigo-500/50'}`} />
                            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 text-xs flex flex-col gap-2 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all shadow-sm group">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-slate-900 dark:text-slate-100 break-words leading-tight">
                                  {formatted.title}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
                                    {formatTimestamp(log.timestamp)}
                                </span>
                              </div>
                              <span className="leading-relaxed text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{formatted.desc}</span>
                            </div>
                          </div>
                        )})}
                      </div>
                  )}
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    Pág. {logPage} de {totalLogPages} <span className="font-medium">({filteredLogs.length} total)</span>
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setLogPage(p => Math.max(p - 1, 1))}
                      disabled={logPage === 1}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-black disabled:opacity-50 cursor-pointer shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                    >
                      Ant
                    </button>
                    <button
                      onClick={() => setLogPage(p => Math.min(p + 1, totalLogPages))}
                      disabled={logPage === totalLogPages}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-black disabled:opacity-50 cursor-pointer shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                    >
                      Sig
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
