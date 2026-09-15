import codecs

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('<GraficaVelocidad')
if idx != -1:
    print("Found GraficaVelocidad in rendering logic!")
else:
    print("GraficaVelocidad not found in rendering logic.")
