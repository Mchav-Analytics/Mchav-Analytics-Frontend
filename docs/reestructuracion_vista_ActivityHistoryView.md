# Reestructuración de la Vista ActivityHistoryView

## Resumen del Refactor

La vista **ActivityHistoryView**, que originalmente constaba de más de 1,000 líneas de código, manejaba de forma monolítica la obtención de datos del historial, el cálculo de niveles, rangos y progreso, así como la renderización de la línea de tiempo (timeline) y la grilla de medallas (achievements).

Para mejorar la mantenibilidad, aplicar el principio de responsabilidad única (Single Responsibility Principle) y aligerar la carga de la vista principal, se migró a un patrón **Container / Presenter**.

---

## Archivos y Módulos Extraídos

### 1. Custom Hook: `useActivityHistory.js`
**Ruta:** `src/features/dashboard/hooks/useActivityHistory.js`
- **Propósito:** Centralizar toda la lógica de negocio y el estado global de la vista.
- **Responsabilidades:**
  - Realizar peticiones al backend (ej: `projectService.getKpiIssuesDetail`).
  - Calcular rangos, experiencia (XP) y progreso hacia el siguiente nivel.
  - Manejar el filtrado de la línea de tiempo (búsqueda de texto, por estado) y de las insignias.
  - Administrar la paginación de la lista de actividades.
  - Almacenar los catálogos y datos iniciales de las medallas (`fullBadgesCatalog`).

### 2. Componentes Presentacionales (UI)

Se extrajo el HTML (JSX) en componentes especializados dentro de `src/features/dashboard/components/`:

#### `ActivityTimeline.jsx`
- **Propósito:** Renderizar la pestaña de *Timeline de Actividades*.
- Contiene la barra resumen de impacto, el buscador, los filtros rápidos de 1-clic y la lista paginada que muestra el recorrido de las tareas con su respectivo nodo conectivo (la línea continua).

#### `ActivityAchievements.jsx`
- **Propósito:** Renderizar la pestaña de *Logros y Medallas*.
- Muestra el encabezado del rango del desarrollador (Nivel Oro, Plata, Diamante, etc.), la barra de progreso de XP total, y mapea el catálogo de insignias mostrando si están bloqueadas o desbloqueadas.

#### `ActivityModals.jsx`
- **Propósito:** Alojar los Portales (Modales) de la vista.
- Se encarga de mostrar el detalle completo (requisito, recompensa e impacto) al hacer clic sobre una medalla específica de la grilla.

### 3. La Vista Principal: `ActivityHistoryView.jsx`
**Ruta:** `src/features/dashboard/views/ActivityHistoryView.jsx`
- **Propósito:** Actuar como Contenedor / Orquestador.
- **Responsabilidades:** 
  - Instanciar el hook `useActivityHistory`.
  - Distribuir las props a los componentes `ActivityTimeline`, `ActivityAchievements` y `ActivityModals`.
  - Renderizar la cabecera fija de la vista (Selección de proyecto y tab switcher).
- **Impacto:** Se redujo drásticamente el tamaño del archivo a unas cuantas líneas, permitiendo que la interfaz sea altamente legible.

---

## Proceso de Verificación
1. **Extracción Lógica:** Se validó que las variables calculadas como `unlockedCount` y `paginatedFeed` se devolvieran correctamente desde el hook.
2. **Paridad Visual (UI Parity):** Se respetaron estrictamente las clases CSS (Tailwind) y los estilos oscuros (dark mode) para asegurar que visualmente el usuario no note diferencias estructurales.
3. **Build:** Se comprobó la integridad del empaquetado (`npm run build`) descartando errores de dependencias cíclicas o variables no definidas.
