import codecs

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Let's clean up variables
vars_old = '''    const showBurnup = isProyecto ? sectionNum === 2 : sectionNum === 4;
    const showCFD = isProyecto ? sectionNum === 3 : sectionNum === 5;
    const showScatter = isProyecto ? sectionNum === 4 : sectionNum === 7;'''

vars_new = '''    // Logica Proyecto
    const showCFD = isProyecto ? sectionNum === 2 : sectionNum === 4;
    const showBurnup = isProyecto ? sectionNum === 3 : sectionNum === 3;
    const showVelocidad = isProyecto ? sectionNum === 4 : sectionNum === 5;
    const showPredictibilidad = isProyecto ? sectionNum === 5 : sectionNum === 5;'''

content = content.replace(vars_old, vars_new)

# Let's clean up the rendering block.
# In the original file, it was:
old_render = '''          {/* ANÁLISIS (Texto de la IA) */}
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
          )}
  
          {showScatter && (
            <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
              <GraficaPredictibilidad data={chartData.percentilesData} />
            </div>
          )}'''

new_render = '''          {/* ANÁLISIS (Texto de la IA) */}
          <div className={PROSE}>
            <ReactMarkdown>{trimmed}</ReactMarkdown>
          </div>
  
          {/* GRÁFICAS INYECTADAS DE FORMA VERTICAL */}
          {showBurnup && (
            <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
              <GraficaBurnup data={chartData.burnupData} />
            </div>
          )}
          
          {showCFD && (
            <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
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
            </div>
          )}

          {showVelocidad && (
            <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
              <GraficaVelocidad data={chartData.velocityData} />
            </div>
          )}

          {showPredictibilidad && (
            <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
              <GraficaPredictibilidad data={chartData.percentilesData} />
            </div>
          )}'''

# Let's perform replacement carefully
start_str = "{/* ANÁLISIS"
if start_str not in content:
    start_str = "{/* AN\xc1LISIS"

idx_start = content.find("<div className={PROSE}>")
if idx_start != -1:
    real_start = content.rfind("{/* ", 0, idx_start)
    # Find the end of showScatter block
    idx_end = content.find("<GraficaPredictibilidad", idx_start)
    idx_end = content.find("</div>", idx_end)
    idx_end = content.find(")}", idx_end)
    
    if idx_end != -1:
        content = content[:real_start] + new_render + content[idx_end+2:]
        with codecs.open(path, 'w', 'utf-8') as f:
            f.write(content)
        print("Updated successfully!")
    else:
        print("End not found")
else:
    print("Start not found")

