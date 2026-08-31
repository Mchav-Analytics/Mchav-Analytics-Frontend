# Reestructuración de la Vista: Mis Bloqueos y Alertas (DevAlertsView)

## Problema Anterior
La vista `DevAlertsView.jsx` era un componente que mezclaba la UI principal (tarjetas de alertas, headers y placeholders) con la lógica de obtención de datos desde el backend y el manejo de acciones del usuario. Esto provocaba que cualquier cambio en la interfaz gráfica obligara a interactuar con la lógica de estado y llamadas a `developerService`, haciendo el código más difícil de mantener y extender.

## Estructura Actualizada (Patrón de Vista Orquestador)

Siguiendo el patrón arquitectónico implementado en las demás vistas del dashboard, transformamos `DevAlertsView.jsx` en un orquestador limpio y modularizado.

### Nuevos Archivos y Responsabilidades

#### 1. `src/features/dashboard/hooks/useDevAlerts.js` (Lógica de Negocio)
*   Extrae el estado local: `alertsData`, `loading`, `actionMsg`, `executingAction`.
*   Gestiona el ciclo de vida de la petición de alertas (`getDevAlerts`) al cambiar el `selectedProjectId`.
*   Encapsula la función `handleAlertAction` que procesa acciones sobre las alertas (e.g., pedir ayuda, marcar como bloqueado) y maneja las notificaciones de éxito o error.

#### 2. Componentes de UI Independientes
*   **`DevAlertsEmpty.jsx`**: Renderiza el estado inicial ("Selecciona un Proyecto") cuando el usuario no ha escogido un proyecto en el selector global.
*   **`DevAlertsHeader.jsx`**: Encabezado visual que muestra el título y el contador de alertas activas, mejorando la separación de las piezas de la interfaz.
*   **`DevAlertCard.jsx`**: Aísla el diseño (UI/UX premium con blur effects y gradientes) de una tarjeta individual de alerta. Recibe su configuración mediante props y delega sus interacciones a las funciones pasadas por el orquestador (`handleAlertAction`).

#### 3. `src/features/dashboard/views/DevAlertsView.jsx` (El Orquestador)
*   Se convierte en un contenedor de alto nivel.
*   Ejecuta `useDevAlerts` para obtener datos y controladores.
*   Renderiza condicionalmente `DevAlertsEmpty` o el conjunto completo (`DevAlertsHeader` y lista de `DevAlertCard`).

---

## Beneficios
- **Alta Legibilidad:** El orquestador `DevAlertsView` ahora tiene alrededor de 50 líneas, siendo mucho más declarativo.
- **Reusabilidad:** Componentes como `DevAlertCard` pueden ser fácilmente reusados en otras partes del aplicativo si fuera necesario (e.g. notificaciones globales).
- **Mantenimiento Simplificado:** Cambios en el diseño de las tarjetas no interfieren con la lógica del hook y viceversa.
