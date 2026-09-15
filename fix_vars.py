import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# We'll use regex to match the variable definitions regardless of line endings
pattern = re.compile(
    r'\s*const showBurnup = .*?;\s*'
    r'const showCFD = .*?;\s*'
    r'const showScatter = .*?;',
    re.DOTALL
)

vars_new = '''
    const showCFD = isProyecto ? sectionNum === 2 : sectionNum === 4;
    const showBurnup = isProyecto ? sectionNum === 3 : sectionNum === 3;
    const showVelocidad = isProyecto ? sectionNum === 4 : sectionNum === 5;
    const showPredictibilidad = isProyecto ? sectionNum === 5 : sectionNum === 6;
'''

if pattern.search(content):
    content = pattern.sub(vars_new, content)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("Variables replaced successfully!")
else:
    print("Variables not found! They might be different.")
