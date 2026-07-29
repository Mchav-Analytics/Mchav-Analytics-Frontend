# MCHAV Analytics — Frontend SPA

**Interfaz de Usuario Web Empresarial para Analítica Ágil, construida en React 18, Vite, Tailwind CSS y Recharts.**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.10.0-blue?style=flat-square)](https://recharts.org/)

---

## Visión General del Frontend

El Frontend de **MCHAV Analytics** es una aplicación de una sola página (SPA) responsiva y de alto rendimiento encargada de la visualización interactiva de las métricas procesadas por el Backend FastAPI.

Proporciona:
* **Tableros Analíticos Dinámicos:** Gráficos interactivos para métricas de Lead Time, Cycle Time, Throughput semanal, velocidad de sprints y trabajo acumulado.
* **Sincronización en Tiempo Real:** Panel de control para la activación manual o programada de la sincronización ETL con Atlassian Jira Cloud.
* **Gestión de Sesión y Autenticación:** Guardias de navegación SPA, soporte del flujo OAuth 2.0 y consumo de cookies de sesión firmadas con HMAC SHA-256.
* **Diseño Modular Responsivo:** Interfaz estructurada mediante Tailwind CSS, iconos vectoriales Lucide React y visualización de datos con Recharts.

---

## Documentación Técnica

* **[Portal Principal de Documentación (`/docs`)](../docs/index.md)**
* **[Documentación del Frontend (`docs/frontend/`)](../docs/frontend/ui_structure.md)**
  * [Ruteo y Navegación SPA](../docs/frontend/routing.md)
  * [Manejo de Estado y Cliente Axios](../docs/frontend/state_management.md)
  * [Componentes UI](../docs/frontend/components.md)
  * [Estructura y Vistas de UI](../docs/frontend/ui_structure.md)

---

## Requisitos del Sistema

* **Node.js:** `v18.0.0` o superior.
* **npm:** `v9.0.0` o superior.

---

## Instalación y Ejecución Local

### 1. Acceder al directorio del Frontend e instalar dependencias
```bash
cd Mchav-Analytics-Frontend
npm install
```

### 2. Iniciar el servidor de desarrollo (Vite)
```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

---

## Despliegue en Contenedores (Docker)

El Frontend incluye una especificación de empaquetado multi-etapa basada en **Nginx**:

```bash
docker build -t mchav-frontend .
docker run -p 80:80 mchav-frontend
```

---

## Dependencias Principales

| Librería | Versión | Función |
| :--- | :--- | :--- |
| **`react`** / **`react-dom`** | `^18.2.0` | Librería base para la construcción de interfaces de usuario declarativas |
| **`vite`** | `^5.0.0` | Empaquetador y entorno de desarrollo de alta velocidad |
| **`tailwindcss`** | `^3.4.0` | Framework CSS utilitario para diseño responsivo |
| **`recharts`** | `^2.10.0` | Biblioteca de gráficos interactivos |
| **`lucide-react`** | `^0.312.0` | Conjunto de iconos vectoriales |
| **`axios`** | `^1.6.5` | Cliente HTTP con manejo de credenciales (`withCredentials`) |
