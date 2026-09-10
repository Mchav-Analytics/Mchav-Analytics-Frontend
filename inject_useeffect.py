import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/views/CentroReportesView.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Replace the specific useEffect end bracket and add fetchGen
# We know it ends with:
#     };
#     fetchData();
#   }, []);

pattern = r"(\s+fetchData\(\);\s*\}\s*,\s*\[)\](\);)"
replacement = r"\1selectedProjectId\2\n\n  useEffect(() => {\n    const fetchGen = async () => {\n        if (genProjectId) {\n            try {\n                const sprintRes = await projectService.getSprints(genProjectId);\n                setDbSprints(sprintRes || []);\n            } catch (e) {}\n        }\n    };\n    fetchGen();\n  }, [genProjectId]);"

content = re.sub(pattern, replacement, content, count=1)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

print("Injected fetchGen successfully!")
