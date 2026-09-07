import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/views/CentroReportesView.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Add validationError state and useEffect to clear it
state_old = "const [searchGeneralQuery, setSearchGeneralQuery] = useState('');"
state_new = "const [searchGeneralQuery, setSearchGeneralQuery] = useState('');\n  const [validationError, setValidationError] = useState(null);\n\n  useEffect(() => {\n    setValidationError(null);\n  }, [reportType, reportParam, genProjectId]);"
content = content.replace(state_old, state_new)

# 2. Replace alert logic in handleGenerateLiveReport
alert_pattern = r'if \(totalRecords < minimumRequired\) \{\s*alert\([^)]+\);\s*setIsGenerating\(false\);\s*return;\s*\}'

new_alert_logic = '''if (totalRecords < minimumRequired) {
        setValidationError({
          targetName,
          totalRecords,
          minimumRequired
        });
        setIsGenerating(false);
        return;
      }'''
content = re.sub(alert_pattern, new_alert_logic, content)

# 3. Inject the JSX above the "Generar reporte" button
jsx_button_old = '''            <button 
              onClick={handleGenerateLiveReport} 
              disabled={isGenerating || (reportType === 'general' ? selectedGeneralProjects.length === 0 : reportParam === '')}
              className={bsolute bottom-0 right-0 px-10 py-4  text-white rounded-xl font-bold flex items-center gap-3 transition-all}
            >
              Generar reporte &rarr;
            </button>'''

jsx_error_card = '''            
            <div className="flex flex-col md:flex-row items-center gap-4 mt-auto">
              {validationError && (
                <div className="flex-1 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800/40 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Datos insuficientes en {validationError.targetName}</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5 leading-relaxed">
                        Se encontraron <b>{validationError.totalRecords}</b> tickets. Para un análisis confiable requerimos al menos <b>{validationError.minimumRequired === 3 ? '3 a 5' : validationError.minimumRequired}</b> tickets.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex-none">
                <button 
                  onClick={handleGenerateLiveReport} 
                  disabled={isGenerating || (reportType === 'general' ? selectedGeneralProjects.length === 0 : reportParam === '')}
                  className={px-10 py-4  text-white rounded-xl font-bold flex items-center gap-3 transition-all}
                >
                  Generar reporte &rarr;
                </button>
              </div>
            </div>'''

# Replace the absolute button with a flex container layout at the bottom
# Notice I need to change bsolute bottom-0 right-0 to standard flex items so it aligns with the error card
content = content.replace(jsx_button_old, jsx_error_card)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

print("Alert replaced with elegant inline card!")
