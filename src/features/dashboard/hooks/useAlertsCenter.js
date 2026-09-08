import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import api from '../../../services/api';

const INITIAL_FEEDBACK_ITEMS = [
  {
    id: 'fb-1',
    title: 'Refactorizar módulo de autenticación',
    summary: 'El código actual tiene alta complejidad en tokens JWT. Revisar patrones de diseño y matriz de permisos RBAC.',
    category: 'Código',
    tags: ['#Código', 'Alta prioridad'],
    status: 'PENDIENTE',
    priority: 'ALTA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: 'Hace 2 días',
    author: 'Camila C.',
    avatar: 'CC',
    comments: [
      { id: 1, author: 'Valentina H.', text: 'Revisaremos la refactorización en la reunión técnica.', time: 'Hace 1 día' },
      { id: 2, author: 'Camila C.', text: 'Tengo preparado el borrador de los middleware.', time: 'Hace 1 hora' }
    ]
  },
  {
    id: 'fb-2',
    title: 'Mejorar documentación de APIs',
    summary: 'La documentación de los endpoints necesita más ejemplos y casos de uso prácticos para la integración de servicios backend.',
    category: 'Documentación',
    tags: ['#Documentación', 'Media prioridad'],
    status: 'EN_PROCESO',
    priority: 'MEDIA',
    project: 'Portal de Clientes & Seguridad',
    timeAgo: 'Hace 2 días',
    author: 'Valentina H.',
    avatar: 'VH',
    comments: [
      { id: 1, author: 'Mike A.', text: 'Agregando spec OpenAPI 3.0.', time: 'Hace 5 horas' }
    ]
  },
  {
    id: 'fb-3',
    title: 'Optimizar consultas de base de datos',
    summary: 'Algunas consultas de la BD pueden optimizarse para mejorar la velocidad de carga de reportes ejecutivos.',
    category: 'Procesos',
    tags: ['#Rendimiento', 'Baja prioridad'],
    status: 'RESUELTO',
    priority: 'BAJA',
    project: 'API Gateway ETL',
    timeAgo: 'Hace 5 días',
    author: 'Mike A.',
    avatar: 'MA',
    comments: []
  },
  {
    id: 'fb-4',
    title: 'Mejorar manejo de errores en frontend',
    summary: 'Implementar mejores mensajes de error para el usuario final e integración de alertas en tiempo real.',
    category: 'UI/UX',
    tags: ['#UI/UX', 'Media prioridad'],
    status: 'EN_PROCESO',
    priority: 'MEDIA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: 'Hace 1 día',
    author: 'Valentina H.',
    avatar: 'VH',
    comments: [
      { id: 1, author: 'Camila C.', text: 'Integrado con el sistema de Toast global.', time: 'Hace 3 horas' }
    ]
  },
  {
    id: 'fb-5',
    title: 'Auditoría de seguridad de endpoints REST',
    summary: 'Verificar la expiración adecuada de tokens y sanitización de entradas en endpoints públicos.',
    category: 'Código',
    tags: ['#Código', 'Alta prioridad'],
    status: 'PENDIENTE',
    priority: 'ALTA',
    project: 'Portal de Clientes & Seguridad',
    timeAgo: 'Hace 3 días',
    author: 'Camila C.',
    avatar: 'CC',
    comments: []
  },
  {
    id: 'fb-6',
    title: 'Estandarización de componentes de UI',
    summary: 'Uniformar colores de botones y estados hover en el sistema de diseño de la consola.',
    category: 'UI/UX',
    tags: ['#UI/UX', 'Media prioridad'],
    status: 'PENDIENTE',
    priority: 'MEDIA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: 'Hace 4 días',
    author: 'Valentina H.',
    avatar: 'VH',
    comments: []
  },
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `fb-res-${i + 1}`,
    title: `Mejora de arquitectura y rendimiento #${i + 1}`,
    summary: `Refactorización completada satisfactoriamente en el sprint previo para optimizar el rendimiento general.`,
    category: i % 4 === 0 ? 'Código' : i % 4 === 1 ? 'Procesos' : i % 4 === 2 ? 'Documentación' : 'UI/UX',
    tags: ['#Optimización', 'Completado'],
    status: 'RESUELTO',
    priority: i % 3 === 0 ? 'ALTA' : i % 3 === 1 ? 'MEDIA' : 'BAJA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: `Hace ${i + 6} días`,
    author: i % 2 === 0 ? 'Camila C.' : 'Mike A.',
    avatar: i % 2 === 0 ? 'CC' : 'MA',
    comments: []
  }))
];

export const SYSTEM_USERS = [
  { id: 'usr-1', name: 'Administrador Principal (Admin)', role: 'ADMIN', project: 'TODOS' },
  { id: 'usr-2', name: 'Camila C. (Líder Técnico)', role: 'MANAGER', project: 'Sistema Analytics MCHAV' },
  { id: 'usr-3', name: 'Julián Torres (Líder Técnico)', role: 'MANAGER', project: 'Portal de Clientes & Seguridad' },
  { id: 'usr-4', name: 'Valentina H. (Desarrolladora)', role: 'DEVELOPER', project: 'Sistema Analytics MCHAV' },
  { id: 'usr-5', name: 'Mike A. (Desarrollador)', role: 'DEVELOPER', project: 'Sistema Analytics MCHAV' },
  { id: 'usr-6', name: 'Carlos Pérez (Desarrollador)', role: 'DEVELOPER', project: 'API Gateway ETL' }
];

