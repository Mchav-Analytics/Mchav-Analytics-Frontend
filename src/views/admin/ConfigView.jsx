import React from 'react';
import { Settings } from 'lucide-react';

function ConfigView({ 
  selectedProjectId, 
  setSelectedProjectId, 
  projects, 
  configLoading, 
  projectStatuses, 
  configSuccessMsg, 
  statusMappings, 
  handleMappingChange, 
  handleSaveMappings 
}) {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Configuración de Flujo</h1>
        <p className="page-subtitle">Mapea los estados personalizados de Jira a estados estándar para refinar el cálculo de Cycle Time.</p>
      </div>

      {/* Selector de Proyecto */}
      <div className="filters-container" style={{ marginBottom: '2rem' }}>
        <div className="filter-group">
          <label className="filter-label">Proyecto</label>
          <select 
            value={selectedProjectId} 
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="filter-select"
          >
            <option value="">Selecciona un proyecto...</option>
            {projects.map(p => (
              <option key={p.id_proyecto} value={p.id_proyecto}>
                {p.nombre} ({p.key_proyecto})
              </option>
            ))}
          </select>
        </div>
      </div>

      {configLoading ? (
        <div style={{ padding: '4rem', color: 'var(--text-muted)', textAlign: 'center' }}>Cargando flujos de trabajo...</div>
      ) : !selectedProjectId ? (
        <div className="no-data-msg">
          Selecciona un proyecto para configurar sus mapeos de estado.
        </div>
      ) : projectStatuses.length === 0 ? (
        <div className="no-data-msg">
          No se detectaron issues ni estados para este proyecto. Intenta sincronizar el proyecto primero.
        </div>
      ) : (
        <div className="logs-container">
          {configSuccessMsg && (
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.15)', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              color: '#34D399', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '1.5rem' 
            }}>
              {configSuccessMsg}
            </div>
          )}

          <table className="logs-table">
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Estado en Jira</th>
                <th style={{ width: '50%' }}>Fase Equivalente en MCHAV</th>
              </tr>
            </thead>
            <tbody>
              {projectStatuses.map(status => (
                <tr key={status}>
                  <td style={{ fontWeight: '600' }}>{status}</td>
                  <td>
                    <select
                      value={statusMappings[status] || ''}
                      onChange={(e) => handleMappingChange(status, e.target.value)}
                      className="filter-select"
                      style={{ width: '100%', minWidth: 'auto' }}
                    >
                      <option value="">-- Sin Mapear (Ignorado) --</option>
                      <option value="TO_DO">To Do (Por Hacer)</option>
                      <option value="IN_PROGRESS">In Progress (En Progreso)</option>
                      <option value="IN_REVIEW">In Review (En Revisión)</option>
                      <option value="DONE">Done (Finalizado)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSaveMappings}
              disabled={configLoading}
              className="sync-btn"
            >
              <Settings size={16} />
              Guardar Mapeo de Flujo
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ConfigView;
