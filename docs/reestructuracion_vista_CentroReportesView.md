# Reestructuración de la Vista: Centro de Reportes (CentroReportesView)

## Problema Anterior (Monolito)
El archivo `CentroReportesView.jsx` constaba de casi 400 líneas. Actuaba como un super-componente que se encargaba de obtener información asíncrona (como la lista de proyectos y usuarios), manejar los complejos estados de los formularios de generación (fechas, parámetros) y el buscador del historial; además de contener todo el extenso código JSX para renderizar el "Wizard" de generación de reportes y el panel de historial en una sola estructura condicional masiva.

## Estructura Actualizada (Patrón de Vista Orquestador)

Para alinearnos con el estándar del proyecto, se descompuso la vista en un Custom Hook que aísla la lógica de estado y peticiones API, y dos componentes UI puros que renderizan cada una de las pestañas (*tabs*).

### Nuevos Archivos y Responsabilidades

#### 1. `src/features/reports/hooks/useReportsCenter.js` (Lógica de Negocio)
Este hook centraliza:
*   **Gestión de Estado General:** Controla qué pestaña está activa (`activeTab`).
*   **Gestión de Formularios:** Maneja los inputs del generador (`reportType`, `reportParam`, fechas).
*   **Data Fetching:** Se encarga de conectarse al backend mediante `api.get` para poblar los selectores de Proyectos y Usuarios al montar el componente.
*   **Peticiones de Historial:** Contiene la lógica `handleFetchHistory` para obtener y procesar reportes inmutables anteriores, así como la simulación asíncrona de reportes en vivo (`handleGenerateLiveReport`).
*   **Control de Impresión:** Exporta la referencia `reportRef` y la función `handlePrint` para el componente oculto `ExecutiveReportTemplate`.

#### 2. `src/features/reports/components/ReportsGenerator.jsx` (Componente de Interfaz)
Componente puro extraído de la antigua función `renderGeneracion()`.
*   Solo recibe *props* (como `reportType`, `setReportType`, y las listas pobladas de la DB).
*   Se enfoca exclusivamente en la experiencia de usuario (UX) del "Wizard" de tres pasos: Selección del objetivo, filtros, e información del contenido.

#### 3. `src/features/reports/components/ReportsHistory.jsx` (Componente de Interfaz)
Componente puro extraído de la antigua función `renderHistorial()`.
*   Renderiza la barra de comandos para reconstrucción histórica y el grid de tarjetas que representan los reportes anteriores.
*   Recibe las variables controladas del hook como *props* para gestionar la base de búsqueda mensual/anual y el mes comparativo opcional.

#### 4. `src/features/reports/views/CentroReportesView.jsx` (El Orquestador)
El archivo original ha pasado a ser el "director de orquesta", reducido de 390 líneas a menos de 100.
*   Instancia `useReportsCenter` para obtener todo el estado y funciones.
*   Renderiza el Layout principal, el *header*, y los botones de pestañas (*Tabs*).
*   Según la pestaña seleccionada, inyecta las *props* de forma declarativa y delegada hacia `ReportsGenerator` o `ReportsHistory`.

---

## Beneficios
- **Claridad de Responsabilidades:** El código HTML/JSX masivo ya no se mezcla con los `useEffect` de consumo de API.
- **Testeabilidad:** Ahora es posible hacer pruebas con `renderHook` sobre `useReportsCenter` para asegurar que el fetching inicial de usuarios y proyectos funcione sin lidiar con el renderizado del Wizard. Y los componentes UI pueden testearse con React Testing Library simulando *props* falsas.
- **Mantenibilidad:** Si se agrega una nueva pestaña (por ejemplo, "Reportes Exportados"), se creará su respectivo componente aislado, sin abultar el Orquestador.
