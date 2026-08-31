# Reestructuración de la Vista: Scorecards de Desarrolladores (TeamDevScorecardsView)

## Problema Anterior
El archivo `TeamDevScorecardsView.jsx` era el componente más denso de las métricas de equipo con 550 líneas de código. Se encargaba simultáneamente de:
1. Buscar y filtrar usuarios (Buscador).
2. Hacer fetch a la API para obtener la lista de usuarios y luego hacer otro fetch dependiente para obtener el detalle (`Scorecard`) del usuario seleccionado.
3. Renderizar una galería interactiva de tarjetas para seleccionar desarrolladores.
4. Renderizar las cuatro complejas tarjetas de KPIs (Cycle Time, WIP, Throughput, SP) con gráficos vectoriales `recharts` incrustados (Mini Sparklines y BarCharts).
5. Renderizar una tabla paginada de las incidencias del usuario con lógica de colores condicionales atada al mapeo de filas.

## Estructura Actualizada (Patrón de Vista Orquestador)

Se extrajo toda la lógica a un hook principal y la vista gigante se dividió en múltiples componentes especializados.

### Nuevos Archivos y Responsabilidades

#### 1. `src/features/dashboard/hooks/useTeamScorecards.js` (Lógica de Negocio)
Extrae las reglas de negocio y carga asíncrona:
*   Controla el buscador de usuarios y el filtrado en tiempo real (`filteredDevs`).
*   Maneja la dependencia en cadena: primero carga `developerService.getDevelopers`, auto-selecciona el primer desarrollador, y luego dispara `developerService.getDeveloperScorecard(targetDevId)` para traer las métricas específicas.
*   Centraliza el estado de la paginación de la tabla (`currentPage`, `itemsPerPage`).

#### 2. Componentes de UI Independientes (`src/features/dashboard/components/`)
*   **`TeamDevScorecardsHeader.jsx`** y **`TeamDevScorecardsNav.jsx`**: Manejan la cabecera, la navegación superior y el botón de exportar.
*   **`TeamDevSelector.jsx`**: Renderiza el campo de búsqueda (Search) y la grilla de tarjetas seleccionables para cambiar de desarrollador. Recibe los props para cambiar el estado activo.
*   **`TeamDevScorecardsDashboard.jsx`**: Encapsula las 4 métricas visuales clave (Cycle Time, WIP, Throughput, Story Points), aislando los imports pesados de `recharts`.
*   **`TeamDevAssignedIssues.jsx`**: Contiene exclusivamente la tabla dinámica de tareas asignadas con toda su lógica de renderizado condicional de colores (según el status) y los botones de paginación inferior.
*   **`ScorecardShared.jsx`**: Archivo de utilidades visuales compartidas que alberga los tooltips interactivos (`MetricInfoTooltip`) y los mini-gráficos (`SparklineMini`), evitando repetirlos en múltiples archivos.

#### 3. `src/features/dashboard/views/TeamDevScorecardsView.jsx` (El Orquestador)
El archivo pasó de 550 líneas a menos de 90.
*   Instancia `useTeamScorecards`.
*   Despliega los componentes en orden secuencial (Header -> Nav -> Selector -> Banner -> Dashboard -> Issues) pasando estrictamente solo los props necesarios a cada bloque.

---

## Beneficios
- **Escalabilidad Visual:** Podemos agregar nuevos gráficos al `TeamDevScorecardsDashboard` sin alterar ni tocar la tabla de incidencias o el selector de usuarios.
- **Rendimiento (Performance):** Al separar la tabla y los gráficos, futuras optimizaciones como `React.memo` pueden aplicarse individualmente si la lista de tickets se vuelve muy larga, sin re-renderizar todo el selector de usuarios.
