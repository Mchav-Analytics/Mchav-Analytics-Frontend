import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Update variables logic for sprint
vars_old = r'''    const showCFD = isProyecto \? sectionNum === 2 : sectionNum === 4;
    const showBurnup = isProyecto \? sectionNum === 3 : sectionNum === 3;
    const showVelocidad = isProyecto \? sectionNum === 4 : sectionNum === 5;
    const showPredictibilidad = isProyecto \? sectionNum === 5 : sectionNum === 6;'''

vars_new = '''    const showCFD = isProyecto ? sectionNum === 2 : sectionNum === 5;
    const showBurnup = isProyecto ? sectionNum === 3 : sectionNum === 3;
    const showVelocidad = isProyecto ? sectionNum === 4 : sectionNum === 4;
    const showPredictibilidad = isProyecto ? sectionNum === 5 : sectionNum === 7;'''

content = re.sub(vars_old, vars_new, content)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Updated Sprint mapping in React.")
