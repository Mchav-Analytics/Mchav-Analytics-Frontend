import codecs

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

old_vars = '''    const showCFD = isProyecto ? sectionNum === 2 : sectionNum === 5;
    const showBurnup = isProyecto ? sectionNum === 3 : sectionNum === 4;
    const showVelocidad = isProyecto ? sectionNum === 4 : false;
    const showPredictibilidad = isProyecto ? sectionNum === 5 : false;
    const showScatter = isProyecto ? sectionNum === 4 : sectionNum === 7;'''

new_vars = '''    // Logica Proyecto
    const showCFD = isProyecto && sectionNum === 2;
    const showBurnup = isProyecto && sectionNum === 3;
    const showVelocidad = isProyecto && sectionNum === 4;
    const showPredictibilidad = isProyecto && sectionNum === 5;

    // Logica Sprint
    const showCFDSprint = !isProyecto && sectionNum === 4;
    const showBurnupSprint = !isProyecto && sectionNum === 3;
    const showVelocidadSprint = !isProyecto && sectionNum === 5;
    const showPredictibilidadSprint = !isProyecto && sectionNum === 5; // o donde vaya en sprint, lo pongo false por ahora para no romper
'''

# Wait, if I replace the vars, I also need to update the rendering blocks to use these new vars or combine them.
# Let's just use:
new_vars = '''    const showCFD = isProyecto ? sectionNum === 2 : sectionNum === 4;
    const showBurnup = isProyecto ? sectionNum === 3 : sectionNum === 3;
    const showVelocidad = isProyecto ? sectionNum === 4 : sectionNum === 5;
    const showPredictibilidad = isProyecto ? sectionNum === 5 : sectionNum === 6;'''
# BUT I don't want to break the user's Sprint report if I don't know the exact sections. 
# They said "ya queda el reporte perfecto" for the Project. I'll just remove showScatter.

