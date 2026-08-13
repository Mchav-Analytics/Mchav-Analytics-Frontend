// ============================================================================
// SUB-VISTA: PLAN DE TRABAJO Y GESTIÓN DE TAREAS (CON PAGINACIÓN Y MÓDULOS AVANZADOS)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Info, 
  User, 
  RotateCcw,
  Zap,
  ShieldCheck,
  X,
  Activity,
  Filter,
  CheckCircle,
  FileText,
  Bug,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Printer,
  ArrowUpDown,
  Sparkles,
  ListTodo
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { developerService } from '../../../services/api';

const DEFAULT_WORKLOAD_LIST = [
  { key_issue: 'MCHAV-101', summary: 'Implementar autenticación SSO y OAuth 2.0', status: 'EN PROGRESO', story_points: 8, cycle_time_days: 4.1, tipo: 'Historia de Usuario', prioridad: 'Alta', asignado: 'Valka Hoyos', avatar: '101', avatarBg: 'from-purple-600 to-indigo-600', fecha: 'Hace 3.2 días', descripcion: 'Integración completa con servicio de identidad Okta / Google OAuth para autenticación empresarial.' },
  { key_issue: 'MCHAV-105', summary: 'Corregir bug en la API de pagos y transacciones', status: 'LISTO', story_points: 5, cycle_time_days: 2.5, tipo: 'Bug / Defecto', prioridad: 'Crítica', asignado: 'Valka Hoyos', avatar: '105', avatarBg: 'from-emerald-600 to-teal-600', fecha: 'Completado', descripcion: 'Resolución de excepción de concurrencia y validaciones nulas en endpoint transaccional.' },
  { key_issue: 'MCHAV-108', summary: 'Configuración de alertas de inactividad', status: 'PENDIENTE', story_points: 5, cycle_time_days: 0, tipo: 'Historia de Usuario', prioridad: 'Media', asignado: 'Valka Hoyos', avatar: '108', avatarBg: 'from-blue-600 to-cyan-600', fecha: 'Registrado hoy', descripcion: 'Implementar job programado para detectar tareas sin movimiento por más de 3 días.' },
  { key_issue: 'MCHAV-112', summary: 'Rediseñar vista de desarrollador con Recharts', status: 'EN PROGRESO', story_points: 13, cycle_time_days: 3.2, tipo: 'Historia de Usuario', prioridad: 'Media', asignado: 'Valka Hoyos', avatar: '112', avatarBg: 'from-purple-600 to-pink-600', fecha: 'Hace 1 día', descripcion: 'Construcción de dashboards modulares interactivos con animaciones y Recharts.' },
  { key_issue: 'MCHAV-114', summary: 'Refactorización de consultas pesadas SQL', status: 'PENDIENTE', story_points: 8, cycle_time_days: 0, tipo: 'Deuda Técnica', prioridad: 'Alta', asignado: 'Valka Hoyos', avatar: '114', avatarBg: 'from-indigo-600 to-purple-700', fecha: 'Ayer', descripcion: 'Optimización de índices compuestos B-Tree y vistas materializadas en PostgreSQL.' },
  { key_issue: 'MCHAV-121', summary: 'Documentación de API endpoints Swagger', status: 'PENDIENTE', story_points: 3, cycle_time_days: 0, tipo: 'Tarea / Deuda', prioridad: 'Baja', asignado: 'Valka Hoyos', avatar: '121', avatarBg: 'from-cyan-600 to-teal-600', fecha: 'Reg: 10 Feb', descripcion: 'Generación de esquemas OpenAPI 3.0 para OpenAPI Swagger UI.' },
  { key_issue: 'MCHAV-124', summary: 'Pruebas unitarias en módulo Auth', status: 'PENDIENTE', story_points: 5, cycle_time_days: 0, tipo: 'Tarea / Deuda', prioridad: 'Media', asignado: 'Valka Hoyos', avatar: '124', avatarBg: 'from-emerald-600 to-teal-600', fecha: 'Reg: 11 Feb', descripcion: 'Aumentar cobertura de pruebas unitarias al 85% en manejadores de autenticación.' },
  { key_issue: 'MCHAV-125', summary: 'Integración con API Sandbox externa', status: 'BLOQUEADA', status_motif: 'Esperando credenciales del equipo backend.', story_points: 5, cycle_time_days: 2.0, tipo: 'Bug / Defecto', prioridad: 'Crítica', asignado: 'Valka Hoyos', avatar: '125', avatarBg: 'from-rose-600 to-red-600', fecha: 'Bloqueada hace 2d', descripcion: 'Obtención de Tokens de prueba y endpoints de pruebas E2E para pasarela Sandbox.' },
  { key_issue: 'MCHAV-129', summary: 'Resolver memory leak en servicio de WebSockets', status: 'EN PROGRESO', story_points: 8, cycle_time_days: 3.5, tipo: 'Bug / Defecto', prioridad: 'Alta', asignado: 'Valka Hoyos', avatar: '129', avatarBg: 'from-rose-600 to-purple-600', fecha: 'Hace 2 días', descripcion: 'Cierre correcto de conexiones inactivas e inspección de manejadores de eventos.' },
  { key_issue: 'MCHAV-133', summary: 'Implementar exportador de reportes a PDF y Excel', status: 'LISTO', story_points: 8, cycle_time_days: 2.2, tipo: 'Historia de Usuario', prioridad: 'Media', asignado: 'Valka Hoyos', avatar: '133', avatarBg: 'from-teal-600 to-emerald-600', fecha: 'Completado', descripcion: 'Generación dinámica de documentos PDF vectoriales y hojas de cálculo XLSX.' },
  { key_issue: 'MCHAV-137', summary: 'Actualizar dependencias de seguridad e imágenes Docker', status: 'LISTO', story_points: 3, cycle_time_days: 1.2, tipo: 'Deuda Técnica', prioridad: 'Baja', asignado: 'Valka Hoyos', avatar: '137', avatarBg: 'from-blue-600 to-indigo-600', fecha: 'Completado', descripcion: 'Escaneo de vulnerabilidades Trivy y actualización a Python 3.11-slim.' },
  { key_issue: 'MCHAV-141', summary: 'Corregir desalineación de tarjetas en modo oscuro', status: 'LISTO', story_points: 2, cycle_time_days: 0.9, tipo: 'Bug / Defecto', prioridad: 'Baja', asignado: 'Valka Hoyos', avatar: '141', avatarBg: 'from-[#00f5d4] to-teal-700', fecha: 'Completado', descripcion: 'Ajuste de padding y bordes Tailwind CSS en componentes de visualización.' },
  { key_issue: 'MCHAV-145', summary: 'Migración de esquemas de datos en base PostgreSQL', status: 'PENDIENTE', story_points: 5, cycle_time_days: 0, tipo: 'Deuda Técnica', prioridad: 'Alta', asignado: 'Valka Hoyos', avatar: '145', avatarBg: 'from-purple-600 to-indigo-700', fecha: 'Reg: 12 Feb', descripcion: 'Scripts de migración Alembic y actualización de constraints de clave foránea.' },
  { key_issue: 'MCHAV-150', summary: 'Diseñar alertas contextuales de alto impacto', status: 'EN PROGRESO', story_points: 8, cycle_time_days: 1.5, tipo: 'Historia de Usuario', prioridad: 'Media', asignado: 'Valka Hoyos', avatar: '150', avatarBg: 'from-cyan-600 to-indigo-600', fecha: 'Hace 1 día', descripcion: 'Sistema de notificaciones push integradas en consola de desarrollador.' }
];

