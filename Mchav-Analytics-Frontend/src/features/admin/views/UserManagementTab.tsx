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
  Lock
} from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER';
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
  lastActive: string;
  actions: string[];
}

const INITIAL_USERS: User[] = [
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
    email: 'cgomez@grupoasd.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    joinedDate: '18 Ene 2026',
    lastActive: 'Hace 2 horas',
    actions: ['Inició sincronización manual', 'Exportó reporte de sprint', 'Inició sesión']
  },
  {
    id: 'usr-003',
    name: 'Andrés Felipe Torres',
    email: 'aftorres@grupoasd.com',
    role: 'DEVELOPER',
    status: 'ACTIVE',
    joinedDate: '01 Feb 2026',
    lastActive: 'Ayer',
    actions: ['Visualizó reporte de velocidad', 'Inició sesión']
  },
  {
    id: 'usr-004',
    name: 'Diana Patarroyo',
    email: 'dpatarroyo@grupoasd.com',
    role: 'DEVELOPER',
    status: 'INACTIVE',
    joinedDate: '15 Feb 2026',
    lastActive: 'Hace 1 semana',
    actions: ['Inició sesión']
  }
];

export default function UserManagementTab() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [selectedUserId, setSelectedUserId] = useState<string>('usr-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  
  // Modal de invitación
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'MANAGER' | 'DEVELOPER'>('DEVELOPER');
  const [inviteError, setInviteError] = useState('');

  // Cambiar rol
  const handleRoleChange = (userId: string, newRole: 'ADMIN' | 'MANAGER' | 'DEVELOPER') => {
    setUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
    );
  };

  // Activar/Desactivar
  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u
      )
    );
  };

  // Crear usuario
  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');

    if (!newName.trim() || !newEmail.trim()) {
      setInviteError('Todos los campos son obligatorios.');
      return;
    }

    if (!newEmail.endsWith('@grupoasd.com')) {
      setInviteError('El correo debe ser corporativo (@grupoasd.com).');
      return;
    }

    const emailExists = users.some(u => u.email.toLowerCase() === newEmail.toLowerCase());
    if (emailExists) {
      setInviteError('Este correo electrónico ya está registrado.');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-3)}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: 'ACTIVE',
      joinedDate: 'Hoy',
      lastActive: 'Nunca',
      actions: ['Cuenta creada e invitación enviada']
    };

    setUsers(prev => [newUser, ...prev]);
    setSelectedUserId(newUser.id);
    setNewName('');
    setNewEmail('');
    setNewRole('DEVELOPER');
    setIsInviteOpen(false);
  };

  // Filtrado
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Devuelve los permisos dinámicos según el rol
  const getPermissionsForRole = (role: 'ADMIN' | 'MANAGER' | 'DEVELOPER') => {
    return {
      viewDashboard: true,
      syncData: role === 'ADMIN' || role === 'MANAGER',
      manageUsers: role === 'ADMIN',
      systemConfig: role === 'ADMIN',
    };
  };

  const perms = selectedUser ? getPermissionsForRole(selectedUser.role) : { viewDashboard: false, syncData: false, manageUsers: false, systemConfig: false };

  return (
    <div className="w-full p-6 sm:p-8 space-y-8 max-w-[1600px] mx-auto">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Gestión de Usuarios y Roles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Estructura de accesos jerárquicos (RBAC) y control de seguridad de la célula de desarrollo.
          </p>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center justify-center rounded-lg text-white px-4 py-2 text-sm font-semibold transition-all shadow-sm gap-2 shrink-0 self-start sm:self-auto hover:opacity-95 active:scale-[0.98] h-10"
          style={{ background: 'linear-gradient(135deg, #0052CC 0%, #8B5CF6 100%)', border: 'none' }}
        >
          <UserPlus size={16} />
          Invitar Usuario
        </button>
      </div>

      {/* Grid Maestro-Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PANEL IZQUIERDO: Lista de Colaboradores (Master List) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[620px]">
          
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="relative flex items-center">
              <input 
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 transition-shadow h-9" 
                placeholder="Buscar usuario..." 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '34px', paddingRight: '12px', paddingTop: '0px', paddingBottom: '0px' }} 
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 transition-shadow appearance-none h-9 pl-3 pr-8"
                >
                  <option value="ALL">Todos los Roles</option>
                  <option value="DEVELOPER">DEVELOPER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><path d="m6 9 6 6 6-6"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const isSelected = user.id === selectedUserId;
                return (
                  <div 
                    key={user.id} 
                    onClick={() => setSelectedUserId(user.id)}
                    className={`group flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm shadow-sm ring-2 ring-white dark:ring-slate-900 ${isSelected ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        {getInitials(user.name)}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>{user.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.role}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Ningún colaborador encontrado.
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: Ficha de Detalle y Configuración de Permisos (Detail Pane) */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col h-[620px] overflow-hidden">
          {selectedUser ? (
            <>
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md ring-4 ring-white dark:ring-slate-900">
                      {getInitials(selectedUser.name)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {selectedUser.name} 
                        {selectedUser.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">Activo</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30">Inactivo</span>
                        )}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Mail size={14} />{selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleUserStatus(selectedUser.id)}
                      className={`inline-flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-sm font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 gap-2 ${
                        selectedUser.status === 'ACTIVE'
                          ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-900 focus-visible:ring-rose-500'
                          : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-200 dark:hover:border-emerald-900 focus-visible:ring-emerald-500'
                      }`}
                    >
                      {selectedUser.status === 'ACTIVE' ? (
                        <><UserX size={14} />Suspender</>
                      ) : (
                        <><UserCheck size={14} />Activar</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="space-y-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Shield size={16} className="text-indigo-500" />Rol Asignado
                      </h3>
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg">
                        <select
                          value={selectedUser.role}
                          onChange={(e) => handleRoleChange(selectedUser.id, e.target.value as 'ADMIN' | 'MANAGER' | 'DEVELOPER')}
                          className="w-full bg-transparent font-medium text-indigo-900 dark:text-indigo-300 focus:outline-none cursor-pointer"
                        >
                          <option value="DEVELOPER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">DEVELOPER</option>
                          <option value="MANAGER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">MANAGER</option>
                          <option value="ADMIN" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">ADMIN</option>
                        </select>
                        <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-1">
                          {selectedUser.role === 'ADMIN' && "Acceso total a repositorios, pipelines y configuración."}
                          {selectedUser.role === 'MANAGER' && "Puede gestionar sincronizaciones y visualizar reportes."}
                          {selectedUser.role === 'DEVELOPER' && "Acceso exclusivo de lectura a tableros y KPIs."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Lock size={16} className="text-slate-500" />Autenticación
                      </h3>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Último acceso:</span><span className="font-medium text-slate-900 dark:text-slate-200">{selectedUser.lastActive}</span></div>
                        <div className="flex items-center justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Fecha Ingreso:</span><span className="font-medium text-slate-900 dark:text-slate-200">{selectedUser.joinedDate}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* TABLA DE PERMISOS */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Matriz de Permisos</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Permisos efectivos heredados del rol base.</p>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <tr><th className="px-4 py-3 font-medium">Módulo</th><th className="px-4 py-3 font-medium text-center">Lectura</th><th className="px-4 py-3 font-medium text-center">Escritura</th><th className="px-4 py-3 font-medium text-center">Admin</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950/50">
                            <tr>
                              <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">Dashboard y KPIs</td>
                              <td className="px-4 py-3 text-center">{perms.viewDashboard ? <CheckCircle size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">-</span>}</td>
                              <td className="px-4 py-3 text-center"><span className="text-slate-300 dark:text-slate-700">-</span></td>
                              <td className="px-4 py-3 text-center"><span className="text-slate-300 dark:text-slate-700">-</span></td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">Sincronización (ETL)</td>
                              <td className="px-4 py-3 text-center">{perms.syncData ? <CheckCircle size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">-</span>}</td>
                              <td className="px-4 py-3 text-center">{perms.syncData ? <CheckCircle size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">-</span>}</td>
                              <td className="px-4 py-3 text-center"><span className="text-slate-300 dark:text-slate-700">-</span></td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">Gestión de Usuarios</td>
                              <td className="px-4 py-3 text-center">{perms.manageUsers ? <CheckCircle size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">-</span>}</td>
                              <td className="px-4 py-3 text-center">{perms.manageUsers ? <CheckCircle size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">-</span>}</td>
                              <td className="px-4 py-3 text-center">{perms.manageUsers ? <CheckCircle size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">-</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">Configuración Sistema</td>
                              <td className="px-4 py-3 text-center">{perms.systemConfig ? <CheckCircle size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">-</span>}</td>
                              <td className="px-4 py-3 text-center">{perms.systemConfig ? <CheckCircle size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">-</span>}</td>
                              <td className="px-4 py-3 text-center">{perms.systemConfig ? <CheckCircle size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">-</span>}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Actividad Reciente */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Actividad Reciente</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Últimas acciones realizadas en el sistema.</p>
                    </div>
                    <div className="space-y-3">
                      {selectedUser.actions.map((action, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900/50">
                          <div className={`shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg shadow-sm border ${
                            i === 0 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400' 
                              : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500'
                          }`}>
                            <CheckCircle size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{action}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                              {i === 0 ? 'Última acción' : 'Registro previo'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <UsersIcon size={40} className="mb-2 opacity-50" />
              Selecciona un colaborador para revisar su ficha de accesos.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Invitación */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            
            <button 
              onClick={() => setIsInviteOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <UserPlus size={18} className="text-slate-500" />
              Invitar Nuevo Colaborador
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Asigna permisos y envía un enlace de acceso al correo corporativo del colaborador.
            </p>

            <form onSubmit={handleInviteUser} className="space-y-4 mt-5">
              {inviteError && (
                <div className="text-xs bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 p-2.5 rounded-lg">
                  {inviteError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Claudia Patricia Restrepo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Correo Electrónico Corporativo
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@grupoasd.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Rol de Acceso (RBAC)
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'MANAGER' | 'DEVELOPER')}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300 cursor-pointer transition-all"
                >
                  <option value="DEVELOPER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">DEVELOPER (Lectura)</option>
                  <option value="MANAGER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">MANAGER (Gestión)</option>
                  <option value="ADMIN" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">ADMIN (Control Total)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="h-10 px-4 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg text-white text-sm font-semibold transition-all shadow-sm hover:opacity-95 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #0052CC 0%, #8B5CF6 100%)', border: 'none' }}
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
