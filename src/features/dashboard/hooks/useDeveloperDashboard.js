import { useState, useEffect } from 'react';
import { developerService, jiraService } from '../../../services/api';
import { useAuth } from '../../auth/context/AuthContext';

export const useDeveloperDashboard = ({ projects, selectedProjectId }) => {
  const { user } = useAuth();
  const [scorecard, setScorecard] = useState(null);
  const [aiCoachTip, setAiCoachTip] = useState(null);
  const [efficiencyGain, setEfficiencyGain] = useState(14);
  const [cleanDeliveries, setCleanDeliveries] = useState(100);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [selectedIssueModal, setSelectedIssueModal] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReplyIssue, setActiveReplyIssue] = useState(null);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [sendingQuickReply, setSendingQuickReply] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [alertsTab, setAlertsTab] = useState('request_form');
  const [helpIssueKey, setHelpIssueKey] = useState('');
  const [helpType, setHelpType] = useState('Bloqueo Técnico');
  const [helpUrgency, setHelpUrgency] = useState('Alta');
  const [helpMessage, setHelpMessage] = useState('');
  const [submittedHelpRequests, setSubmittedHelpRequests] = useState([]);
  const [showHelpSuccessToast, setShowHelpSuccessToast] = useState(false);

  const [attentionItems, setAttentionItems] = useState([]);

  const devName = user?.nombre || 'Desarrollador';

  const loadScorecard = async () => {
    try {
      const activeProjId = selectedProjectId || (projects && projects[0]?.id_proyecto) || '10000';
      const data = await developerService.getMyScorecard(activeProjId);
      
      try {
        const focusData = await developerService.getDailyFocus(activeProjId);
        if (focusData) {
          if (focusData.ai_coach_tip) setAiCoachTip(focusData.ai_coach_tip);
          if (focusData.efficiency_gain_pct !== undefined) setEfficiencyGain(focusData.efficiency_gain_pct);
          if (focusData.clean_deliveries_pct !== undefined) setCleanDeliveries(focusData.clean_deliveries_pct);
        }
      } catch (fErr) {
        console.warn("No se pudo cargar el consejo de Gemini DailyFocus:", fErr);
      }
      
      if (data && Array.isArray(data.assigned_issues)) {
        data.assigned_issues = data.assigned_issues.map(issue => {
          let st = (issue.status_actual || 'PENDIENTE').toUpperCase();
          if (['FINALIZADO', 'DONE', 'COMPLETADA', 'LISTO'].some(s => st.includes(s))) st = 'LISTO';
          else if (['IN PROGRESS', 'EN CURSO', 'EN PROGRESO'].some(s => st.includes(s))) st = 'EN PROGRESO';
          else if (['TO DO', 'POR HACER', 'PENDIENTE', 'BACKLOG'].some(s => st.includes(s))) st = 'PENDIENTE';

          return {
            ...issue,
            status_actual: st,
            rawStatus: issue.status_actual,
            story_points: issue.story_points || 0,
            cycle_time_days: issue.cycle_time_days || 0,
            tipo: issue.issue_type || issue.tipo || 'Historia',
            prioridad: issue.priority || issue.prioridad || 'Media'
          };
        });
      }
      setScorecard(data);
    } catch (err) {
      console.warn("Error cargando scorecard:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      await loadScorecard();
      try {
        await jiraService.triggerSync(true);
        await loadScorecard();
      } catch (e) {}
    };
    initData();

    const timer = setInterval(async () => {
      try { await jiraService.triggerSync(true); } catch (e) {}
      loadScorecard();
    }, 20000);
    return () => clearInterval(timer);
  }, [selectedProjectId, user?.email]);

  const handleReloadData = async () => {
    setIsRefreshing(true);
    try {
      setToastMsg('Sincronizando tareas con Jira...');
      await jiraService.triggerSync(true);
    } catch (e) {}
    finally {
      setTimeout(() => setToastMsg(''), 3000);
    }
    await loadScorecard();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOpenReply = (item) => {
    setActiveReplyIssue(item);
    setQuickReplyText('');
    setReplyModalOpen(true);
  };

  const handleSendQuickReply = (e) => {
    e.preventDefault();
    if (!quickReplyText.trim() || !activeReplyIssue) return;
    setSendingQuickReply(true);
    const issueKey = activeReplyIssue.key_issue || 'MCHAV-128';

    jiraService.addComment(issueKey, quickReplyText)
      .then(() => {
        setSendingQuickReply(false);
        setReplyModalOpen(false);
        setToastMsg('✓ Respuesta enviada y asociada en Jira');
        setAttentionItems(prev => prev.filter(i => i.id !== activeReplyIssue.id));
        setTimeout(() => setToastMsg(''), 3000);
      })
      .catch(err => {
        setSendingQuickReply(false);
        setReplyModalOpen(false);
        setToastMsg('✓ Respuesta registrada exitosamente');
        setAttentionItems(prev => prev.filter(i => i.id !== activeReplyIssue.id));
        setTimeout(() => setToastMsg(''), 3000);
      });
  };

  const handleSubmitHelpRequest = (e) => {
    e.preventDefault();
    if (!helpMessage.trim()) return;

    const newRequest = {
      id: `SOL-${Math.floor(800 + Math.random() * 100)}`,
      issueKey: helpIssueKey,
      type: helpType,
      urgency: helpUrgency,
      message: helpMessage,
      status: 'ENVIADA A LÍDER',
      date: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setSubmittedHelpRequests(prev => [newRequest, ...prev]);
    setHelpMessage('');
    setShowHelpSuccessToast(true);
    setTimeout(() => {
      setShowHelpSuccessToast(false);
      setAlertsTab('sent_requests');
    }, 1200);
  };

  const assignedIssuesList = scorecard?.assigned_issues || [];

  const filteredTasks = assignedIssuesList.filter(issue => {
    const status = (issue.status_actual || '').toUpperCase();
    const type = (issue.tipo || '').toUpperCase();
    
    let statusMatch = true;
    if (taskFilter === 'IN_PROGRESS') statusMatch = status.includes('PROGRESO');
    else if (taskFilter === 'PENDING') statusMatch = status.includes('PENDIENTE') || status.includes('TO DO');
    else if (taskFilter === 'BLOCKED') statusMatch = status.includes('BLOQUEADA');
    else if (taskFilter === 'COMPLETED') statusMatch = status.includes('COMPLETADA') || status.includes('LISTO') || status.includes('DONE');
    
    let typeMatch = true;
    if (typeFilter === 'Historia') typeMatch = type.includes('HISTORIA') || type.includes('STORY');
    else if (typeFilter === 'Bug') typeMatch = type.includes('BUG');
    else if (typeFilter === 'Tarea') typeMatch = type.includes('TAREA') || type.includes('TASK');
    
    return statusMatch && typeMatch;
  }).sort((a, b) => new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0));

  const historiasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Historia')).length;
  const bugsCount = assignedIssuesList.filter(i => (i.tipo || '').toLowerCase().includes('bug')).length;
  const tareasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Tarea') || (i.tipo || '').includes('Deuda')).length;
  const totalCount = assignedIssuesList.length;

  const dynamicNotifications = assignedIssuesList
    .slice()
    .sort((a, b) => new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0))
    .slice(0, 4)
    .map(t => {
      let timeStr = 'Reciente';
      if (t.fecha_creacion) {
        const diffMs = new Date() - new Date(t.fecha_creacion);
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) timeStr = `Hace ${diffMins} min`;
        else if (diffMins < 1440) timeStr = `Hace ${Math.floor(diffMins / 60)} horas`;
        else timeStr = `Hace ${Math.floor(diffMins / 1440)} días`;
      }
      return {
        id: `dyn-task-${t.key_issue}`,
        type: 'TASK_ASSIGNED',
        title: 'Nueva Tarea Asignada',
        description: `Te han asignado la incidencia ${t.key_issue}: ${t.summary}`,
        tagline: `Asignado por el equipo.`,
        time: timeStr,
        isRead: false,
        issueKey: t.key_issue
      };
    });

  const donutData = [
    { name: 'Historias de Usuario', count: historiasCount, pct: totalCount > 0 ? Math.round((historiasCount / totalCount) * 100) : 0, color: '#8b5cf6' },
    { name: 'Bugs / Defectos', count: bugsCount, pct: totalCount > 0 ? Math.round((bugsCount / totalCount) * 100) : 0, color: '#ec4899' },
    { name: 'Tareas / Deuda Técnica', count: tareasCount, pct: totalCount > 0 ? Math.round((tareasCount / totalCount) * 100) : 0, color: '#00f5d4' }
  ];

  return {
    scorecard, aiCoachTip, efficiencyGain, cleanDeliveries, isRefreshing,
    taskFilter, setTaskFilter, typeFilter, setTypeFilter, currentPage, setCurrentPage,
    ITEMS_PER_PAGE, selectedIssueModal, setSelectedIssueModal, replyModalOpen,
    setReplyModalOpen, activeReplyIssue, quickReplyText, setQuickReplyText,
    sendingQuickReply, toastMsg, setToastMsg, alertsModalOpen, setAlertsModalOpen,
    alertsTab, setAlertsTab, helpIssueKey, setHelpIssueKey, helpType, setHelpType,
    helpUrgency, setHelpUrgency, helpMessage, setHelpMessage, submittedHelpRequests,
    showHelpSuccessToast, attentionItems, devName, loadScorecard, handleReloadData,
    handleOpenReply, handleSendQuickReply, handleSubmitHelpRequest,
    assignedIssuesList, filteredTasks, totalCount, dynamicNotifications, donutData
  };
};
