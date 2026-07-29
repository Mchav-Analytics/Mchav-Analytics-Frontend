# Plan de Trabajo: Desarrollo de Frontend - MCHAV Analytics

Este documento detalla las actividades semanales planificadas para completar el desarrollo de la interfaz de usuario de **MCHAV Analytics** utilizando **React**, **Tailwind CSS**, **React Router** y **Recharts**.

El objetivo es avanzar de manera progresiva y controlada, asegurando que cada incremento sea robusto, esté libre de fallas y cumpla con las especificaciones de entrega.

---

## 📋 Resumen del Estado de Dependencias
Las librerías requeridas ya están declaradas en tu [package.json](file:///c:/Users/hlozano/Desktop/Proyecto/Mchav-Analytics-Frontend/package.json):
*   **Routing:** `react-router-dom`
*   **Iconografía:** `lucide-react`
*   **Gráficas:** `recharts`
*   **Cliente HTTP:** `axios`
*   **Estilos:** `tailwindcss` y `postcss`

---

## 🔌 Modo Mock / Offline (Desconexión del Backend)
Para facilitar el desarrollo del frontend de forma aislada y evitar lidiar con la configuración de Docker, bases de datos o credenciales de Jira en esta etapa de diseño, se ha habilitado un **Modo Mock** en el proyecto.

*   **¿Cómo funciona?**
    *   En el archivo [api.js](file:///c:/Users/hlozano/Desktop/Proyecto/Mchav-Analytics-Frontend/src/services/api.js) se ha configurado la constante `USE_MOCK_DATA = true`.
    *   Esto intercepta todas las peticiones y devuelve datos simulados en tiempo real (proyectos, sprints, KPIs de gráficos, logs de sincronización).
    *   Al presionar el botón de **Jira OAuth**, la aplicación te redirigirá automáticamente a `/dashboard?login=success` simulando un login exitoso al instante.
*   **Cómo cambiar de rol para pruebas de vista (Semana 2):**
    *   Puedes editar el campo `nombre_rol` en la variable `mockCurrentUser` dentro de [api.js](file:///c:/Users/hlozano/Desktop/Proyecto/Mchav-Analytics-Frontend/src/services/api.js) y cambiarlo a `"Administrador"`, `"Líder Técnico"` o `"Desarrollador"`. La interfaz se adaptará de inmediato según el rol.
*   **Cómo reconectar el Backend real:**
    *   Simplemente cambia `export const USE_MOCK_DATA = false;` en [api.js](file:///c:/Users/hlozano/Desktop/Proyecto/Mchav-Analytics-Frontend/src/services/api.js).

---

## 🗓️ Cronograma y Control de Actividades

### 📌 SEMANA 1: Configuración y Estructura del Frontend
*Enfoque: Cimientos de la app, navegación estable y layouts globales.*

*   [x] **Organizar Estructura de Carpetas:**
    *   *Estado:* Hecho. La estructura modular en `src/` ya está establecida con `components/`, `services/` y `views/`.
*   [x] **Configurar Rutas y Navegación Básica:**
    *   *Estado:* Hecho. Se configuró `BrowserRouter` y las rutas base en `src/App.jsx` (`/` para Login y `/dashboard` para Dashboard).
*   [x] **Diseñar Layout Base Reutilizable:**
    *   *Estado:* Hecho. `MainLayout` y `Sidebar` están integrados y manejan la navegación entre secciones mediante pestañas de estado (`activeTab`).

---

### 📌 SEMANA 2: Autenticación, Seguridad y Vistas por Rol
*Enfoque: Control de acceso seguro por Jira OAuth, protección de rutas y perfiles de visualización.*

*   [ ] **Diseñar Formulario de Login (Premium):**
    *   Mejorar [LoginView.jsx](file:///c:/Users/hlozano/Desktop/Proyecto/Mchav-Analytics-Frontend/src/views/auth/LoginView.jsx) con una UI moderna que inicie el flujo OAuth llamando a `/api/auth/login`.
*   [ ] **Implementar Rutas Protegidas (`ProtectedRoute`):**
    *   Crear un componente para envolver `/dashboard`. Debe validar la sesión consultando `/api/auth/me` con Axios. Redirigir a `/login` si no hay sesión.
*   [ ] **Implementar Control de Vistas por Rol (RBAC):**
    *   Adaptar la interfaz según el rol del usuario devuelto por el backend (`rol` de la sesión):
        *   🔑 **Rol: Administrador:** Acceso completo a todo el sistema (Dashboard general, Pestaña de Sincronización ETL y Pestaña de Gestión de Usuarios/Roles).
        *   📊 **Rol: Líder Técnico (Tech Lead):** Acceso al Dashboard de métricas avanzadas (Velocity, Lead Time y Cycle Time promedio del equipo, mapeo de estados), pero ocultando las pestañas de administración del sistema y usuarios.
        *   💻 **Rol: Desarrollador (Developer):** Vista personalizada del Dashboard con enfoque en métricas individuales (tareas asignadas a sí mismo, Cycle Time de sus propios tickets, carga de trabajo actual) en modo de solo lectura.

---

### 📌 SEMANA 3: Dashboard, Métricas Avanzadas y Alertas
*Enfoque: Gráficas dinámicas con Recharts, consumo de APIs y sistema de alertas de control de calidad.*

*   [x] **Conectar con Endpoints de KPIs:**
    *   Consumir `/api/jira/metrics` para obtener métricas generales de Sprints, Lead Time y Cycle Time.
*   [x] **Crear Componentes para Gráficas (Recharts):**
    *   Gráfica de Tendencia de tiempos (Lead Time y Cycle Time).
    *   Gráfica de Velocidad de Sprint (comprometido vs. entregado).
*   [x] **Implementar Panel de Alertas y Notificaciones en Dashboard:**
    *   Crear un panel de alertas visuales en tiempo real basado en umbrales de métricas (KPI Thresholds):
        *   ⚠️ **Alerta de Cuello de Botella:** Tareas que lleven más de 5 días en el estado "En Progreso" (Cycle Time excesivo).
        *   🚨 **Alerta de Soportes Críticos:** Incremento inusual de bugs críticos reportados en el Sprint activo.
        *   🔔 **Notificaciones de Sincronización:** Avisos visuales emergentes cuando se inicia y finaliza un proceso de extracción (ETL) en segundo plano.
*   [x] **Diseñar Tabla de Tareas con Ordenamiento:**
    *   Listar las tareas del Sprint en una tabla interactiva que permita ordenar por Key, Título, Estado, Lead Time y Cycle Time.
*   [x] **Implementar Estados de Carga y Errores:**
    *   Agregar animaciones de tipo *Skeleton Loader* durante las llamadas a las APIs.

---

### 📌 SEMANA 4: Filtros, Exporte y Pruebas Unitarias
*Enfoque: Refinamiento de la UX, descarga de reportes y aseguramiento de calidad.*

*   [ ] **Filtros Avanzados en Dashboard:**
    *   Habilitar filtros por fecha (rango de inicio/fin), selección de Proyectos y Sprints.
*   [ ] **Búsqueda y Exportación de Datos:**
    *   Permitir buscar tareas por texto en la tabla.
    *   Implementar un botón "Exportar a CSV" para descargar las métricas del Sprint actual en una hoja de cálculo.
*   [ ] **Escribir Pruebas Unitarias (Vitest + Testing Library):**
    *   Escribir casos de prueba para validar que los componentes del dashboard y filtros se rendericen correctamente, cubriendo al menos el 90% de los componentes críticos.
*   [ ] **Optimización y Responsive Design:**
    *   Garantizar que la aplicación sea responsiva en dispositivos móviles.

---

## 🛠️ Cómo Trabajar Conmigo
1.  **Avances Paso a Paso:** Iremos desarrollando cada punto de la semana actual.
2.  **Validaciones:** Una vez completada una sección, probaremos el código antes de pasar a la siguiente actividad del plan de trabajo.
