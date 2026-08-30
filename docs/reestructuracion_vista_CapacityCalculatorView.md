# Reestructuración de la Vista: Calculadora de Capacidad (CapacityCalculatorView)

## Problema Anterior
A diferencia de otras vistas donde el archivo `View.jsx` era el monolito, aquí la vista `CapacityCalculatorView.jsx` era pequeña pero delegaba todo a un gigantesco componente `CapacitySimulator.jsx` de más de 800 líneas. Este simulador concentraba toda la lógica (fechas laborables, cálculos de SP, filtrado de incidencias en vivo, DB quemada) y mezclaba formularios de inserción con la renderización de métricas de impacto (progress bars) y tablas complejas de Jira.

## Estructura Actualizada (Patrón de Vista Orquestador)

Hemos eliminado por completo `CapacitySimulator.jsx` y elevado `CapacityCalculatorView.jsx` para que asuma el rol de orquestador principal, inyectando un Custom Hook.

### Nuevos Archivos y Responsabilidades

#### 1. `src/features/dashboard/hooks/useCapacityCalculator.js` (Lógica de Negocio)
*   Concentra todo el estado local (días del sprint, cantidad de devs, incapacidades, vacaciones).
*   Maneja la lista de `absenceEvents` y realiza la suma de días laborables.
*   Retorna `results`: un objeto consolidado con cálculos como `netDays`, `adjustedCapacitySP`, porcentajes de pérdida e indicadores de riesgo en base a métricas condicionales.
*   Gestiona los estados de los filtros de la tabla de Jira (`taskSearchTerm`, `taskStatusTab`, etc.).

#### 2. Componentes de UI Independientes
El gigante se fragmentó en componentes lógicos más legibles:
*   **`CapacityShared.jsx`**: Aloja el `InfoTooltip`, la función de fechas útiles `calculateBusinessDays` y el mock temporal de Jira `REAL_JIRA_ISSUES_DB`, despejando completamente el código de UI.
*   **`CapacityForm.jsx`**: Renderiza el grid superior con los `inputs` (Días, Devs, Ausencias) y el formulario colapsable del calendario.
*   **`CapacityResults.jsx`**: Un componente presentacional puro que recibe el objeto `results` para pintar el medidor de impacto y los textos de diagnóstico.
*   **`CapacityJiraTasks.jsx`**: Muestra la barra de búsqueda y la tabla de resultados filtrados de Jira, recibiendo como props `filteredTasks` y los setters correspondientes a los filtros.

#### 3. `src/features/dashboard/views/CapacityCalculatorView.jsx` (El Orquestador)
*   Se encarga de recuperar los parámetros del hook `useCapacityCalculator`.
*   Controla la cabecera (título de página) y el modo expandible (`isCollapsed`).
*   Renderiza ordenadamente `CapacityForm`, `CapacityResults` y `CapacityJiraTasks` si el modo expandido está activo.

---

## Beneficios
- **Código Sostenible:** Ningún archivo supera ahora las 250 líneas.
- **Testeabilidad del Motor de Capacidad:** Al extraer las matemáticas a `useCapacityCalculator`, es posible hacer tests automáticos (Vitest) que evalúen si al ingresar "1 dev, 10 días, 2 vacaciones" el resultado final sea exacto sin requerir renderizar los 800 componentes visuales.
- **Limpieza de Responsabilidades:** El diseño sigue el mismo patrón que el resto de las vistas de Líder Técnico.
