// ============================================================================
// FEATURE USERS — VISTA DE GESTIÓN DE USUARIOS Y ROLES (ADMIN USUARIOS VIEW)
// Diseño con 3 Tarjetas Compactas Superiores y Tabla Principal de Usuarios Abajo
// ============================================================================

import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Code2,
  UserPlus,
  UserCheck,
  UserX,
  X,
  Sliders,
  CheckCircle2,
  Minus,
  Search,
  Filter,
  Clock,
  Sparkles,
  Activity
} from 'lucide-react';

export interface ManagementUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER';
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
  lastActive: string;
  actions: string[];
}

const INITIAL_USERS: ManagementUser[] = [
  {
    id: 'usr-001',
    name: 'Mauricio Salamanca',
    email: 'msalamanca@grupoasd.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    joinedDate: '12 Ene 2026',
    lastActive: 'Hace 5 minutos',
    actions: ['Actualizó roles globales del sistema', 'Sincronizó proyecto MCHAV Analytics', 'Inició sesión en consola RBAC']
  },
  {
    id: 'usr-002',
    name: 'Clara Gómez',
    email: 'cgomez@mchav.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    joinedDate: '18 Ene 2026',
    lastActive: 'Hace 2 horas',
    actions: ['Inició sincronización manual ETL Jira', 'Exportó reporte consolidado de sprint', 'Aprobó solicitud de acceso']
  },
  {
    id: 'usr-003',
    name: 'Andrés Felipe Torres',
    email: 'aftorres@mchav.com',
    role: 'DEVELOPER',
    status: 'ACTIVE',
    joinedDate: '01 Feb 2026',
    lastActive: 'Ayer',
    actions: ['Visualizó reporte de velocidad por sprint', 'Ejecutó consulta JQL en workspace', 'Actualizó filtro de tableros']
  },
  {
    id: 'usr-004',
    name: 'Diana Patarroyo',
    email: 'dpatarroyo@mchav.com',
    role: 'DEVELOPER',
    status: 'INACTIVE',
    joinedDate: '15 Feb 2026',
    lastActive: 'Hace 2 semanas',
    actions: ['Solicitó asignación de credenciales', 'Creación de cuenta inicial']
  }
];

type ApproveUserPermission = (
  email: string,
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER'
) => void;

type AdminUsuariosViewProps = {
  approveUserPermission?: ApproveUserPermission;
  approvedUsers?: string[];
};

