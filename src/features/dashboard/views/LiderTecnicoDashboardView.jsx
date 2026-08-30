import React from 'react';
import { Check, X } from 'lucide-react';
import { useLeaderDashboard } from '../hooks/useLeaderDashboard';

// Components
import LeaderDashboardHeader from '../components/LeaderDashboardHeader';
import GeminiInsightsCard from '../components/GeminiInsightsCard';
import LiderKpiCards from '../components/LiderKpiCards';
import LiderVelocityChart from '../components/LiderVelocityChart';
import CriticalIssuesList from '../components/CriticalIssuesList';

export default function LiderTecnicoDashboardView({
  selectedProjectId,
  setActiveTab,
  isDarkMode = true
}) {
  const {

    velocityData, kpis, criticalIssues, teamMembers, geminiInsights, loading,
    toastMessage, setToastMessage, isExportingPdf,
    handleConfirmReassign, handleNotifyDev, handleExportPdf
  } = useLeaderDashboard(selectedProjectId);

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
      <LeaderDashboardHeader 
        selectedProjectId={selectedProjectId}
        isExportingPdf={isExportingPdf}
        handleExportPdf={handleExportPdf}
        setActiveTab={setActiveTab}
      />


      {/* ── TARJETA DE DIAGNÓSTICO EJECUTIVO IA (GOOGLE GEMINI ENGINE) ── */}
      <GeminiInsightsCard geminiInsights={geminiInsights} />

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
