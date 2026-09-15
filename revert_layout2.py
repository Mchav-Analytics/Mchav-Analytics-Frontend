import codecs

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

magazine_block = '''          {/* CONTENEDOR REVISTA: TEXTO IZQ + GRÁFICA DER */}
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

stacked_block = '''          {/* ANÁLISIS (Texto de la IA) */}
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

if "{/* CONTENEDOR REVISTA:" in content:
    idx = content.find("{/* CONTENEDOR REVISTA:")
    end_idx = content.find("</div>", content.find("showPredictibilidad"))
    # We need to find the exact matching closing div for the flex container
    # Since we can't easily parse HTML in regex, I'll just replace based on the string I injected.
    content = content.replace(magazine_block, stacked_block)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("Reverted layout successfully!")
else:
    print("Magazine block not found")
