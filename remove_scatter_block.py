import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Remove the line const showScatter = ...
content = re.sub(r'\s*const showScatter = .*?;', '', content)

# Remove the block {showScatter && ( ... )}
content = re.sub(r'\{showScatter &&\s*\(\s*<div[^>]+>\s*<GraficaPredictibilidad[^>]+/>\s*</div>\s*\)\}', '', content)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Removed showScatter")
