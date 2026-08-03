// ============================================================================
// FEATURE DASHBOARD — VISTA DEL DESARROLLADOR (CON NOTIFICACIÓN TEMPORAL)
// ============================================================================
// Incluye notificación flotante temporal (auto-desaparece en 5 segundos) al activarse
// el rol de Desarrollador Autorizado por el Administrador.

import React, { useState, useMemo, useEffect } from 'react'; // Hooks useState, useMemo y useEffect para ciclo de vida y notificaciones
import { 
  Clock,           // Icono de reloj para métrica de Cycle Time e indicador de carga
  CheckCircle,     // Icono de verificado para Throughput personal
  ClipboardList,   // Icono de lista para tareas activas (WIP)
  Zap,             // Icono de rayo para Puntos de Historia (SP)
  Play,            // Icono de ejecución para consultas JQL
  Code,            // Icono de código para encabezado de desarrollador
  AlertTriangle,   // Icono de advertencia para errores y estado pendiente
  CheckCircle2,    // Icono de confirmación para ejecuciones exitosas
  Terminal,        // Icono de consola para el módulo JQL
  Lock,            // Icono de candado para consola bloqueada en estado pendiente
  UserCheck,       // Icono para botón de simulación de estado
  X                // Icono X para cerrar notificación temporal manualmente
} from 'lucide-react'; // Librería de iconos vectoriales Lucide React

import { useAuth } from '../../../features/auth/context/AuthContext';
import { jqlService } from '../../../services/api';

// Incidencias de Jira simuladas para cuando el desarrollador ya ha sido asignado a un proyecto
const MOCK_JIRA_ISSUES = [
  { id: 'MCHAV-101', summary: 'Implementar autenticación JWT con OAuth 2.0 Jira', type: 'Story', status: 'Done', points: 5, cycleTimeDays: 2.5, assignee: 'Clara Gomez' },
  { id: 'MCHAV-102', summary: 'Optimizar pipeline ETL para extracción incremental', type: 'Task', status: 'In Progress', points: 3, cycleTimeDays: 1.8, assignee: 'Clara Gomez' },
  { id: 'MCHAV-103', summary: 'Corregir desfasamiento de zona horaria en calculador de Lead Time', type: 'Bug', status: 'In Progress', points: 2, cycleTimeDays: 0.9, assignee: 'Clara Gomez' },
  { id: 'MCHAV-104', summary: 'Diseñar interfaz responsiva para tabla de logs auditoría', type: 'Story', status: 'Done', points: 3, cycleTimeDays: 1.2, assignee: 'Clara Gomez' },
  { id: 'MCHAV-105', summary: 'Configurar contenedor Docker con PostgreSQL y volúmenes', type: 'Task', status: 'Done', points: 5, cycleTimeDays: 3.1, assignee: 'Clara Gomez' },
  { id: 'MCHAV-106', summary: 'Añadir exportación de reportes consolidados en formato PDF', type: 'Story', status: 'To Do', points: 8, cycleTimeDays: 0, assignee: 'Clara Gomez' }
];