export default function DevWorkloadView({ selectedProjectId = 'PROJ-01' }) {
  const { user } = useAuth();
  const [scorecard, setScorecard] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('TODOS'); // 'TODOS' | 'PROGRESO' | 'PENDIENTES' | 'BLOQUEADAS' | 'LISTO'
  const [sortBy, setSortBy] = useState('PRIORIDAD'); // 'PRIORIDAD' | 'SP' | 'CLAVE'
  const [tasksList, setTasksList] = useState(DEFAULT_WORKLOAD_LIST);
  const [selectedTaskModal, setSelectedTaskModal] = useState(null);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);

  // Paginación de 7 elementos por página para llenar la tarjeta completamente
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Formulario para nueva tarea
  const [newKey, setNewKey] = useState(`MCHAV-${Math.floor(150 + Math.random() * 50)}`);
  const [newSummary, setNewSummary] = useState('');
  const [newTipo, setNewTipo] = useState('Historia de Usuario');
  const [newPrioridad, setNewPrioridad] = useState('Media');
  const [newSp, setNewSp] = useState(5);
  const [newDescripcion, setNewDescripcion] = useState('');

  const loadData = async () => {
    try {
      const data = await developerService.getMyScorecard(selectedProjectId);
      setScorecard(data);
    } catch (err) {
      console.warn("Error cargando scorecard de carga:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const handleReload = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const devName = user?.nombre || 'Valka Hoyos';

  // Cambio de estado de una tarea
  const handleUpdateStatus = (keyIssue, newStatus) => {
    setTasksList(prev => prev.map(t => {
      if (t.key_issue === keyIssue) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
    if (selectedTaskModal && selectedTaskModal.key_issue === keyIssue) {
      setSelectedTaskModal(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Crear nueva tarea en tiempo real
  const handleCreateNewTask = (e) => {
    e.preventDefault();
    if (!newSummary.trim()) return;

    const createdTask = {
      key_issue: newKey,
      summary: newSummary,
      status: 'PENDIENTE',
      story_points: Number(newSp),
      cycle_time_days: 0,
      tipo: newTipo,
      prioridad: newPrioridad,
      asignado: devName,
      avatar: newKey.split('-')[1] || 'NEW',
      avatarBg: 'from-purple-600 to-indigo-600',
      fecha: 'Creado ahora',
      descripcion: newDescripcion || 'Nueva tarea creada desde la consola personal del desarrollador.'
    };

    setTasksList(prev => [createdTask, ...prev]);
    setNewSummary('');
    setNewDescripcion('');
    setNewKey(`MCHAV-${Math.floor(150 + Math.random() * 50)}`);
    setNewTaskModalOpen(false);
    setCurrentPage(1);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Filtrado y Ordenamiento
  const filteredTasks = tasksList.filter(task => {
    const matchesSearch = 
      task.key_issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tipo.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'PENDIENTES') return task.status === 'PENDIENTE';
    if (activeFilter === 'PROGRESO') return task.status === 'EN PROGRESO';
    if (activeFilter === 'BLOQUEADAS') return task.status === 'BLOQUEADA';
    if (activeFilter === 'LISTO') return task.status === 'LISTO';

    return true;
  }).sort((a, b) => {
    if (sortBy === 'SP') return b.story_points - a.story_points;
    if (sortBy === 'CLAVE') return a.key_issue.localeCompare(b.key_issue);
    // Por defecto Prioridad
    const priorityWeight = { 'Crítica': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
    return (priorityWeight[b.prioridad] || 0) - (priorityWeight[a.prioridad] || 0);
  });

  // Cálculo de Paginación
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const countPendientes = tasksList.filter(t => t.status === 'PENDIENTE').length;
  const countProgreso = tasksList.filter(t => t.status === 'EN PROGRESO').length;
  const countBloqueadas = tasksList.filter(t => t.status === 'BLOQUEADA').length;
  const countListo = tasksList.filter(t => t.status === 'LISTO').length;
  const countTotal = tasksList.length;

  const totalSPBurned = tasksList.filter(t => t.status === 'LISTO').reduce((acc, curr) => acc + curr.story_points, 0);
  const totalSPAssigned = tasksList.reduce((acc, curr) => acc + curr.story_points, 0);
  const capacityPct = Math.min(100, Math.round(((countProgreso + countPendientes + countBloqueadas) / 10) * 100));

  return (
    <div className="w-full max-w-full flex-1 flex flex-col justify-between space-y-4 text-left font-sans transition-colors duration-300 text-slate-100">

      {/* 1. CABECERA AL ESTILO DIRECTORIO DE USUARIOS CON ACCIONES AVANZADAS */}
      <div className="relative rounded-2xl bg-[#141738] p-5 shadow-2xl border border-[#272b5c] shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Título e Identidad */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-md shadow-indigo-900/40 shrink-0">
              <Layers size={22} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl font-extrabold text-white flex items-center gap-2.5 flex-wrap">
                Plan de Trabajo: {devName}
                <span className="flex items-center gap-1.5 rounded-full bg-[#00f5d4]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#00f5d4] border border-[#00f5d4]/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00f5d4] animate-pulse"></span>
                  {user?.rol || 'DEVELOPER'}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Planificación estratégica de tareas pendientes, entregas en progreso y capacidad del sprint.
              </p>
            </div>
          </div>

          {/* Acciones principales: Registrar Tarea + Actualizar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setNewTaskModalOpen(true)}
              className="px-3.5 py-2 text-xs font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-purple-900/40 border border-purple-400/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Plus size={15} />
              <span>Nueva Tarea</span>
            </button>

            <button
              onClick={handleReload}
              className="p-2 text-slate-400 hover:text-white bg-[#0b0e22] hover:bg-[#181b42] border border-[#232752] rounded-xl transition-all cursor-pointer"
              title="Actualizar datos"
            >
              <RotateCcw size={15} className={isRefreshing ? "animate-spin text-indigo-400" : ""} />
            </button>
          </div>

        </div>

        {/* BANDA DE SALUD Y CAPACIDAD DEL SPRINT (NUEVA MEJORA) */}
        <div className="mt-4 pt-3 border-t border-[#232752] flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap text-[11px] font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>Capacidad Utilizada: <strong className="text-indigo-400 font-extrabold">{capacityPct}%</strong></span>
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-purple-300 font-bold">SP Completados: {totalSPBurned} / {totalSPAssigned} SP</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-400 font-bold">{countListo} Listas</span>
            <span className="text-purple-400 font-bold">{countProgreso} En Progreso</span>
            <span className="text-amber-400 font-bold">{countPendientes} Pendientes</span>
            <span className="text-rose-400 font-bold">{countBloqueadas} Bloqueadas</span>
          </div>

          <div className="w-full md:w-48 bg-[#0c0e21] h-2 rounded-full overflow-hidden border border-[#232752]">
            <div 
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${capacityPct}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* 2. CONTENEDOR PRINCIPAL CON TABLA Y FILTROS */}
      <div className="relative rounded-2xl bg-[#141738] p-5 shadow-2xl border border-[#272b5c] space-y-4 flex-1 flex flex-col justify-between overflow-hidden">
        
        {/* FILTROS Y ORDENAMIENTO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[#232752] shrink-0">
          
          {/* Pestañas de Filtro */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0b0e22] rounded-xl border border-[#232752] overflow-x-auto no-scrollbar">
            <button
              onClick={() => { setActiveFilter('TODOS'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 ${
                activeFilter === 'TODOS' ? 'bg-[#5b36f5] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({countTotal})
            </button>
            <button
              onClick={() => { setActiveFilter('PROGRESO'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 ${
                activeFilter === 'PROGRESO' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              En Progreso ({countProgreso})
            </button>
            <button
              onClick={() => { setActiveFilter('PENDIENTES'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 ${
                activeFilter === 'PENDIENTES' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pendientes ({countPendientes})
            </button>
            <button
              onClick={() => { setActiveFilter('BLOQUEADAS'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 ${
                activeFilter === 'BLOQUEADAS' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bloqueadas ({countBloqueadas})
            </button>
            <button
              onClick={() => { setActiveFilter('LISTO'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 ${
                activeFilter === 'LISTO' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Listas ({countListo})
            </button>
          </div>

          {/* Ordenamiento y Buscador */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar por clave o resumen..."
                className="pl-9 pr-4 py-1.5 bg-[#0c0e21] text-xs text-white placeholder-slate-400 rounded-xl border border-[#232752] focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-[#0c0e21] text-xs text-indigo-300 font-bold rounded-xl border border-[#232752] focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="PRIORIDAD">Ordenar: Prioridad</option>
              <option value="SP">Ordenar: Story Points</option>
              <option value="CLAVE">Ordenar: Clave</option>
            </select>
          </div>

        </div>

        {/* Encabezado de Columnas (Labels) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">
          <div className="col-span-4">USUARIO & INCIDENCIA</div>
          <div className="col-span-3">TIPO & PRIORIDAD</div>
          <div className="col-span-2 text-center">ESTADO</div>
          <div className="col-span-2 text-right">CYCLE TIME / SP</div>
          <div className="col-span-1 text-right">ACCIONES</div>
        </div>

        {/* LISTADO DE TAREAS (FILAS EN TARJETAS DE ALTO CONTRASTE) */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1">
          {paginatedTasks.length > 0 ? (
            paginatedTasks.map((task, idx) => {
              const isProgreso = task.status === 'EN PROGRESO';
              const isBloqueada = task.status === 'BLOQUEADA';
              const isListo = task.status === 'LISTO';

              return (
                <div 
                  key={idx}
                  className="group rounded-2xl bg-[#0e112a] border border-[#232752] hover:border-indigo-500/60 p-3.5 transition-all duration-200 flex flex-col md:grid md:grid-cols-12 items-center gap-4 shadow-md"
                >
                  
                  {/* COL 1: AVATAR + RESUMEN & CLAVE (4 COLS) */}
                  <div className="md:col-span-4 flex items-center gap-3.5 w-full">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${task.avatarBg} text-white font-black text-xs shadow-md shrink-0`}>
                      {task.avatar}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-indigo-400 text-xs">{task.key_issue}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {task.asignado}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white truncate leading-snug">
                        {task.summary}
                      </h3>
                    </div>
                  </div>

                  {/* COL 2: TIPO & PRIORIDAD (3 COLS) */}
                  <div className="md:col-span-3 flex items-center gap-2 w-full">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#181c45] text-indigo-300 border border-indigo-500/30 truncate">
                      {task.tipo}
                    </span>
                    <span className={`px-2 py-0.5 rounded-xl text-[10px] font-extrabold border ${
                      task.prioridad === 'Crítica' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                      task.prioridad === 'Alta' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {task.prioridad}
                    </span>
                  </div>

                  {/* COL 3: SELECTOR DE ESTADO INTERACTIVO (2 COLS) */}
                  <div className="md:col-span-2 flex items-center justify-center w-full">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.key_issue, e.target.value)}
                      className={`w-full max-w-[130px] appearance-none px-2.5 py-1 rounded-xl text-xs font-extrabold cursor-pointer text-center focus:outline-none transition-all border ${
                        isListo
                          ? 'bg-[#064e3b] text-[#00f5d4] border-[#00f5d4]/40'
                          : isProgreso
                          ? 'bg-[#1e1b4b] text-purple-300 border-purple-500/50'
                          : isBloqueada
                          ? 'bg-[#4c0519] text-rose-300 border-rose-500/50'
                          : 'bg-slate-800 text-amber-300 border-slate-700'
                      }`}
                    >
                      <option value="PENDIENTE">⚫ Pendiente</option>
                      <option value="EN PROGRESO">🟣 En Progreso</option>
                      <option value="BLOQUEADA">🔴 Bloqueada</option>
                      <option value="LISTO">🟢 Listo</option>
                    </select>
                  </div>

                  {/* COL 4: CYCLE TIME / SP (2 COLS) */}
                  <div className="md:col-span-2 text-right w-full font-semibold text-xs space-y-0.5">
                    <div className="flex items-center justify-end gap-1 text-slate-200">
                      <Clock size={12} className="text-slate-400" />
                      <span className="font-bold">{task.fecha}</span>
                    </div>
                    <div className="text-[11px] text-purple-400 font-extrabold">
                      {task.story_points} Story Points
                    </div>
                  </div>

                  {/* COL 5: BOTÓN VER LOG (1 COL) */}
                  <div className="md:col-span-1 flex items-center justify-end w-full">
                    <button
                      onClick={() => setSelectedTaskModal(task)}
                      className="px-3 py-1.5 text-xs font-extrabold bg-[#181c45] hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl border border-indigo-500/40 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                      title="Ver detalle completo de la tarea"
                    >
                      <Activity size={13} />
                      <span>Ver Log</span>
                    </button>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No se encontraron tareas con el filtro aplicado.
            </div>
          )}
        </div>

        {/* CONTROLES DE PAGINACIÓN Y RESUMEN INFERIOR (PÁGINA 1 DE N) */}
        <div className="pt-3 border-t border-[#232752] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-semibold gap-2 shrink-0">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <ListTodo size={13} className="text-indigo-400" />
              <span>Mostrando {paginatedTasks.length} de {filteredTasks.length} tareas</span>
            </span>
            <span className="text-purple-400">{countProgreso} en progreso</span>
            <span className="text-[#00f5d4]">{countListo} completadas</span>
          </div>

          {/* BARRA DE PAGINACIÓN */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold">
              Pág {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#0c0e21] text-slate-300 hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-0.5 border border-[#232752]"
              >
                <ChevronLeft size={13} /> Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-6 h-6 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer ${
                    currentPage === pNum
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-[#0c0e21] text-slate-400 hover:text-white border border-[#232752]'
                  }`}
                >
                  {pNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#0c0e21] text-slate-300 hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-0.5 border border-[#232752]"
              >
                Siguiente <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: REGISTRAR NUEVA TAREA PERSONAL */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form onSubmit={handleCreateNewTask} className="relative w-full max-w-md rounded-2xl bg-[#141738] p-6 shadow-2xl border border-[#272b5c] space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#232752]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <Plus size={18} />
                </div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  REGISTRAR NUEVA TAREA PERSONAL
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setNewTaskModalOpen(false)} 
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Clave de Incidencia:</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full p-2.5 bg-[#0c0e21] border border-[#232752] rounded-xl font-mono text-indigo-400 font-extrabold focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Título / Resumen de la Tarea:</label>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Ej: Refactorizar servicios de autenticación..."
                  className="w-full p-2.5 bg-[#0c0e21] border border-[#232752] rounded-xl text-white font-semibold focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 block">Tipo:</label>
                  <select
                    value={newTipo}
                    onChange={(e) => setNewTipo(e.target.value)}
                    className="w-full p-2 bg-[#0c0e21] border border-[#232752] rounded-xl text-white text-[11px] font-bold focus:outline-none"
                  >
                    <option value="Historia de Usuario">Historia</option>
                    <option value="Bug / Defecto">Bug</option>
                    <option value="Deuda Técnica">Deuda</option>
                    <option value="Tarea / Deuda">Tarea</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 block">Prioridad:</label>
                  <select
                    value={newPrioridad}
                    onChange={(e) => setNewPrioridad(e.target.value)}
                    className="w-full p-2 bg-[#0c0e21] border border-[#232752] rounded-xl text-white text-[11px] font-bold focus:outline-none"
                  >
                    <option value="Crítica">Crítica</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 block">SP Estimados:</label>
                  <input
                    type="number"
                    min={1}
                    max={21}
                    value={newSp}
                    onChange={(e) => setNewSp(e.target.value)}
                    className="w-full p-2 bg-[#0c0e21] border border-[#232752] rounded-xl text-white text-[11px] font-extrabold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Descripción:</label>
                <textarea
                  rows={2}
                  value={newDescripcion}
                  onChange={(e) => setNewDescripcion(e.target.value)}
                  placeholder="Detalles sobre lo que contempla esta tarea..."
                  className="w-full p-2.5 bg-[#0c0e21] border border-[#232752] rounded-xl text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#232752] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewTaskModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow cursor-pointer"
              >
                Crear Tarea
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: VER LOG Y AUDITORÍA DE TAREA */}
      {selectedTaskModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#141738] p-6 shadow-2xl border border-[#272b5c] space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#232752]">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-black text-sm px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                  {selectedTaskModal.key_issue}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase">Detalle y Log de Auditoría</span>
              </div>
              <button 
                onClick={() => setSelectedTaskModal(null)} 
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white leading-snug">
                {selectedTaskModal.summary}
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed p-3 bg-[#0c0e21] rounded-xl border border-[#232752]">
                {selectedTaskModal.descripcion}
              </p>

              <div className="grid grid-cols-2 gap-2 text-slate-200">
                <div className="p-2.5 bg-[#0c0e21] rounded-lg border border-[#232752]">
                  <span className="text-[10px] text-slate-400 block font-bold">PUNTOS DE HISTORIA</span>
                  <span className="font-extrabold text-purple-400">{selectedTaskModal.story_points} SP</span>
                </div>
                <div className="p-2.5 bg-[#0c0e21] rounded-lg border border-[#232752]">
                  <span className="text-[10px] text-slate-400 block font-bold">ESTADO ACTUAL</span>
                  <span className="font-extrabold text-indigo-400">{selectedTaskModal.status}</span>
                </div>
              </div>

              {selectedTaskModal.status_motif && (
                <div className="p-3 bg-rose-500/10 text-rose-300 rounded-xl border border-rose-500/30 text-xs leading-relaxed">
                  <strong>Motivo de Bloqueo:</strong> {selectedTaskModal.status_motif}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#232752] flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-semibold">Asignado a: {selectedTaskModal.asignado}</span>
              <button 
                onClick={() => setSelectedTaskModal(null)} 
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
