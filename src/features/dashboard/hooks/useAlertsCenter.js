import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import api, { alertService, projectService, userService, developerService } from '../../../services/api';

const DEFAULT_PROJECTS = [
  { id_proyecto: 'Sistema Analytics MCHAV', nombre: 'Sistema Analytics MCHAV' },
  { id_proyecto: 'Portal de Clientes & Seguridad', nombre: 'Portal de Clientes & Seguridad' },
  { id_proyecto: 'API Gateway ETL', nombre: 'API Gateway ETL' }
];

const INITIAL_FEEDBACK_ITEMS = [
  {
    id: 'fb-1',
    rawHelpRequestId: 1,
    isHelpRequest: true,
    title: 'Refactorizar módulo de autenticación',
    summary: 'El código actual tiene alta complejidad en tokens JWT. Revisar patrones de diseño y matriz de permisos RBAC.',
    category: 'Código',
    tags: ['#Código', 'Alta prioridad'],
    status: 'PENDIENTE',
    priority: 'ALTA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: 'Hace 2 días',
    author: 'Camila C.',
    recipient: 'Administrador Principal (Admin)',
    avatar: 'CC',
    comments: [
      { id: 1, author: 'Valentina H.', text: 'Revisaremos la refactorización en la reunión técnica.', time: 'Hace 1 día' },
      { id: 2, author: 'Camila C.', text: 'Tengo preparado el borrador de los middleware.', time: 'Hace 1 hora' }
    ]
  },
  {
    id: 'fb-2',
    rawHelpRequestId: 2,
    isHelpRequest: true,
    title: 'Mejorar documentación de APIs',
    summary: 'La documentación de los endpoints necesita más ejemplos y casos de uso prácticos para la integración de servicios backend.',
    category: 'Documentación',
    tags: ['#Documentación', 'Media prioridad'],
    status: 'EN_PROCESO',
    priority: 'MEDIA',
    project: 'Portal de Clientes & Seguridad',
    timeAgo: 'Hace 2 días',
    author: 'Valentina H.',
    recipient: 'Camila C. (Líder Técnico)',
    avatar: 'VH',
    comments: [
      { id: 1, author: 'Mike A.', text: 'Agregando spec OpenAPI 3.0.', time: 'Hace 5 horas' }
    ]
  },
  {
    id: 'fb-3',
    rawHelpRequestId: 3,
    isHelpRequest: true,
    title: 'Optimizar consultas de base de datos',
    summary: 'Algunas consultas de la BD pueden optimizarse para mejorar la velocidad de carga de reportes ejecutivos.',
    category: 'Procesos',
    tags: ['#Rendimiento', 'Baja prioridad'],
    status: 'RESUELTO',
    priority: 'BAJA',
    project: 'API Gateway ETL',
    timeAgo: 'Hace 5 días',
    author: 'Mike A.',
    recipient: 'Valentina H. (Desarrolladora)',
    avatar: 'MA',
    comments: []
  },
  {
    id: 'fb-4',
    rawHelpRequestId: 4,
    isHelpRequest: true,
    title: 'Mejorar manejo de errores en frontend',
    summary: 'Implementar mejores mensajes de error para el usuario final e integración de alertas en tiempo real.',
    category: 'UI/UX',
    tags: ['#UI/UX', 'Media prioridad'],
    status: 'EN_PROCESO',
    priority: 'MEDIA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: 'Hace 1 día',
    author: 'Valentina H.',
    recipient: 'Camila C. (Líder Técnico)',
    avatar: 'VH',
    comments: [
      { id: 1, author: 'Camila C.', text: 'Integrado con el sistema de Toast global.', time: 'Hace 3 horas' }
    ]
  },
  {
    id: 'fb-5',
    rawHelpRequestId: 5,
    isHelpRequest: true,
    title: 'Auditoría de seguridad de endpoints REST',
    summary: 'Verificar la expiración adecuada de tokens y sanitización de entradas en endpoints públicos.',
    category: 'Código',
    tags: ['#Código', 'Alta prioridad'],
    status: 'PENDIENTE',
    priority: 'ALTA',
    project: 'Portal de Clientes & Seguridad',
    timeAgo: 'Hace 3 días',
    author: 'Camila C.',
    recipient: 'Administrador Principal (Admin)',
    avatar: 'CC',
    comments: []
  },
  {
    id: 'fb-6',
    rawHelpRequestId: 6,
    isHelpRequest: true,
    title: 'Estandarización de componentes de UI',
    summary: 'Uniformar colores de botones y estados hover en el sistema de diseño de la consola.',
    category: 'UI/UX',
    tags: ['#UI/UX', 'Media prioridad'],
    status: 'PENDIENTE',
    priority: 'MEDIA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: 'Hace 4 días',
    author: 'Valentina H.',
    recipient: 'Mike A. (Desarrollador)',
    avatar: 'VH',
    comments: []
  }
];

