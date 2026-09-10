import codecs

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/components/DynamicAIReportTemplate.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# We need to replace the flex row container back to vertical stacking.
# We added this block:
# {/* CONTENEDOR REVISTA: TEXTO IZQ + GRÁFICA DER */}
# <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'flex-start', marginTop: '15px', width: '100%' }}>

idx_container = content.find('{/* CONTENEDOR REVISTA: TEXTO IZQ + GRÁFICA DER */}')
if idx_container != -1:
    idx_end = content.find('</div>', content.find('<GraficaPredictibilidad', idx_container))
    # We need to find the final closing </div> of the magazine container.
    # It's better to just replace the string exactly if we can extract it.

