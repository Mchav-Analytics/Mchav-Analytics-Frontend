# Reestructuración de la Vista: Mi Agenda de Hoy (DailyFocusView)

## Problema Anterior
La vista `DailyFocusView.jsx` era un archivo monolítico de 465 líneas de código. Contenía demasiadas responsabilidades que dificultaban su lectura y mantenimiento:
1.  **Manejo de Estado y Peticiones API**: Lógica para obtener issues de Jira y hacer sincronización (polling cada 20s).
2.  **Lógica de Negocio y Paginación**: Clasificación de tareas mediante utils locales, manejo de notas con LocalStorage, y lógica de paginación (`currentPage`, `totalPages`, variables derivadas).
3.  **UI Compleja**: Renderizado condicional de múltiples sub-vistas (tareas atrasadas, tareas de hoy, barra de progreso con gradientes complejos, bloc de notas, y navegación por fechas).

## Estructura Actualizada (Patrón de Vista Orquestador)

Se extrajo todo el núcleo funcional y presentacional para transformar `DailyFocusView.jsx` en un orquestador limpio de alto nivel.

### Nuevos Archivos y Responsabilidades

#### 1. `src/features/dashboard/hooks/useDailyFocus.js` (Lógica de Negocio)
*   Extrae completamente las funciones de peticiones a backend (`fetchLocalIssues`, `fetchIssues`) y sincronización (`setInterval`).
*   Agrupa los estados de fecha (`selectedDate`), tareas, notas en localStorage y estado de interfaz (`highlightedTaskKey`, `currentPage`).
*   Computa los datos transformados usando `useMemo` (`classification`, `filteredNotes`, `paginatedTasks`, `totalPages`).
*   Exporta manejadores estandarizados: `handleTaskFocus`, `handleToggleDone`, `handleAddNote`, `handleDeleteNote`.

#### 2. Componentes de UI Independientes
*   **`DailyFocusHeader.jsx`**: Renderiza el bloque superior, manejando el título del proyecto y los controles para avanzar, retroceder, seleccionar fecha o volver a "HOY".
*   **`DailyFocusTasks.jsx`**: Contenedor estructural de la columna principal (70% de ancho). Renderiza las sub-secciones de "Tareas de Hoy" (incluyendo la paginación) y "Tareas Atrasadas".
*   **`DailyFocusTaskRow.jsx`**: Componente extraído de la antigua función `renderTaskRow`. Maneja toda la complejidad visual, colores de prioridad, tags y botón de *toggle status* de cada fila de tarea, tanto normal como atrasada.
*   **`DailyFocusSidebar.jsx`**: Columna derecha (30% de ancho) que consolida el widget de Progreso del Día (Progress Bar de completados) y el mini Bloc de Notas interactivo.

#### 3. `src/features/dashboard/views/DailyFocusView.jsx` (El Orquestador)
*   Invoca `useDailyFocus(selectedProjectId, projectName)`.
*   Desestructura todas las variables y funciones necesarias.
*   Renderiza una grilla pura e inyecta las props (`props drilling` de primer nivel) hacia `DailyFocusHeader`, `DailyFocusTasks` y `DailyFocusSidebar`.
*   Total de líneas reducidas: de 465 a ~60 líneas altamente declarativas.

---

## Beneficios
- **Escalabilidad Visual:** Si se desean agregar widgets a la columna derecha (ej. estadísticas de nubia), simplemente se importan en `DailyFocusSidebar.jsx` sin engordar la vista.
- **Separación de Concernimientos:** Las modificaciones en estilos Tailwind de las tarjetas ya no tienen el ruido visual de las promesas de Axios llamando a `jiraService`.
- **Desempeño y Mantenimiento:** La función `renderTaskRow` ahora es un componente real que, si fuera necesario a futuro, puede memorizarse (`React.memo`) para evitar re-renders innecesarios en listas largas.
