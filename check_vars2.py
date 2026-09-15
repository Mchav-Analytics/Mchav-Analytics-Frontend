import codecs

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('const showBurnup')
if idx != -1:
    print(content[idx-50:idx+400].encode('ascii', 'ignore').decode('ascii'))
