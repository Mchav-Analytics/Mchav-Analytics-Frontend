// ============================================================================
// FEATURE USERS — VISTA DE GESTIÓN DE USUARIOS Y ROLES (RBAC ROBUSTO Y BLINDADO)
// ============================================================================
// Proporciona el control de usuarios, asignación jerárquica de roles
// (ADMINISTRADOR, MANAGER, DEVELOPER), matriz de permisos e invitaciones de equipo.
// Blindado contra excepciones nulas de contexto para garantizar renderizado continuo.

import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Shield, 
  UserCheck, 
  UserX, 
  Filter, 
  X,
  Mail,
  Users as UsersIcon,
  CheckCircle,
  Clock,
  ChevronDown,
  Lock
} from 'lucide-react';
import AuthContext, { useAuth } from '../../auth/context/AuthContext';

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
    actions: ['Actualizó roles del sistema', 'Sincronizó proyecto MCHAV', 'Inició sesión']
  },
  {
    id: 'usr-002',
    name: 'Clara Gómez',
    email: 'cgomez@mchav.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    joinedDate: '18 Ene 2026',
    lastActive: 'Hace 2 horas',
    actions: ['Inició sincronización manual', 'Exportó reporte de sprint', 'Inició sesión']
  },
  {
    id: 'usr-003',
    name: 'Andrés Felipe Torres',
    email: 'aftorres@mchav.com',
    role: 'DEVELOPER',
    status: 'ACTIVE',
    joinedDate: '01 Feb 2026',
    lastActive: 'Ayer',
    actions: ['Visualizó reporte de velocidad', 'Inició sesión']
  },
  {
    id: 'usr-004',
    name: 'Diana Patarroyo',
    email: 'dpatarroyo@mchav.com',
    role: 'DEVELOPER',
    status: 'INACTIVE',
    joinedDate: '15 Feb 2026',
    lastActive: 'Hace 2 semanas',
    actions: ['Inició sesión']
  }
];

