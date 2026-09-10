# Rediseño del Reporte de Sprint (Menos IA, Más Gráficas)

Actualmente el reporte de Sprint genera 8 secciones con hasta 24 párrafos de texto generados por IA, lo que hace que se vea abrumador y oculte las gráficas. 

## Proposed Changes

### 1. Backend (gemini_service.py)
- **Reducir el exceso de texto:** Modificaremos el prompt de la IA para el Sprint eliminando la orden de "escribir al menos 3 párrafos por sección". Le pediremos que sea directa, concisa y use viñetas (bullet points) para no generar "muros de texto".
- **Reducir las secciones:** Pasaremos de 8 a 6 secciones mucho más lógicas y rápidas de leer:
  - # 01 — RESUMEN EJECUTIVO
  - # 02 — KPIs DEL SPRINT
  - # 03 — PLANIFICADO VS ENTREGADO
  - # 04 — FLUJO DE TRABAJO Y CUELLOS DE BOTELLA
  - # 05 — PATRONES DE PREDICTIBILIDAD
  - # 06 — CONCLUSIÓN Y RECOMENDACIONES

### 2. Frontend (DynamicAIReportTemplate.jsx)
- **Ajuste de inyección de gráficas:** Sincronizaremos las gráficas para que aparezcan exactamente debajo de cada nueva sección, distribuyéndolas mejor en el documento:
  - **Sección 2:** Tarjetas de KPIs visuales.
  - **Sección 3:** Tabla comparativa + **Gráfica Burnup**.
  - **Sección 4:** **Diagrama de Flujo Acumulado (CFD)** + Tabla de interpretación de flujo.
  - **Sección 5:** **Gráfica de Dispersión (Percentiles P50/P85/P95)**.
- **Gráfica de Velocidad Histórica:** Actualmente la gráfica de velocidad (que compara sprints pasados) solo sale en el reporte de "Proyecto". Habilitaremos para que **también salga en el reporte de Sprint**, inyectándola al final de la Sección 3 para que el reporte tenga aún más valor visual.

## User Review Required
> [!IMPORTANT]
> ¿Estás de acuerdo con reducir de 8 a 6 secciones y pedirle a la IA que sea más directa y menos parlanchina? 
> ¿Te parece bien incluir la Gráfica de Velocidad en el reporte de Sprint para darle más peso visual?
