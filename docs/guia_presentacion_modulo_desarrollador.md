# 🎙️ Guía de Exposición y Pitch: Módulo de Desarrollador (MCHAV Analytics)

Esta guía contiene el guion paso a paso, los argumentos de negocio, la explicación técnica y los consejos prácticos para exponer con éxito las 4 vistas del módulo de desarrollador:
1. **Métricas del Desarrollador (Scorecard)**
2. **Mi Agenda de Hoy (con Asistente NUBIIA)**
3. **Plan de Trabajo (Dev Workload)**
4. **Historial de Actividad y Logros (Standup & Gamificación)**

---

## ⏱️ Estructura y Tiempos Sugeridos (Duración Total: 5 a 7 minutos)

```text
1. Introducción y Métricas del Desarrollador  ───►  1.5 min
2. Mi Agenda de Hoy y Asistente NUBIIA       ───►  2.0 min
3. Plan de Trabajo con Paginación            ───►  1.5 min
4. Historial de Actividad y Logros           ───►  1.0 min
```

---

## 🚀 1. Métricas del Desarrollador (*Developer Scorecard*)

### 🎯 Objetivo de la Vista
Demostrar cómo el desarrollador tiene visibilidad transparente y en tiempo real de su velocidad, predictibilidad y calidad a partir de datos reales sincronizados de Jira.

### 🗣️ Qué debes decir (Guion de Exposición):
> *"Buenos días / tardes a todos. Les presento el ecosistema de trabajo para desarrolladores en **MCHAV Analytics**.*
> 
> *Comenzamos en la vista de **Métricas del Desarrollador**. Históricamente, los desarrolladores no cuentan con un panel de autogestión claro y dependen de reuniones para saber si van a cumplir sus compromisos. Esta vista resuelve esa necesidad convirtiendo los tickets de Jira en indicadores clave personales:*
>
> 1. ***Tiempo de Ciclo Personal (Cycle Time):** Muestra el promedio de días que me toma llevar un requerimiento desde que inicio su desarrollo hasta su entrega en QA/Producción. Compara mi rendimiento actual con el sprint anterior para evidenciar mi curva de productividad.*
> 2. ***Límite de WIP (Work in Progress):** Supervisa cuántas tareas tengo abiertas en paralelo. Si supero el límite saludable (más de 3 tareas), el sistema me ayuda a enfocarme en cerrar tickets antes de abrir nuevos, reduciendo el cambio de contexto.*
> 3. ***Compromiso y Quema de Story Points:** Permite visualizar los puntos de historia logrados frente a la meta fijada para el sprint actual.*
> 4. ***Distribución del Esfuerzo:** Clasifica visualmente mi trabajo en Historias de usuario, Tareas técnicas y Bugs, permitiéndome auditar la calidad y el tipo de aporte que estoy entregando al equipo.*
>
> *En resumen, no son métricas punitivas, sino una herramienta de autodiagnóstico y mejora continua basada en datos 100% reales."*

---

## 📅 2. Mi Agenda de Hoy (*con Asistente Inteligente NUBIIA*)

### 🎯 Objetivo de la Vista
Mostrar la planificación diaria del desarrollador, la regla de negocio matemática y estricta para tareas atrasadas, y el asistente contextual **NUBIIA**.

### 🗣️ Qué debes decir (Guion de Exposición):
> *"Pasamos a la vista central de la jornada: **Mi Agenda de Hoy**.*
> 
> *Esta vista responde de forma inmediata a la pregunta: **'¿En qué me debo enfocar hoy?'**.*
>
> *El elemento más innovador aquí es **NUBIIA**, nuestro asistente inteligente integrado:*
> - ***Es 100% automático:** No requiere que el usuario presione botones de 'calcular' u 'organizar'. Al entrar a la agenda, NUBIIA analiza en segundo plano las tareas asignadas, sus fechas de vencimiento, prioridades y puntos de historia.*
> - ***Responde a '¿Qué debería hacer ahora?':** NUBIIA no repite los números que ya están en la pantalla, sino que interpreta la situación y entrega una recomendación orientada a la acción. Si detecta una tarea que vence pronto o una actividad de prioridad crítica, me la sugiere e incluye un acceso rápido ('Ver tarea') para resaltarla.*
>
> *En la sección de gestión de tareas contamos con una regla de negocio clara y unificada:*
> - ***Tareas de Hoy:** Las actividades programadas para la fecha seleccionada.*
> - ***Tareas Atrasadas:** Tienen una condición estricta: solo se consideran atrasadas si su fecha de vencimiento real es menor a la fecha seleccionada (`dueDate < fechaSeleccionada`) y no están completadas. Si una tarea pertenece al sprint actual y su plazo está vigente (como **SCRUM-152**), el sistema respeta su plazo y no genera falsas alarmas de retraso.*
> - *Incluye un selector interactivo para navegar entre fechas pasadas o futuras, registro de **Notas Rápidas** y la posibilidad de marcar tareas como completadas con actualización en tiempo real de la barra de progreso."*

---

## 📋 3. Plan de Trabajo (*Dev Workload*)

