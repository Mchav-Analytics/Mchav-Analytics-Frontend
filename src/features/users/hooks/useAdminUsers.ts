import { useState, useEffect } from 'react';
import api from '../../../services/api';

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

export function useAdminUsers(approveUserPermission?: any, approvedUsers?: string[]) {
  const [users, setUsers] = useState<ManagementUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logPage, setLogPage] = useState(1);
  const [logFilterDate, setLogFilterDate] = useState('ALL');
  const [logSpecificDate, setLogSpecificDate] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const itemsPerPage = 5;
  const itemsPerLogPage = 5;

  const approvedUsersKey = (approvedUsers || []).join(',');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/v1/users');
        const mappedUsers = res.data.map((u: any) => {
          const rawRolStr = String(u.rol || '').toUpperCase();
          const parsedRole = rawRolStr.includes('ADMIN')
            ? 'ADMIN'
            : (rawRolStr.includes('PLANIF') || rawRolStr.includes('MANAG') || rawRolStr.includes('LIDER'))
              ? 'MANAGER'
              : 'DEVELOPER';

          return {
            id: String(u.id_usuario),
            name: u.nombre || u.email || 'Usuario',
            email: u.email || '',
            role: parsedRole,
            status: u.activo ? 'ACTIVE' : 'INACTIVE',
            joinedDate: 'Reciente',
            lastActive: 'Activo',
            actions: []
          };
        });
        setUsers(mappedUsers);
      } catch (e) {
        console.error("Error fetching real users", e);
      }
    };
    fetchUsers();
  }, [approvedUsersKey]);

  useEffect(() => {
    if (expandedUserId) {
      const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
          const res = await api.get(`/api/v1/users/${expandedUserId}/logs`);
          setLogs(res.data);
        } catch (e) {
          console.error("Error logs", e);
        } finally {
          setLoadingLogs(false);
        }
      };
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [expandedUserId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRoleChange = async (userId: string, targetRole: 'ADMIN' | 'MANAGER' | 'DEVELOPER') => {
    const targetUser = users.find(u => u.id === userId);

    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: targetRole } : u))
    );

    try {
      await api.put(`/api/v1/users/${userId}/role`, { role: targetRole });
    } catch (err) {
      console.log("Actualizando estado local de rol:", err);
    }

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

    const displayRoleName = targetRole === 'MANAGER' ? 'PLANIFICADOR' : targetRole === 'ADMIN' ? 'ADMINISTRADOR' : 'DESARROLLADOR';
    showToast(`✨ Rol de ${targetUser?.name || 'usuario'} actualizado a ${displayRoleName}`);
  };

  const toggleUserStatus = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    const newStatus = targetUser?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, status: newStatus } : u
      )
    );

    try {
      await api.put(`/api/v1/users/${userId}/status`, { activo: newStatus === 'ACTIVE' });
    } catch (err) {
      console.log("Actualizando estado local de activación:", err);
    }

    showToast(newStatus === 'ACTIVE'
      ? `🟢 Cuenta de ${targetUser?.name} activada exitosamente`
      : `🔴 Cuenta de ${targetUser?.name} suspendida`
    );
  };

  const handleInviteUser = (newName: string, newEmail: string, newRole: 'ADMIN' | 'MANAGER' | 'DEVELOPER') => {
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
    showToast(`🚀 Invitación enviada a ${newUser.email}`);
  };

  const adminUsers = users.filter(u => u.role === 'ADMIN');
  const managerUsers = users.filter(u => u.role === 'MANAGER');
  const developerUsers = users.filter(u => u.role === 'DEVELOPER');
  const pendingRequests = users.filter(u => u.status === 'INACTIVE');

  const filteredUsers = users.filter(u => {
    const userName = (u.name || u.email || '').toLowerCase();
    const userEmail = (u.email || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();
    const matchesSearch = userName.includes(search) || userEmail.includes(search);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredLogs = logs.filter((log: any) => {
    const actDate = new Date(log.timestamp);
    const today = new Date();
    
    let matchesPredefined = true;
    if (logFilterDate === '7D') {
      const diff = today.getTime() - actDate.getTime();
      matchesPredefined = diff <= 7 * 24 * 60 * 60 * 1000;
    } else if (logFilterDate === '30D') {
      const diff = today.getTime() - actDate.getTime();
      matchesPredefined = diff <= 30 * 24 * 60 * 60 * 1000;
    }

    let matchesSpecific = true;
    if (logSpecificDate) {
      const logDateStr = actDate.toISOString().split('T')[0];
      matchesSpecific = logDateStr === logSpecificDate;
    }

    return matchesPredefined && matchesSpecific;
  });

  const totalLogPages = Math.ceil(filteredLogs.length / itemsPerLogPage) || 1;
  const paginatedLogs = filteredLogs.slice((logPage - 1) * itemsPerLogPage, logPage * itemsPerLogPage);

  return {
    users,
    adminUsers,
    managerUsers,
    developerUsers,
    pendingRequests,
    filteredUsers,
    paginatedUsers,
    currentPage,
    setCurrentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    expandedUserId,
    setExpandedUserId,
    logs,
    filteredLogs,
    paginatedLogs,
    loadingLogs,
    logPage,
    setLogPage,
    totalLogPages,
    logFilterDate,
    setLogFilterDate,
    logSpecificDate,
    setLogSpecificDate,
    toastMessage,
    setToastMessage,
    handleRoleChange,
    toggleUserStatus,
    handleInviteUser
  };
}
