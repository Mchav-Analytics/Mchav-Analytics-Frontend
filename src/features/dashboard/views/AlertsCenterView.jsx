// ============================================================================
// VISTA: CENTRO DE ACTIVIDAD — FEEDBACK & REVISIONES (MIGRACIÓN UI MAQUETADA)
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Users,
  Search,
  Plus,
  FileDown,
  X,
  ArrowUp,
  ArrowDown,
  Code,
  FileText,
  Layers,
  Layout,
  ShieldCheck,
  Sparkles,
  Info,
  Send,
  Clock,
  Trash2,
  Filter,
  Check,
  Activity,
  FolderKanban,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import api, { jiraService } from '../../../services/api';

const tooltipStyle = {
  backgroundColor: '#191c3d',
  borderColor: '#33376b',
  borderRadius: '12px',
  color: '#f8fafc',
  fontSize: '12px',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
};

const MetricInfoTooltip = ({ text, align = "auto" }) => {
  return (
    <div className="relative group/tooltip flex items-center inline-flex">
      <Info size={13} className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer ml-1 shrink-0" />
      <div className={`absolute bottom-full mb-2 ${align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"} hidden group-hover/tooltip:block w-56 p-2.5 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none text-left backdrop-blur-md font-normal leading-relaxed`}>
        {text}
        <div className={`absolute top-full ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent border-t-slate-900`}></div>
      </div>
    </div>
  );
};

// DATOS INICIALES DE FEEDBACK & REVISIONES (Fieles al Maquetado)
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

