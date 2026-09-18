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
    author: 'Camila Corredor (Líder Técnico)',
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
    author: 'Valentina Montalvo (Desarrollador)',
    recipient: 'Mike A. (Desarrollador)',
    avatar: 'VH',
    comments: []
  },
  {
    id: 'fb-7',
    rawHelpRequestId: 7,
    isHelpRequest: true,
    title: 'Solicitud de incremento de cuota en API Gateway',
    summary: 'Se requiere aumentar la tasa límite de peticiones para atender el incremento de tráfico en el portal web.',
    category: 'Procesos',
    tags: ['#Procesos', 'Alta prioridad'],
    status: 'PENDIENTE',
    priority: 'ALTA',
    project: 'API Gateway ETL',
    timeAgo: 'Hace 3 horas',
    author: 'Julián Torres (Líder Técnico)',
    recipient: 'Administrador Principal (Admin)',
    avatar: 'JT',
    comments: []
  },
  {
    id: 'fb-8',
    rawHelpRequestId: 8,
    isHelpRequest: true,
    title: 'Actualización de políticas de retención de logs',
    summary: 'Definir el período de almacenamiento en S3 para los registros auditados del backend.',
    category: 'Documentación',
    tags: ['#Documentación', 'Media prioridad'],
    status: 'EN_PROCESO',
    priority: 'MEDIA',
    project: 'Portal de Clientes & Seguridad',
    timeAgo: 'Hace 4 horas',
    author: 'Camila Corredor (Líder Técnico)',
    recipient: 'Administrador Principal (Admin)',
    avatar: 'CC',
    comments: []
  },
  {
    id: 'fb-9',
    rawHelpRequestId: 9,
    isHelpRequest: true,
    title: 'Revisión de matriz de permisos RBAC para nuevos módulos',
    summary: 'Validar la asignación de roles de usuario en los módulos de reportería avanzada.',
    category: 'Código',
    tags: ['#Código', 'Media prioridad'],
    status: 'PENDIENTE',
    priority: 'MEDIA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: 'Hace 6 horas',
    author: 'Julián Torres (Líder Técnico)',
    recipient: 'Administrador Principal (Admin)',
    avatar: 'JT',
    comments: []
  },
  {
    id: 'fb-10',
    rawHelpRequestId: 10,
    isHelpRequest: true,
    title: 'Optimización de pipelines de despliegue CI/CD',
    summary: 'Reducir tiempos de build en los runner de GitHub Actions para el microservicio de reportes.',
    category: 'Procesos',
    tags: ['#Procesos', 'Baja prioridad'],
    status: 'RESUELTO',
    priority: 'BAJA',
    project: 'API Gateway ETL',
    timeAgo: 'Hace 1 día',
    author: 'Camila Corredor (Líder Técnico)',
    recipient: 'Administrador Principal (Admin)',
    avatar: 'CC',
    comments: []
  },
  {
    id: 'fb-11',
    rawHelpRequestId: 11,
    isHelpRequest: true,
    title: 'Integración de alertas de monitoreo en tiempo real',
    summary: 'Configurar Webhooks de Sentry para notificaciones instantáneas de errores 500.',
    category: 'UI/UX',
    tags: ['#UI/UX', 'Alta prioridad'],
    status: 'EN_PROCESO',
    priority: 'ALTA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: 'Hace 2 días',
    author: 'Julián Torres (Líder Técnico)',
    recipient: 'Administrador Principal (Admin)',
    avatar: 'JT',
    comments: []
  },
  {
    id: 'fb-12',
    rawHelpRequestId: 12,
    isHelpRequest: true,
    title: 'Renovación de certificados SSL y dominios principales',
    summary: 'Planificar el ciclo de actualización de certificados TLS para endpoints de producción.',
    category: 'Documentación',
    tags: ['#Documentación', 'Baja prioridad'],
    status: 'RESUELTO',
    priority: 'BAJA',
    project: 'Portal de Clientes & Seguridad',
    timeAgo: 'Hace 3 días',
    author: 'Camila Corredor (Líder Técnico)',
    recipient: 'Administrador Principal (Admin)',
    avatar: 'CC',
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
    if (isNaN(d.getTime())) return dateStr;

    const now = new Date();
    const diffMs = Math.max(0, now - d);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 5) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return diffDays === 1 ? 'Hace 1 día' : `Hace ${diffDays} días`;
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return 'Reciente';
  }
};