export default function AdminUsuariosView({
  approveUserPermission,
  approvedUsers = [],
}: AdminUsuariosViewProps) {
  const [users, setUsers] = useState<ManagementUser[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'MANAGER' | 'DEVELOPER'>('DEVELOPER');
  const [inviteError, setInviteError] = useState('');

  React.useEffect(() => {
    try {
      const rolesMap: Record<string, string> = JSON.parse(localStorage.getItem('mock_user_roles_map') || '{}');
      const approvedList: string[] = JSON.parse(localStorage.getItem('mock_approved_users') || '[]');

      setUsers(prevUsers =>
        prevUsers.map(u => {
          const storedRole = rolesMap[u.email];
          const isApproved = approvedList.includes(u.email) || approvedUsers.includes(u.email) || u.role === 'ADMIN';
          return {
            ...u,
            role: (storedRole as 'ADMIN' | 'MANAGER' | 'DEVELOPER') || u.role,
            status: isApproved ? 'ACTIVE' : u.status
          };
        })
      );
    } catch (e) {
      console.error('Error cargando asignación de roles:', e);
    }
  }, [approvedUsers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRoleChange = (userId: string, targetRole: 'ADMIN' | 'MANAGER' | 'DEVELOPER') => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser && typeof approveUserPermission === 'function') {
      approveUserPermission(targetUser.email, targetRole);
    }

    try {
      const rolesMap: Record<string, string> = JSON.parse(localStorage.getItem('mock_user_roles_map') || '{}');
      if (targetUser) {
        rolesMap[targetUser.email] = targetRole;
        localStorage.setItem('mock_user_roles_map', JSON.stringify(rolesMap));
      }
    } catch {
      /* ignore storage errors */
    }

    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: targetRole } : u))
    );

    showToast(`✨ Rol de ${targetUser?.name || 'usuario'} actualizado a ${targetRole}`);
  };

  const toggleUserStatus = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    const newStatus = targetUser?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, status: newStatus } : u
      )
    );

    showToast(newStatus === 'ACTIVE'
      ? `🟢 Cuenta de ${targetUser?.name} activada exitosamente`
      : `🔴 Cuenta de ${targetUser?.name} suspendida`
    );
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');

    if (!newName.trim() || !newEmail.trim()) {
      setInviteError('Todos los campos son obligatorios.');
      return;
    }

    const newUser: ManagementUser = {
      id: `usr-${Date.now().toString().slice(-3)}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: 'ACTIVE',
      joinedDate: 'Hoy',
      lastActive: 'Ahora',
      actions: ['Invitación enviada y registrado en plataforma']
    };

    if (typeof approveUserPermission === 'function') {
      approveUserPermission(newUser.email, newRole);
    }

    setUsers(prev => [newUser, ...prev]);
    setNewName('');
    setNewEmail('');
    setNewRole('DEVELOPER');
    setIsInviteOpen(false);
    showToast(`🚀 Invitación enviada a ${newUser.email}`);
  };

  const adminUsers = users.filter(u => u.role === 'ADMIN');
  const managerUsers = users.filter(u => u.role === 'MANAGER');
  const developerUsers = users.filter(u => u.role === 'DEVELOPER');
  const pendingRequests = users.filter(u => u.status === 'INACTIVE');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 px-2 sm:px-4 py-4 text-left animate-in fade-in duration-300">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-white/95 dark:bg-slate-900/95 border border-emerald-300 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-200 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400 animate-spin" />
          <span className="text-xs font-black tracking-wide">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 ml-3">
            <X size={15} />
          </button>
        </div>
      )}

      {/* CONTENEDOR 1 — Resumen RBAC y roles */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm dark:shadow-2xl space-y-4">
        <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-purple-400/20 dark:bg-purple-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-indigo-400/15 dark:bg-indigo-500/10 blur-3xl" />



        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 px-1 sm:px-2 pt-1">
          {/* TARJETA 1: ADMINISTRADOR */}
          <div
            onClick={() => setRoleFilter(roleFilter === 'ADMIN' ? 'ALL' : 'ADMIN')}
            className={`group bg-white dark:bg-slate-900/50 backdrop-blur-xl border rounded-2xl p-5 sm:px-6 sm:py-5 shadow-sm dark:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.02] cursor-pointer flex items-center justify-between ${
              roleFilter === 'ADMIN'
                ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 shadow-lg shadow-purple-500/20'
                : 'border-purple-200 dark:border-purple-500/30 hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-purple-500/15'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Caja de Icono 20x20 */}
              <div className="w-20 h-20 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-inner ring-1 ring-purple-500/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <ShieldCheck size={36} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Administrador</h3>
                  {roleFilter === 'ADMIN' && <CheckCircle2 size={16} className="text-purple-600 dark:text-purple-400" />}
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300/80 font-semibold">Control Total & Gobernanza</p>

                {/* Stack de Avatares */}
                <div className="flex items-center gap-1 pt-1">
                  {adminUsers.map(u => (
                    <div key={u.id} title={u.name} className="w-5 h-5 rounded-full bg-purple-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md">
                      {u.name[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TARJETA 2: LÍDER TÉCNICO */}
          <div
            onClick={() => setRoleFilter(roleFilter === 'MANAGER' ? 'ALL' : 'MANAGER')}
            className={`group bg-white dark:bg-slate-900/50 backdrop-blur-xl border rounded-2xl p-5 sm:px-6 sm:py-5 shadow-sm dark:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.02] cursor-pointer flex items-center justify-between ${
              roleFilter === 'MANAGER'
                ? 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg shadow-blue-500/20'
                : 'border-blue-200 dark:border-blue-500/30 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-blue-500/15'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Caja de Icono 20x20 */}
              <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-inner ring-1 ring-blue-500/20 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                <Users size={36} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Líder Técnico</h3>
                  {roleFilter === 'MANAGER' && <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400" />}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300/80 font-semibold">Gestión de Sprint & Equipo</p>

                {/* Stack de Avatares */}
                <div className="flex items-center gap-1 pt-1">
                  {managerUsers.map(u => (
                    <div key={u.id} title={u.name} className="w-5 h-5 rounded-full bg-blue-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md">
                      {u.name[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TARJETA 3: DESARROLLADOR */}
          <div
            onClick={() => setRoleFilter(roleFilter === 'DEVELOPER' ? 'ALL' : 'DEVELOPER')}
            className={`group bg-white dark:bg-slate-900/50 backdrop-blur-xl border rounded-2xl p-5 sm:px-6 sm:py-5 shadow-sm dark:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.02] cursor-pointer flex items-center justify-between ${
              roleFilter === 'DEVELOPER'
                ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/20'
                : 'border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-emerald-500/15'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Caja de Icono 20x20 */}
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner ring-1 ring-emerald-500/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Code2 size={36} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Desarrollador</h3>
                  {roleFilter === 'DEVELOPER' && <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />}
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300/80 font-semibold">Ejecución & Tablero JQL</p>

                {/* Stack de Avatares */}
                <div className="flex items-center gap-1 pt-1">
                  {developerUsers.map(u => (
                    <div key={u.id} title={u.name} className="w-5 h-5 rounded-full bg-emerald-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md">
                      {u.name[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENEDOR 2 — Cabecera del directorio + búsqueda */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm dark:shadow-2xl">
        <div className="pointer-events-none absolute -top-16 right-0 h-36 w-36 rounded-full bg-indigo-400/15 dark:bg-indigo-500/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5 min-w-0 pl-2 sm:pl-3">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 shrink-0">
                <Users size={18} />
              </span>
              Directorio de usuarios
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Busca, filtra y administra cuentas, roles y auditoría.
            </p>
          </div>

          <label className="relative flex items-center w-full lg:w-[380px] shrink-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 shadow-inner focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <span className="flex items-center justify-center w-11 shrink-0 text-indigo-500 dark:text-indigo-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full min-h-[44px] bg-transparent border-0 py-2.5 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="pr-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
              >
                <X size={15} />
              </button>
            )}
          </label>
        </div>
      </section>

      {/* CONTENEDOR 3 — Filtros */}
      <section className="relative bg-white dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-7 shadow-sm dark:shadow-2xl space-y-4">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
          <Filter size={14} className="text-indigo-500 dark:text-indigo-400" /> Filtros
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
          <button
            onClick={() => { setRoleFilter('ALL'); setStatusFilter('ALL'); }}
            className={`w-full min-h-11 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${roleFilter === 'ALL' && statusFilter === 'ALL'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
          >
            Todos ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`w-full min-h-11 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${roleFilter === 'ADMIN'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
              : 'bg-purple-50 dark:bg-slate-950/80 text-purple-700 dark:text-purple-300/80 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-900/40'
              }`}
          >
            Admins ({adminUsers.length})
          </button>
          <button
            onClick={() => setRoleFilter('MANAGER')}
            className={`w-full min-h-11 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${roleFilter === 'MANAGER'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-blue-50 dark:bg-slate-950/80 text-blue-700 dark:text-blue-300/80 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-900/40'
              }`}
          >
            Líderes ({managerUsers.length})
          </button>
          <button
            onClick={() => setRoleFilter('DEVELOPER')}
            className={`w-full min-h-11 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${roleFilter === 'DEVELOPER'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-emerald-50 dark:bg-slate-950/80 text-emerald-700 dark:text-emerald-300/80 hover:text-emerald-800 dark:hover:text-emerald-200 border border-emerald-200 dark:border-emerald-900/40'
              }`}
          >
            Devs ({developerUsers.length})
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
            className={`w-full min-h-11 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center col-span-2 sm:col-span-1 ${statusFilter === 'INACTIVE'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
              : 'bg-amber-50 dark:bg-slate-950/80 text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 border border-amber-200 dark:border-amber-900/40'
              }`}
          >
            Inactivos ({pendingRequests.length})
          </button>
        </div>
      </section>

      {/* CONTENEDOR 4 — Listado de usuarios */}
      <section className="relative bg-white dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-4">
        <div className="flex items-center justify-between gap-3 pb-1">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Listado de cuentas
          </h4>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            {filteredUsers.length} resultado{filteredUsers.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="hidden xl:grid grid-cols-[minmax(220px,1.4fr)_minmax(160px,1fr)_minmax(180px,1.1fr)_minmax(140px,0.9fr)_110px] gap-4 px-5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <span>Usuario</span>
          <span className="text-center">Rol</span>
          <span className="text-center">Estado</span>
          <span className="text-center">Último acceso</span>
          <span className="text-center">Auditoría</span>
        </div>

        {filteredUsers.map(u => {
          const isExpanded = expandedUserId === u.id;
          return (
            <div
              key={u.id}
              className={`rounded-2xl border transition-all duration-200 ${isExpanded
                ? 'border-indigo-300 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-slate-900/80 shadow-md shadow-indigo-100 dark:shadow-none'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900/50 hover:shadow-sm'
                }`}
            >
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(220px,1.4fr)_minmax(160px,1fr)_minmax(180px,1.1fr)_minmax(140px,0.9fr)_110px] gap-4 xl:gap-5 items-center px-5 py-5">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xs text-white shrink-0 ring-2 shadow-sm ${u.role === 'ADMIN' ? 'bg-gradient-to-br from-purple-500 to-purple-700 ring-purple-300 dark:ring-purple-500/40' :
                    u.role === 'MANAGER' ? 'bg-gradient-to-br from-blue-500 to-blue-700 ring-blue-300 dark:ring-blue-500/40' :
                      'bg-gradient-to-br from-emerald-500 to-emerald-700 ring-emerald-300 dark:ring-emerald-500/40'
                    }`}>
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2 flex-wrap">
                      {u.name}
                      {u.role === 'ADMIN' && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold border border-purple-200 dark:border-purple-500/30">
                          ADMIN
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 xl:items-center">
                  <span className="xl:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rol</span>
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value as 'ADMIN' | 'MANAGER' | 'DEVELOPER')}
                    className={`w-full max-w-[200px] border rounded-xl px-3 py-2.5 text-xs font-bold outline-none cursor-pointer transition-all ${u.role === 'ADMIN'
                      ? 'bg-purple-50 dark:bg-purple-950/90 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700/60'
                      : u.role === 'MANAGER'
                        ? 'bg-blue-50 dark:bg-blue-950/90 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/60'
                        : 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60'
                      }`}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="DEVELOPER">DEVELOPER</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 xl:items-center">
                  <span className="xl:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Estado</span>
                  <div className="flex flex-wrap items-center gap-2 xl:justify-center">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold inline-flex items-center gap-2 ${u.status === 'ACTIVE'
                      ? 'bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
                      }`}>
                      <span className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      {u.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${u.status === 'ACTIVE'
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-500/20'
                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                        }`}
                    >
                      {u.status === 'ACTIVE' ? <UserX size={13} /> : <UserCheck size={13} />}
                      {u.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1 xl:items-center text-center">
                  <span className="xl:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-left">Último acceso</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 justify-center">
                    <Clock size={13} className="text-indigo-500 dark:text-indigo-400" /> {u.lastActive}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Reg: {u.joinedDate}</span>
                </div>

                <div className="flex flex-col gap-1.5 xl:items-center">
                  <span className="xl:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Auditoría</span>
                  <button
                    onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                    className={`w-full xl:w-auto px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${isExpanded
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                  >
                    <Activity size={14} />
                    <span>{isExpanded ? 'Ocultar' : 'Ver Log'}</span>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-indigo-100 dark:border-slate-800 px-5 py-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="rounded-2xl border border-indigo-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 p-4 space-y-3">
                    <h5 className="text-xs font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                      <Activity size={15} className="text-indigo-500 dark:text-indigo-400" />
                      Auditoría RBAC — {u.name}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {u.actions.map((act, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2.5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1 shrink-0" />
                          <span className="leading-relaxed">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No hay usuarios con esos filtros.
          </div>
        )}
      </section>

      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
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
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-extrabold">Dashboards & KPIs Consolidados</td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-purple-500 dark:text-purple-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><Minus className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-extrabold">Consola JQL y Tareas Personales</td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-purple-500 dark:text-purple-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-extrabold">Gestión de Usuarios & Roles (RBAC)</td>
                    <td className="py-3.5 px-5 text-center"><CheckCircle2 className="w-4 h-4 text-purple-500 dark:text-purple-400 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><Minus className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" /></td>
                    <td className="py-3.5 px-5 text-center"><Minus className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
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

      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left">
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
            <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
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
                  <option value="DEVELOPER">DEVELOPER (Desarrollador)</option>
                  <option value="MANAGER">MANAGER (Líder Técnico)</option>
                  <option value="ADMIN">ADMIN (Administrador)</option>
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
    </div>
  );
}

