# Reestructuración de la Vista: ProyectosDashboardView

## Objetivo Logrado
Se refactorizó exitosamente la vista monolítica `ProyectosDashboardView.jsx` (que originalmente contaba con más de 1,200 líneas de código) aplicando los principios de Clean Code y el patrón de diseño **Container/Presentational**. 

La vista fue reducida sustancialmente (a menos de 200 líneas), mejorando drásticamente su legibilidad, mantenibilidad y preparándola para futuras pruebas unitarias y de integración. Todo el proceso se completó **sin alterar en absoluto la apariencia visual original ni la funcionalidad de la aplicación.**

## Cómo se hizo
1. **Separación de responsabilidades (Separation of Concerns):** Se extrajo toda la lógica de negocio, manejo de estado (`useState`, `useEffect`, `useMemo`) y orquestación de datos hacia un Custom Hook independiente.
2. **Desacoplamiento de Datos:** Las constantes, configuraciones estáticas y datos "mock" (de prueba) se movieron a un archivo de datos centralizado para limpiar los archivos `.jsx`.
3. **Modularización de Componentes Visuales:** Las distintas secciones principales de la interfaz gráfica (Cabecera, KPIs, Tablas y Gráficos) fueron encapsuladas en nuevos componentes puramente visuales (Presentational Components).
4. **Reensamblaje:** El archivo original de la vista (`ProyectosDashboardView.jsx`) fue reescrito para actuar únicamente como un "Layout Container", importando el Hook para obtener los datos e inyectándolos ordenadamente en cada subcomponente visual.

---

## Archivos Nuevos Creados y su Función

### 1. Lógica y Estado
- **`src/features/projects/hooks/useProyectosDashboard.js`**
  Contiene el "cerebro" de la vista. Se encarga de manejar todo el estado de React (ej: filtros, modales, proyectos seleccionados), así como de procesar, iterar y calcular las métricas complejas antes de entregarlas a la capa visual.

### 2. Datos Estáticos
- **`src/features/projects/data/mockData.js`**
  Almacena todas las constantes estáticas y los arreglos de datos duros (`DEFAULT_PROJECT_ROWS`, `MOCK_BURNUP_DATA`, etc.) que simulan la API, manteniendo la capa visual libre de "ruido" de datos estáticos.

### 3. Componentes Visuales Extraídos
Todos ubicados en: `src/features/projects/components/`

- **`ProjectsHeader.jsx`**
  Renderiza la cabecera principal de la vista, incluyendo el saludo dinámico del usuario y los controles globales de contexto (como el selector maestro de proyectos).

- **`ProjectsKpiStrip.jsx`**
  Muestra la banda superior de tarjetas indicadoras de rendimiento (KPIs), tales como "Issues totales", "Completados", "En progreso" y la gráfica de progreso circular. Recibe las métricas pre-calculadas del hook.

- **`ProjectsTable.jsx`**
  Construye la tabla interactiva "Resumen de Proyectos" que muestra el listado detallado, junto con la barra de búsqueda y los controles de paginación.

- **`ProjectsCFD.jsx`**
  Encapsula el bloque del "Cumulative Flow Diagram", integrando el componente del gráfico con su cabecera y el botón para ver el detalle.

- **`ProjectsBurnup.jsx`**
  Contiene la estructura visual del "Sprint Burnup Chart", aislando el componente del gráfico y los accesos a la documentación técnica respectiva.

- **`ProjectsTeamPerformance.jsx`**
  Renderiza la sección de desempeño del equipo (Grid de dos columnas). Incluye tanto el gráfico de dona de "Distribución de estados" como el gráfico de barras horizontales de "Tiempo de ciclo por tipo".

- **`ProjectsAssignedTeam.jsx`**
  Componente dedicado a construir la tabla con la lista de miembros del equipo asignados, formateando correctamente sus roles, iniciales de usuario y carga de tareas actuales.

- **`Tooltips.jsx`**
  Un archivo de utilería visual donde se alojan pequeños componentes reutilizables como `InfoTooltip` (íconos flotantes de información) y `EnrichedChartTooltip` (popups avanzados para los gráficos de Recharts).
