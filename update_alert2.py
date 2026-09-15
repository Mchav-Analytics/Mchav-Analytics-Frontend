import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/views/CentroReportesView.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

old_alert = "alert(¡Ups!  solo tiene  ticket registrado.\\n\\nNuestro motor de Inteligencia Artificial requiere al menos  tickets para poder emitir un análisis confiable.\\n\\nPor favor, selecciona un periodo con más movimiento o intenta sincronizar nuevamente.);"

new_alert = "alert(¡Ups!  solo tiene  ticket registrado.\\n\\nPara poder generar un reporte con un análisis realmente confiable, se requieren al menos  tickets.\\n\\nPor favor, selecciona un periodo con más movimiento o intenta sincronizar nuevamente.);"

content = content.replace(old_alert, new_alert)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Updated alert message again!")