export const getRecipientsForUser = (currentUser, selectedProject = 'Sistema Analytics MCHAV') => {
  const roleRaw = (currentUser?.rol || currentUser?.role || 'DEVELOPER').toUpperCase();
  const isAdmin = roleRaw.includes('ADMIN');
  const isLeader = roleRaw.includes('MANAG') || roleRaw.includes('LIDER') || roleRaw.includes('LEAD');

  if (isAdmin) {
    return {
      recipients: SYSTEM_USERS.filter(u => u.name !== currentUser?.nombre),
      notice: 'Como Administrador, puedes enviar feedback a cualquier usuario del sistema.',
      roleLabel: 'Administrador'
    };
  }

  if (isLeader) {
    const leaderProj = currentUser?.project || selectedProject;
    const filtered = SYSTEM_USERS.filter(u => {
      if (u.name === currentUser?.nombre) return false;
      return u.role === 'ADMIN' || u.project === leaderProj || u.project === 'TODOS';
    });
    return {
      recipients: filtered,
      notice: 'Como Líder Técnico, puedes enviar feedback al Administrador y a los miembros de tu equipo asignado.',
      roleLabel: 'Líder Técnico'
    };
  }

  // Developer
  const devProj = currentUser?.project || selectedProject;
  const filtered = SYSTEM_USERS.filter(u => {
    if (u.name === currentUser?.nombre) return false;
    const isTeammate = u.project === devProj;
    const isLeaderOrAdmin = u.role === 'MANAGER' || u.role === 'ADMIN';
    return isTeammate || (isLeaderOrAdmin && (u.project === devProj || u.project === 'TODOS'));
  });

  return {
    recipients: filtered.length > 0 ? filtered : SYSTEM_USERS.filter(u => u.role === 'ADMIN' || u.role === 'MANAGER'),
    notice: 'Como Desarrollador, puedes enviar feedback a tus compañeros de proyecto y a tu Líder Técnico.',
    roleLabel: 'Desarrollador'
  };
};

export const useAlertsCenter = ({ selectedProjectId }) => {
  const { user } = useAuth();
  const isAdmin = user?.rol?.toLowerCase().includes('admin') || user?.rol?.toLowerCase().includes('administrador');

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

  // Recipient / A quién va dirigido
  const recipientsInfo = useMemo(() => getRecipientsForUser(user, formProject), [user, formProject]);
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

  useEffect(() => {
    api.get('/api/v1/alerts').then(res => {
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const apiFeed = res.data.map((a, idx) => ({
          id: `api-alert-${a.id_alerta || idx}`,
          title: a.titulo || a.tipo_alerta || `Alerta #${idx + 1}`,
          summary: a.mensaje || a.descripcion || 'Alerta generada por el motor de agilidad.',
          category: idx % 2 === 0 ? 'Código' : 'Procesos',
          tags: ['Jira Cloud', a.severidad || 'Sistema'],
          status: a.reconocida ? 'RESUELTO' : 'PENDIENTE',
          priority: (a.severidad || '').toUpperCase() === 'CRITICAL' ? 'ALTA' : 'MEDIA',
          project: a.id_proyecto || 'Proyecto Jira',
          timeAgo: 'Reciente',
          author: 'Motor de Inteligencia',
          recipient: 'Equipo Técnico',
          avatar: 'A',
          comments: []
        }));
        
        setFeedbackList(prev => {
          const ids = new Set(prev.map(p => p.id));
          const uniqueApi = apiFeed.filter(f => !ids.has(f.id));
          return [...prev, ...uniqueApi];
        });
      }
    }).catch(err => console.warn("Usando catálogo dinámico de feedback:", err));
  }, []);

  const handleCreateFeedback = (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) {
      showToast('Ingresa el título y la descripción del feedback.');
      return;
    }

    const newItem = {
      id: `fb-${Date.now()}`,
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
    showToast('✨ Nuevo feedback registrado exitosamente.');
  };

  const handleToggleStatus = (id, targetStatus = null) => {
    setFeedbackList(prev => prev.map(item => {
      if (item.id === id) {
        let nextStatus = targetStatus;
        if (!nextStatus) {
          if (item.status === 'PENDIENTE') nextStatus = 'EN_PROCESO';
          else if (item.status === 'EN_PROCESO') nextStatus = 'RESUELTO';
          else nextStatus = 'PENDIENTE';
        }

        if (nextStatus === 'RESUELTO') {
          showToast('✅ Feedback marcado como resuelto y guardado en el historial.');
        } else if (nextStatus === 'EN_PROCESO') {
          showToast('⏳ Feedback cambiado a En Proceso.');
        } else {
          showToast('📌 Feedback reactivado como Pendiente.');
        }
        return { ...item, status: nextStatus };
      }
      return item;
    }));
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
