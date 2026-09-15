import re

with open('src/features/reports/components/DynamicAIReportTemplate.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''    // ═══════════════════════════════════════════════════════════════════════
    // MAPEO DE GRÁFICAS POR TIPO DE REPORTE
    // Sprint:    sección 4 → Burnup, sección 5 → CFD, sección 7 → Scatter
    // Proyecto:  ACTO 2 → Burnup, ACTO 3 → CFD, ACTO 4 → Scatter
    // ═══════════════════════════════════════════════════════════════════════
    const showBurnup = isProyecto ? sectionNum === 2 : sectionNum === 4;
    const showCFD = isProyecto ? sectionNum === 3 : sectionNum === 5;
    const showScatter = isProyecto ? sectionNum === 4 : sectionNum === 7;''', '''    // ═══════════════════════════════════════════════════════════════════════
    // MAPEO DE GRÁFICAS POR TIPO DE REPORTE
    // Sprint:    Sección 3 → Burnup + Velocidad, Sección 4 → CFD, Sección 5 → Predictibilidad
    // Proyecto:  ACTO 2 → CFD, ACTO 3 → Burnup, ACTO 4 → Velocidad, ACTO 5 → Predictibilidad
    // ═══════════════════════════════════════════════════════════════════════
    const showCFD = isProyecto ? sectionNum === 2 : sectionNum === 4;
    const showBurnup = isProyecto ? sectionNum === 3 : sectionNum === 3;
    const showVelocidad = isProyecto ? sectionNum === 4 : sectionNum === 3;
    const showScatter = isProyecto ? sectionNum === 5 : sectionNum === 5;''')

content = content.replace('''        {/* ═══ GRÁFICA BURNUP ═══ */}
        {showBurnup && (
          <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
            <GraficaBurnup data={chartData.burnupData} />
          </div>
        )}''', '''        {/* ═══ GRÁFICA BURNUP ═══ */}
        {showBurnup && (
          <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
            <GraficaBurnup data={chartData.burnupData} />
          </div>
        )}

        {/* ═══ GRÁFICA VELOCIDAD ═══ */}
        {showVelocidad && (
          <div style={{ pageBreakInside: 'avoid', marginTop: '15px' }}>
            <GraficaVelocidad data={chartData.velocityData} />
          </div>
        )}''')

with open('src/features/reports/components/DynamicAIReportTemplate.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
