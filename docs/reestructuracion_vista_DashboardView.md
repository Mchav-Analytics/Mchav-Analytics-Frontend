# Reestructuración de la Vista: Histórico General (DashboardView)

## Problema Anterior
El archivo `DashboardView.jsx` constaba de 739 líneas de código que abarcaban la vista ejecutiva principal. En este solo archivo convivían:
1.  **Datos Mock y Estado**: Declaración inmensa de datos estáticos (mock) para tendencias, salud de proyectos y estado general, junto a docenas de hooks de estado (`useState`, `useMemo`, `useEffect`).
2.  **Llamadas al API**: Lógica para obtener proyectos desde la base de datos y cruzar la información de Jira, así como la consulta de logs de la última sincronización.
3.  **Lógica Compleja de UI**: Componentes de `recharts` (Gráficos de Área, Gráficos de Dona, Sparklines), carrusel con drag/scroll personalizado, modales de detalle e indicadores con animaciones numéricas.

## Estructura Actualizada (Patrón de Vista Orquestador)

Hemos refactorizado el código separando las métricas, la lógica y la interfaz para hacer de `DashboardView.jsx` un orquestador altamente legible.

### Nuevos Archivos y Responsabilidades

#### 1. `src/features/dashboard/hooks/useDashboard.js` (Lógica de Negocio y Datos)
*   **Mocks Movidos**: Toda la constante de mock de datos y rendimiento fue extraída aquí.
*   **Llamadas API**: Obtiene los datos en vivo vía `projectService` y `jiraService` y maneja su estado.
*   **Computación de Datos (`useMemo`)**: Procesa los contadores animados (`useAnimatedCounter`), calcula la salud (status, badges, donas) de cada proyecto, y prepara los sets de datos requeridos por los gráficos.
*   **Eventos Generales**: Exporta los métodos `handleScrollCarouselRight`, `handleExportPDF`, y los manejadores de los Drill-Down modales.

#### 2. Componentes de UI Independientes (en `src/features/dashboard/components/`)
*   **`DashboardHeader.jsx`**: El encabezado de la página con el título principal ("Histórico General"), el botón para exportar PDF y la campana de notificaciones.
*   **`DashboardProjectPanorama.jsx`**: Todo el carrusel horizontal interactivo que muestra las tarjetas de "Salud del Proyecto" junto con sus anillos porcentuales SVG personalizados.
*   **`DashboardTrends.jsx`**: Combina el gran gráfico de áreas (Tendencia General) en la columna izquierda y las tarjetas de Última Sincronización + Gráfico de Dona de Estado (columna derecha).
*   **`DashboardPerformance.jsx`**: Contiene la grilla de los 4 "Sparklines" inferiores que detallan el promedio del equipo en métricas ágiles (Velocity, Throughput, Cycle Time, Lead Time).

#### 3. `src/features/dashboard/views/DashboardView.jsx` (El Orquestador)
*   Invoca de manera limpia a `useDashboard` y distribuye (props drilling de primer nivel) hacia las cuatro grandes secciones (Header, Panorama, Trends, Performance) y el Modal de detalle.
*   El tamaño de este archivo se redujo dramáticamente a menos de 80 líneas limpias y declarativas.

---

## Beneficios
- **Especialización**: Un analista de UI ahora puede editar las curvas o colores de *Recharts* directamente en `DashboardTrends.jsx` o `DashboardPerformance.jsx` sin miedo a romper el estado de autenticación o los flujos del carrusel.
- **Limpieza de Datos**: Extraer los diccionarios de mock al hook limpió cientos de líneas muertas en la vista.
- **Legibilidad**: Identificar las cuatro secciones principales del layout ejecutivo ahora toma segundos leyendo el archivo Orquestador.
