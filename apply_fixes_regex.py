import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/views/CentroReportesView.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. State
state_old = r"const \[searchGeneralQuery, setSearchGeneralQuery\] = useState\(''\);"
state_new = "const [searchGeneralQuery, setSearchGeneralQuery] = useState('');\n  const [genProjectId, setGenProjectId] = useState(selectedProjectId || '');\n  const [validationError, setValidationError] = useState(null);\n\n  useEffect(() => {\n    setValidationError(null);\n  }, [reportType, reportParam, genProjectId]);"
content = re.sub(state_old, state_new, content)

# 2. useEffects
# We find exactly the end of fetchData
useeffect_old = r"(\s+catch\s*\(e\)\s*\{\s*console\.error\(\"Error fetching sprints\",\s*e\);\s*\}\s*\}\s*;\s*fetchData\(\);\s*\}\s*,\s*\[)(\])\s*;"
useeffect_new = r"\1selectedProjectId]);\n  \n  useEffect(() => {\n    const fetchGen = async () => {\n        if (genProjectId) {\n            try {\n                const sprintRes = await projectService.getSprints(genProjectId);\n                setDbSprints(sprintRes || []);\n            } catch (e) {}\n        }\n    };\n    fetchGen();\n  }, [genProjectId];"
# Wait, let's just do a simpler replace.
useeffect_old_exact = """        } catch (e) { console.error("Error fetching sprints", e); }
    };
    fetchData();
  }, []);"""

useeffect_new_exact = """        } catch (e) { console.error("Error fetching sprints", e); }
    };
    fetchData();
  }, [selectedProjectId]);
  
  useEffect(() => {
    const fetchGen = async () => {
        if (genProjectId) {
            try {
                const sprintRes = await projectService.getSprints(genProjectId);
                setDbSprints(sprintRes || []);
            } catch (e) {}
        }
    };
    fetchGen();
  }, [genProjectId]);"""
if useeffect_old_exact in content:
    content = content.replace(useeffect_old_exact, useeffect_new_exact)
else:
    print("FAILED TO MATCH USEEFFECT")


# 3. Project ID logic in Generate
pid_old = r"const projectId = reportType === 'general'\s*\?\s*\(selectedGeneralProjects\.length > 0 \?\s*selectedGeneralProjects\[0\] : null\)\s*: reportParam;"
pid_new = r"const projectId = reportType === 'general'\n        ? (selectedGeneralProjects.length > 0 ? selectedGeneralProjects[0] : null)\n        : (reportType === 'proyecto' ? reportParam : genProjectId);"
content = re.sub(pid_old, pid_new, content)

cproj_old = r"const currentProj = dbProjects\.find\(p => p\.id_proyecto === \(reportType === 'proyecto' \? projectId : selectedProjectId\)\);"
cproj_new = r"const currentProj = dbProjects.find(p => p.id_proyecto === (reportType === 'proyecto' ? projectId : genProjectId));"
content = re.sub(cproj_old, cproj_new, content)

# 4. Alert replace
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

# 5. Dropdowns
# "Selecciona un proyecto..."
proj_drop_old = r'<select\s+className="w-full pl-4 pr-10 py-3 rounded-xl[^"]+"\s+value=\{reportParam\}\s+onChange=\{\(e\) => setReportParam\(e\.target\.value\)\}\s*>\s*<option value="">Selecciona un proyecto...</option>'
proj_drop_new = '''<select 
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                          value={reportType === 'proyecto' ? reportParam : genProjectId} 
                          onChange={(e) => reportType === 'proyecto' ? setReportParam(e.target.value) : setGenProjectId(e.target.value)}
                        >
                          <option value="">Selecciona un proyecto...</option>'''
content = re.sub(proj_drop_old, proj_drop_new, content)

# "Selecciona un sprint..."
sprint_drop_old = r'<select className="w-full pl-4 pr-10 py-3 rounded-xl[^"]+">\s*<option value="">Selecciona un sprint...</option>'
sprint_drop_new = '''<select 
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none"
                          value={reportParam} onChange={(e) => setReportParam(e.target.value)}
                        >
                          <option value="">Selecciona un sprint...</option>'''
content = re.sub(sprint_drop_old, sprint_drop_new, content)

# "Selecciona un desarrollador..."
dev_drop_old = r'<select className="w-full pl-4 pr-10 py-3 rounded-xl[^"]+">\s*<option value="">Selecciona un desarrollador...</option>'
dev_drop_new = '''<select 
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none appearance-none"
                          value={reportParam} onChange={(e) => setReportParam(e.target.value)}
                        >
                          <option value="">Selecciona un desarrollador...</option>'''
content = re.sub(dev_drop_old, dev_drop_new, content)

# 6. Error Card
button_pattern = r'<button\s+onClick=\{handleGenerateLiveReport\}[^>]+>\s*Generar reporte &rarr;\s*</button>'
jsx_error_card = '''<div className="flex flex-col md:flex-row items-center gap-4 mt-auto w-full max-w-full justify-between pb-4">
              <div className="flex-1">
                {validationError && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-300">
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
              </div>
              
              <div className="flex-none shrink-0">
                <button 
                  onClick={handleGenerateLiveReport} 
                  disabled={isGenerating || (reportType === 'general' ? selectedGeneralProjects.length === 0 : reportParam === '')}
                  className={px-10 py-4  text-white rounded-xl font-bold flex items-center gap-3 transition-all}
                >
                  Generar reporte &rarr;
                </button>
              </div>
            </div>'''
content = re.sub(button_pattern, jsx_error_card, content)


with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

print("Applied robust regex fixes cleanly!")
