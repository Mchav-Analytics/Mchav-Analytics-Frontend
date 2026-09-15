import re

with open('src/features/reports/components/DynamicAIReportTemplate.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#243b67', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', marginBottom: '60px', maxWidth: '420px', lineHeight: 1.25 }}>
              {titleMap[reportType] || titleMap.general}
            </h1>''', '''            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#243b67', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', marginBottom: '60px', maxWidth: '420px', lineHeight: 1.25 }}>
              {reportType === 'sprint' ? REPORTE DE  : (titleMap[reportType] || titleMap.general)}
            </h1>''')

with open('src/features/reports/components/DynamicAIReportTemplate.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
