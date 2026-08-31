import { useState, useEffect } from 'react';
import { developerService } from '../../../services/api';
import { useAuth } from '../../../features/auth/context/AuthContext';

export function useDevAlerts(selectedProjectId, projects) {
  const { user } = useAuth();
  const [alertsData, setAlertsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [executingAction, setExecutingAction] = useState(false);

  const devName = user?.nombre || 'Valka Hoyos';
  const selectedProjectObj = projects.find(p => String(p.id_proyecto) === String(selectedProjectId));
  const projectName = selectedProjectObj?.nombre || `Proyecto ${selectedProjectId}`;

  useEffect(() => {
    if (!selectedProjectId) {
      setAlertsData(null);
      return;
    }
    setLoading(true);
    developerService.getDevAlerts(selectedProjectId)
      .then(res => {
        setAlertsData(res);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Error cargando alertas:", err);
        setLoading(false);
      });
  }, [selectedProjectId]);

  const handleAlertAction = (issueId, actionType) => {
    setExecutingAction(true);
    developerService.performAlertAction(issueId, actionType)
      .then(res => {
        setActionMsg(`✅ ${res.message || "Acción registrada correctamente."}`);
        setExecutingAction(false);
        setTimeout(() => setActionMsg(''), 5000);
      })
      .catch(err => {
        setActionMsg(`⚠️ Error al ejecutar la acción para el ticket #${issueId}`);
        setExecutingAction(false);
      });
  };

  const defaultAlerts = [
    { id: "alert-101", issue_id: "101", key_issue: "MCHAV-101", type: "INACTIVITY", level: "CRITICAL", title: "Inactividad: Tarea sin cambios por más de 48 horas", description: "Tu ticket MCHAV-101 (SSO OAuth 2.0) lleva 3.2 días en 'In Progress' sin registrar avances ni notas." },
    { id: "alert-wip", type: "WIP_EXCEEDED", level: "WARNING", title: "Advertencia de Multitarea Excesiva (WIP = 7 Tareas)", description: "Tienes 7 tareas abiertas en progreso. Mantener más de 3 tareas abiertas ralentiza el tiempo de ciclo." }
  ];

  const alerts = alertsData?.alerts || defaultAlerts;

  return {
    devName,
    projectName,
    loading,
    actionMsg,
    executingAction,
    alerts,
    handleAlertAction
  };
}
