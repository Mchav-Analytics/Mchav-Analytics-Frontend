import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Replace margin: '20px 0' to margin: '10px 0'
content = content.replace("margin: '20px 0'", "margin: '10px 0'")

# Replace height: 350 to height: 260
content = content.replace("height: 350", "height: 260")

# Replace height={340} to height={250}
content = content.replace("height={340}", "height={250}")

# There are also width and height directly inside <BarChart height={340} ...> etc.
content = content.replace("height:340", "height:250") # Just in case

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

print("Heights updated to be more compact.")
