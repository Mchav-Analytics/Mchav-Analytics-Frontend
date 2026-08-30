import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useDevAlerts } from '../hooks/useDevAlerts';

import DevAlertsHeader from '../components/DevAlertsHeader';
import DevAlertCard from '../components/DevAlertCard';
import DevAlertsEmpty from '../components/DevAlertsEmpty';

export default function DevAlertsView({ 
  projects = [],
  selectedProjectId,
  setSelectedProjectId,
  syncSuccessMsg
}) {
  const {
    projectName,
    actionMsg,
    executingAction,
    alerts,
    handleAlertAction
  } = useDevAlerts(selectedProjectId, projects);

  return (
    <div className="w-full space-y-10 py-4 px-1 text-left font-sans min-h-[85vh] flex flex-col justify-between">
      {/* Si no hay proyecto seleccionado, mostrar prompt */}
      {!selectedProjectId ? (
        <DevAlertsEmpty />
      ) : (
        <>
          <DevAlertsHeader 
            projectName={projectName} 
            alertsCount={alerts.length} 
          />

          {/* TOAST DE RESPUESTA DE ACCIÓN API */}
          {actionMsg && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-900/30 backdrop-blur-sm border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-3 shadow-md mb-6 animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 size={18} />
              <span>{actionMsg}</span>
            </div>
          )}

          {/* LISTADO DE ALERTAS PREMIUM */}
          <div className="space-y-5 sm:space-y-6 flex-1">
            {alerts.map((alert, idx) => (
              <DevAlertCard 
                key={idx}
                alert={alert}
                executingAction={executingAction}
                handleAlertAction={handleAlertAction}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