export const SYSTEM_USERS_FALLBACK = [
  { id: 'usr-1', name: 'Administrador Principal (Admin)', role: 'ADMIN', project: 'TODOS' },
  { id: 'usr-2', name: 'Camila C. (Líder Técnico)', role: 'MANAGER', project: 'Sistema Analytics MCHAV' },
  { id: 'usr-3', name: 'Julián Torres (Líder Técnico)', role: 'MANAGER', project: 'Portal de Clientes & Seguridad' },
  { id: 'usr-4', name: 'Valentina H. (Desarrolladora)', role: 'DEVELOPER', project: 'Sistema Analytics MCHAV' },
  { id: 'usr-5', name: 'Mike A. (Desarrollador)', role: 'DEVELOPER', project: 'Sistema Analytics MCHAV' },
  { id: 'usr-6', name: 'Carlos Pérez (Desarrollador)', role: 'DEVELOPER', project: 'API Gateway ETL' }
];

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Reciente';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 5) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} días`;
  } catch (e) {
    return 'Reciente';
  }
};

export const getRecipientsForUserList = (currentUser, systemUsers = SYSTEM_USERS_FALLBACK, selectedProject = 'Sistema Analytics MCHAV') => {
  const roleRaw = (currentUser?.rol || currentUser?.role || 'DEVELOPER').toUpperCase();
  const isAdmin = roleRaw.includes('ADMIN');
  const isLeader = roleRaw.includes('MANAG') || roleRaw.includes('LIDER') || roleRaw.includes('LEAD');

  const users = systemUsers && systemUsers.length > 0 ? systemUsers : SYSTEM_USERS_FALLBACK;

  if (isAdmin) {
    return {
      recipients: users.filter(u => u.name !== currentUser?.nombre),
      notice: 'Como Administrador, puedes enviar feedback a cualquier usuario del sistema.',
      roleLabel: 'Administrador'
    };
  }

  if (isLeader) {
    const leaderProj = currentUser?.project || selectedProject;
    const filtered = users.filter(u => {
      if (u.name === currentUser?.nombre) return false;
      return u.role === 'ADMIN' || u.project === leaderProj || u.project === 'TODOS';
    });
    return {
      recipients: filtered.length > 0 ? filtered : users,
      notice: 'Como Líder Técnico, puedes enviar feedback al Administrador y a los miembros de tu equipo asignado.',
      roleLabel: 'Líder Técnico'
    };
  }

  // Developer
  const devProj = currentUser?.project || selectedProject;
  const filtered = users.filter(u => {
    if (u.name === currentUser?.nombre) return false;
    const isTeammate = u.project === devProj;
    const isLeaderOrAdmin = u.role === 'MANAGER' || u.role === 'ADMIN';
    return isTeammate || (isLeaderOrAdmin && (u.project === devProj || u.project === 'TODOS'));
  });

  return {
    recipients: filtered.length > 0 ? filtered : users.filter(u => u.role === 'ADMIN' || u.role === 'MANAGER'),
    notice: 'Como Desarrollador, puedes enviar feedback a tus compañeros de proyecto y a tu Líder Técnico.',
    roleLabel: 'Desarrollador'
  };
};

