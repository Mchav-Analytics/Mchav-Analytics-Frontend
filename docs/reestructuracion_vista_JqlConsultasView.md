# Reestructuración de la Vista: Consola de Consultas JQL (JqlConsultasView)

## Problema Anterior (Monolito)
El archivo `JqlConsultasView.jsx` era un archivo monolítico de casi 500 líneas. Mezclaba la lógica de peticiones asíncronas hacia el motor JQL del backend (`handleExecuteJql`), el formateo de datos para exportación a CSV, y el renderizado de tres componentes UI distintos (el editor con presets, la tabla de resultados, y el diccionario JQL con el historial de auditoría). Esta mezcla dificultaba la escalabilidad y hacía imposible escribir tests unitarios separados para la lógica de la consola y para la interfaz gráfica.

## Estructura Actualizada (Patrón de Vista Orquestador)

Siguiendo el estándar de refactorización del proyecto, la vista se desacopló en un Custom Hook para la lógica y tres componentes puros para la UI, ubicados en las carpetas `hooks` y `components` del feature `jql`.

### Nuevos Archivos y Responsabilidades

#### 1. `src/features/jql/hooks/useJqlConsole.js` (Lógica de Negocio)
Este custom hook concentra todo el estado y la lógica asíncrona de la consola JQL.
*   **Gestión de Estado:** Maneja `jqlQuery`, estados de carga (`isExecutingJql`), éxito, error, e historial de auditoría (`jqlAuditLog`).
*   **Peticiones a Backend:** Contiene la función `handleExecuteJql` que se comunica con `jqlService.executeJql` o `automationService.executeJqlQuery`.
*   **Exportación:** Contiene la lógica funcional de `exportJqlToCsv` para generar archivos descargables.
*   *Testabilidad:* Puede ser testeado sin necesidad de renderizar componentes, asegurando que las peticiones y el formateo de CSV funcionen correctamente.

#### 2. `src/features/jql/components/JqlEditor.jsx` (Componente de Interfaz)
Componente puro encargado de renderizar:
*   El área de texto del editor JQL.
*   Los botones de "Consultas Recomendadas" (presets) que actualizan el `jqlQuery`.
*   Los mensajes de éxito o alerta de sintaxis de la consulta.
*   Los controles principales para ejecutar la consulta o alternar la vista del diccionario.

#### 3. `src/features/jql/components/JqlResultsTable.jsx` (Componente de Interfaz)
Componente puro que se encarga estrictamente de renderizar la tabla de resultados.
*   Recibe el array `jqlIssues` y extrae dinámicamente los campos utilizando anidación segura (`issue.fields?.summary`, etc.) para soportar tanto la respuesta cruda de Jira como la respuesta parseada.
*   Calcula y gestiona la visualización de datos paginados.

#### 4. `src/features/jql/components/JqlDictionary.jsx` (Componente de Interfaz)
Componente auxiliar (columna derecha) que encapsula:
*   La barra de búsqueda y lista de la guía de sintaxis JQL.
*   El historial local de auditoría de consultas (`jqlAuditLog`), mapeando las últimas consultas ejecutadas con su tiempo de respuesta.

#### 5. `src/features/jql/views/JqlConsultasView.jsx` (El Orquestador)
El archivo original ha sido reducido drásticamente. Ahora actúa únicamente como el punto de entrada que instancia el hook `useJqlConsole` y distribuye las propiedades (*props*) hacia `JqlEditor`, `JqlResultsTable` y `JqlDictionary`, manejando la estructura base del layout (Grid responsivo).

---

## Beneficios
- **Reducción de Deuda Técnica:** El archivo de vista principal se redujo de casi 500 líneas a menos de 90 líneas, enfocado 100% en layout.
- **Preparación para Testing:** Al extraer `useJqlConsole`, ahora podemos usar `renderHook` de React Testing Library para simular peticiones JQL de forma independiente.
- **Mantenibilidad UI:** Si se desea agregar una nueva columna a la tabla o un nuevo filtro de presets, se puede modificar el componente específico sin riesgo de afectar el resto de la vista.
