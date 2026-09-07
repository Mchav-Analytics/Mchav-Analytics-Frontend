import codecs
import re

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/views/CentroReportesView.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. State
state_old = "const [searchGeneralQuery, setSearchGeneralQuery] = useState('');"
state_new = "const [searchGeneralQuery, setSearchGeneralQuery] = useState('');\n  const [genProjectId, setGenProjectId] = useState(selectedProjectId || '');\n  const [validationError, setValidationError] = useState(null);\n\n  useEffect(() => {\n    setValidationError(null);\n  }, [reportType, reportParam, genProjectId]);"
content = content.replace(state_old, state_new)

# 2. useEffects
useeffect_old = '''        try {
            if (selectedProjectId) {
                const sprintRes = await projectService.getSprints(selectedProjectId);
                setDbSprints(sprintRes || []);
            }
        } catch (e) { console.error("Error fetching sprints", e); }
    };
    fetchData();
  }, []);'''

useeffect_new = '''        try {
            if (selectedProjectId) {
                const sprintRes = await projectService.getSprints(selectedProjectId);
                setDbSprints(sprintRes || []);
            }
        } catch (e) { console.error("Error fetching sprints", e); }
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
  }, [genProjectId]);'''
content = content.replace(useeffect_old, useeffect_new)

# 3. Project ID logic in Generate
pid_old = '''      const projectId = reportType === 'general' 
        ? (selectedGeneralProjects.length > 0 ? selectedGeneralProjects[0] : null) 
        : reportParam;'''
pid_new = '''      const projectId = reportType === 'general' 
        ? (selectedGeneralProjects.length > 0 ? selectedGeneralProjects[0] : null) 
        : (reportType === 'proyecto' ? reportParam : genProjectId);'''
content = content.replace(pid_old, pid_new)

# 3b. currentProj
cproj_old = "const currentProj = dbProjects.find(p => p.id_proyecto === (reportType === 'proyecto' ? projectId : selectedProjectId));"
cproj_new = "const currentProj = dbProjects.find(p => p.id_proyecto === (reportType === 'proyecto' ? projectId : genProjectId));"
content = content.replace(cproj_old, cproj_new)

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
jsx_proj_old = '''                        <select 
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                          value={reportParam} onChange={(e) => setReportParam(e.target.value)}
                        >'''
jsx_proj_new = '''                        <select 
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                          value={reportType === 'proyecto' ? reportParam : genProjectId} 
                          onChange={(e) => reportType === 'proyecto' ? setReportParam(e.target.value) : setGenProjectId(e.target.value)}
                        >'''
content = content.replace(jsx_proj_old, jsx_proj_new)

jsx_sprint_old = '''                        <select className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none">
                          <option value="">Selecciona un sprint...</option>'''
jsx_sprint_new = '''                        <select 
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none"
                          value={reportParam} onChange={(e) => setReportParam(e.target.value)}
                        >
                          <option value="">Selecciona un sprint...</option>'''
content = content.replace(jsx_sprint_old, jsx_sprint_new)

jsx_dev_old = '''                        <select className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none appearance-none">
                          <option value="">Selecciona un desarrollador...</option>'''
jsx_dev_new = '''                        <select 
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none appearance-none"
                          value={reportParam} onChange={(e) => setReportParam(e.target.value)}
                        >
                          <option value="">Selecciona un desarrollador...</option>'''
content = content.replace(jsx_dev_old, jsx_dev_new)

# 6. Error Card
jsx_button_old = '''            <button 
              onClick={handleGenerateLiveReport} 
              disabled={isGenerating || (reportType === 'general' ? selectedGeneralProjects.length === 0 : reportParam === '')}
              className={bsolute bottom-0 right-0 px-10 py-4  text-white rounded-xl font-bold flex items-center gap-3 transition-all}
            >
              Generar reporte &rarr;
            </button>'''

jsx_error_card = '''            
            <div className="flex flex-col md:flex-row items-center gap-4 mt-auto w-full max-w-full justify-between pb-4">
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
content = content.replace(jsx_button_old, jsx_error_card)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

print("Applied UI and dropdown fixes cleanly via script!")
