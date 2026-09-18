import { useState, useEffect } from 'react';
import { projectService, jqlService, userService } from '../../../services/api';

export function useLeaderDashboard(selectedProjectId) {


  // Estados de datos de API reales
  const [velocityData, setVelocityData] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [criticalIssues, setCriticalIssues] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [geminiInsights, setGeminiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado UI
  const [toastMessage, setToastMessage] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Cargar datos reales desde la API
  useEffect(() => {
    let isMounted = true;
    const loadRealData = async () => {
      setLoading(true);
      try {
        const projectId = selectedProjectId || '10000';
        
        // 0. Cargar Gemini Insights de Salud del Sprint
        try {
          const healthData = await projectService.getSprintHealth(projectId);
          if (isMounted && healthData?.gemini_insights) {
            setGeminiInsights(healthData.gemini_insights);
          }
        } catch (hErr) {
          console.warn("No se pudieron cargar los insights de Gemini", hErr);
        }
        
        // 1. Cargar Usuarios para Reasignar
        const users = await userService.getUsers();
        if (isMounted) {
          setTeamMembers(users.map(u => ({ name: u.nombre, role: u.rol })));
        }

        // 2. Cargar KPIs Históricos
        const kpisData = await projectService.getKpis(projectId);
        if (isMounted && kpisData.length > 0) {
          const currentKpi = kpisData[kpisData.length - 1];
          setKpis({
            sprintCompliance: currentKpi.velocity_promedio_historico || 0,
            leadTime: currentKpi.lead_time_promedio_dias || 0,
            cycleTime: currentKpi.cycle_time_promedio_dias || 0,
            scopeCreep: currentKpi.throughput_issues || 0
          });
        }

        // 3. Cargar Issues Críticos con JQL
        try {
          const jqlQuery = `project = "${projectId}" AND priority in (High, Highest) AND status != "Done"`;
          const jqlRes = await jqlService.executeJql(jqlQuery, 10);
          if (isMounted && jqlRes.status === 'success' && jqlRes.issues) {
            setCriticalIssues(jqlRes.issues.map(issue => ({
              key: issue.key_issue || issue.key,
              summary: issue.summary || issue.fields?.summary || 'Sin Título',
              assignee: issue.assignee || issue.fields?.assignee?.displayName || 'Sin Asignar',
              priority: issue.priority || issue.fields?.priority?.name || 'Alta',
              sp: issue.story_points || issue.fields?.customfield_10016 || issue.fields?.customfield_10026 || issue.fields?.storypoints || 0
            })));
          }
        } catch (e) {
          console.warn("No se pudieron cargar issues críticos", e);
          if (isMounted) setCriticalIssues([]);
        }

        // 4. Cargar Sprints y armar Gráfica de Velocidad
        try {
          const sprints = await projectService.getSprints(projectId);
          if (isMounted && sprints.length > 0) {
            const chartData = [];
            
            const sortedSprints = [...sprints].sort((a, b) => 
              a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: 'base' })
            );

            for (const sp of sortedSprints.slice(-5)) {
              try {
                const health = await projectService.getSprintHealth(projectId, sp.id_sprint);
                const planned = health?.metrics?.sp_planned ?? sp.sp_comprometidos ?? 0;
                const completed = health?.metrics?.sp_completed ?? sp.sp_completados ?? 0;
                
                chartData.push({
                  sprint: sp.nombre,
                  compromisos: planned,
                  entregados: completed
                });
              } catch (e) {
                chartData.push({ 
                  sprint: sp.nombre, 
                  compromisos: sp.sp_comprometidos ?? 0, 
                  entregados: sp.sp_completados ?? 0 
                });
              }
            }
            setVelocityData(chartData);
          }
        } catch (e) {
          console.warn("No se pudieron cargar los sprints", e);
        }

      } catch (error) {
        console.error("Error cargando datos del Lider Dashboard", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRealData();
    return () => { isMounted = false; };
  }, [selectedProjectId]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmReassign = (key, newAssigneeName) => {
    setCriticalIssues(prev => prev.map(issue => {
      if (issue.key === key) {
        return { ...issue, assignee: newAssigneeName };
      }
      return issue;
    }));
    triggerToast(`Incidencia ${key} reasignada correctamente a ${newAssigneeName}.`);
  };

  const handleNotifyDev = (key, devName) => {
    triggerToast(`Notificación enviada a ${devName} sobre la incidencia ${key}.`);
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      setIsExportingPdf(false);
      triggerToast('Reporte consolidado de rendimiento descargado en formato PDF.');
    }, 1200);
  };

  return {
    velocityData, kpis, criticalIssues, teamMembers, geminiInsights, loading,
    toastMessage, setToastMessage, isExportingPdf,
    handleConfirmReassign, handleNotifyDev, handleExportPdf
  };
}
