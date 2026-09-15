import codecs

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

idx = content.find('{showScatter &&')
if idx != -1:
    sub = content[idx:idx+350]
    sub = sub.encode('ascii', 'ignore').decode('ascii')
    print(sub)
