import React from 'react';
import { BarChart2, LayoutDashboard, History } from 'lucide-react';
import ExecutiveReportTemplate from '../components/ExecutiveReportTemplate';
import { useReportsCenter } from '../hooks/useReportsCenter';
import { ReportsGenerator } from '../components/ReportsGenerator';
import { ReportsHistory } from '../components/ReportsHistory';

export default function CentroReportesView({ selectedProjectId }) {
  const {
    activeTab, setActiveTab,
    reportType, setReportType,
    reportParam, setReportParam,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,
    isGenerating,
    reportData,
    selectedMonth, setSelectedMonth,
    selectedYear, setSelectedYear,
    compareMonth, setCompareMonth,
    compareYear, setCompareYear,
    loadingHistory,
    error,
    dbProjects,
    dbUsers,
    reportRef,
    months,
    years,
    handleGenerateLiveReport,
    handleFetchHistory
  } = useReportsCenter(selectedProjectId);

  return (
    <div className="w-full min-h-[calc(100vh-110px)] bg-gradient-to-br from-slate-50 to-white dark:from-transparent dark:to-transparent shadow-sm dark:shadow-none border border-slate-200/60 dark:border-transparent rounded-3xl p-8 md:p-12 flex flex-col gap-8 relative overflow-hidden">
      
      {/* HEADER Y TABS */}
      {/* Luces decorativas de fondo (Soft Glassmorphism effect) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/10 dark:bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-sky-400/10 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 relative z-20">
        <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
                <BarChart2 className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Centro de Reportes</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">Genera, consulta y compara el rendimiento de tus proyectos y equipos.</p>
        </div>
        
        <div className="flex p-1.5 bg-slate-100/80 dark:bg-[#141738]/50 backdrop-blur-md rounded-[1.25rem] border border-slate-200/80 dark:border-white/5 w-full md:w-auto mt-6 md:mt-0 shadow-inner">
            <button 
                onClick={() => setActiveTab('generacion')} 
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[13px] transition-all duration-300 ${activeTab === 'generacion' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(99,102,241,0.3)] ring-1 ring-slate-200 dark:ring-0 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
            >
                <LayoutDashboard className="w-4 h-4" />
                Generación de Reportes
            </button>
            <button 
                onClick={() => setActiveTab('historial')} 
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[13px] transition-all duration-300 ${activeTab === 'historial' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(99,102,241,0.3)] ring-1 ring-slate-200 dark:ring-0 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
            >
                <History className="w-4 h-4" />
                Historial Inmutable
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full relative z-20">
        {activeTab === 'generacion' ? (
          <ReportsGenerator 
            reportType={reportType} setReportType={setReportType}
            reportParam={reportParam} setReportParam={setReportParam}
            customStartDate={customStartDate} setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate} setCustomEndDate={setCustomEndDate}
            isGenerating={isGenerating} handleGenerateLiveReport={handleGenerateLiveReport}
            dbProjects={dbProjects} dbUsers={dbUsers}
          />
        ) : (
          <ReportsHistory 
            selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear} setSelectedYear={setSelectedYear}
            compareMonth={compareMonth} setCompareMonth={setCompareMonth}
            compareYear={compareYear} setCompareYear={setCompareYear}
            handleFetchHistory={handleFetchHistory}
            months={months} years={years}
          />
        )}
      </div>
      
      {/* Plantilla oculta para el PDF */}
      <ExecutiveReportTemplate ref={reportRef} reportType={reportType} filters={{}} />
    </div>
  );
}