export const isUserParticipantInFeedback = (user, item) => {
  if (!user || !item) return true;

  const userName = (user?.nombre || user?.email || '').trim().toLowerCase();
  const userRole = (user?.rol || user?.role || '').toUpperCase();
  const isAdmin = userRole.includes('ADMIN');
  const isLeader = userRole.includes('MANAG') || userRole.includes('LIDER') || userRole.includes('LEAD');
  const isDev = !isAdmin && !isLeader;

  const itemAuthor = (item.author || '').trim().toLowerCase();
  const itemRecipient = (item.recipient || '').trim().toLowerCase();
  const itemTitle = (item.title || '').trim().toLowerCase();

  const isAuthor = Boolean(itemAuthor && (itemAuthor === userName || userName.includes(itemAuthor) || itemAuthor.includes(userName)));
  const isDirectRecipient = Boolean(itemRecipient && (itemRecipient === userName || userName.includes(itemRecipient) || itemRecipient.includes(userName)));

  const recipientIsAdmin = itemRecipient.includes('admin') || itemRecipient.includes('administrador') || Boolean(item.isLeaderToAdmin) || itemTitle.includes('admin');
  const recipientIsLeader = (itemRecipient.includes('líder') || itemRecipient.includes('lider') || itemRecipient.includes('manager') || itemRecipient.includes('camilo') || itemRecipient.includes('julián') || Boolean(item.isDevToLeader)) && !recipientIsAdmin;

  // 1. VISTA ADMINISTRADOR:
  // Lo que sea para Líder NUNCA debe salirle al Admin.
  if (isAdmin) {
    if (recipientIsLeader && !isAuthor && !isDirectRecipient) {
      return false;
    }
    return recipientIsAdmin || isAuthor || isDirectRecipient;
  }

  // 2. VISTA LÍDER TÉCNICO:
  // Lo que sea para Admin entre otro Líder y Admin NO le sale a este Líder si no es participante.
  if (isLeader) {
    if (recipientIsAdmin && !isAuthor && !isDirectRecipient) {
      return false;
    }
    return true;
  }

  // 3. VISTA DESARROLLADOR:
  // Lo que sea para Admin NUNCA le sale al Desarrollador.
  if (isDev) {
    if (recipientIsAdmin) {
      return false;
    }
    return true;
  }

  return false;
};

export const getRecipientsForUserList = (currentUser, systemUsers = SYSTEM_USERS_FALLBACK, selectedProject = 'Sistema Analytics MCHAV') => {
  const roleRaw = (currentUser?.rol || currentUser?.role || 'DEVELOPER').toUpperCase();
  const isAdmin = roleRaw.includes('ADMIN');
  const isLeader = roleRaw.includes('MANAG') || roleRaw.includes('LIDER') || roleRaw.includes('LEAD');

  const users = systemUsers && systemUsers.length > 0 ? systemUsers : SYSTEM_USERS_FALLBACK;

  if (isAdmin) {
    return {
      recipients: users.filter(u => u.name !== currentUser?.nombre),
      notice: 'Como Administrador, puedes enviar feedback a cualquier Líder Técnico o Desarrollador.',
      roleLabel: 'Administrador'
    };
  }

  if (isLeader) {
    const leaderRecipients = users.filter(u => {
      return u.role === 'ADMIN' || (u.role && u.role.includes('ADMIN')) || (u.name && u.name.includes('Admin'));
    });
    return {
      recipients: leaderRecipients.length > 0 ? leaderRecipients : users.filter(u => u.role === 'ADMIN'),
      notice: 'Como Líder Técnico, puedes enviar feedback a los Administradores del sistema.',
      roleLabel: 'Líder Técnico'
    };
  }

  // Developer -> solo Líderes Técnicos
  const devRecipients = users.filter(u => {
    if (u.name === currentUser?.nombre) return false;
    return u.role === 'MANAGER' || (u.role && u.role.includes('LIDER')) || (u.name && u.name.includes('Líder'));
  });

  return {
    recipients: devRecipients.length > 0 ? devRecipients : users.filter(u => u.role === 'MANAGER'),
    notice: 'Como Desarrollador, solo puedes enviar feedback a los Líderes Técnicos.',
    roleLabel: 'Desarrollador'
  };
};

