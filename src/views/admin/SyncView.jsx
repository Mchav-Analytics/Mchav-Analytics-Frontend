import React from 'react';

function SyncView({ syncLogs }) {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Historial de Sincronizaciones</h1>
        <p className="page-subtitle">Logs de auditoría del proceso de extracción y carga (ETL).</p>
      </div>

      <div className="logs-container">
        {syncLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            No se han registrado ejecuciones de sincronización todavía.
          </div>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Fecha de Ejecución</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Duración</th>
                <th>Tareas Procesadas</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {syncLogs.map(log => (
                <tr key={log.id_log}>
                  <td>{new Date(log.fecha_ejecucion).toLocaleString()}</td>
                  <td>
                    <span style={{ fontWeight: '500' }}>{log.tipo_sincronizacion}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${log.resultado.toLowerCase() === 'success' ? 'success' : 'error'}`}>
                      {log.resultado}
                    </span>
                  </td>
                  <td>{log.tiempo_ejecucion_segundos} segs</td>
                  <td>
                    <strong>{log.issues_procesados}</strong> items
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                    {log.detalle_error ? log.detalle_error.substring(0, 100) + '...' : 'Sincronización exitosa.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default SyncView;
