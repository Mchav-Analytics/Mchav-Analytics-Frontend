import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, FolderKanban, ShieldCheck, CheckCircle2, TrendingUp, History, Trash2, Search, Check, AlertCircle, X } from 'lucide-react';
import { projectService, reportService } from '../../../services/api';

export default function ReportsView({ isDarkMode }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjId, setSelectedProjId] = useState('');
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Historial simulado de reportes generados
  const [reportsHistory, setReportsHistory] = useState([
    { id: 'rep-001', name: 'reporte_ejecutivo_prueba_asd.pdf', date: 'Hoy 14:35', project: 'PASD', size: '142 KB', user: 'Stephany Leon' },
    { id: 'rep-002', name: 'reporte_ejecutivo_mchav_analytics.pdf', date: 'Ayer 09:12', project: 'MCHAV', size: '138 KB', user: 'Stephany Leon' },
    { id: 'rep-003', name: 'consolidado_kpi_pasd_q2.pdf', date: '22 Jul 2026', project: 'PASD', size: '254 KB', user: 'Stephany Leon' }
  ]);

  const [kpis, setKpis] = useState({
    throughput: 21.5,
    cycleTime: 3.8,
    velocity: 186
  });

  const sprintData = [
    { label: 'SP_1', value: 42, height: '40%', detail: '42 issues completados (Throughput: 14)' },
    { label: 'SP_2', value: 58, height: '58%', detail: '58 issues completados (Throughput: 19)' },
    { label: 'SP_3', value: 51, height: '51%', detail: '51 issues completados (Throughput: 17)' },
    { label: 'SP_4', value: 67, height: '85%', detail: '67 issues completados (Throughput: 22)' }
  ];

  useEffect(() => {
    projectService.getProjects()
      .then(data => {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjId(data[0].id_proyecto);
        }
      })
      .catch(err => console.error("Error fetching projects for reports:", err));
  }, []);

  useEffect(() => {
    if (selectedProjId) {
      if (selectedProjId === '10034') {
        setKpis({ throughput: 11.0, cycleTime: 3.2, velocity: 70 });
      } else {
        setKpis({ throughput: 21.5, cycleTime: 3.8, velocity: 186 });
      }
    }
  }, [selectedProjId, startDate, endDate]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleDownloadPdf = () => {
    if (!selectedProjId) return;
    setIsDownloading(true);
    reportService.downloadPdfReport(selectedProjId, startDate, endDate)
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const projName = projects.find(p => p.id_proyecto === selectedProjId)?.nombre || 'proyecto';
        const fileName = `reporte_ejecutivo_${projName.replace(/\s+/g, '_').toLowerCase()}.pdf`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Agregar al historial de descargas
        const newReport = {
          id: `rep-${Date.now()}`,
          name: fileName,
          date: 'Ahora',
          project: projects.find(p => p.id_proyecto === selectedProjId)?.key_proyecto || 'General',
          size: '145 KB',
          user: 'Stephany Leon'
        };
        setReportsHistory(prev => [newReport, ...prev]);
        setIsDownloading(false);
        showToast(`¡Reporte "${fileName}" generado y descargado con éxito!`);
      })
      .catch(err => {
        console.error("Error downloading report:", err);
        setIsDownloading(false);
        showToast('Ocurrió un error al intentar generar el PDF.', 'error');
      });
  };

  const handleDeleteHistoryItem = (id) => {
    const item = reportsHistory.find(r => r.id === id);
    setReportsHistory(prev => prev.filter(r => r.id !== id));
    if (item) {
      showToast(`Se eliminó "${item.name}" del historial.`, 'info');
    }
  };

  const selectedProjName = projects.find(p => p.id_proyecto === selectedProjId)?.nombre || 'MCHAV Analytics';

  const filteredHistory = reportsHistory.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full text-slate-800 dark:text-slate-100 animate-in fade-in duration-300 space-y-7 pb-12 relative">
      
      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'error'
            ? 'bg-rose-500/90 border-rose-400 text-white'
            : toast.type === 'info'
            ? 'bg-slate-800/90 border-slate-700 text-white'
            : 'bg-emerald-600/90 border-emerald-500 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="ml-2 text-white/70 hover:text-white cursor-pointer bg-transparent border-none"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* SECCIÓN 1: PANEL DE CONTROL HORIZONTAL (FILTROS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-all duration-300">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
            {/* Proyecto */}
            <div className="space-y-2">
              <label htmlFor="project-select" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FolderKanban size={13} className="text-indigo-500" /> Seleccionar Proyecto
              </label>
              <select
                id="project-select"
                value={selectedProjId}
                onChange={(e) => setSelectedProjId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
              >
                {projects.map(p => (
                  <option key={p.id_proyecto} value={p.id_proyecto}>
                    {p.nombre} ({p.key_proyecto})
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Desde */}
            <div className="space-y-2">
              <label htmlFor="start-date-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-indigo-500" /> Fecha Inicio
              </label>
              <input
                id="start-date-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl p-2.5 text-sm text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
              />
            </div>

            {/* Fecha Hasta */}
            <div className="space-y-2">
              <label htmlFor="end-date-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-indigo-500" /> Fecha Fin
              </label>
              <input
                id="end-date-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl p-2.5 text-sm text-slate-755 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
              />
            </div>
          </div>

          {/* Botón Principal Generar */}
          <div className="shrink-0">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading || !selectedProjId}
              className="w-full xl:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-3.5 text-sm font-bold transition-all shadow-md shadow-indigo-650/15 disabled:opacity-75 cursor-pointer border-none h-11.5"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Compilando PDF...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Generar y Descargar Reporte PDF
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* SECCIÓN 2: VISTA DE DATOS A EXPORTAR (Métricas e Histórico Visual) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Contenedor Izquierdo: Resumen de KPIs a Generar (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-indigo-500" />
              Métricas Consolidadas en Reporte
            </h3>
            
            <div className="space-y-3.5">
              {/* Metrica 1 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/30 transition-colors">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Throughput (Sprint Deliveries)</span>
                <span className="text-sm font-black font-mono text-slate-850 dark:text-white">{kpis.throughput} issues</span>
              </div>
              {/* Metrica 2 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/30 transition-colors">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cycle Time Promedio</span>
                <span className="text-sm font-black font-mono text-slate-850 dark:text-white">{kpis.cycleTime} días</span>
              </div>
              {/* Metrica 3 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/30 transition-colors">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Velocity Acumulada</span>
                <span className="text-sm font-black font-mono text-slate-850 dark:text-white">{kpis.velocity} pts</span>
              </div>
            </div>

            {/* Banner de Info Legal / Seguridad */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400">
              <ShieldCheck size={18} className="shrink-0 mt-0.5 text-emerald-500" />
              <p className="text-[11px] leading-relaxed font-medium">
                Este informe contiene firma digital y hash SHA-256 de seguridad, garantizando la inmutabilidad de los logs obtenidos de Jira API.
              </p>
            </div>
          </div>
        </div>

        {/* Contenedor Derecho: Tendencias y Gráfica Visual (7/12) */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-full flex flex-col justify-between relative">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" />
                Tendencias de Rendimiento ({selectedProjName})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Pasa el cursor para más detalles</span>
            </div>

            {/* Gráfico SVG Simulado Interactivo con Tooltip Flotante */}
            <div className="flex-1 flex flex-col justify-center py-6 relative">
              
              {/* Tooltip flotante al hacer hover */}
              {activeTooltip !== null && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-lg transition-all animate-in fade-in zoom-in-95 z-20 pointer-events-none">
                  {sprintData[activeTooltip].label}: {sprintData[activeTooltip].detail}
                </div>
              )}

              <div className="h-36 flex items-end justify-between gap-5 px-4 pt-6 border-b border-slate-100 dark:border-slate-800 relative">
                {sprintData.map((sprint, idx) => (
                  <div
                    key={sprint.label}
                    onMouseEnter={() => setActiveTooltip(idx)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    style={{ height: sprint.height }}
                    className={`w-full rounded-t transition-all duration-300 cursor-pointer flex items-end justify-center pb-2 border ${
                      idx === 3
                        ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white shadow-md shadow-indigo-500/20 scale-105'
                        : 'bg-indigo-500/20 hover:bg-indigo-500/35 border-indigo-500/30 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    <span className="text-[10px] font-black font-mono tracking-wider">{sprint.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-400 text-center leading-relaxed">
              El reporte final PDF compilará estos gráficos vectorizados automáticamente de forma nativa mediante el motor ReportLab.
            </p>
          </div>
        </div>

      </div>

      {/* SECCIÓN 3: HISTORIAL DE REPORTES GENERADOS (TABLA DE AUDITORÍA CON BÚSQUEDA) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <History className="text-slate-400 shrink-0" size={18} />
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                Historial de Descargas de Reportes
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Auditoría y registro de informes generados por los integrantes del equipo.
              </p>
            </div>
          </div>

          {/* Campo de búsqueda de historial */}
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 dark:bg-slate-955 text-slate-500 dark:text-slate-450 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Nombre de Archivo</th>
                <th className="px-6 py-4">Fecha de Generación</th>
                <th className="px-6 py-4">Código Proyecto</th>
                <th className="px-6 py-4 text-right">Tamaño</th>
                <th className="px-6 py-4">Generado Por</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    {searchTerm ? `No se encontraron reportes con "${searchTerm}".` : 'No se han registrado descargas de reportes en esta sesión.'}
                  </td>
                </tr>
              ) : (
                filteredHistory.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                      {report.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-450 font-medium">
                      {report.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-indigo-50 dark:bg-indigo-550/10 px-2 py-0.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/15">
                        {report.project}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold font-mono text-slate-500 dark:text-slate-450">
                      {report.size}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {report.user}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          title="Descargar de nuevo"
                          onClick={() => {
                            // Simular la re-descarga del reporte
                            const dummyPdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\nstream\nBT /F1 24 Tf 70 700 Td (MCHAV Analytics - Reporte Ejecutivo) Tj ET\nendstream\nendobj\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n315\n%%EOF`;
                            const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = report.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            showToast(`Re-descargando "${report.name}"...`);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          title="Eliminar registro"
                          onClick={() => handleDeleteHistoryItem(report.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

