import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import api from '../../../services/api';

const INITIAL_FEEDBACK_ITEMS = [
  {
    id: 'fb-1',
    title: 'Mejorar documentación de APIs',
    summary: 'La documentación de los endpoints necesita más ejemplos y casos de uso prácticos para la integración de servicios backend.',
    category: 'Código',
    tags: ['Backend', 'API Service'],
    status: 'PENDIENTE',
    priority: 'MEDIA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: 'Hace 2 días',
    author: 'Julián Torres',
    avatar: 'J',
    comments: [
      { id: 1, author: 'Carlos Pérez', text: 'Se agregarán ejemplos de Swagger en el próximo sprint.', time: 'Hace 1 día' }
    ]
  },
  {
    id: 'fb-2',
    title: 'Refactorizar módulo de autenticación',
    summary: 'El código actual tiene alta complejidad en tokens JWT. Revisar patrones de diseño y matriz de permisos RBAC.',
    category: 'Código',
    tags: ['Backend', 'Auth Service'],
    status: 'PENDIENTE',
    priority: 'ALTA',
    project: 'Portal de Clientes & Seguridad',
    timeAgo: 'Hace 2 días',
    author: 'Clara Gómez',
    avatar: 'C',
    comments: []
  },
  {
    id: 'fb-3',
    title: 'Optimizar consultas de base de datos',
    summary: 'Algunas consultas de la BD pueden optimizarse para mejorar la velocidad de carga de reportes ejecutivos.',
    category: 'Procesos',
    tags: ['Backend', 'Database'],
    status: 'RESUELTO',
    priority: 'BAJA',
    project: 'API Gateway ETL',
    timeAgo: 'Hace 5 días',
    author: 'Carlos Pérez',
    avatar: 'C',
    comments: [
      { id: 1, author: 'Mauricio Salamanca', text: 'Índices agregados correctamente en MySQL.', time: 'Hace 3 días' }
    ]
  },
  {
    id: 'fb-4',
    title: 'Mejorar manejo de errores en frontend',
    summary: 'Implementar mejores mensajes de error para el usuario final e integración de alertas en tiempo real.',
    category: 'UI/UX',
    tags: ['Frontend', 'UI/UX'],
    status: 'EN_PROCESO',
    priority: 'MEDIA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: 'Hace 1 día',
    author: 'Diana Patarroyo',
    avatar: 'D',
    comments: []
  },
  {
    id: 'fb-5',
    title: 'Actualizar dependencias del proyecto',
    summary: 'Algunas dependencias tienen versiones más recientes disponibles con parches de seguridad recomendados.',
    category: 'Procesos',
    tags: ['DevOps', 'Dependencias'],
    status: 'RESUELTO',
    priority: 'BAJA',
    project: 'API Gateway ETL',
    timeAgo: 'Hace 1 semana',
    author: 'Andrés Torres',
    avatar: 'A',
    comments: []
  },
  {
    id: 'fb-6',
    title: 'Estandarización de componentes de UI',
    summary: 'Uniformar colores de botones y estados hover en el sistema de diseño de la consola.',
    category: 'UI/UX',
    tags: ['Frontend', 'Diseño'],
    status: 'PENDIENTE',
    priority: 'MEDIA',
    project: 'Sistema Analytics MCHAV',
    timeAgo: 'Hace 3 días',
    author: 'Eduardo Martínez',
    avatar: 'E',
    comments: []
  },
  {
    id: 'fb-7',
    title: 'Revisión de arquitectura WebSockets',
    summary: 'Evaluar la resiliencia de la conexión en tiempo real ante desconexiones de red.',
    category: 'Arquitectura',
    tags: ['Arquitectura', 'WebSockets'],
    status: 'EN_PROCESO',
    priority: 'ALTA',
    project: 'API Gateway ETL',
    timeAgo: 'Hace 4 días',
    author: 'Fernando Ruiz',
    avatar: 'F',
    comments: []
  }
];

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
      avatar: (user?.nombre || 'U')[0].toUpperCase(),
      comments: []
    };

    setFeedbackList(prev => [newItem, ...prev]);
    setShowCreateModal(false);
    setFormTitle('');
    setFormSummary('');
    showToast('✨ Nuevo feedback registrado exitosamente.');
  };

  const handleToggleStatus = (id) => {
    setFeedbackList(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'RESUELTO' ? 'PENDIENTE' : 'RESUELTO';
        showToast(nextStatus === 'RESUELTO' ? '✅ Feedback marcado como resuelto.' : '🔄 Feedback reabierto.');
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
      const headers = ['ID', 'Título', 'Resumen', 'Categoría', 'Estado', 'Prioridad', 'Proyecto', 'Autor'];
      const rows = feedbackList.map(item => [
        item.id,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.summary.replace(/"/g, '""')}"`,
        item.category,
        item.status,
        item.priority,
        `"${item.project}"`,
        `"${item.author}"`
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

      if (statusTab === 'PENDING' && item.status !== 'PENDIENTE' && item.status !== 'EN_PROCESO') return false;
      if (statusTab === 'RESOLVED' && item.status !== 'RESUELTO') return false;
      if (statusTab === 'MY_ASSIGNED' && item.author !== user?.nombre) return false;

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
