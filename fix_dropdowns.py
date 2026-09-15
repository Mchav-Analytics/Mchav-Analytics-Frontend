import codecs
import re

path = 'c:/Users/vhoyos/Desktop/temp_centro.txt'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Add genProjectId state
state_old = "const [searchGeneralQuery, setSearchGeneralQuery] = useState('');"
state_new = "const [searchGeneralQuery, setSearchGeneralQuery] = useState('');\n  const [genProjectId, setGenProjectId] = useState(selectedProjectId || '');"
content = content.replace(state_old, state_new)

# 2. Update useEffect to fetch sprints/users when genProjectId changes
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
  
  // NEW EFFECT FOR GEN PROJECT
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

# 3. Update handleGenerateLiveReport projectId logic
# Original: const currentProj = dbProjects.find(p => p.id_proyecto === (reportType === 'proyecto' ? projectId : selectedProjectId));
# We need to change that so it uses genProjectId instead of selectedProjectId if it's sprint/desarrollador.
proj_logic_old = "const currentProj = dbProjects.find(p => p.id_proyecto === (reportType === 'proyecto' ? projectId : selectedProjectId));"
proj_logic_new = "const currentProj = dbProjects.find(p => p.id_proyecto === (reportType === 'proyecto' ? projectId : genProjectId));"
content = content.replace(proj_logic_old, proj_logic_new)

# Also fix the projectId variable definition inside handleGenerateLiveReport
pid_logic_old = '''      const projectId = reportType === 'general' 
        ? (selectedGeneralProjects.length > 0 ? selectedGeneralProjects[0] : null) 
        : reportParam;'''
pid_logic_new = '''      const projectId = reportType === 'general' 
        ? (selectedGeneralProjects.length > 0 ? selectedGeneralProjects[0] : null) 
        : (reportType === 'proyecto' ? reportParam : genProjectId);'''
content = content.replace(pid_logic_old, pid_logic_new)

# 4. Update JSX dropdowns
# Project Dropdown:
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

# Sprint Dropdown:
jsx_sprint_old = '''                        <select className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none">
                          <option value="">Selecciona un sprint...</option>'''
jsx_sprint_new = '''                        <select 
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none"
                          value={reportParam} onChange={(e) => setReportParam(e.target.value)}
                        >
                          <option value="">Selecciona un sprint...</option>'''
content = content.replace(jsx_sprint_old, jsx_sprint_new)

# Dev Dropdown:
jsx_dev_old = '''                        <select className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none appearance-none">
                          <option value="">Selecciona un desarrollador...</option>'''
jsx_dev_new = '''                        <select 
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-md focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none appearance-none"
                          value={reportParam} onChange={(e) => setReportParam(e.target.value)}
                        >
                          <option value="">Selecciona un desarrollador...</option>'''
content = content.replace(jsx_dev_old, jsx_dev_new)

with codecs.open('c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/views/CentroReportesView.jsx', 'w', 'utf-8') as f:
    f.write(content)

print("Fixed dropdown logic in CentroReportesView!")
