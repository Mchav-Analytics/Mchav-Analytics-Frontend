import codecs

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('const showCFD')
if idx != -1:
    sub = content[idx-50:idx+350]
    sub = sub.encode('ascii', 'ignore').decode('ascii')
    print(sub)