### 🎯 Objetivo de la Vista
Presentar la visión consolidada de todo el inventario de trabajo asignado en el proyecto, con filtros instantáneos y paginación optimizada.

### 🗣️ Qué debes decir (Guion de Exposición):
> *"Para tener una perspectiva global de todo el proyecto y el sprint, pasamos a **Plan de Trabajo**.*
>
> *Aquí el desarrollador puede consultar y filtrar la totalidad de sus entregables:*
> 1. ***Tarjetas de Resumen KPI:** En la parte superior vemos el resumen consolidado de Story Points totales asignados, puntos completados con porcentaje de quema, tareas en curso y tareas pendientes.*
> 2. ***Buscador y Filtros Dinámicos:** Cuenta con una barra de búsqueda en tiempo real por clave o palabra del resumen, y selectores para filtrar por estado (Pendientes, En Curso, Bloqueadas, Finalizadas) o por prioridad (Crítica, Alta, Media, Baja).*
> 3. ***Paginación Optimizada a 10 Elementos:** La tabla cuenta con un diseño espacioso y moderno, organizado en páginas de máximo 10 tareas con controles numéricos de navegación directa, lo que garantiza una visualización limpia y sin saturación.*
> 4. ***Badges Informativos:** Cada fila destaca visualmente el tipo de issue (Historia, Bug, Tarea, Épica), el estado con indicadores interactivos y los Story Points correspondientes.*
>
> *Es la herramienta ideal para la planificación y seguimiento integral del backlog personal."*

---

## 🏆 4. Historial de Actividad y Logros (*Activity History & Gamification*)

### 🎯 Objetivo de la Vista
Evidenciar la trazabilidad de Jira en tiempo real y la gamificación que incentiva las buenas prácticas de ingeniería de software.

### 🗣️ Qué debes decir (Guion de Exposición):
> *"Por último, revisamos el **Historial de Actividad y Logros**.*
>
> *Este módulo combina auditoría técnica con reconocimiento al mérito:*
> - ***Timeline de Transiciones (Standup en Vivo):** Registra cronológicamente cada cambio de estado realizado en Jira (cuándo se inició un desarrollo, cuándo se envió a Code Review o cuándo se finalizó). Sirve como bitácora automática para rendir cuentas en las reuniones diarias sin esfuerzo manual.*
> - ***Sistema de Medallas y Logros Dinámicos:** Reconoce la excelencia técnica mediante criterios calculados automáticamente:*
>   - ***Zero Defect Delivery:** Se desbloquea cuando entregas tus historias sin re-apertura de bugs en QA.*
>   - ***Fast Delivery Hero:** Se activa cuando mantienes un tiempo de ciclo personal inferior a 2.5 días.*
>   - ***Sprint Commitment Master:** Premia un cumplimiento superior al 80% del compromiso inicial del sprint.*
>   - ***Alto Rendimiento:** Reconoce un alto volumen sostenido de entregas finalizadas.*
>
> *En conclusión, MCHAV Analytics transforma los datos de Jira en una experiencia ágil, motivadora, visualmente atractiva y potenciada por inteligencia artificial con NUBIIA."*

---

## 🔔 5. Centro de Notificaciones en Tiempo Real (Campanita de Actividad)

### 🎯 Objetivo de la Característica
Mostrar la sincronización proactiva de eventos de Jira (asignación de nuevas tareas, resolución de bloqueos, solicitudes y alertas de sincronización).

### 🗣️ Qué debes decir (Guion de Exposición):
> *"En la esquina superior derecha contamos con el **Centro de Notificaciones en Tiempo Real**:*
> 
> - *La campana muestra un contador visual con las notificaciones activas no leídas.*
> - *Al desplegar el panel, el desarrollador encuentra tarjetas limpias con las últimas tareas asignadas (por ejemplo: **SCRUM-152**), solicitudes de colaboración o alertas del sistema.*
> - *Cada notificación cuenta con una **acción rápida directa** ('Ver tarea') que me lleva automáticamente a la vista correspondiente para empezar a trabajar de inmediato sin perder tiempo navegando en los menús.*
> - *Además, permite marcar todas como leídas o navegar al Centro de Actividad completo."*

---

## 💡 Consejos Clave para la Demostración en Vivo

1. **En Mi Agenda:**
   - Señala la tarjeta de **NUBIIA** y menciona que el análisis es automático.
   - Muestra cómo al presionar el botón de la acción recomendada (ej. *"Ver SCRUM-152"*), la fila de la tarea se resalta con una suave animación.
   - Cambia a una fecha pasada o futura para mostrar cómo NUBIIA adapta su mensaje instantáneamente al contexto.
2. **En Plan de Trabajo:**
   - Escribe en el buscador (ej. *"SCRUM"*) y filtra por estado para mostrar la respuesta inmediata de la tabla.
   - Haz clic en los botones de paginación para demostrar la fluidez de navegación entre páginas de 10 elementos.
3. **En Historial de Actividad:**
   - Destaca que el historial es una fuente de verdad generada por eventos de Jira y muestra las medallas desbloqueadas.
