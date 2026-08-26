# Pruebas Unitarias y de Integración con Vitest

Este documento explica cómo están configuradas y funcionando las pruebas del Frontend, qué se ha logrado con ellas y cómo ejecutarlas localmente.

## 🛠️ Herramientas Utilizadas
El proyecto utiliza **Vitest** como framework principal de testing, junto con **React Testing Library** para renderizar y simular interacciones de usuario en el DOM de React de forma aislada.

## 🚀 ¿Qué se logró con estas pruebas?
Las pruebas actuales garantizan la estabilidad de las vistas más críticas y complejas del sistema, así como la capa de servicios y hooks core, asegurando que:
- **Componentes de Layout (Sidebar y Topbar):** Utilizando `userEvent` se valida que los menús laterales rendericen correctamente según el rol del usuario, y se simulan interacciones completas (como hacer click en notificaciones y en botones de logout).
- **Servicios Core (api.js, NotificationStore):** Se cubren exhaustivamente las peticiones del proxy de backend (`jqlService`, `projectService`, `authService`) verificando que llamen correctamente a `api.get` y `api.post`. Además, se verifica el almacenamiento local de `NotificationStore`.
- **Hooks y Contextos (`AuthContext`, `useProjectsData`):** Se cubre la lógica de autorización, manejo de estado `useProjectsData` y animaciones (`useAnimatedCounter`), alcanzando 100% de cobertura en la capa de hooks.
- **Renderizado sin bloqueos:** Se verifica que ninguna vista principal arroje errores fatales al montarse en el DOM.
- **Interacciones Básicas:** Se prueban interacciones clave, como el cambio de pestañas en `CentroReportesView` y la apertura de modales (como `AiChatModal` y `ProfileSettingsModal`).

## 📊 Porcentajes de Cobertura (Coverage)
Tras la finalización de las Fases 1 y 2, la cobertura global del proyecto es la siguiente (con más de 118 pruebas exitosas):

- **Líneas (Lines):** ~40.42%
- **Declaraciones (Statements):** ~38.29%
- **Ramas / Condiciones (Branches):** ~26.34%
- **Funciones (Functions):** ~26.22%

> **Nota:** Con la finalización de la **Fase 3**, la cobertura del proyecto ha dado un salto significativo. Se refactorizaron las pruebas de vistas masivas y complejas (como `ProyectosDashboardView.jsx` de más de 1300 líneas y `CentroReportesView.test.jsx`), resolviendo problemas de carga asíncrona de dependencias (imports dinámicos) y errores de timeout (warnings de `act(...)`). La cobertura de estas vistas individuales ha pasado de casi 0% a promedios entre el 40% y el 70%. La **Fase 4** se centrará en pulir componentes individuales, modales y utilidades secundarias para alcanzar la meta global del 90%.

## 💻 Comandos Útiles

Puedes ejecutar y verificar estas pruebas usando los siguientes comandos en tu terminal (asegúrate de estar en el directorio `Mchav-Analytics-Frontend`):

### 1. Ejecutar las pruebas una sola vez
```bash
npm run test:run
```
Este comando corre los 62 tests disponibles (en 24 archivos) y te muestra un reporte de éxito o fallo en consola.

### 2. Ejecutar las pruebas en modo "Watch" (Desarrollo)
```bash
npm run test
```
Este comando dejará Vitest abierto. Cada vez que guardes un archivo `.jsx` o `.js`, ejecutará automáticamente las pruebas que se vean afectadas, ayudándote a programar sin romper nada.

### 3. Generar el reporte de Cobertura (Coverage)
```bash
npx vitest run --coverage
```
Este comando ejecuta todos los tests y, al finalizar, genera una tabla detallada con los porcentajes de código que fue ejecutado durante las pruebas, mostrándote exactamente qué líneas de código te faltan por probar.

---

# Pruebas End-to-End (E2E) con Playwright

Además de las pruebas unitarias con Vitest, el proyecto cuenta con pruebas de integración reales utilizando **Playwright**. Estas pruebas simulan a un usuario real interactuando con la aplicación en un entorno de navegador completo.

## 🚀 ¿Qué se logró con las pruebas E2E?
Las pruebas de Playwright verifican los flujos completos y críticos de extremo a extremo, probando la compatibilidad cruzada en diferentes navegadores (Chromium, WebKit y Firefox). Los flujos actualmente cubiertos son:

1. **Flujo de Autenticación (`auth.spec.js`):** Simula el inicio de sesión a través de `localStorage` y verifica la redirección exitosa al dashboard principal.
2. **Dashboard Principal (`dashboard.spec.js`):** Ingresa a la vista del Dashboard principal y verifica que todos sus componentes clave se rendericen correctamente y sin colapsos.
3. **Dashboard de Proyectos (`proyectos.spec.js`):** Verifica específicamente que la vista más compleja de la plataforma (Proyectos) se renderice correctamente en los diferentes motores de renderizado web.

## 📊 Resultados y Compatibilidad (Cross-Browser)
Actualmente, las pruebas E2E se ejecutan contra tres motores principales:
- ✅ **Chromium (Chrome/Edge):** Las 3 suites de pruebas pasan de manera exitosa (tiempos promedio entre 8s y 10s).
- ✅ **WebKit (Safari):** Las 3 suites de pruebas pasan exitosamente, confirmando soporte para macOS/iOS (tiempos promedio entre 8s y 27s).
- ❌ **Firefox:** Actualmente se está presentando un timeout/fallo en el entorno automatizado para las tres vistas, que requiere investigación adicional sobre cómo Firefox maneja la carga asíncrona de recursos en la plataforma.

## 💻 Comandos de Playwright

### 1. Ejecutar todas las pruebas E2E en todos los navegadores
```bash
npx playwright test
```

### 2. Ejecutar las pruebas con la interfaz de usuario de Playwright
```bash
npx playwright test --ui
```
Este comando abre una herramienta visual interactiva que te permite ver el navegador en vivo, inspeccionar el DOM, viajar en el tiempo por los pasos de la prueba y debuggear fácilmente cualquier fallo (muy útil para revisar qué está pasando con Firefox).
