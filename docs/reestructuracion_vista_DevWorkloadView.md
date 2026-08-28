# Reestructuración de la Vista DevWorkloadView

## Resumen del Refactor

La vista **DevWorkloadView**, que originalmente constaba de casi 1,000 líneas de código, manejaba de forma unificada la obtención de datos, sincronización con Jira, filtrado de tareas, paginación, cálculo de métricas (SP) y un complejo modal interactivo para transiciones de estados.

Para mejorar la mantenibilidad y aplicar el principio de responsabilidad única (Single Responsibility Principle), se migró a un patrón **Container / Presenter**.

---

## Archivos y Módulos Extraídos

### 1. Custom Hook: `useDevWorkload.js`
**Ruta:** `src/features/dashboard/hooks/useDevWorkload.js`
- **Propósito:** Centralizar toda la lógica de negocio, estado y conexión a APIs.
- **Responsabilidades:**
  - Obtener el *scorecard* local (`developerService.getMyScorecard`).
  - Sincronizar en segundo plano con Jira (`jiraService.triggerSync`).
  - Filtrado, ordenamiento y paginación de las tareas.
  - Gestión interactiva del estado desde Jira (`jiraService.executeIssueTransition` y `jiraService.getIssueTransitions`).
  - Cálculo de KPIs: SP Asignados, SP Completados, Tareas en Progreso/Pendientes.

### 2. Componentes Presentacionales (UI)

Se extrajo el JSX a tres componentes especializados:

#### `DevWorkloadFilters.jsx`
- **Propósito:** Renderizar la barra de búsqueda y los selectores (Estado, Prioridad, Orden).
- Mantiene los estilos y el botón de "Limpiar" filtros.

#### `DevWorkloadTable.jsx`
- **Propósito:** Renderizar la tabla principal y su paginación.
- Incluye las insignias (*badges*) de prioridad, estado y tipo, respetando exactamente el diseño original.

#### `DevWorkloadModals.jsx`
- **Propósito:** Contener el modal interactivo de gestión de tarea.
- Permite visualizar detalles de la tarea, copiar el comando de rama git y, sobre todo, cambiar el estado de la tarea sincronizando en tiempo real con Jira.

### 3. La Vista Principal: `DevWorkloadView.jsx`
**Ruta:** `src/features/dashboard/views/DevWorkloadView.jsx`
- **Propósito:** Actuar como Contenedor / Orquestador.
- **Responsabilidades:** 
  - Renderizar el encabezado y el resumen numérico superior.
  - Instanciar el hook `useDevWorkload` y pasar los *props* a los componentes presentacionales.
- **Impacto:** Se redujo drásticamente el tamaño del archivo, manteniendo únicamente la maquetación macro de la vista.

---

## Proceso de Verificación
1. **Extracción Lógica:** Se validó que las variables calculadas (`paginatedTasks`, `totalSPAssigned`, etc.) y las funciones de transición funcionen correctamente.
2. **Paridad Visual (UI Parity):** Se respetaron estrictamente las clases CSS de Tailwind, conservando el diseño interactivo (animaciones, *shadows* y *dark mode*).
3. **Build:** Se comprobó la integridad del empaquetado (`npm run build`) para garantizar que las importaciones estén libres de errores cíclicos y variables indefinidas.
