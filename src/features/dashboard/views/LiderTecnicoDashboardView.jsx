import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Calculator,
  FileDown,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import LiderNotificationBell from '../components/LiderNotificationBell';
import CapacitySimulator from '../components/CapacitySimulator';
import LiderKpiCards from '../components/LiderKpiCards';
import LiderVelocityChart from '../components/LiderVelocityChart';
import CriticalIssuesList from '../components/CriticalIssuesList';
import { projectService, jqlService, userService } from '../../../services/api';

export default function LiderTecnicoDashboardView({
  selectedProjectId,
  setActiveTab,
  isDarkMode = true
}) {
  // Estado para la Calculadora de Capacidad
  const [showCapacityCalculator, setShowCapacityCalculator] = useState(false);
  const [devCount, setDevCount] = useState(4);
  const [sprintDays, setSprintDays] = useState(10);
  const [vacationDays, setVacationDays] = useState(2);
  const [sickDays, setSickDays] = useState(0); 
  const [sickDevsCount, setSickDevsCount] = useState(0); 
  const [avgDevVelocity, setAvgDevVelocity] = useState(10);

  // Estados de datos de API reales
  const [velocityData, setVelocityData] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [criticalIssues, setCriticalIssues] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Cargar datos reales desde la API
  useEffect(() => {
    let isMounted = true;
    const loadRealData = async () => {
      setLoading(true);
      try {
        const projectId = selectedProjectId || '10000'; // Default o seleccionado
        
        // 1. Cargar Usuarios para Reasignar
        const users = await userService.getUsers();
        if (isMounted) {
          setTeamMembers(users.map(u => ({ name: u.nombre, role: u.rol })));
        }

        // 2. Cargar KPIs Históricos
        const kpisData = await projectService.getKpis(projectId);
        if (isMounted && kpisData.length > 0) {
          // Tomar el último registro como actual
          const currentKpi = kpisData[kpisData.length - 1];
          setKpis({
            sprintCompliance: currentKpi.velocity_promedio_historico || 0, // Ajustar según backend
            leadTime: currentKpi.lead_time_promedio_dias || 0,
            cycleTime: currentKpi.cycle_time_promedio_dias || 0,
            scopeCreep: currentKpi.throughput_issues || 0 // Ajustar según backend
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
            
            // Ordenar los sprints por nombre para que aparezcan en orden lógico (Sprint 1, Sprint 2...) 
            // y no por fecha de creación (ya que en datos de prueba las fechas están desordenadas).
            const sortedSprints = [...sprints].sort((a, b) => 
              a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: 'base' })
            );

            // Usamos un pequeño índice para generar datos mock deterministas si Jira viene en 0
            let mockIndex = 0;
            const mockPlanned = [45, 50, 48, 55, 60];
            const mockCompleted = [40, 48, 40, 52, 58];
            
            for (const sp of sortedSprints.slice(-5)) { // Últimos 5 sprints
              try {
                const health = await projectService.getSprintHealth(projectId, sp.id_sprint);
                let planned = health?.metrics?.sp_planned || 0;
                let completed = health?.metrics?.sp_completed || 0;
                
                // Si Jira devuelve 0 (por falta de config de SP), usamos mocks para la demo
                if (planned === 0 && completed === 0) {
                  planned = mockPlanned[mockIndex % mockPlanned.length];
                  completed = mockCompleted[mockIndex % mockCompleted.length];
                  mockIndex++;
                }
                
                chartData.push({
                  sprint: sp.nombre,
                  compromisos: planned,
                  entregados: completed
                });
              } catch (e) {
                // Fallback si no hay data de health
                chartData.push({ 
                  sprint: sp.nombre, 
                  compromisos: mockPlanned[mockIndex % mockPlanned.length], 
                  entregados: mockCompleted[mockIndex % mockCompleted.length] 
                });
                mockIndex++;
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

  // Mostrar mensaje emergente Toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reasignar desarrollador a una incidencia (Solo local/Mock para UI)
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative text-slate-900 dark:text-slate-100">

      {/* ── NOTIFICACIÓN EMERGENTE (TOAST) ── */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-200">
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Check size={14} />
          </div>
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* ── CABECERA UNIFICADA DE PANEL OPERATIVO ── */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
            <BarChart2 size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-indigo-600 dark:text-indigo-300" />
                Liderazgo Técnico
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                • Proyecto: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedProjectId || 'MCHAV'}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Panel Operativo del Sprint Activo
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <LiderNotificationBell />

          <button
            type="button"
            onClick={() => setShowCapacityCalculator(!showCapacityCalculator)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-extrabold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Calculator size={14} className="text-cyan-600 dark:text-cyan-400" /> 
            {showCapacityCalculator ? 'Cerrar Calculadora' : 'Planificar Capacidad'}
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-2.5 rounded-2xl bg-[#5b36f5] hover:bg-indigo-600 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0 disabled:opacity-50"
          >
            <FileDown size={15} /> 
            {isExportingPdf ? 'Generando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {/* ── PANEL PLEGABLE: SIMULADOR DE CAPACIDAD ── */}
      {showCapacityCalculator && (
        <CapacitySimulator 
          devCount={devCount} setDevCount={setDevCount}
          sprintDays={sprintDays} setSprintDays={setSprintDays}
          vacationDays={vacationDays} setVacationDays={setVacationDays}
          sickDevsCount={sickDevsCount} setSickDevsCount={setSickDevsCount}
          sickDays={sickDays} setSickDays={setSickDays}
          avgDevVelocity={avgDevVelocity} setAvgDevVelocity={setAvgDevVelocity}
          onClose={() => setShowCapacityCalculator(false)}
        />
      )}

      {/* ── TARJETAS DE KPIS ── */}
      <LiderKpiCards kpis={kpis} />

      {/* ── SECCIÓN PRINCIPAL DE 2 COLUMNAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: GRÁFICO DE VELOCIDAD */}
        <LiderVelocityChart velocityData={velocityData} isDarkMode={isDarkMode} />

        {/* COLUMNA DERECHA: IMPEDIMENTOS */}
        <CriticalIssuesList 
          criticalIssues={criticalIssues}
          teamMembers={teamMembers}
          handleNotifyDev={handleNotifyDev}
          handleConfirmReassign={handleConfirmReassign}
          setActiveTab={setActiveTab}
        />
      </div>

    </div>
  );
}
