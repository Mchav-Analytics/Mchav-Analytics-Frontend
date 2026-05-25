# MCHAV Analytics Frontend

> Dashboard interactivo para visualización de KPIs y métricas de equipos de desarrollo integrados con Jira Cloud.

![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge\&logo=react)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge\&logo=vite)
![Chart.js](https://img.shields.io/badge/Charts-Chart.js-FF6384?style=for-the-badge\&logo=chartdotjs)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=for-the-badge)

---

## Descripción

MCHAV Analytics Frontend es el cliente web encargado de visualizar métricas de rendimiento de equipos de desarrollo mediante dashboards dinámicos, gráficos interactivos y analítica en tiempo real.

La plataforma consume la API del backend para transformar datos de Jira Cloud en información estratégica.

---

## Características

* Dashboards interactivos en tiempo real
* Visualización de KPIs mediante gráficos
* Autenticación JWT
* Rutas protegidas y control por roles
* Filtros por sprint, proyecto y rango de fechas
* Exportación de reportes PDF
* Diseño responsive
* Integración con API REST FastAPI

---

## KPIs Soportados

* Sprint Velocity
* Lead Time
* Cycle Time
* Throughput
* Reopen Rate
* Resolution Rate

---

## Stack Tecnológico

| Tecnología   | Propósito              |
| ------------ | ---------------------- |
| React        | Interfaz frontend      |
| TypeScript   | Tipado seguro          |
| Vite         | Bundler                |
| Chart.js     | Visualización de datos |
| Axios        | Comunicación con API   |
| React Router | Navegación             |
| JWT          | Autenticación          |

---

## Estructura del Proyecto

```bash
src/
├── components/
├── pages/
├── services/
├── hooks/
├── routes/
├── context/
├── assets/
└── utils/
```

---

## Instalación

### Clonar repositorio

```bash
git clone https://github.com/tu-org/mchav-analytics-frontend.git
```

---

### Instalar dependencias

```bash
npm install
```

---

### Variables de entorno

```env
VITE_API_URL=http://localhost:8000
```

---

### Ejecutar proyecto

```bash
npm run dev
```

---

## Seguridad

* Autenticación JWT
* Rutas protegidas
* Control de acceso por roles
* Comunicación segura con API

---

## Capturas

Agregar:

* Login
* Dashboard
* KPIs
* Gráficos
* Reportes

---

## Equipo

Desarrollado para Grupo ASD SAS bajo metodología Scrum.
