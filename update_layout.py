import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Update the variables
vars_old = '''    const showBurnup = isProyecto ? sectionNum === 2 : sectionNum === 4;
    const showCFD = isProyecto ? sectionNum === 3 : sectionNum === 5;'''
vars_new = '''    const showCFD = isProyecto ? sectionNum === 2 : sectionNum === 5;
    const showBurnup = isProyecto ? sectionNum === 3 : sectionNum === 4;
    const showVelocidad = isProyecto ? sectionNum === 4 : false;
    const showPredictibilidad = isProyecto ? sectionNum === 5 : false;'''

content = content.replace(vars_old, vars_new)

# 2. Update the layout
# We want to replace the whole block starting from <div className={PROSE}> 
# up to the end of GraficaCFD section, or whatever is there, and put it inside a flex container.
# We will use regex to find the ReactMarkdown block and the subsequent chart blocks.

pattern = re.compile(
    r'(<div className=\{PROSE\}>\s*<ReactMarkdown>\{trimmed\}</ReactMarkdown>\s*</div>)\s*'
    r'(\{\/\* 🌊 GRÁFICA BURNUP 🌊 \*\/.*?(?:GraficaFlujo|GraficaBurnup)[^\}]+\}\s*</div>\s*\)\s*\})?\s*'
    r'(\{\/\* 🌊 GRÁFICA CFD 🌊 \*\/.*?(?:GraficaFlujo|GraficaBurnup)[^\}]+\}\s*</div>\s*\)\s*\})?',
    re.DOTALL | re.IGNORECASE
)

# Actually, wait. Let's just do a manual string replacement to be extremely safe, as regex on JSX can easily fail.
block_to_replace = '''          {/* ANÁLISIS (Texto de la IA) */}
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
              <GraficaFlujo data={chartData.cfdData} />
              {/* Tabla de flujo solo para sprint */}
              {!isProyecto && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: '"Times New Roman", serif', marginTop: '20px' }}>
                  <thead>
                    <tr style={{ background: '#1e293b' }}>
                      <th style={{ padding: '8px 15px', textAlign: 'left', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Indicador de Flujo</th>
                      <th style={{ padding: '8px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Valor</th>
                      <th style={{ padding: '8px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Interpretación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 15px', fontWeight: 700, color: '#1e293b' }}>Cycle Time Promedio</td>
                      <td style={{ padding: '8px 15px', textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>{stats.cycleTime} días</td>
                      <td style={{ padding: '8px 15px', textAlign: 'center', color: '#64748b', fontSize: '10px' }}>{stats.cycleTime <= 3 ? 'Dentro del rango saludable' : stats.cycleTime <= 7 ? 'Requiere monitoreo' : 'Fuera de rango óptimo'}</td>
                    </tr>
                    <tr style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 15px', fontWeight: 700, color: '#1e293b' }}>Throughput</td>
                      <td style={{ padding: '8px 15px', textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>{stats.throughput} tickets</td>
                      <td style={{ padding: '8px 15px', textAlign: 'center', color: '#64748b', fontSize: '10px' }}>Volumen de entrega del período</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          )}'''

new_block = '''          {/* CONTENEDOR REVISTA: TEXTO IZQ + GRÁFICA DER */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'flex-start', marginTop: '15px', width: '100%' }}>
            
            {/* ANÁLISIS (Texto de la IA) */}
            <div className={PROSE} style={{ flex: 1, minWidth: 0 }}>
              <ReactMarkdown>{trimmed}</ReactMarkdown>
            </div>
            
            {/* COLUMNA DERECHA (Gráficas inyectadas) */}
            {(showBurnup || showCFD || showVelocidad || showPredictibilidad) && (
              <div style={{ width: '380px', flexShrink: 0, pageBreakInside: 'avoid' }}>
                {showBurnup && <GraficaBurnup data={chartData.burnupData} />}
                
                {showCFD && (
                  <>
                    <GraficaFlujo data={chartData.cfdData} />
                    {!isProyecto && (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: '"Times New Roman", serif', marginTop: '20px' }}>
                        <thead>
                          <tr style={{ background: '#1e293b' }}>
                            <th style={{ padding: '8px 15px', textAlign: 'left', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Indicador de Flujo</th>
                            <th style={{ padding: '8px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Valor</th>
                            <th style={{ padding: '8px 15px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>Interpretación</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px 15px', fontWeight: 700, color: '#1e293b' }}>Cycle Time Promedio</td>
                            <td style={{ padding: '8px 15px', textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>{stats.cycleTime} días</td>
                            <td style={{ padding: '8px 15px', textAlign: 'center', color: '#64748b', fontSize: '10px' }}>{stats.cycleTime <= 3 ? 'Dentro del rango saludable' : stats.cycleTime <= 7 ? 'Requiere monitoreo' : 'Fuera de rango óptimo'}</td>
                          </tr>
                          <tr style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px 15px', fontWeight: 700, color: '#1e293b' }}>Throughput</td>
                            <td style={{ padding: '8px 15px', textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>{stats.throughput} tickets</td>
                            <td style={{ padding: '8px 15px', textAlign: 'center', color: '#64748b', fontSize: '10px' }}>Volumen de entrega del período</td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </>
                )}

                {showVelocidad && <GraficaVelocidad data={chartData.velocityData} />}
                
                {showPredictibilidad && <GraficaPredictibilidad data={chartData.percentilesData} />}
              </div>
            )}
          </div>'''

# The original block in the file might have weird encoding (e.g. Ó, í, etc.) so let's try a regex on the key parts.
# Let's find the start of ANÁLISIS up to the end of the CFD table.
# Since we know const PROSE = is defined earlier, we can match from <div className={PROSE}> to the end of the 	able} or )}
# To be robust, let's use search and replace by looking up indices.

start_str = "{/* ANÁLISIS"
if start_str not in content:
    start_str = "{/* AN\xc1LISIS"

idx_start = content.find("<div className={PROSE}>")
if idx_start == -1:
    print("Could not find start")
    exit()

# We know the block ends with the table in showCFD.
idx_end = content.find("</table>", idx_start)
if idx_end != -1:
    idx_end = content.find(")}", idx_end) # find the closing of showCFD
    idx_end = content.find("</div>", idx_end) # closing of showCFD div
    idx_end = content.find(")}", idx_end) # closing of showCFD condition

if idx_end != -1:
    print("Replacing layout...")
    # Find the actual start including the comment
    real_start = content.rfind("{/* ", 0, idx_start)
    if real_start != -1:
        # replace
        content = content[:real_start] + new_block + content[idx_end+2:]
        with codecs.open(path, 'w', 'utf-8') as f:
            f.write(content)
        print("Replaced successfully!")
else:
    print("Could not find end")
