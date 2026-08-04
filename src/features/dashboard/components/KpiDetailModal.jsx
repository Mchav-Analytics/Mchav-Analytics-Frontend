import React, { useState, useEffect } from 'react';
import { X, Search, Clock, CheckCircle, Calendar, Tag, ArrowRight, Layers, FileText } from 'lucide-react';
import { projectService } from '../../../services/api';

export default function KpiDetailModal({ isOpen, onClose, projectId, metricTitle, metricType, sprintId }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalIssues, setTotalIssues] = useState(0);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchDetail();
    }
  }, [isOpen, projectId, metricType, sprintId]);

  const fetchDetail = () => {
    setLoading(true);
    projectService.getKpiIssuesDetail(projectId, {
      metric_type: metricType,
      sprint_id: sprintId
    })
      .then(data => {
        setIssues(data.issues || []);
        setTotalIssues(data.total_issues || 0);
      })
      .catch(err => {
        console.error("Error fetching KPI issues detail:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!isOpen) return null;

  const filteredIssues = issues.filter(issue => 
    issue.key_issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (issue.status_actual && issue.status_actual.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    const st = (status || '').toLowerCase();
    if (st.includes('done') || st.includes('resuelto') || st.includes('cerrado') || st.includes('completado')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (st.includes('progress') || st.includes('progreso') || st.includes('desarrollo')) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    return 'bg-slate-700/40 text-slate-300 border-slate-600/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Desglose de Incidencias: <span className="text-indigo-400">{metricTitle}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Detalle y trazabilidad de los tickets considerados en el cálculo (HU-015)
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input 
              type="text"
              placeholder="Buscar por clave (ej: MCHAV-101) o título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-sm text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-300 font-medium">
              Total Incidencias: <strong className="text-white">{totalIssues}</strong>
            </span>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-400">Cargando desglose de tickets...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-white">No se encontraron incidencias</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No hay tickets registrados para los filtros seleccionados o el término de búsqueda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Clave</th>
                    <th className="py-3 px-4">Resumen / Título</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-center">Story Points</th>
                    <th className="py-3 px-4 text-center">Lead Time</th>
                    <th className="py-3 px-4 text-center">Cycle Time</th>
                    <th className="py-3 px-4">Sprint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id_jira} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-indigo-400 font-mono">
                        {issue.key_issue}
                      </td>
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                        {issue.summary}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 border rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 ${getStatusBadge(issue.status_actual)}`}>
                          {issue.status_actual}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-200">
                        {issue.story_points > 0 ? issue.story_points : '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-amber-400 font-mono">
                        {issue.lead_time_days > 0 ? `${issue.lead_time_days}d` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-cyan-400 font-mono">
                        {issue.cycle_time_days > 0 ? `${issue.cycle_time_days}d` : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-[140px]">
                        {issue.sprint_nombre}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Trazabilidad garantizada hasta la fuente original de datos de Jira.
          </p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
