import React from 'react';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  Activity, 
  AlertTriangle 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

function DashboardView({ 
  metrics, 
  metricsLoading, 
  metricsError, 
  syncSuccessMsg, 
  kpis, 
  selectedProjectId,
  setActiveTab 
}) {
  const sparklineData1 = [
    { value: 900 }, { value: 950 }, { value: 1100 }, { value: 1050 }, { value: 1200 }, { value: 1150 }, { value: 1248 }
  ];
  const sparklineData2 = [
    { value: 700 }, { value: 780 }, { value: 850 }, { value: 820 }, { value: 920 }, { value: 980 }, { value: 1035 }
  ];
  const sparklineData3 = [
    { value: 5.2 }, { value: 4.8 }, { value: 4.6 }, { value: 4.5 }, { value: 4.3 }, { value: 4.1 }, { value: 4.2 }
  ];
  const sparklineData4 = [
    { value: 90 }, { value: 95 }, { value: 102 }, { value: 105 }, { value: 115 }, { value: 110 }, { value: 113 }
  ];

  const evolucionData = [
    { name: '1 may', Creadas: 210, Resueltas: 160 },
    { name: '8 may', Creadas: 480, Resueltas: 380 },
    { name: '15 may', Creadas: 680, Resueltas: 520 },
    { name: '22 may', Creadas: 950, Resueltas: 780 },
    { name: '31 may', Creadas: 1248, Resueltas: 1035 }
  ];

  const cicloEstadoData = [
    { name: 'Backlog', value: 1.2, fill: '#3B82F6' },
    { name: 'En progreso', value: 2.1, fill: '#06B6D4' },
    { name: 'En revisión', value: 0.6, fill: '#8B5CF6' },
    { name: 'En pruebas', value: 0.3, fill: '#F59E0B' },
    { name: 'Hecho', value: 0.1, fill: '#10B981' }
  ];

  const tipoIncidenciaData = [
    { name: 'Historia', value: 524, fill: '#3B82F6' },
    { name: 'Bug', value: 349, fill: '#EF4444' },
    { name: 'Tarea', value: 250, fill: '#10B981' },
    { name: 'Mejora', value: 125, fill: '#F59E0B' }
  ];

  const teamData = [
    { name: 'Plataforma Web', initials: 'PW', bg: '#3B82F6', throughput: 42, tpTrend: '+16%', cycle: '3.1d', cyTrend: '-7%' },
    { name: 'Aplicaciones Móviles', initials: 'AM', bg: '#EC4899', throughput: 31, tpTrend: '+8%', cycle: '4.8d', cyTrend: '+9%' },
    { name: 'Integraciones', initials: 'IN', bg: '#10B981', throughput: 25, tpTrend: '+12%', cycle: '2.7d', cyTrend: '-5%' },
    { name: 'Infraestructura', initials: 'IF', bg: '#F59E0B', throughput: 15, tpTrend: '-4%', cycle: '6.3d', cyTrend: '+11%' }
  ];

  const blockedIssues = [
    { key: 'PROJ-126', summary: 'Error en validación de pagos', days: '8 días', color: 'red' },
    { key: 'PROJ-342', summary: 'Integración con pasarela', days: '5 días', color: 'red' },
    { key: 'PROJ-589', summary: 'Flujo de onboarding', days: '3 días', color: 'orange' }
  ];

  return (
    <>
      {metricsError && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          color: '#EF4444', 
          padding: '1rem', 
          borderRadius: '12px', 
          marginBottom: '1.5rem',
          fontSize: '0.85rem'
        }}>
          {metricsError}
        </div>
      )}

      {syncSuccessMsg && (
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.2)', 
          color: '#10B981', 
          padding: '1rem', 
          borderRadius: '12px', 
          marginBottom: '1.5rem',
          fontSize: '0.85rem'
        }}>
          {syncSuccessMsg}
        </div>
      )}

      {/* Fila de Tarjetas de KPIs Enriquecidos */}
      <div className="metrics-grid">
        {/* KPI 1 */}
        <div className="metric-card-wrapper">
          <div className="metric-card-content">
            <div className="metric-left">
              <div className="metric-badge blue">
                <ClipboardList size={18} />
              </div>
              <span className="metric-title">Incidencias creadas</span>
              <div className="metric-value" style={{ color: 'var(--text-main)', margin: '4px 0' }}>
                {metricsLoading ? "..." : (metrics.completed_tickets + metrics.in_progress_tickets + 120 || "1,248")}
              </div>
              <div className="metric-trend up">
                <span>↑ 18.5%</span> <span className="metric-trend-comparison">vs. 1 abr - 30 abr</span>
              </div>
            </div>
            <div className="metric-right">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData1}>
                  <defs>
                    <linearGradient id="sparklineGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={1.5} fill="url(#sparklineGrad1)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="metric-card-wrapper">
          <div className="metric-card-content">
            <div className="metric-left">
              <div className="metric-badge green">
                <CheckCircle size={18} />
              </div>
              <span className="metric-title">Incidencias resueltas</span>
              <div className="metric-value" style={{ color: 'var(--text-main)', margin: '4px 0' }}>
                {metricsLoading ? "..." : (metrics.completed_tickets || "1,035")}
              </div>
              <div className="metric-trend up">
                <span>↑ 12.7%</span> <span className="metric-trend-comparison">vs. 1 abr - 30 abr</span>
              </div>
            </div>
            <div className="metric-right">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData2}>
                  <defs>
                    <linearGradient id="sparklineGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={1.5} fill="url(#sparklineGrad2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="metric-card-wrapper">
          <div className="metric-card-content">
            <div className="metric-left">
              <div className="metric-badge purple">
                <Clock size={18} />
              </div>
              <span className="metric-title">Tiempo de ciclo prom.</span>
              <div className="metric-value" style={{ color: 'var(--text-main)', margin: '4px 0' }}>
                {selectedProjectId && kpis.length > 0 ? `${kpis[kpis.length - 1].cycle_time_promedio_dias} días` : "4.2 días"}
              </div>
              <div className="metric-trend down">
                <span>↓ 8.3%</span> <span className="metric-trend-comparison">vs. 1 abr - 30 abr</span>
              </div>
            </div>
            <div className="metric-right">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData3}>
                  <defs>
                    <linearGradient id="sparklineGrad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={1.5} fill="url(#sparklineGrad3)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="metric-card-wrapper">
          <div className="metric-card-content">
            <div className="metric-left">
              <div className="metric-badge yellow">
                <Activity size={18} />
              </div>
              <span className="metric-title">Throughput</span>
              <div className="metric-value" style={{ color: 'var(--text-main)', margin: '4px 0' }}>
                {selectedProjectId && kpis.length > 0 ? kpis[kpis.length - 1].throughput_issues : "113"}
              </div>
              <div className="metric-trend up">
                <span>↑ 15.2%</span> <span className="metric-trend-comparison">vs. 1 abr - 30 abr</span>
              </div>
            </div>
            <div className="metric-right">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData4}>
                  <defs>
                    <linearGradient id="sparklineGrad4" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={1.5} fill="url(#sparklineGrad4)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Rejilla Media: Gráficos de Evolución y Ciclos */}
      <div className="charts-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Grafico Evolucion de Incidencias */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="chart-title" style={{ borderLeft: 'none', paddingLeft: '0', margin: '0', fontSize: '1rem' }}>
              Evolución de incidencias <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'help' }}>ⓘ</span>
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="filter-select" style={{ minWidth: 'auto', padding: '4px 10px', fontSize: '0.8rem', borderRadius: '6px' }}>
                <option>Diario</option>
                <option>Semanal</option>
              </select>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>⋮</button>
            </div>
          </div>
          
          <div className="chart-container-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreadas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResueltas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 1500]} ticks={[0, 250, 500, 750, 1000, 1250]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area name="Creadas" type="monotone" dataKey="Creadas" stroke="#1e3a8a" fillOpacity={1} fill="url(#colorCreadas)" strokeWidth={2.5} dot={{ r: 4 }} />
                <Area name="Resueltas" type="monotone" dataKey="Resueltas" stroke="#0d9488" fillOpacity={1} fill="url(#colorResueltas)" strokeWidth={2.5} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafico Donut Tiempo de Ciclo por Estado */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="chart-title" style={{ borderLeft: 'none', paddingLeft: '0', margin: '0', fontSize: '1rem' }}>
              Tiempo de ciclo por estado <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'help' }}>ⓘ</span>
            </h3>
            <button style={{ background: 'none', border: 'none', color: '#8B5CF6', fontSize: '1.2rem', cursor: 'pointer' }}>✦</button>
          </div>
          
          <div className="donut-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cicloEstadoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cicloEstadoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center-label">
              <span className="donut-center-value">4.2</span>
              <span className="donut-center-text">días promedio</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem', fontSize: '0.8rem' }}>
            {cicloEstadoData.map(item => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.fill }}></span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{item.name}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{item.value} días</span>
              </div>
            ))}
          </div>

          <a className="widget-action-link" style={{ textAlign: 'center', justifyContent: 'center' }}>
            Ver detalle →
          </a>
        </div>
      </div>

      {/* Fila Inferior (3 Widgets Grid) */}
      <div className="widgets-grid">
        {/* Widget 1: Rendimiento por equipo */}
        <div className="widget-card">
          <div className="widget-header">
            <span className="widget-title">
              Rendimiento por equipo <span className="widget-info-icon">ⓘ</span>
            </span>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>⋮</button>
          </div>
          
          <div style={{ flex: '1' }}>
            <table className="team-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Throughput</th>
                  <th>Tiempo de ciclo</th>
                </tr>
              </thead>
              <tbody>
                {teamData.map(team => (
                  <tr key={team.name}>
                    <td>
                      <div className="team-name-cell">
                        <div className="team-badge" style={{ backgroundColor: team.bg }}>
                          {team.initials}
                        </div>
                        <span>{team.name}</span>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>{team.throughput}</strong>
                      <span style={{ color: '#10B981', fontSize: '0.7rem', marginLeft: '4px', fontWeight: '600' }}>{team.tpTrend}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>{team.cycle}</strong>
                      <span style={{ color: team.cyTrend.startsWith('-') ? '#10B981' : '#EF4444', fontSize: '0.7rem', marginLeft: '4px', fontWeight: '600' }}>
                        {team.cyTrend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <a onClick={() => setActiveTab('proyectos')} className="widget-action-link">
            Ver todos los equipos →
          </a>
        </div>

        {/* Widget 2: Distribución por tipo de incidencia */}
        <div className="widget-card">
          <div className="widget-header">
            <span className="widget-title">
              Distribución por tipo de incidencia <span className="widget-info-icon">ⓘ</span>
            </span>
          </div>

          <div className="donut-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tipoIncidenciaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {tipoIncidenciaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center-label">
              <span className="donut-center-value">1,248</span>
              <span className="donut-center-text">Total</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.75rem', marginTop: 'auto' }}>
            {tipoIncidenciaData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-dark)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.fill }}></span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{item.name}</span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>{Math.round(item.value / 12.48)}%</span>
              </div>
            ))}
          </div>

          <a className="widget-action-link" style={{ textAlign: 'center', justifyContent: 'center' }}>
            Ver detalle →
          </a>
        </div>

        {/* Widget 3: Incidencias bloqueadas */}
        <div className="widget-card">
          <div className="widget-header">
            <span className="widget-title">
              Incidencias bloqueadas <span className="widget-info-icon">ⓘ</span>
            </span>
          </div>
          
          <div className="blocked-container">
            <div className="blocked-summary-card">
              <div className="blocked-summary-left">
                <span className="blocked-summary-number">23</span>
                <span className="blocked-summary-label">incidencias</span>
              </div>
              <div className="blocked-summary-icon">
                🔒
              </div>
            </div>

            <div className="blocked-list">
              {blockedIssues.map(issue => (
                <div key={issue.key} className="blocked-item">
                  <div className="blocked-item-left">
                    <span className="blocked-item-key">{issue.key}</span>
                    <span className="blocked-item-summary">{issue.summary}</span>
                  </div>
                  <div className="blocked-item-right">
                    <span className="blocked-item-days">{issue.days}</span>
                    <span className={`blocked-dot ${issue.color}`}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <a className="widget-action-link">
            Ver detalle →
          </a>
        </div>
      </div>
    </>
  );
}

export default DashboardView;
