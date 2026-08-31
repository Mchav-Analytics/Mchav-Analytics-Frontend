import React from 'react';
import { Info } from 'lucide-react';

export const InfoTooltip = ({ text, align = "center" }) => {
  return (
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-1 shrink-0 z-30">
      <div className="p-0.5 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
        <Info size={13} />
      </div>
      <div className={`absolute bottom-full mb-2 ${align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"} hidden group-hover/tooltip:block w-60 p-2.5 bg-slate-900/95 dark:bg-slate-950/95 text-slate-100 text-[11px] font-normal leading-relaxed rounded-xl shadow-2xl z-50 pointer-events-none text-left backdrop-blur-md border border-slate-700/80`}>
        {text}
        <div className={`absolute top-full ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent border-t-slate-900 dark:border-t-slate-950`}></div>
      </div>
    </div>
  );
};

// Función auxiliar para calcular días hábiles entre 2 fechas (excluyendo sábados y domingos)
export function calculateBusinessDays(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start) || isNaN(end) || start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// Array de incidencias reales sincronizadas desde la base de datos de Jira (mchav.db)
export const REAL_JIRA_ISSUES_DB = [
  // MCHAV ANALITYCS (10000)
  { key: 'SCRUM-1', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Tarea 1: Estructuración inicial de repositorio y módulos base', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Andrés Alcalá', sp: 1, priority: 'Media', type: 'Tarea' },
  { key: 'SCRUM-2', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Tarea 2: Configuración de frontend Vite y arquitectura React', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Stephany León', sp: 1, priority: 'Media', type: 'Historia' },
  { key: 'SCRUM-3', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Tarea 3: Implementación de componentes de UI y navegación', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Camilo Beltrán', sp: 1, priority: 'Media', type: 'Tarea' },
  { key: 'SCRUM-4', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Subtarea 2.1: Validación de modelos Pydantic y esquemas API', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Valentina Montalvo', sp: 1, priority: 'Media', type: 'Subtask' },
  { key: 'SCRUM-5', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Creación del repositorio donde guardan los artefactos', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Mai Salamanca', sp: 1, priority: 'Media', type: 'Tarea' },
  { key: 'SCRUM-6', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Carta del proyecto y definición de requisitos funcionales', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Stephany León', sp: 2, priority: 'Alta', type: 'Tarea' },
  { key: 'SCRUM-7', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Investigación de la aplicación Jira y mapeo de estados', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Andrés Alcalá', sp: 1, priority: 'Media', type: 'Tarea' },
  { key: 'SCRUM-8', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Investigación de la API de Jira Atlassian Cloud', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Valentina Montalvo', sp: 1, priority: 'Media', type: 'Tarea' },
  { key: 'SCRUM-9', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Pruebas de recuperación de información de la API de Jira', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Camilo Beltrán', sp: 1, priority: 'Media', type: 'Tarea' },
  { key: 'SCRUM-15', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Documento Visión del Proyecto Analytics y KPIs', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Camilo Beltrán', sp: 2, priority: 'Media', type: 'Tarea' },
  { key: 'SCRUM-16', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Documento de requerimientos funcionales y de seguridad', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Andrés Alcalá', sp: 3, priority: 'Alta', type: 'Tarea' },
  { key: 'SCRUM-17', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Documento de historias de usuario y estimación en SP', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Valentina Montalvo', sp: 2, priority: 'Media', type: 'Tarea' },
  { key: 'SCRUM-23', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Diagrama de arquitectura del sistema MCHAV en AWS/Docker', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Stephany León', sp: 2, priority: 'Alta', type: 'Tarea' },
  { key: 'SCRUM-24', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Diagrama de modelo de datos en PostgreSQL/SQLite', status: 'Completados', rawStatus: 'Finalizado', assignee: 'Mai Salamanca', sp: 1, priority: 'Media', type: 'Tarea' },
  { key: 'SCRUM-104', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Implementar autenticación OAuth 2.0 con Atlassian Jira Cloud', status: 'En Progreso', rawStatus: 'En curso', assignee: 'Michael Rodríguez', sp: 13, priority: 'Alta', type: 'Historia' },
  { key: 'SCRUM-112', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Crear endpoints REST para sincronización periódica de sprints', status: 'En Progreso', rawStatus: 'En curso', assignee: 'Camilo Beltrán', sp: 5, priority: 'Media', type: 'Tarea' },
  { key: 'SCRUM-145', project: 'MCHAV ANALITYCS', projectId: '10000', summary: 'Configuración de alertas automáticas para incidencias bloqueadas', status: 'Por Hacer', rawStatus: 'Por hacer', assignee: 'Carlos Mendoza', sp: 5, priority: 'Alta', type: 'Tarea' },

  // PRUEBA ASD (10033)
  { key: 'PA-54', project: 'Prueba ASD', projectId: '10033', summary: 'Actualizar Tailwind CSS a v4 y validar tokens de color', status: 'En Progreso', rawStatus: 'En curso', assignee: 'Sin Asignar', sp: 2, priority: 'Media', type: 'Error' },
  { key: 'PA-55', project: 'Prueba ASD', projectId: '10033', summary: 'Optimización de consultas SQL en backend de FastAPI', status: 'En Progreso', rawStatus: 'En curso', assignee: 'Sin Asignar', sp: 3, priority: 'Media', type: 'Historia' },
  { key: 'PA-58', project: 'Prueba ASD', projectId: '10033', summary: 'Mejorar accesibilidad WCAG en interfaz de usuario', status: 'En Revisión', rawStatus: 'Listo', assignee: 'Valentina Montalvo', sp: 8, priority: 'Media', type: 'Historia' },
  { key: 'PA-62', project: 'Prueba ASD', projectId: '10033', summary: 'Añadir paginación a la tabla de logs de sincronización', status: 'En Progreso', rawStatus: 'En curso', assignee: 'Sin Asignar', sp: 2, priority: 'Media', type: 'Historia' },
  { key: 'PA-64', project: 'Prueba ASD', projectId: '10033', summary: 'Integración con API de Atlassian Jira Cloud', status: 'En Revisión', rawStatus: 'Listo', assignee: 'Valentina Montalvo', sp: 3, priority: 'Media', type: 'Error' },
  { key: 'PA-65', project: 'Prueba ASD', projectId: '10033', summary: 'Diseñar vista de métricas ejecutivas para Líder Técnico', status: 'En Progreso', rawStatus: 'En curso', assignee: 'Sin Asignar', sp: 3, priority: 'Media', type: 'Tarea' },
  { key: 'PA-74', project: 'Prueba ASD', projectId: '10033', summary: 'Optimizar queries ETL para consolidación masiva de datos', status: 'En Revisión', rawStatus: 'Listo', assignee: 'Valentina Montalvo', sp: 8, priority: 'Media', type: 'Tarea' },
  { key: 'PA-76', project: 'Prueba ASD', projectId: '10033', summary: 'Diseñar interfaz web de métricas de rendimiento', status: 'En Revisión', rawStatus: 'Listo', assignee: 'Andrés Alcalá', sp: 5, priority: 'Media', type: 'Tarea' },
  { key: 'PA-77', project: 'Prueba ASD', projectId: '10033', summary: 'Configurar autenticación OAuth 2.0 con Atlassian Console', status: 'En Revisión', rawStatus: 'Listo', assignee: 'Andrés Alcalá', sp: 8, priority: 'Alta', type: 'Tarea' },
  { key: 'PA-78', project: 'Prueba ASD', projectId: '10033', summary: 'Optimizar consultas SQL en backend de FastAPI', status: 'En Revisión', rawStatus: 'Listo', assignee: 'Stephany León', sp: 3, priority: 'Media', type: 'Tarea' },
  { key: 'PA-79', project: 'Prueba ASD', projectId: '10033', summary: 'Implementar exportador de reportes en PDF y formato impreso', status: 'En Revisión', rawStatus: 'Listo', assignee: 'Mai Salamanca', sp: 5, priority: 'Alta', type: 'Tarea' },
  { key: 'PA-80', project: 'Prueba ASD', projectId: '10033', summary: 'Configurar contenedor Docker Compose para producción', status: 'En Revisión', rawStatus: 'Listo', assignee: 'Stephany León', sp: 5, priority: 'Media', type: 'Tarea' },
  { key: 'PA-81', project: 'Prueba ASD', projectId: '10033', summary: 'Integrar sistema de caché en memoria Redis para sesiones', status: 'En Revisión', rawStatus: 'Listo', assignee: 'Stephany León', sp: 5, priority: 'Alta', type: 'Tarea' },
  { key: 'PA-82', project: 'Prueba ASD', projectId: '10033', summary: 'Refactorizar controladores siguiendo Clean Architecture', status: 'En Revisión', rawStatus: 'Listo', assignee: 'Mai Salamanca', sp: 3, priority: 'Media', type: 'Tarea' },
  { key: 'PA-84', project: 'Prueba ASD', projectId: '10033', summary: 'Corregir bug de token en refresco de sesión', status: 'En Revisión', rawStatus: 'Listo', assignee: 'Andrés Alcalá', sp: 2, priority: 'Alta', type: 'Tarea' },
  { key: 'PA-85', project: 'Prueba ASD', projectId: '10033', summary: 'Crear script de sincronización automática ETL', status: 'Por Hacer', rawStatus: 'Por hacer', assignee: 'Sin Asignar', sp: 3, priority: 'Media', type: 'Tarea' },
  { key: 'PA-86', project: 'Prueba ASD', projectId: '10033', summary: 'Añadir soporte para migración Atlassian Change 2046', status: 'Por Hacer', rawStatus: 'Por hacer', assignee: 'Sin Asignar', sp: 5, priority: 'Alta', type: 'Tarea' },
  { key: 'PA-87', project: 'Prueba ASD', projectId: '10033', summary: 'Validar llaves foráneas en base de datos PostgreSQL', status: 'Por Hacer', rawStatus: 'Por hacer', assignee: 'Sin Asignar', sp: 2, priority: 'Media', type: 'Tarea' }
];
