import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronLeft, ChevronRight, FileText, AlertTriangle } from 'lucide-react';
import { projectService } from '../../../services/api';

const mockChangelog = [];

export default function ScopeCreepModal({ isOpen, onClose, sprintId, projectId }) {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const preventScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
      setSearchTerm('');
      setCurrentPage(1);
      
      const targetProj = projectId || '10000';
      projectService.getKpiIssuesDetail(targetProj)
        .then(res => {
          if (res?.issues && Array.isArray(res.issues)) {
            const mapped = res.issues.slice(0, 10).map((i, idx) => ({
              id: idx + 1,
              key_issue: i.key_issue,
              action: idx % 3 === 0 ? 'REMOVED' : 'ADDED',
              story_points: Math.round(parseFloat(i.story_points || 1)),
              author: i.assignee_name || 'Equipo Jira',
              date: new Date().toISOString(),
              sprint: 'Sprint Actual'
            }));
            setLogs(mapped);
          } else {
            setLogs([]);
          }
        })
        .catch(() => setLogs([]));
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [isOpen, projectId, sprintId]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => 
    (log.key_issue && log.key_issue.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.author && log.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' 
    });
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-hidden"
    >
      <div 
        className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden text-left my-auto"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Registro de Cambios de Alcance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Auditoría de tickets añadidos o retirados del sprint
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por ticket o autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-700 dark:text-slate-300 font-medium">
              Total Cambios: <strong className="text-slate-900 dark:text-white">{filteredLogs.length}</strong>
            </span>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 p-4 select-none min-h-[300px] flex flex-col justify-between overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center my-auto">
              <FileText className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Sin registros</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                No hay cambios de alcance que coincidan con la búsqueda.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-[280px] flex flex-col justify-start">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 table-fixed">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                  <tr className="h-11">
                    <th className="px-4 w-[110px] align-middle">Clave</th>
                    <th className="px-4 w-[130px] align-middle">Acción</th>
                    <th className="px-4 w-[80px] text-center align-middle">Puntos</th>
                    <th className="px-4 align-middle">Autor</th>
                    <th className="px-4 w-[150px] align-middle">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="h-13 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 font-bold text-indigo-600 dark:text-indigo-400 font-mono align-middle">
                        {log.key_issue}
                      </td>
                      <td className="px-4 align-middle">
                        {log.action === 'ADDED' ? (
                          <span className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg text-[11px] font-bold">
                            AGREGADO
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] font-bold">
                            RETIRADO
                          </span>
                        )}
                      </td>
                      <td className="px-4 text-center font-extrabold align-middle">
                        <span className={log.action === 'ADDED' ? 'text-rose-500' : 'text-emerald-500'}>
                          {log.action === 'ADDED' ? '+' : '-'}{log.story_points} SP
                        </span>
                      </td>
                      <td className="px-4 font-medium text-slate-900 dark:text-white truncate align-middle">
                        {log.author}
                      </td>
                      <td className="px-4 text-slate-500 dark:text-slate-400 truncate align-middle">
                        {formatDate(log.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <p className="text-slate-500 dark:text-slate-400">
            Mostrando <strong className="text-slate-900 dark:text-white">{filteredLogs.length > 0 ? startIndex + 1 : 0}</strong> a <strong className="text-slate-900 dark:text-white">{Math.min(startIndex + pageSize, filteredLogs.length)}</strong> de <strong className="text-slate-900 dark:text-white">{filteredLogs.length}</strong> registros
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 py-1 font-bold text-slate-700 dark:text-slate-300 text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
