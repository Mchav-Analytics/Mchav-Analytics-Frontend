import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  BarChart, 
  Bar, 
  Line, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

function MetricsView({ 
  selectedProjectId, 
  setSelectedProjectId, 
  projects, 
  selectedSprintId, 
  setSelectedSprintId, 
  sprints, 
  kpis, 
  kpisLoading 
}) {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Métricas de Proyectos</h1>
        <p className="page-subtitle">Gráficos históricos avanzados calculados localmente a partir del ETL.</p>
      </div>

      {/* Filtros Dropdown */}
      <div className="filters-container">
        <div className="filter-group">
          <label className="filter-label">Proyecto</label>
          <select 
            value={selectedProjectId} 
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedSprintId('');
            }}
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

        <div className="filter-group">
          <label className="filter-label">Sprint</label>
          <select 
            value={selectedSprintId} 
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className="filter-select"
            disabled={!selectedProjectId}
          >
            <option value="">Todos los Sprints (Histórico)</option>
            {sprints.map(s => (
              <option key={s.id_sprint} value={s.id_sprint}>
                {s.nombre} ({s.estado})
              </option>
            ))}
          </select>
        </div>
      </div>

      {kpisLoading ? (
        <div style={{ padding: '4rem', color: 'var(--text-muted)', textAlign: 'center' }}>Cargando analíticas...</div>
      ) : !selectedProjectId ? (
        <div className="no-data-msg">
          Selecciona un proyecto para visualizar sus métricas avanzadas.
        </div>
      ) : kpis.length === 0 ? (
        <div className="no-data-msg">
          <AlertTriangle style={{ margin: '0 auto 1rem auto', display: 'block', color: 'var(--text-muted)' }} size={48} />
          No hay analíticas de KPIs calculadas para este proyecto en la base de datos local.
          <br />
          <span style={{ fontSize: '0.85rem' }}>Ejecuta una sincronización en el Dashboard para ingerir y calcular los KPIs.</span>
        </div>
      ) : (
        <div className="charts-grid">
          {/* Gráfico 1: Velocidad (Story Points Entregados) */}
          <div className="chart-card">
            <h3 className="chart-title">Velocidad del Sprint (Story Points)</h3>
            <div className="chart-container-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={kpis.filter(k => k.id_sprint !== null)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="sprintName" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar name="Story Points Entregados" dataKey="velocity_total_sp" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Line name="Promedio Histórico" type="monotone" dataKey="velocity_promedio_historico" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Tiempos de Entrega (Lead Time vs Cycle Time) */}
          <div className="chart-card">
            <h3 className="chart-title">Tiempos Promedio en Días (Lead vs Cycle)</h3>
            <div className="chart-container-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLead" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCycle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="sprintName" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Area name="Lead Time Promedio" type="monotone" dataKey="lead_time_promedio_dias" stroke="#EF4444" fillOpacity={1} fill="url(#colorLead)" strokeWidth={2} />
                  <Area name="Cycle Time Promedio" type="monotone" dataKey="cycle_time_promedio_dias" stroke="#F59E0B" fillOpacity={1} fill="url(#colorCycle)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 3: Throughput (Tareas Finalizadas) */}
          <div className="chart-card full-width-chart">
            <h3 className="chart-title">Rendimiento (Throughput de Tareas por Sprint)</h3>
            <div className="chart-container-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="sprintName" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar name="Tickets Completados" dataKey="throughput_issues" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MetricsView;
