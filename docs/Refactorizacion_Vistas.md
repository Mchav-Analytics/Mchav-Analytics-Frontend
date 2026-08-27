# Documentación de Refactorización de Vistas Principales

Durante la fase de optimización y preparación para alcanzar el 90% de cobertura en pruebas (Vitest + React Testing Library), se llevó a cabo una refactorización masiva de las vistas más complejas del proyecto. 

El objetivo principal fue eliminar los "archivos monolíticos" (archivos de más de 1000 líneas que mezclaban lógica de negocio, peticiones API, estado y UI) implementando una arquitectura de **Vista como Orquestador**: separando las responsabilidades en Custom Hooks (Lógica) y Componentes Puros (UI).

A continuación, se detalla qué se hizo en cada vista y qué nuevos archivos se crearon.

---

## 1. ProyectosDashboardView

### Problema Anterior
Era una vista masiva que manejaba directamente las llamadas a la API, el filtrado complejo de proyectos, la paginación y renderizaba decenas de modales y tarjetas directamente dentro del mismo archivo.

### Nuevos Archivos y Responsabilidades
- **`useProyectosDashboard.js` (Hook de Negocio):** Maneja la extracción de datos asíncrona, paginación, cálculo de métricas derivadas (como porcentaje de completitud y desviaciones de story points) y el estado global de la vista.
- **`ProjectCard.jsx` (Componente UI):** Extraído para aislar la visualización individual de cada proyecto (tarjetas).
- **`ProyectosDashboardView.jsx` (Orquestador):** Ahora actúa únicamente como conector entre el hook y los componentes hijos, siendo un archivo muy limpio y fácil de leer.

---

## 2. AdminUsuariosView

### Problema Anterior
Esta vista administraba usuarios, roles, permisos y sincronización en un solo lugar. Renderizaba enormes tablas condicionales y manejaba formularios complejos para la creación y edición de roles, lo que la hacía in-testeable.

### Nuevos Archivos y Responsabilidades
- **`useAdminUsers.ts` (Hook de Negocio):** Centraliza las funciones para listar, crear, editar y deshabilitar usuarios, además de gestionar los estados de carga, filtros de búsqueda y notificaciones de éxito/error.
- **`AdminUserTable.tsx` (Componente UI):** Componente puro que recibe la lista de usuarios procesada por el hook y se encarga exclusivamente de renderizar la tabla y emitir eventos de "Editar" o "Eliminar".
- **`AdminUserModals.tsx` (Componente UI):** Agrupa todos los modales (Formulario de Creación, Edición y Confirmación de Eliminación).
- **`AdminRolesSummary.tsx` y `AdminUserFilters.tsx`:** Componentes modulares para las tarjetas superiores de resumen estadístico y la barra de búsqueda/filtros respectivamente.

---

## 3. SystemSyncTab

### Problema Anterior
Una de las vistas más críticas y complejas del sistema, encargada de la integración ETL con Jira. Combinaba la configuración de credenciales de API, los Webhooks, la gestión de logs en tiempo real y el panel interactivo (JQL Console).

### Nuevos Archivos y Responsabilidades
- **`useSystemSync.ts` (Hook de Negocio):** Extrae la lógica de autenticación (credenciales, conexión, test de Jira) y toda la orquestación de sincronizaciones masivas (polling, estados de carga y manejo de errores del sincronizador ETL).
- **`useJqlConsole.ts` (Hook de Negocio):** Extraído específicamente para desacoplar el motor de peticiones JQL independientes de la sincronización global.
- **`SystemSyncControlPanel.tsx` (Componente UI):** Interfaz para administrar credenciales y lanzar o detener la sincronización del sistema.
- **`SyncLogsViewer.tsx` (Componente UI):** Componente dedicado a renderizar la terminal visual de logs en tiempo real y el histórico de sincronizaciones.

---

## 4. DeveloperView

### Problema Anterior
El espacio de trabajo personal del desarrollador ("Mi Trabajo") era un archivo de más de 1100 líneas. Gestionaba transiciones de estados de Jira Cloud, comentarios rápidos, lectura del *scorecard* personal, alertas de bloqueo y gráficas de uso.

### Nuevos Archivos y Responsabilidades
- **`useDeveloperWorkload.js` (Hook de Negocio):** Concentra todas las reglas de negocio del desarrollador. Pide el `scorecard`, cruza las incidencias asignadas, formatea métricas como *Cycle Time* y distribuye las tareas (Donut Chart Data), además de manejar transiciones rápidas de estado de Jira y registro de actividad.
- **`DeveloperMetricsPanel.jsx` (Componente UI):** Extrae la renderización superior de las cuatro tarjetas clave (CYCLE TIME, TICKETS WIP, THROUGHPUT, STORY POINTS).
- **`DeveloperActiveTasks.jsx` (Componente UI):** Encargado de mostrar la gráfica de dona (Distribución de Trabajo) y la tabla paginada de "Mis Tareas Asignadas", gestionando visualmente colores y estados.
- **`DeveloperModals.jsx` (Componente UI):** Aísla los modales de "Detalle de Tarea", "Responder Solicitud Rápida" y "Centro de Alertas & Solicitar Ayuda".

---

## Conclusión y Beneficios Obtenidos

Al aplicar este patrón arquitectónico, se logró:
1. **Responsabilidad Única:** Cada archivo tiene un único propósito, lo que elimina el código espagueti.
2. **Reutilización:** Los componentes extraídos ahora pueden instanciarse en otras vistas del ecosistema si fuera necesario.
3. **Testeabilidad Total:** Con los componentes y la lógica separados, logramos escribir tests funcionales que validan el comportamiento real del usuario, un paso indispensable para llegar al 90% de cobertura.