export default function UserManagementTab() {
  // Consumo ultra-seguro del contexto usando el custom hook useAuth()
  const { approveUserPermission } = useAuth();
  
  const [users, setUsers] = useState<ManagementUser[]>(INITIAL_USERS);
  const [selectedUserId, setSelectedUserId] = useState<string>('usr-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  
  // Modal de invitación de usuario
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'MANAGER' | 'DEVELOPER'>('DEVELOPER');
  const [inviteError, setInviteError] = useState('');

  // Cambiar rol de usuario
  const handleRoleChange = (userId: string, targetRole: 'ADMIN' | 'MANAGER' | 'DEVELOPER') => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser && typeof approveUserPermission === 'function') {
      approveUserPermission(targetUser.email, targetRole);
    }

    setUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, role: targetRole } : u)
    );
  };

  // Suspender / Activar usuario
  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u
      )
    );
  };

  // Crear e invitar un nuevo usuario
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
      lastActive: 'Nunca',
      actions: ['Cuenta creada e invitación enviada']
    };

    if (typeof approveUserPermission === 'function') {
      approveUserPermission(newUser.email, newRole);
    }

    setUsers(prev => [newUser, ...prev]);
    setSelectedUserId(newUser.id);
    setNewName('');
    setNewEmail('');
    setNewRole('DEVELOPER');
    setIsInviteOpen(false);
  };

  // Filtrado de lista de usuarios
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  return (
    <div className="w-full space-y-6 text-left">
      
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Gestión de Usuarios y Roles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Estructura de accesos jerárquicos (RBAC) y control de seguridad de la célula de desarrollo.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer w-fit"
        >
          <UserPlus size={16} /> + Invitar Usuario
        </button>
      </div>

      {/* Layout de 2 Columnas (Lista a la Izquierda y Detalle a la Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL IZQUIERDO: LISTA DE USUARIOS */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          
          {/* Caja de Búsqueda */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Filtro por Rol */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Filter size={13} /> Filtrar por Rol:
            </span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="DEVELOPER">DEVELOPER</option>
            </select>
          </div>

          {/* Tarjetas de Usuarios */}
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredUsers.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between border ${
                  selectedUserId === u.id 
                    ? 'bg-indigo-50/70 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' 
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    u.role === 'ADMIN' ? 'bg-purple-600 text-white' :
                    u.role === 'MANAGER' ? 'bg-indigo-600 text-white' : 'bg-teal-600 text-white'
                  }`}>
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{u.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">{u.email}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{u.role}</span>
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* PANEL DERECHO: DETALLE DEL USUARIO SELECCIONADO */}
        {selectedUser && (
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* Cabecera del Usuario con Botón Suspender */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{selectedUser.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedUser.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {selectedUser.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedUser.email}</p>
                </div>
              </div>

              <button
                onClick={() => toggleUserStatus(selectedUser.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedUser.status === 'ACTIVE'
                    ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
                }`}
              >
                {selectedUser.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
                {selectedUser.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
              </button>
            </div>

            {/* Fila 1: Rol Asignado y Autenticación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Rol Asignado */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} className="text-indigo-500" /> Rol Asignado
                </label>
                <select
                  value={selectedUser.role}
                  onChange={e => handleRoleChange(selectedUser.id, e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="DEVELOPER">DEVELOPER</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
                <p className="text-[11px] text-indigo-400 font-medium">
                  {selectedUser.role === 'ADMIN' && "Acceso total a repositorios, pipelines y configuración."}
                  {selectedUser.role === 'MANAGER' && "Acceso a dashboards completos, métricas e informes."}
                  {selectedUser.role === 'DEVELOPER' && "Acceso restringido a su espacio de trabajo y JQL."}
                </p>
              </div>

              {/* Autenticación */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={14} className="text-teal-500" /> Autenticación
                </label>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Último acceso:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedUser.lastActive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fecha Ingreso:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedUser.joinedDate}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Matriz de Permisos */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matriz de Permisos</h4>
              <p className="text-[11px] text-slate-400">Permisos efectivos heredados del rol base.</p>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Módulo</th>
                      <th className="p-3">Lectura</th>
                      <th className="p-3">Escritura</th>
                      <th className="p-3">Administración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 font-medium">
                    <tr>
                      <td className="p-3">Dashboards & Métricas</td>
                      <td className="p-3"><CheckCircle size={15} className="text-emerald-500" /></td>
                      <td className="p-3">{selectedUser.role !== 'DEVELOPER' ? <CheckCircle size={15} className="text-emerald-500" /> : '—'}</td>
                      <td className="p-3">{selectedUser.role === 'ADMIN' ? <CheckCircle size={15} className="text-emerald-500" /> : '—'}</td>
                    </tr>
                    <tr>
                      <td className="p-3">Consola JQL</td>
                      <td className="p-3"><CheckCircle size={15} className="text-emerald-500" /></td>
                      <td className="p-3"><CheckCircle size={15} className="text-emerald-500" /></td>
                      <td className="p-3">{selectedUser.role === 'ADMIN' ? <CheckCircle size={15} className="text-emerald-500" /> : '—'}</td>
                    </tr>
                    <tr>
                      <td className="p-3">Usuarios & Roles (RBAC)</td>
                      <td className="p-3">{selectedUser.role === 'ADMIN' ? <CheckCircle size={15} className="text-emerald-500" /> : '—'}</td>
                      <td className="p-3">{selectedUser.role === 'ADMIN' ? <CheckCircle size={15} className="text-emerald-500" /> : '—'}</td>
                      <td className="p-3">{selectedUser.role === 'ADMIN' ? <CheckCircle size={15} className="text-emerald-500" /> : '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actividad Reciente</h4>
              <div className="space-y-2">
                {selectedUser.actions.map((act, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Clock size={13} className="text-indigo-400" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL DE INVITACIÓN DE NUEVO USUARIO */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus size={16} className="text-indigo-500" /> Invitar Nuevo Usuario
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={16} />
              </button>
            </div>

            {inviteError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {inviteError}
              </div>
            )}

            <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre Completo</label>
                <input 
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ej. Laura Restrepo"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Correo Electrónico</label>
                <input 
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="lrestrepo@mchav.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Rol Jerárquico Inicial</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-semibold outline-none cursor-pointer"
                >
                  <option value="DEVELOPER">DEVELOPER (Desarrollador)</option>
                  <option value="MANAGER">MANAGER (Líder Técnico)</option>
                  <option value="ADMIN">ADMIN (Administrador)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
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
