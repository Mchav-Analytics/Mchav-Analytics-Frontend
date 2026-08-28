# Reestructuración de la Vista AlertsCenterView

## Resumen del Refactor

La vista **AlertsCenterView**, que también rondaba las 1,000 líneas de código, manejaba un estado complejo para el seguimiento del feedback, comentarios interactivos, filtros cruzados, métricas y el modal de creación.

Con esta refactorización, finalizamos la aplicación del patrón **Container / Presenter** a todas las vistas masivas identificadas.

---

## Archivos y Módulos Extraídos

### 1. Custom Hook: `useAlertsCenter.js`
**Ruta:** `src/features/dashboard/hooks/useAlertsCenter.js`
- **Propósito:** Centralizar la lógica y estado de la sección de Feedback & Revisiones.
- **Responsabilidades:**
  - Carga inicial de *feedback* (local y sincronizado asíncronamente vía API).
  - Estado del formulario para creación de nuevo *feedback*.
  - Lógica de adición de comentarios interactivos (`handleAddComment`).
  - Filtrado reactivo en cascada (por proyecto, estado, prioridad y texto libre).
  - Cálculo de contadores KPIs (`categoryCounts`, `pendingCount`, etc.) y exportación a CSV.

### 2. Componentes Presentacionales (UI)

Se extrajo el bloque visual en componentes enfocados:

#### `AlertsCenterHeader.jsx`
- Contiene el título principal de la vista, los botones de acción principal (Nuevo Feedback y Exportar) y las cuatro tarjetas (KPIs) métricas superiores.

#### `AlertsCenterList.jsx`
- Ocupa la parte central izquierda. Contiene la barra de búsqueda y las pestañas superiores.
- Itera y renderiza cada ítem de feedback, incluyendo la lógica condicional que expande los detalles del ítem, mostrando el historial de comentarios y la caja de texto interactiva para añadir respuestas.

#### `AlertsCenterFilters.jsx`
- Ocupa la barra lateral derecha.
- Provee de un conjunto de `select` para aplicar filtros al listado, así como un resumen estadístico interactivo por Tipo de Feedback (Código, Documentación, Procesos, UI/UX, Arquitectura).

#### `AlertsCenterModal.jsx`
- Un componente aislado para el modal flotante (backdrop) que recolecta el formulario completo para ingresar un nuevo *feedback*.

### 3. La Vista Principal: `AlertsCenterView.jsx`
**Ruta:** `src/features/dashboard/views/AlertsCenterView.jsx`
- **Propósito:** Servir puramente como Orquestador.
- **Impacto:** Importa y conecta los valores desde `useAlertsCenter.js` inyectándolos como *props* a los componentes aislados. Quedó extremadamente limpio y fácil de mantener.

---

## Proceso de Verificación
1. **Extracción y Testing Unitario (Mock):** Se validó que el Hook retorne correctamente todas las funciones reactivas que la tabla necesita.
2. **Paridad Visual:** Todos los iconos, badges con sus colores condicionales (e.g. `ALTA` es rojo/rosa, `MEDIA` es ámbar) y modales mantienen el diseño original al 100%.
3. **Build Exitoso:** Se corrió `npm run build` sin incidencias, confirmando que la aplicación completa compila exitosamente tras refactorizar `DeveloperView`, `ActivityHistoryView`, `DevWorkloadView` y `AlertsCenterView`.
