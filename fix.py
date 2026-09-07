import re

with open('src/features/reports/components/DynamicAIReportTemplate.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''    // ═══════════════════════════════════════════════════════════════════════
    // MAPEO DE GRÁFICAS POR TIPO DE REPORTE
    // Sprint:    sección 4 → Burnup, sección 5 → CFD, sección 7 → Scatter
    // Proyecto:  ACTO 2 → Burnup, ACTO 3 → CFD, ACTO 4 → Scatter
    // ═══════════════════════════════════════════════════════════════════════
    const showCFD = isProyecto ? sectionNum === 2 : sectionNum === 5;
    const showBurnup = isProyecto ? sectionNum === 3 : sectionNum === 3;
    const showVelocidad = isProyecto ? sectionNum === 4 : sectionNum === 4;
    const showPredictibilidad = isProyecto ? sectionNum === 5 : sectionNum === 7;''', '')

content = content.replace('''    let title = '';
    
    // ═══════════════════════════════════════════════════════════════════════
    // MAPEO DE GRÁFICAS POR TIPO DE REPORTE
    // Sprint:    Sección 3 → Burnup + Velocidad, Sección 4 → CFD, Sección 5 → Predictibilidad
    // Proyecto:  ACTO 2 → CFD, ACTO 3 → Burnup, ACTO 4 → Velocidad, ACTO 5 → Predictibilidad
    // ═══════════════════════════════════════════════════════════════════════
    const showCFD = isProyecto ? sectionNum === 2 : sectionNum === 4;
    const showBurnup = isProyecto ? sectionNum === 3 : sectionNum === 3;
    const showVelocidad = isProyecto ? sectionNum === 4 : sectionNum === 3;
    const showPredictibilidad = isProyecto ? sectionNum === 5 : sectionNum === 5;

    if (lines.length > 0 && (lines[0].startsWith('# ') || lines[0].startsWith('### '))) {''', '''    let title = '';
    if (lines.length > 0 && (lines[0].startsWith('# ') || lines[0].startsWith('### '))) {''')

content = content.replace('''    if (lines.length > 0 && (lines[0].startsWith('# ') || lines[0].startsWith('### '))) {
      title = lines[0];
      lines.shift();
      trimmed = lines.join('\n');
    }''', '''    if (lines.length > 0 && (lines[0].startsWith('# ') || lines[0].startsWith('### '))) {
      title = lines[0];
      lines.shift();
      trimmed = lines.join('\\n');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MAPEO DE GRÁFICAS POR TIPO DE REPORTE
    // Sprint:    Sección 3 → Burnup + Velocidad, Sección 4 → CFD, Sección 5 → Predictibilidad
    // Proyecto:  ACTO 2 → CFD, ACTO 3 → Burnup, ACTO 4 → Velocidad, ACTO 5 → Predictibilidad
    // ═══════════════════════════════════════════════════════════════════════
    const showCFD = isProyecto ? sectionNum === 2 : sectionNum === 4;
    const showBurnup = isProyecto ? sectionNum === 3 : sectionNum === 3;
    const showVelocidad = isProyecto ? sectionNum === 4 : sectionNum === 3;
    const showPredictibilidad = isProyecto ? sectionNum === 5 : sectionNum === 5;''')

with open('src/features/reports/components/DynamicAIReportTemplate.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
