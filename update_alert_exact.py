import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/views/CentroReportesView.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Pattern for the old alert
old_alert_pattern = r'alert\(¡Ups! Datos insuficientes\\n\\nActualmente hay \$\{totalRecords\}.*?\);'

new_alert = "alert(¡Ups!  solo tiene  ticket registrado. Para poder generar el reporte se requiere al menos  tickets. Por favor, selecciona un periodo con más movimiento o intenta sincronizar nuevamente.);"

content = re.sub(old_alert_pattern, new_alert, content, flags=re.DOTALL)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Updated alert message to exact user string!")
