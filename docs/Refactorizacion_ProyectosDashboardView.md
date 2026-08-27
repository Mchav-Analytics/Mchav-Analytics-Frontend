# Documentación de Refactorización: ProyectosDashboardView

## Estado Anterior (El Problema)
Originalmente, la vista `ProyectosDashboardView` era un **archivo monolítico masivo**. Contenía:
- Toda la lógica de obtención de datos desde la API.
- Todo el manejo de estado complejo (filtros, modales, paginación, métricas calculadas).
- Decenas de componentes de UI (tablas, gráficas, tarjetas, modales) incrustados directamente dentro de la vista sin ser reutilizables.
- Extrema dificultad para testear y mantener, violando principios de arquitectura limpia y responsabilidad única (SOLID).

No se estaban aprovechando componentes compartidos ni encapsulación, lo que generaba duplicación de código y dificultaba la colaboración del equipo.

## Razones para la Refactorización
Se decidió llevar a cabo una refactorización integral impulsada por la necesidad de implementar pruebas automatizadas eficientes y alcanzar el 90% de cobertura. Las principales razones fueron:
1. **Separación de Responsabilidades (SoC):** Desacoplar la UI de la lógica de negocio.
2. **Reutilización:** Extraer paneles, tarjetas y modales para que puedan ser usados en otras vistas de manera aislada.
3. **Facilidad de Pruebas (Testability):** Probar componentes de cientos de líneas es un antipatrón. Se extrajo la lógica a Hooks (ej. `useProyectosDashboard`) para probar los datos por separado, y se dejaron los componentes de UI (tablas, gráficas) puros para probar sus estados y renderizados independientemente (usando Vitest y React Testing Library con `userEvent`).
4. **Mantenibilidad:** Un código base ordenado por dominios y jerarquías claras (hooks, components, views) permite una evolución sostenible del proyecto.

## Arquitectura Adoptada
La refactorización migró el monolito a un patrón de **Vista como Orquestador**:
- **Custom Hooks (`hooks/`):** Encargados puramente de la lógica asíncrona, estado derivado y callbacks de acción.
- **Componentes (`components/`):** Elementos visuales aislados (ej. Tablas de proyectos, tarjetas de métricas, modales) que solo reciben `props` y emiten eventos.
- **Vista (`views/`):** Actúa únicamente conectando el hook con los componentes visuales.

Esto transformó un archivo inmanejable en pequeñas piezas robustas, independientes y 100% testeables, asegurando que el software se comporte exactamente como espera el usuario final.
