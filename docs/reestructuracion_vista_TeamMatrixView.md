# Reestructuración de la Vista: Matriz de Rendimiento del Equipo (TeamMatrixView)

## Problema Anterior
El archivo `TeamMatrixView.jsx` era un monolito de más de 350 líneas que mezclaba la lógica de estado de carga y petición al servicio backend (`developerService.getTeamMatrix`) con el layout y renderizado de la cabecera, navegación de pestañas, indicadores numéricos y una tabla interactiva compleja de resultados. Esta mezcla violaba la separación de intereses (Separation of Concerns).

## Estructura Actualizada (Patrón de Vista Orquestador)

Hemos desacoplado la lógica de obtención de datos hacia un Custom Hook y separado los bloques de interfaz de usuario en componentes independientes.

### Nuevos Archivos y Responsabilidades

#### 1. `src/features/dashboard/hooks/useTeamMatrix.js` (Lógica de Negocio)
Extrae todo el ciclo de vida del estado. Se encarga de:
*   Controlar el estado de `loading`.
*   Obtener la matriz consolidada llamando a `developerService.getTeamMatrix(selectedProjectId)`.
*   Extraer las propiedades principales para la UI (como `teamSummary`, `developers`, `topPerformer` y `conteo`).
*   Manejar el estado del detalle seleccionado en la matriz (`selectedDevDetail`).

#### 2. Componentes de UI Independientes
Para mantener cada bloque modular y reutilizable, se crearon cuatro archivos nuevos en `src/features/dashboard/components/`:
*   **`TeamMatrixHeader.jsx`**: Cabecera principal con el icono de trofeo, los botones de exportar y las notificaciones.
*   **`TeamMatrixNav.jsx`**: Barra de navegación estilo píldora para cambiar entre las sub-vistas del dashboard (Cuadrantes, Salud del Sprint, Scorecards), mostrando en tiempo real quién es el `Top Performer`.
*   **`TeamMatrixKpis.jsx`**: Bloque superior que renderiza los cuatro indicadores principales (Score Promedio, Cuadrante Estrella, Metódicos, Cycle Time).
*   **`TeamMatrixLeaderboard.jsx`**: La tabla detallada de ranking donde se visualiza el puntaje individual de cada desarrollador, sus insignias de cuadrantes, barras de rendimiento, y su justificación generada por el backend.

#### 3. `src/features/dashboard/views/TeamMatrixView.jsx` (El Orquestador)
*   Se redujo el archivo principal a unas pocas decenas de líneas.
*   Ahora simplemente actúa como el director: llama a `useTeamMatrix` e inyecta las props extraídas hacia cada uno de los componentes de UI (Header, Nav, KPIs, FourQuadrantChart, Leaderboard).

---

## Beneficios de la Reestructuración
- **Fácil Lectura:** Cualquier desarrollador puede entender cómo está compuesta la pantalla con solo mirar el archivo Orquestador.
- **Componentes Reusables:** La tabla de posiciones (`TeamMatrixLeaderboard`) puede ser reutilizada en vistas futuras (como reportes ejecutivos).
- **Inyección de Dependencias Limpia:** Preparados para inyectar datos falsos en pruebas automatizadas renderizando el orquestador con un `useTeamMatrix` simulado.
