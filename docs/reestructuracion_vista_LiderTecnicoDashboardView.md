# Reestructuración de la Vista: Dashboard del Líder Técnico (LiderTecnicoDashboardView)

## Problema Anterior
El archivo `LiderTecnicoDashboardView.jsx` contenía más de 330 líneas. Si bien la interfaz ya utilizaba algunos componentes extraídos (`LiderVelocityChart`, `CriticalIssuesList`, etc.), **toda la lógica asíncrona (Data Fetching), el estado y la configuración de UI (Tooltips, Notificaciones, Calculadora de Capacidad)** estaban atados directamente al renderizado principal. Esto dificultaba la inyección de datos de prueba y violaba el principio de responsabilidad única.

## Estructura Actualizada (Patrón de Vista Orquestador)

Para alinearnos con el estándar arquitectónico del proyecto, extrajimos la lógica hacia un Custom Hook y modularizamos los bloques de UI restantes.

### Nuevos Archivos y Responsabilidades

#### 1. `src/features/dashboard/hooks/useLeaderDashboard.js` (Lógica de Negocio)
Este hook centraliza:
*   **Gestión de Estado Compleja:** Variables para la Calculadora de Capacidad (`devCount`, `sprintDays`, etc.), estado de carga (`loading`) y notificaciones tipo toast (`toastMessage`).
*   **Data Fetching (API):** Consumo de `projectService` (KPIs históricos, salud del sprint, gráficas de velocidad), `jqlService` (Issues Críticos), y `userService` (Miembros para reasignación) en un solo gran `useEffect`.
*   **Handlers:** Controla las funciones lógicas de `handleConfirmReassign`, `handleNotifyDev` y `handleExportPdf`.

#### 2. `src/features/dashboard/components/LeaderDashboardHeader.jsx` (Componente de Interfaz)
*   Se extrajo el bloque superior del Dashboard que contiene el título del proyecto y los botones de acción principal (Abrir calculadora y Exportar PDF).
*   Recibe props para inyectar su estado condicional y acciones.

#### 3. `src/features/dashboard/components/GeminiInsightsCard.jsx` (Componente de Interfaz)
*   Se extrajo la visualización específica de los diagnósticos (Insights) proporcionados por Gemini.
*   Es un componente sin estado (stateless) que simplemente recibe el objeto `geminiInsights` y decide cómo renderizar los bloques de evaluación, riesgos y sugerencias.

#### 4. `src/features/dashboard/views/LiderTecnicoDashboardView.jsx` (El Orquestador)
El archivo original pasó de 333 líneas a menos de 90.
*   Instancia `useLeaderDashboard` para manejar todo el estado y funciones.
*   Simplemente renderiza y pasa las propiedades de manera declarativa a `LeaderDashboardHeader`, `CapacitySimulator`, `GeminiInsightsCard`, `LiderKpiCards`, `LiderVelocityChart` y `CriticalIssuesList`.

---

## Beneficios
- **Código Declarativo:** Leer la vista principal ahora es entender inmediatamente la composición de la pantalla sin ruido de `useEffects` ni mapeos de arrays.
- **Testeabilidad:** El hook `useLeaderDashboard` puede testearse simulando respuestas de la API (`mockService`), mientras que componentes como `GeminiInsightsCard` pueden testearse renderizándolos de forma aislada.
