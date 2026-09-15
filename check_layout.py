import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Replace the layout
old_layout = '''          {/* ANÁLISIS (Texto de la IA) */}
          <div className={PROSE}>
            <ReactMarkdown>{trimmed}</ReactMarkdown>
          </div>
  
          {/* 🌊 GRÁFICA BURNUP 🌊 */}
          {showBurnup && (
            <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
              <GraficaBurnup data={chartData.burnupData} />
            </div>
          )}
  
          {/* 🌊 GRÁFICA CFD 🌊 */}
          {showCFD && (
            <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
              <GraficaFlujo data={chartData.cfdData} />'''

# Wait, the exact text might have weird characters for "ANÁLISIS". Let's use regex.
pattern = re.compile(r"(\{\/\* AN[^\*]+\*\/.*?)(<div className=\{PROSE\}>.*?<\/div>)(.*?)(?=\{\/\* 🌊)", re.DOTALL | re.IGNORECASE)

def repl(m):
    return "" # Will craft this later

# Let's just find the ReactMarkdown part
match = re.search(r"<div className=\{PROSE\}>\s*<ReactMarkdown>\{trimmed\}</ReactMarkdown>\s*</div>", content)
if match:
    print("Found ReactMarkdown block")
else:
    print("Not found ReactMarkdown block")

