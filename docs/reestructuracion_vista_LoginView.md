# Reestructuración de la Vista: Inicio de Sesión (LoginView)

## Problema Anterior
La vista `LoginView.jsx` era un archivo extremadamente denso (637 líneas) que combinaba múltiples responsabilidades:
1.  **Lógica de Autenticación**: Manejo de la redirección si el usuario ya estaba autenticado, llamadas a `loginWithJira`, mocks de desarrollo local, y manejo de errores.
2.  **Lógica de Interfaz y Animación 3D**: Referencias (`useRef`) y cálculos matemáticos para rastrear el movimiento del mouse (`handleMouseMove`) y crear un efecto de paralaje 3D en el fondo.
3.  **Marcado (HTML/JSX)**: Un bloque inmenso de JSX que renderizaba la tarjeta 3D giratoria, las farolas interactivas del fondo y la mascota búho con su diálogo.
4.  **Estilos (CSS en línea)**: Un bloque `<style>` de más de 300 líneas con media queries para hacerlo responsive, animaciones de hover y keyframes (como la moneda giratoria).

## Estructura Actualizada (Patrón de Vista Orquestador)

Hemos desacoplado completamente la vista separándola en 5 archivos específicos:

### Nuevos Archivos y Responsabilidades

#### 1. `src/features/auth/hooks/useLogin.js` (Lógica de Negocio y Eventos)
*   Centraliza el estado de autenticación (errores, estado de carga).
*   Encapsula las funciones `handleJiraAuth` y `handleLocalDevLogin`.
*   Maneja los `useRef` para la tarjeta y el contenedor principal, así como las funciones `handleMouseMove` y `handleMouseLeave` que inyectan variables CSS nativas para el efecto 3D paralaje del fondo.

#### 2. Componentes de UI Independientes
*   **`LoginStyles.jsx`**: Un componente dedicado exclusivamente a devolver la etiqueta `<style>` con todos los estilos CSS y media queries. Esto limpia el JSX y sigue siendo scopeado al renderizar.
*   **`Login3DCard.jsx`**: Extrae todo el JSX de la tarjeta 3D que gira, incluyendo el frente (logo 3D gigante animado) y el reverso (botón de login de Jira y manejos de error).
*   **`LoginStreetlamps.jsx`**: Separa la "capa" puramente visual y decorativa de las 3 farolas de neón interactivo que reaccionan al hover sobre la imagen de fondo.
*   **`LoginMascot.jsx`**: Extrae la mascota (búho animado flotando) y su globo de texto.

#### 3. `src/features/auth/views/LoginView.jsx` (El Orquestador)
*   Invoca a `useLogin` para adquirir las referencias (`containerRef`, `cardRef`), funciones de mouse y funciones de autenticación.
*   Renderiza limpiamente cada una de las capas visuales de atrás hacia adelante: el contenedor base con el evento del mouse, la capa de estilos (`LoginStyles`), la tarjeta central (`Login3DCard`), la capa decorativa (`LoginStreetlamps`) y por último la mascota (`LoginMascot`).
*   Se redujo de 637 a 40 líneas.

---

## Beneficios
- **Cero Interrupciones Cognitivas:** Editar las físicas de la animación CSS de las farolas ya no requiere scrollear entre funciones asíncronas de Jira.
- **Limpieza de JSX:** La tarjeta de login, al ser la parte vital, ahora reside en su propio archivo (`Login3DCard`), lo cual previene errores al editar el marcado.
- **Fácil de mantener:** La lógica de autenticación está 100% aislada en `useLogin.js`.