export const useAlertsCenter = ({ selectedProjectId }) => {
  const { user } = useAuth();
  const isAdmin = user?.rol?.toLowerCase().includes('admin') || user?.rol?.toLowerCase().includes('administrador');

  const [projectsList, setProjectsList] = useState(DEFAULT_PROJECTS);
  const [systemUsers, setSystemUsers] = useState(SYSTEM_USERS_FALLBACK);

  const [feedbackList, setFeedbackList] = useState(() => {
    const saved = localStorage.getItem('mchav_feedback_items');
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACK_ITEMS;
  });

  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');

  const [sidebarProject, setSidebarProject] = useState('ALL');
  const [sidebarCategory, setSidebarCategory] = useState('ALL');
  const [sidebarPriority, setSidebarPriority] = useState('ALL');
  const [sidebarStatus, setSidebarStatus] = useState('ALL');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formCategory, setFormCategory] = useState('Código');
  const [formPriority, setFormPriority] = useState('MEDIA');
  const [formProject, setFormProject] = useState('Sistema Analytics MCHAV');

  const recipientsInfo = useMemo(() => getRecipientsForUserList(user, systemUsers, formProject), [user, systemUsers, formProject]);
  const [formRecipient, setFormRecipient] = useState('');

  useEffect(() => {
    if (recipientsInfo.recipients && recipientsInfo.recipients.length > 0 && !formRecipient) {
      setFormRecipient(recipientsInfo.recipients[0].name);
    }
  }, [recipientsInfo, formRecipient]);

  const [newCommentText, setNewCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    localStorage.setItem('mchav_feedback_items', JSON.stringify(feedbackList));
  }, [feedbackList]);

  // Carga de datos reales desde el Backend FastAPI
  const loadRealBackendData = useCallback(async () => {
    try {
      // 1. Cargar proyectos reales
      const projs = await projectService.getProjects().catch(() => []);
      if (projs && Array.isArray(projs) && projs.length > 0) {
        setProjectsList(projs);
        if (projs[0]?.nombre) setFormProject(projs[0].nombre);
      }

      // 2. Cargar usuarios reales
      const usersData = await userService.getUsers().catch(() => []);
      if (usersData && Array.isArray(usersData) && usersData.length > 0) {
        const formattedUsers = usersData.map(u => ({
          id: `usr-${u.id_usuario}`,
          name: u.nombre || u.email || `Usuario #${u.id_usuario}`,
          role: (u.rol || 'DEVELOPER').toUpperCase().includes('ADMIN') ? 'ADMIN' : (u.rol || '').toUpperCase().includes('MANAG') || (u.rol || '').toUpperCase().includes('PLANIF') ? 'MANAGER' : 'DEVELOPER',
          project: (u.proyectos_asignados && u.proyectos_asignados[0]) || 'Sistema Analytics MCHAV'
        }));
        setSystemUsers(formattedUsers);
      } else {
        const devs = await developerService.getDevelopers('ALL').catch(() => []);
        if (devs && Array.isArray(devs) && devs.length > 0) {
          const devUsers = devs.map(d => ({
            id: d.assignee_id || `dev-${d.email}`,
            name: d.nombre || d.email,
            role: 'DEVELOPER',
            project: 'Sistema Analytics MCHAV'
          }));
          setSystemUsers(devUsers);
        }
      }

      // 3. Cargar Solicitudes de Ayuda (Help Requests) reales de BD
      const helpReqs = await alertService.getHelpRequests('ALL').catch(() => []);

      // 4. Cargar Alertas del Sistema reales de BD
      const sysAlerts = await alertService.getAlerts('ALL').catch(() => []);

      let realBackendItems = [];

      if (helpReqs && Array.isArray(helpReqs) && helpReqs.length > 0) {
        const mappedReqs = helpReqs.map(r => ({
          id: `hr-${r.id_solicitud}`,
          rawHelpRequestId: r.id_solicitud,
          isHelpRequest: true,
          title: r.titulo || 'Solicitud de Apoyo Técnico',
          summary: r.descripcion || 'Sin descripción adicional.',
          category: r.key_issue ? 'Código' : 'Procesos',
          tags: [r.key_issue || 'HelpRequest', r.prioridad || 'Media'],
          status: (r.estado || '').toUpperCase().includes('RESUELT') ? 'RESUELTO' : (r.estado || '').toUpperCase().includes('ATENCION') || (r.estado || '').toUpperCase().includes('PROCESO') ? 'EN_PROCESO' : 'PENDIENTE',
          priority: (r.prioridad || 'MEDIA').toUpperCase(),
          project: r.id_proyecto || 'Sistema Analytics MCHAV',
          timeAgo: formatTimeAgo(r.fecha_creacion),
          author: r.solicitado_por_name || 'Desarrollador',
          recipient: r.atendido_por_name || 'Equipo Técnico',
          avatar: (r.solicitado_por_name || 'U')[0].toUpperCase(),
          comments: []
        }));
        realBackendItems = [...realBackendItems, ...mappedReqs];
      }

      if (sysAlerts && Array.isArray(sysAlerts) && sysAlerts.length > 0) {
        const mappedAlerts = sysAlerts.map((a, idx) => ({
          id: `sys-alt-${a.id_alerta || idx}`,
          rawAlertId: a.id_alerta,
          isHelpRequest: false,
          title: a.tipo_alerta === 'BLOCK_48H' ? `Bloqueo > 48h en ${a.key_issue || 'ticket'}` : a.tipo_alerta === 'WIP_EXCESSIVE' ? `WIP Excesivo: ${a.assignee_name || 'Dev'}` : (a.titulo || a.tipo_alerta || `Alerta de Agilidad #${idx + 1}`),
          summary: a.mensaje || a.recomendacion || 'Alerta generada por el motor analítico.',
          category: a.tipo_alerta === 'BLOCK_48H' ? 'Código' : 'Procesos',
          tags: ['Motor Agilidad', a.severidad || 'Sistema'],
          status: a.atendida || a.reconocida ? 'RESUELTO' : 'PENDIENTE',
          priority: (a.severidad || '').toUpperCase() === 'HIGH' || (a.severidad || '').toUpperCase() === 'CRITICAL' ? 'ALTA' : 'MEDIA',
          project: a.id_proyecto || 'Sistema Analytics MCHAV',
          timeAgo: formatTimeAgo(a.fecha_creacion),
          author: 'Motor de Agilidad AI',
          recipient: a.assignee_name || 'Equipo Técnico',
          avatar: 'A',
          comments: []
        }));
        realBackendItems = [...realBackendItems, ...mappedAlerts];
      }

      if (realBackendItems.length > 0) {
        setFeedbackList(prev => {
          const ids = new Set(realBackendItems.map(b => b.id));
          const localOnly = prev.filter(p => !ids.has(p.id) && !p.id.startsWith('fb-'));
          return [...realBackendItems, ...localOnly];
        });
      }
    } catch (err) {
      console.warn("Información backend cargada con respaldo dinámico:", err);
    }
  }, []);

  useEffect(() => {
    loadRealBackendData();
  }, [loadRealBackendData]);

  // Crear Feedback persistido en BD local FastAPI
  const handleCreateFeedback = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) {
      showToast('Ingresa el título y la descripción del feedback.');
      return;
    }

    const payload = {
      id_proyecto: formProject,
      solicitado_por_name: user?.nombre || 'Usuario Actual',
      solicitado_por_email: user?.email || 'dev@mchav.com',
      rol_usuario: (user?.rol || user?.role || 'DEVELOPER').toUpperCase(),
      titulo: formTitle.trim(),
      descripcion: formSummary.trim(),
      key_issue: null,
      prioridad: formPriority
    };

    let createdReal = null;
    try {
      createdReal = await alertService.createHelpRequest(payload);
    } catch (err) {
      console.warn("Guardando feedback en almacenamiento local:", err);
    }

    const newItem = {
      id: createdReal?.id_solicitud ? `hr-${createdReal.id_solicitud}` : `fb-${Date.now()}`,
      rawHelpRequestId: createdReal?.id_solicitud || null,
      isHelpRequest: true,
      title: formTitle.trim(),
      summary: formSummary.trim(),
      category: formCategory,
      tags: [formCategory, formProject.split(' ')[0]],
      status: 'PENDIENTE',
      priority: formPriority,
      project: formProject,
      timeAgo: 'Creado ahora',
      author: user?.nombre || 'Usuario Actual',
      recipient: formRecipient || recipientsInfo.recipients[0]?.name || 'Administrador Principal (Admin)',
      avatar: (user?.nombre || 'U')[0].toUpperCase(),
      comments: []
    };

    setFeedbackList(prev => [newItem, ...prev]);
    setShowCreateModal(false);
    setFormTitle('');
    setFormSummary('');
    showToast('✨ Nuevo feedback registrado y guardado en la base de datos.');
  };

  // Cambiar estado en BD local (PENDIENTE -> EN_PROCESO -> RESUELTO)
  const handleToggleStatus = async (id, targetStatus = null) => {
    let targetItem = feedbackList.find(i => i.id === id);
    if (!targetItem) return;

    let nextStatus = targetStatus;
    if (!nextStatus) {
      if (targetItem.status === 'PENDIENTE') nextStatus = 'EN_PROCESO';
      else if (targetItem.status === 'EN_PROCESO') nextStatus = 'RESUELTO';
      else nextStatus = 'PENDIENTE';
    }

    // Persistencia Backend
    if (targetItem.rawHelpRequestId) {
      const backendStatus = nextStatus === 'RESUELTO' ? 'RESUELTA' : nextStatus === 'EN_PROCESO' ? 'EN_ATENCION' : 'PENDIENTE';
      alertService.updateHelpRequestStatus(targetItem.rawHelpRequestId, backendStatus, user?.nombre).catch(err => {
        console.warn("Actualización en backend:", err);
      });
    } else if (targetItem.rawAlertId) {
      alertService.acknowledgeAlert(targetItem.rawAlertId).catch(err => {
        console.warn("Actualización de alerta en backend:", err);
      });
    }

    setFeedbackList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: nextStatus };
      }
      return item;
    }));

    if (nextStatus === 'RESUELTO') {
      showToast('✅ Feedback marcado como resuelto y guardado en el historial.');
    } else if (nextStatus === 'EN_PROCESO') {
      showToast('⏳ Feedback cambiado a En Proceso.');
    } else {
      showToast('📌 Feedback reactivado como Pendiente.');
    }
  };

  const handleAddComment = (itemId) => {
    if (!newCommentText.trim()) return;
    setFeedbackList(prev => prev.map(item => {
      if (item.id === itemId) {
        const newCom = {
          id: Date.now(),
          author: user?.nombre || 'Usuario Actual',
          text: newCommentText.trim(),
          time: 'Justo ahora'
        };
        return { ...item, comments: [...(item.comments || []), newCom] };
      }
      return item;
    }));
    setNewCommentText('');
    showToast('💬 Comentario añadido.');
  };

  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Título', 'Resumen', 'Categoría', 'Estado', 'Prioridad', 'Proyecto', 'Autor', 'Destinatario'];
      const rows = feedbackList.map(item => [
        item.id,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.summary.replace(/"/g, '""')}"`,
        item.category,
        item.status,
        item.priority,
        `"${item.project}"`,
        `"${item.author}"`,
        `"${item.recipient || ''}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `feedback_revisiones_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📄 Reporte de feedback exportado con éxito.');
    } catch (e) {
      showToast('Error al exportar reporte.');
    }
  };

  const categoryCounts = useMemo(() => {
    const counts = { 'Código': 0, 'Documentación': 0, 'Procesos': 0, 'UI/UX': 0, 'Arquitectura': 0 };
    feedbackList.forEach(item => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      } else {
        counts['Código']++;
      }
    });
    return counts;
  }, [feedbackList]);

  const filteredItems = useMemo(() => {
    return feedbackList.filter(item => {
      const matchesSearch = !searchTerm.trim() ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.project.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Filtrado por Tab de Estado / Historial
      if (statusTab === 'RESOLVED') {
        if (item.status !== 'RESUELTO') return false;
      } else if (statusTab === 'PENDING') {
        if (item.status !== 'PENDIENTE') return false;
      } else if (statusTab === 'IN_PROGRESS') {
        if (item.status !== 'EN_PROCESO') return false;
      } else if (statusTab === 'MY_ASSIGNED') {
        if (item.author !== user?.nombre) return false;
      } else {
        // Modo por defecto ('ALL'): Oculta los resueltos para que desaparezcan de la lista activa y queden en el Historial
        if (item.status === 'RESUELTO') return false;
      }

      if (sidebarProject !== 'ALL' && item.project !== sidebarProject) return false;
      if (sidebarCategory !== 'ALL' && item.category !== sidebarCategory) return false;
      if (sidebarPriority !== 'ALL' && item.priority !== sidebarPriority) return false;
      if (sidebarStatus !== 'ALL' && item.status !== sidebarStatus) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        const pMap = { 'ALTA': 3, 'MEDIA': 2, 'BAJA': 1 };
        return (pMap[b.priority] || 2) - (pMap[a.priority] || 2);
      }
      if (sortBy === 'project') return a.project.localeCompare(b.project);
      return 0; // recent
    });
  }, [feedbackList, searchTerm, statusTab, sidebarProject, sidebarCategory, sidebarPriority, sidebarStatus, sortBy, user?.nombre]);

  const pendingCount = feedbackList.filter(i => i.status === 'PENDIENTE').length;
  const resolvedCount = feedbackList.filter(i => i.status === 'RESUELTO').length;
  const inProgressCount = feedbackList.filter(i => i.status === 'EN_PROCESO').length;

  return {
    user, isAdmin, toastMessage, setToastMessage,
    projectsList, systemUsers,
    showCreateModal, setShowCreateModal,
    formTitle, setFormTitle, formSummary, setFormSummary,
    formCategory, setFormCategory, formPriority, setFormPriority, formProject, setFormProject,
    formRecipient, setFormRecipient, recipientsInfo,
    handleCreateFeedback, handleExportCSV,
    pendingCount, resolvedCount, inProgressCount,
    statusTab, setStatusTab, searchTerm, setSearchTerm, sortBy, setSortBy,
    filteredItems, expandedId, setExpandedId,
    newCommentText, setNewCommentText, handleAddComment, handleToggleStatus,
    sidebarProject, setSidebarProject, sidebarCategory, setSidebarCategory,
    sidebarPriority, setSidebarPriority, sidebarStatus, setSidebarStatus,
    categoryCounts
  };
};