export default function DeveloperView({ kpis = [], selectedProjectId }) {
  const { user, approveUserPermission } = useAuth(); // Obtener el usuario conectado y la función de aprobación en tiempo real

  // Estado para controlar la visibilidad del cuadrito de notificación temporal de activación
  const [showActiveToast, setShowActiveToast] = useState(true);

  // Estado para almacenar la consulta JQL escrita por el desarrollador (HU-008)
  const [jqlQuery, setJqlQuery] = useState('project = "MCHAV" AND assignee = currentUser() AND status = "In Progress"');
  
  // Estado para capturar errores de sintaxis JQL (HU-008 CA-04)
  const [jqlError, setJqlError] = useState('');
  
  // Estado para mensajes de confirmación de consulta exitosa
  const [jqlSuccess, setJqlSuccess] = useState('');
  
  // Indicador de carga durante la ejecución de la consulta
  const [isExecutingJql, setIsExecutingJql] = useState(false);
  
  // Estado del botón de plantilla predefinida activo
  const [activePreset, setActivePreset] = useState('in_progress');

  // Evaluar si las métricas deben cargarse o mostrarse en cero según el estado de la cuenta en sesión
  const isPending = user?.status === 'PENDING';

  // Temporizador para ocultar la notificación del rol activo automáticamente tras 5 segundos
  useEffect(() => {
    if (!isPending) {
      setShowActiveToast(true);
      const timer = setTimeout(() => {
        setShowActiveToast(false); // Ocultar el cuadrito de notificación automáticamente
      }, 5000);
      return () => clearTimeout(timer); // Limpiar temporizador al desmontar
    }
  }, [isPending]);

  // Filtrar incidencias activas en progreso (0 si está PENDING)
  const myActiveTickets = useMemo(() => {
    if (isPending) return [];
    return MOCK_JIRA_ISSUES.filter(i => i.status === 'In Progress');
  }, [isPending]);
  
  // Filtrar incidencias completadas (0 si está PENDING)
  const myCompletedTickets = useMemo(() => {
    if (isPending) return [];
    return MOCK_JIRA_ISSUES.filter(i => i.status === 'Done');
  }, [isPending]);
  
  // Promedio de Cycle Time Personal (0 si está PENDING)
  const avgPersonalCycleTime = useMemo(() => {
    if (isPending || myCompletedTickets.length === 0) return '0.0';
    const totalDays = myCompletedTickets.reduce((sum, item) => sum + item.cycleTimeDays, 0);
    return (totalDays / myCompletedTickets.length).toFixed(1);
  }, [isPending, myCompletedTickets]);

  // Suma total de Puntos de Historia (0 SP si está PENDING)
  const totalPointsBurned = useMemo(() => {
    if (isPending) return 0;
    return myCompletedTickets.reduce((sum, item) => sum + item.points, 0);
  }, [isPending]);

  // Manejar la ejecución de consultas JQL con validación de backend (HU-009)
  const handleExecuteJql = (e) => {
    e.preventDefault();
    if (isPending) {
      setJqlError('Consola Bloqueada: Tu cuenta está en estado pendiente. Un Administrador debe asignarte proyectos primero.');
      return;
    }

    setJqlError('');
    setJqlSuccess('');
    setIsExecutingJql(true);

    jqlService.executeJql(jqlQuery)
      .then(res => {
        setIsExecutingJql(false);
        const count = res.total !== undefined ? res.total : (res.issues ? res.issues.length : 0);
        setJqlSuccess(`Consulta JQL ejecutada correctamente. ${count} incidencias encontradas.`);
        setTimeout(() => setJqlSuccess(''), 4000);
      })
      .catch(err => {
        setIsExecutingJql(false);
        const detail = err?.response?.data?.detail || err?.message || 'Error de sintaxis o consulta JQL.';
        setJqlError(detail);
      });
  };

  // Cargar una consulta predefinida JQL
  const handleApplyPreset = (presetKey, queryText) => {
    if (isPending) return;
    setActivePreset(presetKey);
    setJqlQuery(queryText);
    setJqlError('');
  };

  return (
    <div className="w-full space-y-8 text-left">
      
      {/* CUADRO DE NOTIFICACIÓN DE ESTADO PENDIENTE (SI ESTÁ EN ESPERA DE ASIGNACIÓN) */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 dark:border-amber-500/40 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
              <Clock size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-amber-200">
                  ⏳ Estado: Pendiente de Asignación de Rol y Proyectos
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 uppercase">
                  En Espera
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed max-w-2xl">
                Hola <strong>{user?.nombre || 'Desarrollador'}</strong> ({user?.email}). Tu cuenta se ha autenticado correctamente. Un <strong>Administrador</strong> debe aprobar tu acceso desde la pestaña de Usuarios y Roles para habilitar tus datos.
              </p>
            </div>
          </div>

          {/* Botón de Simulación de Aprobación por el Admin */}
          <button
            type="button"
            onClick={() => approveUserPermission(user?.email || 'cgomez@mchav.com', 'DEVELOPER')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
            title="Simular aprobación del Administrador"
          >
            <UserCheck size={16} /> Simular Aprobación por Admin
          </button>
        </div>
      )}

      {/* NOTIFICACIÓN FLOTANTE TEMPORAL DE ROL ACTIVADO (AUTO-DESAPARECE EN 5 SEGUNDOS) */}
      {!isPending && showActiveToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="font-extrabold text-emerald-300">
                ✅ Rol Activado: Desarrollador Autorizado ({user?.nombre || 'Clara Gomez'})
              </span>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">
                Proyectos vinculados y permisos de consulta JQL activos por el Administrador.
              </p>
            </div>
          </div>

          {/* Botón de cerrar manualmente el cuadrito */}
          <button 
            onClick={() => setShowActiveToast(false)}
            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400/80 hover:text-emerald-300 transition-colors cursor-pointer"
            title="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SECCIÓN 1: PANEL DE MÉTRICAS PERSONALES (EN CEROS SI ESTÁ PENDING) */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Code size={16} className="text-teal-500" /> Mi Rendimiento y Carga de Trabajo Personal
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Tarjeta 1: Cycle Time Personal Promedio */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center mb-2">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl mr-3">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cycle Time Personal</h3>
                <p className="text-[11px] text-slate-400">In Progress ➔ Done</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {avgPersonalCycleTime}d
              </p>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {isPending ? "⏳ Sin proyectos asignados" : "⚡ Promedio de desarrollo activo"}
              </p>
            </div>
          </div>

          {/* Tarjeta 2: Mis Tickets Activos en Progreso */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center mb-2">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl mr-3">
                <ClipboardList size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tickets en Progreso</h3>
                <p className="text-[11px] text-slate-400">Trabajo en curso (WIP)</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {myActiveTickets.length}
              </p>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {isPending ? "⏳ 0 Tareas activas" : "📌 Tareas activas asignadas"}
              </p>
            </div>
          </div>

          {/* Tarjeta 3: Mi Throughput Personal */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center mb-2">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl mr-3">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mi Throughput</h3>
                <p className="text-[11px] text-slate-400">Incidencias resueltas</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {myCompletedTickets.length}
              </p>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {isPending ? "⏳ 0 Entregables" : "✅ Entregables finalizados"}
              </p>
            </div>
          </div>

          {/* Tarjeta 4: Puntos de Historia Quemados */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center mb-2">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl mr-3">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Puntos Quemados</h3>
                <p className="text-[11px] text-slate-400">Esfuerzo personal SP</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalPointsBurned} SP
              </p>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {isPending ? "⏳ 0 Puntos" : "🔥 Puntos de historia en sprint"}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* SECCIÓN 2: CONSOLA DE CONSULTAS JQL (HU-008) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Cabecera de la Consola de Consultas JQL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Terminal size={18} className="text-indigo-500" />
              Buscador y Ejecutor de Consultas JQL (Jira Query Language)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Filtra y consulta incidencias de los proyectos autorizados para análisis de datos (HU-008).
            </p>
          </div>

          {/* Botones de Plantillas Predefinidas JQL */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleApplyPreset('in_progress', 'project = "MCHAV" AND assignee = currentUser() AND status = "In Progress"')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isPending ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800' :
                activePreset === 'in_progress'
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              📌 Mis Tickets Activos
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleApplyPreset('bugs', 'project = "MCHAV" AND issuetype = Bug AND status != Done')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isPending ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800' :
                activePreset === 'bugs'
                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🐛 Bugs del Proyecto
            </button>
          </div>
        </div>

        {/* Formulario de Entrada JQL con Campo de Texto y Validación */}
        <form onSubmit={handleExecuteJql} className="space-y-4">
          <div className="relative">
            <textarea
              rows={2}
              disabled={isPending}
              value={jqlQuery}
              onChange={(e) => setJqlQuery(e.target.value)}
              placeholder={isPending ? "Consola bloqueada hasta que el Administrador active tu usuario..." : "Escribe tu consulta JQL aquí... ej: project = MCHAV AND assignee = currentUser()"}
              className={`w-full border rounded-2xl p-4 font-mono text-xs outline-none transition-all resize-none ${
                isPending 
                  ? 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 shadow-inner'
              }`}
            />
          </div>

          {/* Alerta de Error o Consola Bloqueada */}
          {jqlError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{jqlError}</span>
            </div>
          )}

          {/* Mensaje de Confirmación de Ejecución JQL Exitosa */}
          {jqlSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{jqlSuccess}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isExecutingJql || isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Lock size={15} /> Consola Bloqueada (Pendiente)
                </>
              ) : isExecutingJql ? (
                <>
                  <Clock size={15} className="animate-spin" /> Ejecutando Query JQL...
                </>
              ) : (
                <>
                  <Play size={15} fill="currentColor" /> Ejecutar Consulta JQL
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tabla Estructurada con Resultados (Vacía en Estado Pending) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Resultados de la Consulta ({isPending ? 0 : MOCK_JIRA_ISSUES.length} Incidencias)
            </span>
            <span className="text-xs font-semibold text-amber-500 dark:text-amber-400">
              {isPending ? "⏳ Sin Proyecto Asignado" : "Proyecto Activo: MCHAV Analytics"}
            </span>
          </div>

          <div className="overflow-x-auto">
            {isPending ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Lock size={32} className="mx-auto text-amber-500/60 mb-2" />
                <p className="text-sm font-semibold text-slate-300">No hay datos de incidencias cargados</p>
                <p className="text-xs text-slate-500">Un Administrador debe autorizar la vinculación de proyectos a tu perfil.</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/70 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Clave Issue</th>
                    <th className="px-4 py-3">Resumen / Título</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-right">Story Points</th>
                    <th className="px-4 py-3 text-right">Cycle Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  {MOCK_JIRA_ISSUES.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {issue.id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100 max-w-xs truncate">
                        {issue.summary}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          issue.type === 'Bug' 
                            ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20' 
                            : issue.type === 'Story'
                            ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20'
                            : 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20'
                        }`}>
                          {issue.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                          issue.status === 'Done'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                            : issue.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {issue.points} SP
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-purple-600 dark:text-purple-400">
                        {issue.cycleTimeDays > 0 ? `${issue.cycleTimeDays}d` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
