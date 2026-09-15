import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/views/CentroReportesView.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# We look for the start of the alert
old_alert_pattern = r'alert\(¡Ups!.*?\);'

new_alert = "alert(¡Ups! Datos insuficientes\\n\\nEl  tiene  ticket. Se requieren al menos  tickets para generar el reporte.);"

content = re.sub(old_alert_pattern, new_alert, content, flags=re.DOTALL)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Updated alert message using regex!")