export default function AlertsCenterView({ selectedProjectId = null }) {
  const { user } = useAuth();
  const isAdmin = user?.rol?.toLowerCase().includes('admin') || user?.rol?.toLowerCase().includes('administrador');

  const [feedbackList, setFeedbackList] = useState(() => {
    const saved = localStorage.getItem('mchav_feedback_items');
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACK_ITEMS;
  });

  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'RESOLVED' | 'MY_ASSIGNED'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'priority' | 'project'

  // Filtros de la Barra Lateral Derecha
  const [sidebarProject, setSidebarProject] = useState('ALL');
  const [sidebarCategory, setSidebarCategory] = useState('ALL');
  const [sidebarPriority, setSidebarPriority] = useState('ALL');
  const [sidebarStatus, setSidebarStatus] = useState('ALL');

  // Modal para Nuevo Feedback
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formCategory, setFormCategory] = useState('Código');
  const [formPriority, setFormPriority] = useState('MEDIA');
  const [formProject, setFormProject] = useState('Sistema Analytics MCHAV');

  // Comentarios internos en tarjeta expandida
  const [newCommentText, setNewCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Guardar en localStorage al cambiar la lista
  useEffect(() => {
    localStorage.setItem('mchav_feedback_items', JSON.stringify(feedbackList));
  }, [feedbackList]);

  // Cargar datos reales desde la API de alertas o proyectos si está disponible
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
        
        // Unir datos preservando los locales
        setFeedbackList(prev => {
          const ids = new Set(prev.map(p => p.id));
          const uniqueApi = apiFeed.filter(f => !ids.has(f.id));
          return [...prev, ...uniqueApi];
        });
      }
    }).catch(err => console.warn("Usando catálogo dinámico de feedback:", err));
  }, []);

  // Manejo de Creación de Nuevo Feedback
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

  // Manejo de cambio de estado (Resolver / Reabrir)
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

  // Agregar comentario en tarjeta expandida
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

  // Exportar lista a CSV
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

  // Conteos por categoría para la barra lateral derecha
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

  // Lista filtrada dinámicamente
  const filteredItems = useMemo(() => {
    return feedbackList.filter(item => {
      // Filtro de búsqueda por texto
      const matchesSearch = !searchTerm.trim() ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.project.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Pestañas superiores (Todos, Pendientes, Resueltos, Mis Asignados)
      if (statusTab === 'PENDING' && item.status !== 'PENDIENTE' && item.status !== 'EN_PROCESO') return false;
      if (statusTab === 'RESOLVED' && item.status !== 'RESUELTO') return false;
      if (statusTab === 'MY_ASSIGNED' && item.author !== user?.nombre) return false;

      // Filtros del panel lateral derecho
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

  // Conteos KPI
  const pendingCount = feedbackList.filter(i => i.status === 'PENDIENTE').length;
  const resolvedCount = feedbackList.filter(i => i.status === 'RESUELTO').length;
  const inProgressCount = feedbackList.filter(i => i.status === 'EN_PROCESO').length;

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200 font-sans pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 border border-indigo-500/50 text-indigo-200 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-black tracking-wide">{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-100 ml-3">
            <X size={15} />
          </button>
        </div>
      )}

      {/* HEADER SUPERIOR (Maquetado idéntico a la imagen) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Feedback & Revisiones</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Seguimiento de feedback, revisiones y acciones de mejora del equipo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Nuevo Feedback</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1a1e3b] hover:bg-slate-200 dark:hover:bg-[#252a4e] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-[#33376b] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <FileDown size={16} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* 4 TARJETAS KPI MAQUETADAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Feedback Pendiente */}
        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Feedback Pendiente</span>
              <MetricInfoTooltip text="Items de feedback recibidos pendientes por revisar o asignar." />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</p>
            <p className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 mt-1">
              +2 desde la semana pasada
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
            <MessageSquare size={20} />
          </div>
        </div>

        {/* Card 2: Feedback Resuelto */}
        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Feedback Resuelto</span>
              <MetricInfoTooltip text="Acciones de mejora atendidas e implementadas." />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{resolvedCount}</p>
            <p className="text-[11px] font-semibold text-emerald-500 dark:text-emerald-400 mt-1">
              +5 desde la semana pasada
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 3: Acciones en Proceso */}
        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones en Proceso</span>
              <MetricInfoTooltip text="Planes de mejora técnica actualmente en ejecución." />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{inProgressCount || 5}</p>
            <p className="text-[11px] font-semibold text-amber-500 dark:text-amber-400 mt-1">
              En seguimiento
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Card 4: Mejora del Equipo */}
        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mejora del Equipo</span>
              <MetricInfoTooltip text="Porcentaje de feedback convertido en refactorizaciones de valor." />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">50%</p>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              Basado en feedback aplicado
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE DOS COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: PESTAÑAS Y TARJETAS (8 COLUMNAS) */}
        <div className="lg:col-span-8 space-y-4">
          {/* BARRA DE PESTAÑAS Y CONTROLES */}
          <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Pestañas de Filtrado Superior */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStatusTab('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${statusTab === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('PENDING')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${statusTab === 'PENDING'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                Pendientes
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('RESOLVED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${statusTab === 'RESOLVED'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                Resueltos
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('MY_ASSIGNED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${statusTab === 'MY_ASSIGNED'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                Mis Asignados
              </button>
            </div>

            {/* Ordenar y Buscador Rápido */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar feedback..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500 w-36 sm:w-44"
                />
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="recent">Más recientes</option>
                <option value="priority">Por Prioridad</option>
                <option value="project">Por Proyecto</option>
              </select>
            </div>
          </div>

          {/* LISTA DE TARJETAS DE FEEDBACK (FIDELIDAD AL MAQUETADO) */}
          <div className="space-y-3.5">
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] rounded-2xl space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
                <p className="text-sm font-bold text-slate-400">No se encontró feedback con los filtros aplicados.</p>
                <button
                  type="button"
                  onClick={() => { setStatusTab('ALL'); setSidebarCategory('ALL'); setSidebarPriority('ALL'); setSidebarStatus('ALL'); setSearchTerm(''); }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 text-xs font-bold hover:bg-indigo-600/30 transition-colors"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isExpanded = expandedId === item.id;
                const isResolved = item.status === 'RESUELTO';

                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-[#13162b] border ${isExpanded ? 'border-indigo-500 shadow-md shadow-indigo-500/10' : 'border-slate-200 dark:border-[#252a4e] hover:border-indigo-500/50'
                      } rounded-2xl p-5 transition-all duration-200 space-y-4`}
                  >
                    {/* Header de la Tarjeta */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="flex items-start justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* Ícono de Prioridad */}
                        <div className="mt-0.5 shrink-0">
                          {item.priority === 'ALTA' ? (
                            <div className="w-9 h-9 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
                              <ArrowUp size={18} />
                            </div>
                          ) : item.priority === 'MEDIA' ? (
                            <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                              <ArrowUp size={18} />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                              <ArrowDown size={18} />
                            </div>
                          )}
                        </div>

                        {/* Título, Descripción y Tags */}
                        <div className="space-y-1 min-w-0">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {item.summary}
                          </p>

                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            {item.tags?.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-md bg-purple-900/30 border border-purple-700/40 text-purple-300 text-[10px] font-bold"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Status Pill, Tiempo y Avatar */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${isResolved
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                              : item.status === 'EN_PROCESO'
                                ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                                : 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                            }`}
                        >
                          {isResolved ? 'Resuelto' : item.status === 'EN_PROCESO' ? 'En Proceso' : 'Pendiente'}
                        </span>

                        <span className="text-[11px] font-medium text-slate-400">
                          {item.timeAgo}
                        </span>

                        <div
                          title={`Autor: ${item.author}`}
                          className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-[9px] flex items-center justify-center border-2 border-[#13162b]"
                        >
                          {item.avatar || 'U'}
                        </div>
                      </div>
                    </div>

                    {/* VISTA EXPANDIDA CON DETALLES Y HILO DE COMENTARIOS */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-slate-200 dark:border-[#252a4e] space-y-4 animate-in slide-in-from-top-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-slate-400">
                            Proyecto: <span className="text-slate-200 font-extrabold">{item.project}</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isResolved
                                  ? 'bg-amber-600/20 text-amber-300 hover:bg-amber-600/30'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                            >
                              <Check size={14} />
                              <span>{isResolved ? 'Reabrir Feedback' : 'Marcar Resuelto'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Hilo de Comentarios */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] space-y-3">
                          <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                            Conversación & Comentarios ({item.comments?.length || 0})
                          </h4>

                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {item.comments?.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No hay comentarios registrados en este feedback aún.</p>
                            ) : (
                              item.comments.map(c => (
                                <div key={c.id} className="p-2.5 rounded-lg bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-indigo-400">{c.author}</span>
                                    <span className="text-slate-500">{c.time}</span>
                                  </div>
                                  <p className="text-xs text-slate-300">{c.text}</p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Campo agregar comentario */}
                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="text"
                              placeholder="Escribe una respuesta o aclaración..."
                              value={newCommentText}
                              onChange={e => setNewCommentText(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleAddComment(item.id); }}
                              className="flex-1 bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#2b305b] text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddComment(item.id)}
                              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: FILTROS Y CATEGORÍAS (4 COLUMNAS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* CAJA 1: FILTROS */}
          <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Filtros</h3>

            <div className="space-y-3.5">
              {/* Filtro Proyecto */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Proyecto</label>
                <select
                  value={sidebarProject}
                  onChange={e => setSidebarProject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="ALL">Todos los proyectos</option>
                  <option value="Sistema Analytics MCHAV">Sistema Analytics MCHAV</option>
                  <option value="Portal de Clientes & Seguridad">Portal de Clientes & Seguridad</option>
                  <option value="API Gateway ETL">API Gateway ETL</option>
                </select>
              </div>

              {/* Filtro Tipo de Feedback */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tipo de Feedback</label>
                <select
                  value={sidebarCategory}
                  onChange={e => setSidebarCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="ALL">Todos los tipos</option>
                  <option value="Código">Código / Backend</option>
                  <option value="Documentación">Documentación</option>
                  <option value="Procesos">Procesos / ETL</option>
                  <option value="UI/UX">UI/UX / Frontend</option>
                  <option value="Arquitectura">Arquitectura</option>
                </select>
              </div>

              {/* Filtro Prioridad */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Prioridad</label>
                <select
                  value={sidebarPriority}
                  onChange={e => setSidebarPriority(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="ALL">Todas las prioridades</option>
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Media</option>
                  <option value="BAJA">Baja</option>
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estado</label>
                <select
                  value={sidebarStatus}
                  onChange={e => setSidebarStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="RESUELTO">Resueltos</option>
                </select>
              </div>
            </div>
          </div>

          {/* CAJA 2: TIPOS DE FEEDBACK (Contadores Dinámicos) */}
          <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Tipos de Feedback</h3>

            <div className="space-y-2">
              <div
                onClick={() => setSidebarCategory(sidebarCategory === 'Código' ? 'ALL' : 'Código')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${sidebarCategory === 'Código' ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-50 dark:bg-[#1a1e3b] border-slate-200 dark:border-[#2b305b] hover:border-indigo-500/40'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Code size={16} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Código</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-[#252a4e] px-2 py-0.5 rounded-md">
                  {categoryCounts['Código']}
                </span>
              </div>

              <div
                onClick={() => setSidebarCategory(sidebarCategory === 'Documentación' ? 'ALL' : 'Documentación')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${sidebarCategory === 'Documentación' ? 'bg-purple-600/20 border-purple-500' : 'bg-slate-50 dark:bg-[#1a1e3b] border-slate-200 dark:border-[#2b305b] hover:border-purple-500/40'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-purple-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Documentación</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-[#252a4e] px-2 py-0.5 rounded-md">
                  {categoryCounts['Documentación']}
                </span>
              </div>

              <div
                onClick={() => setSidebarCategory(sidebarCategory === 'Procesos' ? 'ALL' : 'Procesos')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${sidebarCategory === 'Procesos' ? 'bg-amber-600/20 border-amber-500' : 'bg-slate-50 dark:bg-[#1a1e3b] border-slate-200 dark:border-[#2b305b] hover:border-amber-500/40'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Layers size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Procesos</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-[#252a4e] px-2 py-0.5 rounded-md">
                  {categoryCounts['Procesos']}
                </span>
              </div>

              <div
                onClick={() => setSidebarCategory(sidebarCategory === 'UI/UX' ? 'ALL' : 'UI/UX')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${sidebarCategory === 'UI/UX' ? 'bg-teal-600/20 border-teal-500' : 'bg-slate-50 dark:bg-[#1a1e3b] border-slate-200 dark:border-[#2b305b] hover:border-teal-500/40'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Layout size={16} className="text-teal-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">UI/UX</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-[#252a4e] px-2 py-0.5 rounded-md">
                  {categoryCounts['UI/UX']}
                </span>
              </div>

              <div
                onClick={() => setSidebarCategory(sidebarCategory === 'Arquitectura' ? 'ALL' : 'Arquitectura')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${sidebarCategory === 'Arquitectura' ? 'bg-sky-600/20 border-sky-500' : 'bg-slate-50 dark:bg-[#1a1e3b] border-slate-200 dark:border-[#2b305b] hover:border-sky-500/40'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-sky-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Arquitectura</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-[#252a4e] px-2 py-0.5 rounded-md">
                  {categoryCounts['Arquitectura']}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL NUEVO FEEDBACK */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#252a4e] pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Nuevo Feedback / Revisión</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFeedback} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">Título del Feedback</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mejorar documentación de APIs"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">Descripción / Detalles</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe la oportunidad de mejora o hallazgo..."
                  value={formSummary}
                  onChange={e => setFormSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Tipo de Feedback</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500"
                  >
                    <option value="Código">Código</option>
                    <option value="Documentación">Documentación</option>
                    <option value="Procesos">Procesos</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="Arquitectura">Arquitectura</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Prioridad</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500"
                  >
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Media</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">Proyecto Asociado</label>
                <select
                  value={formProject}
                  onChange={e => setFormProject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500"
                >
                  <option value="Sistema Analytics MCHAV">Sistema Analytics MCHAV</option>
                  <option value="Portal de Clientes & Seguridad">Portal de Clientes & Seguridad</option>
                  <option value="API Gateway ETL">API Gateway ETL</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#1a1e3b] text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Guardar Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
