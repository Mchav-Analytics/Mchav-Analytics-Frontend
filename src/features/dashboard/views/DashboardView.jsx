import React from 'react';
import { useDashboard } from '../hooks/useDashboard';

import DashboardHeader from '../components/DashboardHeader';
import DashboardProjectPanorama from '../components/DashboardProjectPanorama';
import DashboardTrends from '../components/DashboardTrends';
import DashboardPerformance from '../components/DashboardPerformance';
import KpiDetailModal from '../components/KpiDetailModal';

export default function DashboardView({ subTab = 'dashboard', selectedProjectId, metrics, kpis, setActiveTab }) {
  const {
    isRefreshing,
    carouselRef,
    hoveredProject, setHoveredProject,
    isModalOpen, modalTitle, modalMetricType,
    openDrillDown, closeDrillDown,
    projectsHealthList,
    totalProjectsCount,
    estadoDonutData,
    lastSyncInfo,
    trendMetric, setTrendMetric,
    trendTimeframe, setTrendTimeframe,
    tendenciaData,
    rendimientoTimeFilter, setRendimientoTimeFilter,
    rd,
    animVelocity, animThroughput, animCycle, animLead,
    handleScrollCarouselRight,
    handleRefresh,
    handleExportPDF
  } = useDashboard(selectedProjectId);

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200 font-sans pb-10">
      
      {/* 1. BARRA SUPERIOR ADAPTADA A SUPERVISIÓN EJECUTIVA (ADMIN RESUMEN) */}
      <DashboardHeader 
        onNavigateTab={setActiveTab} 
        handleExportPDF={handleExportPDF} 
      />

      {/* ============================================================================ */}
      {/* SECCIÓN 1: PANORAMA DE PROYECTOS (CARRUSEL DE TARJETAS DE SALUD) */}
      {/* ============================================================================ */}
      <DashboardProjectPanorama 
        projectsHealthList={projectsHealthList}
        setActiveTab={setActiveTab}
        carouselRef={carouselRef}
        handleScrollCarouselRight={handleScrollCarouselRight}
        hoveredProject={hoveredProject}
        setHoveredProject={setHoveredProject}
      />

      {/* ============================================================================ */}
      {/* SECCIÓN 2: TENDENCIA GENERAL (IZQ 7 COLS) Y ESTADO GENERAL (DER 5 COLS) */}
      {/* ============================================================================ */}
      <DashboardTrends 
        trendMetric={trendMetric} setTrendMetric={setTrendMetric}
        trendTimeframe={trendTimeframe} setTrendTimeframe={setTrendTimeframe}
        tendenciaData={tendenciaData}
        setActiveTab={setActiveTab}
        lastSyncInfo={lastSyncInfo}
        totalProjectsCount={totalProjectsCount}
        estadoDonutData={estadoDonutData}
      />

      {/* ============================================================================ */}
      {/* SECCIÓN 3: RENDIMIENTO GLOBAL PROMEDIO (REUBICADO Y PROMINENTE EN LA PARTE INFERIOR) */}
      {/* ============================================================================ */}
      <DashboardPerformance 
        rendimientoTimeFilter={rendimientoTimeFilter}
        setRendimientoTimeFilter={setRendimientoTimeFilter}
        rd={rd}
        animVelocity={animVelocity}
        animThroughput={animThroughput}
        animCycle={animCycle}
        animLead={animLead}
        openDrillDown={openDrillDown}
      />

      {/* Modal de Drill-down de métricas por ticket (HU-015) */}
      <KpiDetailModal
        isOpen={isModalOpen}
        onClose={closeDrillDown}
        projectId={selectedProjectId}
        metricTitle={modalTitle}
        metricType={modalMetricType}
      />

    </div>
  );
}
