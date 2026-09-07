import codecs

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('GR\xc1FICAS INYECTADAS DE FORMA VERTICAL')
if idx == -1:
    idx = content.find('GRÁFICAS INYECTADAS')

if idx != -1:
    print(content[idx-200:idx+800].encode('ascii', 'ignore').decode('ascii'))