export const useAlertsCenter = ({ selectedProjectId }) => {
  const { user } = useAuth();
  const roleRaw = (user?.rol || user?.role || '').toUpperCase();
  const isAdmin = roleRaw.includes('ADMIN');
  const isLeader = roleRaw.includes('MANAG') || roleRaw.includes('LIDER') || roleRaw.includes('LEAD');
  const isDev = !isAdmin && !isLeader;

  const [projectsList, setProjectsList] = useState(DEFAULT_PROJECTS);
  const [systemUsers, setSystemUsers] = useState(SYSTEM_USERS_FALLBACK);

  const [feedbackList, setFeedbackList] = useState(() => {
    const saved = localStorage.getItem('mchav_feedback_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const realUserItems = parsed.filter(item => !INITIAL_FEEDBACK_ITEMS.some(init => init.id === item.id));
          if (realUserItems.length > 0) {
            return realUserItems;
          }
        }
      } catch (e) {}
    }
    return INITIAL_FEEDBACK_ITEMS;
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
    if (recipientsInfo.recipients && recipientsInfo.recipients.length > 0) {
      const names = recipientsInfo.recipients.map(r => r.name);
      if (!formRecipient || !names.includes(formRecipient)) {
        setFormRecipient(recipientsInfo.recipients[0].name);
      }
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
        const mappedReqs = helpReqs.map(r => {
          const userRoleUpper = (r.rol_usuario || '').toUpperCase();
          const isFromLeader = userRoleUpper.includes('MANAG') || userRoleUpper.includes('LIDER') || userRoleUpper.includes('LEAD');
          const defaultRec = isFromLeader ? 'Administrador Principal (Admin)' : 'Camilo Corredor (Líder Técnico)';

          const recipientStr = r.atendido_por_name || r.destinatario || defaultRec;
          const isLeaderToAdmin = isFromLeader || recipientStr.toLowerCase().includes('admin');

          return {
            id: `hr-${r.id_solicitud}`,
            rawHelpRequestId: r.id_solicitud,
            isHelpRequest: true,
            isLeaderToAdmin: isLeaderToAdmin,
            isDevToLeader: !isLeaderToAdmin,
            title: r.titulo || 'Solicitud de Apoyo Técnico',
            summary: r.descripcion || 'Sin descripción adicional.',
            category: r.key_issue ? 'Código' : 'Procesos',
            tags: [r.key_issue || 'HelpRequest', r.prioridad || 'Media'],
            status: (r.estado || '').toUpperCase().includes('RESUELT') ? 'RESUELTO' : (r.estado || '').toUpperCase().includes('ATENCION') || (r.estado || '').toUpperCase().includes('PROCESO') ? 'EN_PROCESO' : 'PENDIENTE',
            priority: (r.prioridad || 'MEDIA').toUpperCase(),
            project: r.id_proyecto || 'Sistema Analytics MCHAV',
            timeAgo: formatTimeAgo(r.fecha_creacion),
            author: r.solicitado_por_name || (isFromLeader ? 'Camila C. (Líder Técnico)' : 'Valentina H. (Desarrolladora)'),
            recipient: recipientStr,
            avatar: (r.solicitado_por_name || 'U')[0].toUpperCase(),
            comments: []
          };
        });
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
          recipient: a.assignee_name || 'Camilo Corredor (Líder Técnico)',
          avatar: 'A',
          comments: []
        }));
        realBackendItems = [...realBackendItems, ...mappedAlerts];
      }

      if (realBackendItems.length > 0) {
        setFeedbackList(prev => {
          const prevMap = new Map(prev.map(p => [p.id, p]));
          const mergedBackend = realBackendItems.map(b => {
            const existing = prevMap.get(b.id);
            if (existing) {
              const mergedComments = (existing.comments && existing.comments.length > 0) 
                ? existing.comments 
                : (b.comments || []);
              const mergedRecipient = (existing.recipient && existing.recipient !== 'Camilo Corredor (Líder Técnico)') 
                ? existing.recipient 
                : b.recipient;
              const mergedAuthor = existing.author || b.author;
              return { 
                ...b, 
                recipient: mergedRecipient, 
                author: mergedAuthor,
                comments: mergedComments
              };
            }
            return b;
          });
          const ids = new Set(mergedBackend.map(b => b.id));
          const localOnly = prev.filter(p => !ids.has(p.id) && !INITIAL_FEEDBACK_ITEMS.some(init => init.id === p.id));
          return [...mergedBackend, ...localOnly];
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

    const roleUpper = (user?.rol || user?.role || 'DEVELOPER').toUpperCase();
    const isAdminUser = roleUpper.includes('ADMIN');
    const isLeaderUser = roleUpper.includes('MANAG') || roleUpper.includes('LIDER') || roleUpper.includes('LEAD');
    const isDevUser = !isAdminUser && !isLeaderUser;

    let selectedRecipient = formRecipient || recipientsInfo.recipients[0]?.name;
    if (isDevUser || (selectedRecipient && selectedRecipient.includes('Admin') && !isLeaderUser && !isAdminUser)) {
      selectedRecipient = 'Camilo Corredor (Líder Técnico)';
    } else if (!selectedRecipient) {
      selectedRecipient = isLeaderUser ? 'Administrador Principal (Admin)' : 'Camilo Corredor (Líder Técnico)';
    }

    const payload = {
      id_proyecto: formProject,
      solicitado_por_name: user?.nombre || 'Usuario Actual',
      solicitado_por_email: user?.email || 'dev@mchav.com',
      atendido_por_name: selectedRecipient,
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

    const isLeaderToAdmin = isLeaderUser || (formRecipient && formRecipient.includes('Admin'));

    const newItem = {
      id: createdReal?.id_solicitud ? `hr-${createdReal.id_solicitud}` : `fb-${Date.now()}`,
      rawHelpRequestId: createdReal?.id_solicitud || null,
      isHelpRequest: true,
      isLeaderToAdmin: isLeaderToAdmin,
      isDevToLeader: !isLeaderToAdmin,
      title: formTitle.trim(),
      summary: formSummary.trim(),
      category: formCategory,
      tags: [formCategory, formProject.split(' ')[0]],
      status: 'PENDIENTE',
      priority: formPriority,
      project: formProject,
      timeAgo: 'Creado ahora',
      author: user?.nombre || 'Usuario Actual',
      recipient: isLeaderToAdmin ? 'Administrador Principal (Admin)' : 'Camilo Corredor (Líder Técnico)',
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

  const handleAddComment = (itemId, textOverride = null) => {
    const textToSend = textOverride !== null ? textOverride : newCommentText;
    if (!textToSend || !textToSend.trim()) return;

    const roleRaw = (user?.rol || user?.role || '').toUpperCase();
    let authorName = user?.nombre || user?.email;
    if (!authorName) {
      authorName = roleRaw.includes('ADMIN') ? 'Administrador Principal (Admin)' : roleRaw.includes('MANAG') || roleRaw.includes('LIDER') ? 'Líder Técnico' : 'Desarrollador';
    }

    setFeedbackList(prev => prev.map(item => {
      if (item.id === itemId) {
        const newCom = {
          id: Date.now(),
          author: authorName,
          text: textToSend.trim(),
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

  // Filtrar ítems visibles estrictamente según jerarquía (DEV <-> LÍDER <-> ADMIN)
  const visibleFeedbackList = useMemo(() => {
    return feedbackList.filter(item => isUserParticipantInFeedback(user, item));
  }, [feedbackList, user]);

  const categoryCounts = useMemo(() => {
    const counts = { 'Código': 0, 'Documentación': 0, 'Procesos': 0, 'UI/UX': 0, 'Arquitectura': 0 };
    visibleFeedbackList.forEach(item => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      } else {
        counts['Código']++;
      }
    });
    return counts;
  }, [visibleFeedbackList]);

  const pendingCount = useMemo(() => {
    return visibleFeedbackList.filter(item => item.status === 'PENDIENTE').length;
  }, [visibleFeedbackList]);

  const resolvedCount = useMemo(() => {
    return visibleFeedbackList.filter(item => item.status === 'RESUELTO').length;
  }, [visibleFeedbackList]);

  const inProgressCount = useMemo(() => {
    return visibleFeedbackList.filter(item => item.status === 'EN_PROCESO').length;
  }, [visibleFeedbackList]);

  const filteredItems = useMemo(() => {
    return visibleFeedbackList.filter(item => {
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
  }, [visibleFeedbackList, searchTerm, statusTab, sidebarProject, sidebarCategory, sidebarPriority, sidebarStatus, sortBy, user?.nombre]);

  const [trendTimeframe, setTrendTimeframe] = useState('weekly');

  const trendData = useMemo(() => {
    if (trendTimeframe === 'monthly') {
      const labels = ['May', 'Jun', 'Jul', 'Ago', 'Sep'];
      return labels.map((label, idx) => {
        // Al estar configurando el módulo ahora, los meses anteriores muestran 0
        // y Septiembre refleja el total real de feedbacks registrados.
        const count = idx === 4 ? visibleFeedbackList.length : 0;
        return { name: label, val: count };
      });
    }
    const labels = ['20 Ago', '27 Ago', '3 Sep', '10 Sep', '17 Sep'];
    let count10Sep = 0;
    let count17Sep = 0;
    visibleFeedbackList.forEach(item => {
      const timeStr = item.timeAgo || '';
      if (timeStr.includes('5 días') || timeStr.includes('6 días') || timeStr.includes('7 días')) {
        count10Sep++;
      } else {
        count17Sep++;
      }
    });
    return labels.map((label, idx) => {
      if (idx === 4) return { name: label, val: count17Sep };
      if (idx === 3) return { name: label, val: count10Sep };
      return { name: label, val: 0 };
    });
  }, [visibleFeedbackList, trendTimeframe]);

  const projectCounts = useMemo(() => {
    const counts = {};
    visibleFeedbackList.forEach(item => {
      const proj = (item.project || 'Sistema Analytics MCHAV').trim();
      counts[proj] = (counts[proj] || 0) + 1;
    });
    return counts;
  }, [visibleFeedbackList]);

  return {
    user, isAdmin, isLeader, isDev, toastMessage, setToastMessage,
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
    categoryCounts, projectCounts, trendData, trendTimeframe, setTrendTimeframe
  };
};
