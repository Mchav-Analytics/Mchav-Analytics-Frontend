// ============================================================================
// FEATURE USERS — VISTA DE GESTIÓN DE USUARIOS Y ROLES (ADMIN USUARIOS VIEW)
// Diseño Refactorizado - Fase 4
// ============================================================================

import React, { useState } from 'react';
import { Users, Sparkles, X, FileDown } from 'lucide-react';

import { useAuth } from '../../auth/context/AuthContext';
import LiderNotificationBell from '../../dashboard/components/LiderNotificationBell';
import { useAdminUsers } from '../hooks/useAdminUsers';

// Componentes extraídos
import AdminRolesSummary from '../components/AdminRolesSummary';
import AdminUserFilters from '../components/AdminUserFilters';
import AdminUserTable from '../components/AdminUserTable';
import AdminUserModals from '../components/AdminUserModals';

type ApproveUserPermission = (
  email: string,
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER'
) => void;

type AdminUsuariosViewProps = {
  approveUserPermission?: ApproveUserPermission;
  approvedUsers?: string[];
};

const formatTimestamp = (ts: string) => {
  if (!ts) return 'Sin fecha';
  const dateString = ts.endsWith('Z') ? ts : `${ts}Z`;
  const dt = new Date(dateString);
  if (isNaN(dt.getTime())) return ts.replace('T', ' ').substring(0, 19);
  const day = String(dt.getDate()).padStart(2, '0');
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const year = dt.getFullYear();
  let hours = dt.getHours();
  const minutes = String(dt.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');
  return `${day}/${month}/${year}, ${hoursStr}:${minutes} ${ampm}`;
};

export default function AdminUsuariosView({
  approveUserPermission: propApproveUserPermission,
  approvedUsers: propApprovedUsers,
}: AdminUsuariosViewProps) {
  const { approveUserPermission: authApprove, approvedUsers: authApproved } = useAuth();
  const approveUserPermission = propApproveUserPermission || authApprove;
  const approvedUsers = (propApprovedUsers && propApprovedUsers.length > 0) ? propApprovedUsers : authApproved;

  // Extraemos toda la lógica pesada al hook
  const {
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
  } = useAdminUsers(approveUserPermission, approvedUsers);

  // Estados locales UI puros de esta vista principal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const selectedLogUser = users.find(u => u.id === expandedUserId);

  return (
    <>
      <div className="space-y-6 text-left animate-in fade-in duration-200 font-sans pb-10">
        
        {/* Toast Notificaciones */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-white/95 dark:bg-slate-900/95 border border-emerald-300 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-200 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
            <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400 animate-spin" />
            <span className="text-xs font-black tracking-wide">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 ml-3 cursor-pointer">
              <X size={15} />
            </button>
          </div>
        )}

        {/* 1. BARRA SUPERIOR DE CONTROL DE USUARIOS */}
        <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
              <Users size={24} />
            </div>
            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  Supervisión Ejecutiva
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Usuarios y Roles
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <LiderNotificationBell />
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-2xl bg-[#5b36f5] hover:bg-indigo-600 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
              title="Exportar reporte consolidado en PDF"
            >
              <FileDown size={15} />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* CONTENEDOR 1 — Resumen RBAC y roles (EXTRAÍDO) */}
        <AdminRolesSummary 
          adminUsers={adminUsers}
          managerUsers={managerUsers}
          developerUsers={developerUsers}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
        />

        {/* CONTENEDOR 2 — Filtros (EXTRAÍDO) */}
        <AdminUserFilters 
          usersCount={users.length}
          pendingRequestsCount={pendingRequests.length}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* CONTENEDOR 3 - Tabla de Usuarios (EXTRAÍDO) */}
        <AdminUserTable 
          paginatedUsers={paginatedUsers}
          filteredUsers={filteredUsers}
          expandedUserId={expandedUserId}
          setExpandedUserId={setExpandedUserId}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          itemsPerPage={5}
          handleRoleChange={handleRoleChange}
          toggleUserStatus={toggleUserStatus}
        />

      </div>

      {/* MODALES Y POPUPS (EXTRAÍDO) */}
      <AdminUserModals 
        showConfigModal={showConfigModal}
        setShowConfigModal={setShowConfigModal}
        isInviteOpen={isInviteOpen}
        setIsInviteOpen={setIsInviteOpen}
        handleInviteUser={handleInviteUser}
        selectedLogUser={selectedLogUser}
        setExpandedUserId={setExpandedUserId}
        logSpecificDate={logSpecificDate}
        setLogSpecificDate={setLogSpecificDate}
        logFilterDate={logFilterDate}
        setLogFilterDate={setLogFilterDate}
        setLogPage={setLogPage}
        loadingLogs={loadingLogs}
        paginatedLogs={paginatedLogs}
        logPage={logPage}
        totalLogPages={totalLogPages}
        filteredLogs={filteredLogs}
        formatTimestamp={formatTimestamp}
      />
    </>
  );
}
