import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/views/CentroReportesView.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Replace the old alert
old_alert = r"alert\(No hay suficientes registros para este reporte\.\\n\\nSe requieren al menos \$\{minimumRequired\} tickets, pero solo se encontraron \$\{totalRecords\} para \$\{targetName\}\.\\n\\nIntenta sincronizar nuevamente o selecciona otro filtro\.\);"

new_alert = "alert(¡Ups!  solo tiene  ticket registrado.\\n\\nNuestro motor de Inteligencia Artificial requiere al menos  tickets para poder emitir un análisis confiable.\\n\\nPor favor, selecciona un periodo con más movimiento o intenta sincronizar nuevamente.);"

content = re.sub(old_alert, new_alert, content)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Updated alert message!")
