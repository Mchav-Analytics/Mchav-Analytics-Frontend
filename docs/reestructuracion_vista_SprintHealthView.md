# Reestructuración de la Vista: Salud y Predictibilidad del Sprint (SprintHealthView)

## Problema Anterior
El archivo `SprintHealthView.jsx` era un componente grande de más de 500 líneas. Incluía toda la lógica de obtención de datos asíncrona, formateo de etiquetas, constantes locales y un complejo renderizado de la interfaz, que mezclaba tarjetas de KPIs con gráficos de `recharts` e insights interactivos (tooltips dinámicos con reglas condicionales).

## Estructura Actualizada (Patrón de Vista Orquestador)

Hemos desacoplado la lógica de estado a un Custom Hook e implementado una división modular para la UI.

### Nuevos Archivos y Responsabilidades

#### 1. `src/features/dashboard/hooks/useSprintHealth.js` (Lógica de Negocio)
*   Extrae el estado principal (`loading`, `healthData`, `sprints`, `selectedSprintId`).
*   Llama al backend con `projectService.getSprints` y `projectService.getSprintHealth`.
*   Aplica transformaciones de datos directamente, como `formatSpanishStage`, devolviendo la información digerida a la UI (`metrics`, `stages`, `insight`, `warning`, `healthScore`).

#### 2. Componentes de UI Independientes
Para asegurar que los gráficos, cabeceras y métricas sean reusables e independientes, se dividió el renderizado en:
*   **`SprintHealthShared.jsx`**: Archivo de constantes y componentes puramente utilitarios, como las explicaciones de las etapas (`STAGE_EXPLANATIONS`) y el tooltip personalizado del gráfico de Recharts (`CustomFlowTooltip`).
*   **`SprintHealthHeader.jsx`**: Renderiza el círculo de puntuación radial, el icono principal y la llamada al `LiderNotificationBell`.
*   **`SprintHealthNav.jsx`**: Aloja la navegación por píldoras estilo menú y el **selector de sprint activo**, delegando el cambio a la función inyectada por el Hook.
*   **`SprintHealthKpis.jsx`**: Renderiza condicionalmente el banner de advertencia (Scope Creep) y un grid con los 4 indicadores clave (Confiabilidad, Variación, Carryover, Eficiencia).
*   **`SprintHealthChart.jsx`**: Contiene la implementación de `BarChart` y extrae a un lado los mensajes generados por la IA en la sección de Identificación de Cuellos de Botella.

#### 3. `src/features/dashboard/views/SprintHealthView.jsx` (El Orquestador)
*   Se redujo de >500 líneas a apenas 70.
*   Simplemente llama a `useSprintHealth` y pasa las variables de estado destructuradas hacia los cuatro bloques principales de UI en el orden lógico visual.

---

## Beneficios
- **Facilidad de Actualización del Gráfico:** Si se decide cambiar de `recharts` a `chart.js` o similar, solo se debe tocar `SprintHealthChart.jsx`.
- **Delegación Clara del Selector:** El dropdown de los sprints ya no contamina visualmente la vista principal.
- **Preparado para Testing:** Ahora es trivial escribir pruebas con Vitest que inyecten un `mock` de `useSprintHealth` forzando distintos `healthScore` o advertencias, garantizando que los UI components respondan visualmente al color correcto.
