# Refactorización de ProyectosDashboardView

Este documento detalla los motivos, el proceso y los beneficios de la profunda refactorización arquitectónica realizada en la vista principal del dashboard de proyectos (`ProyectosDashboardView.jsx`), así como la posterior actualización de sus pruebas.

## 🎯 El Problema: Un Componente Monolítico
Antes de la refactorización, `ProyectosDashboardView.jsx` era un componente masivo que superaba las **1300 líneas de código**. Sufría de un grave problema de acoplamiento, ya que centralizaba demasiadas responsabilidades en un solo lugar.

**¿Qué tenía antes?**
- **Falta de Reusabilidad:** Todo el código HTML/JSX para las tarjetas de proyecto, las gráficas (sparklines), las etiquetas y los tooltips estaba escrito directamente en el archivo. No se utilizaban componentes reutilizables.
- **Mezcla de Responsabilidades:** El componente manejaba la obtención de datos (fetching a la API), el filtrado complejo, la lógica de negocio, los cálculos de KPIs y toda la presentación visual al mismo tiempo.
- **Mantenibilidad Crítica:** Modificar cualquier pequeño detalle visual o agregar una nueva regla de negocio requería navegar por cientos de líneas, aumentando el riesgo de romper otra funcionalidad sin darse cuenta.

## 🛠️ La Solución: Separación de Responsabilidades

Para resolver esto, decidimos aplicar el principio de **Separación de Responsabilidades (Separation of Concerns)** y arquitecturar el frontend basándonos en componentes modulares y reutilizables. 

Los pasos clave de esta refactorización fueron:

### 1. Creación de Componentes UI Reutilizables
Se extrajeron los fragmentos de interfaz repetitivos hacia sus propios componentes aislados:
- **`ProjectCard.jsx`**: Se creó un componente dedicado exclusivamente a renderizar la información de cada proyecto individual y manejar su estado de expansión.
- **`SparklineMini.jsx` y `MetricInfoTooltip.jsx`**: Se abstrajeron los elementos visuales menores en micro-componentes que ahora pueden ser usados en cualquier otra vista de la aplicación (no solo en el dashboard).

### 2. Extracción de Lógica de Negocio (Custom Hooks)
- Todo el manejo de estado (carga de datos, paginación, filtrado de texto, sincronización y manejo de errores) se extrajo hacia un custom hook dedicado, como **`useProjectsData.js`**.
- Esto liberó a la vista de tener que saber *cómo* se obtienen los datos. Ahora, la vista simplemente *consume* los datos que el hook le provee y se encarga únicamente de orquestar la interfaz gráfica.

## ✅ Impacto de la Refactorización

1. **Código Limpio y Legible:** El archivo `ProyectosDashboardView.jsx` redujo drásticamente su tamaño, convirtiéndose en un orquestador limpio que importa y acomoda componentes hijos.
2. **Alta Reusabilidad:** Los nuevos componentes (`ProjectCard`, `MetricInfoTooltip`, etc.) están ahora disponibles para futuras vistas, evitando la duplicación de código.
3. **Escalabilidad:** Añadir nuevas funcionalidades (ej. un nuevo filtro o un nuevo tipo de tarjeta) es mucho más fácil y seguro, ya que cada pieza de código tiene una única responsabilidad.

---

## 🧪 Refactorización de las Pruebas (Testing)

Debido a que la arquitectura de la vista cambió radicalmente, las pruebas antiguas quedaron obsoletas, se rompió la resolución de módulos por imports dinámicos y dependían de *mocks* excesivamente simplificados. 

Para acompañar la nueva arquitectura, las pruebas también fueron refactorizadas:
- Se implementaron **Pruebas Centradas en el Usuario (User-Centric Testing)** utilizando `userEvent` para simular clics y escritura real.
- Se eliminó el mock de `ProjectCard` para permitir que el árbol de componentes real se renderice, logrando probar la integración completa entre la vista padre y los nuevos componentes hijos reutilizables.
- Se envolvieron las interacciones asíncronas en `act(async () => ...)` para estabilizar la suite y evitar condiciones de carrera (Race Conditions).

**Resultado del Testing:** Gracias a la separación de responsabilidades y a las nuevas pruebas de integración, la cobertura de `ProyectosDashboardView.jsx` subió de 0% a promedios superiores al 40%, elevando drásticamente la cobertura global del proyecto.
