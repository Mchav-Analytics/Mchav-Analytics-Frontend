# Refactorización de Pruebas: ProyectosDashboardView

Este documento detalla los cambios, desafíos y soluciones implementadas durante la refactorización de las pruebas unitarias y de integración para la vista principal del dashboard de proyectos (`ProyectosDashboardView.jsx`).

## 🎯 Objetivo de la Refactorización
El objetivo principal fue elevar la calidad de las pruebas de uno de los componentes más grandes (más de 1300 líneas) y complejos de la aplicación. Originalmente, las pruebas estaban "saltadas" (`describe.skip`) o fallaban debido a problemas de asincronía y resolución de módulos. Queríamos pasar de "Smoke Tests" básicos a **pruebas de comportamiento real** que simularan a un usuario interactuando con el sistema, logrando así un salto significativo en la cobertura global del Frontend.

## 🛠️ Desafíos Encontrados

1. **Imports Dinámicos en React (Code Splitting):**
   `ProyectosDashboardView.jsx` utiliza importaciones dinámicas (`import('../../../services/api')`) dentro de sus `useEffect` para cargar servicios bajo demanda y no bloquear el renderizado inicial. Esto causaba que el entorno de Vitest/Node no lograra resolver correctamente la ruta de `mockData` durante el testeo, resultando en el error `Cannot find module .../mockData`.

2. **Mocks Excesivos y Frágiles:**
   El test original sobre-escribía casi todos los componentes hijos (como `ProjectCard`) con versiones sumamente simplificadas. Esto impedía probar cómo la vista manejaba la expansión de tarjetas y la interacción real con los botones internos, reduciendo la cobertura efectiva.

3. **Condiciones de Carrera (Race Conditions) y `act(...)` Warnings:**
   Al ser una vista con múltiples llamadas asíncronas encadenadas (cargar usuarios, cargar proyectos, cargar KPIs al expandir), las aserciones de los tests se ejecutaban antes de que React terminara de actualizar el estado, lanzando errores de timeout o advertencias sobre actualizaciones de estado fuera de `act()`.

## ✅ Soluciones Implementadas

### 1. Resolución de Módulos (Imports)
- Se corrigieron las importaciones en `api.js` para asegurar que el motor de resolución de Node/Vitest encontrara los mocks sin problemas, añadiendo la extensión explícita (`.js`).
- Se reescribió la estrategia de mocking del API en el test. En lugar de depender del require dinámico para interceptar `userService` y `projectService`, inyectamos directamente los `vi.fn().mockResolvedValue()` sobre los servicios reales simulados antes del montaje.

### 2. Pruebas Centradas en el Usuario (User-Centric Testing)
En lugar de aislar excesivamente el componente, permitimos que renderizara gran parte de su árbol real (eliminando el mock restrictivo de `ProjectCard`). Ahora las pruebas:
- **Renderizado inicial:** Verifican que la vista muestre los títulos esperados y haga las peticiones iniciales de proyectos.
- **Filtrado:** Simulan escritura en el input de búsqueda mediante `userEvent.type()` y verifican que la lista de proyectos en el DOM se reduzca dinámicamente, asegurando que componentes como "Proyecto BETA" desaparezcan de la pantalla si no coinciden.
- **Interacciones asíncronas:** Simulan clics en los botones de "Expandir" de las tarjetas de proyecto. El test ahora hace un `await waitFor(...)` para garantizar que la expansión dispara las llamadas correctas a `projectService.getKpis` y `projectService.getKpiIssuesDetail`.
- **Navegación por Pestañas:** Simulan la selección de la pestaña "TIEMPOS (HU-014)" para asegurar que el enrutamiento interno del componente muestra los gráficos adecuados (`PercentilesChart`).

### 3. Control de Asincronía
- Se unificó el uso de `userEvent` (sin fake timers) junto con `await act(async () => ...)` para envolver cualquier acción que dispara peticiones y muta el estado de React. Esto eliminó por completo los warnings de `act(...)` y los timeouts.

## 📈 Impacto y Resultados
- **Estabilidad:** Pasamos de 0 pruebas útiles (estaban en `.skip`) a 4 pruebas de integración robustas que verifican flujos completos.
- **Cobertura de Líneas:** La cobertura del archivo `ProyectosDashboardView.jsx` saltó de cerca de un **0% a un ~37%**, lo cual es masivo considerando el tamaño del archivo.
- **Cobertura en Cascada:** Al no mockear `ProjectCard`, la cobertura de este componente subió automáticamente al **47%**.
- **Cobertura Global:** Esta refactorización fue un factor clave para que la cobertura global del Frontend superara la barrera del **40%**.
