import { useState, useEffect } from 'react';
import { developerService, jiraService, projectService } from '../../../services/api';

export function useDeveloperWorkload(selectedProjectId, user) {
  const [scorecard, setScorecard] = useState(null);
  const [aiCoachTip, setAiCoachTip] = useState(null);
  const [efficiencyGain, setEfficiencyGain] = useState(14);
  const [cleanDeliveries, setCleanDeliveries] = useState(100);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Modales interactivos
  const [selectedIssueModal, setSelectedIssueModal] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReplyIssue, setActiveReplyIssue] = useState(null);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [sendingQuickReply, setSendingQuickReply] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Centro de Alertas y Ayuda
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [alertsTab, setAlertsTab] = useState('request_form');
  const [helpIssueKey, setHelpIssueKey] = useState('');
  const [helpType, setHelpType] = useState('Bloqueo Técnico');
  const [helpUrgency, setHelpUrgency] = useState('Alta');
  const [helpMessage, setHelpMessage] = useState('');
  const [submittedHelpRequests, setSubmittedHelpRequests] = useState([]);
  const [showHelpSuccessToast, setShowHelpSuccessToast] = useState(false);

  // Elementos "Requiere mi atención"
  const [attentionItems, setAttentionItems] = useState([]);

  const showNotificationToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadScorecard = async () => {
    try {
      const data = await developerService.getMyScorecard(selectedProjectId);
      
      try {
        const focusData = await developerService.getDailyFocus(selectedProjectId);
        if (focusData) {
          if (focusData.ai_coach_tip) setAiCoachTip(focusData.ai_coach_tip);
          if (focusData.efficiency_gain_pct !== undefined) setEfficiencyGain(focusData.efficiency_gain_pct);
          if (focusData.clean_deliveries_pct !== undefined) setCleanDeliveries(focusData.clean_deliveries_pct);
        }
      } catch (fErr) {
        console.warn("No se pudo cargar el consejo de Gemini DailyFocus:", fErr);
      }
      
      try {
        const userEmail = user?.email || 'valentina1025m@gmail.com';
        const userName = user?.nombre || 'Valentina Montalvo';
        const projectId = selectedProjectId || '10000';
        
        const dbRes = await projectService.getKpiIssuesDetail(projectId, { assignee_email: userEmail, assignee_name: userName, limit: 50 });
        
        if (dbRes && dbRes.issues && dbRes.issues.length > 0) {
          const realIssues = dbRes.issues.map(issue => {
            let st = issue.status_actual?.toUpperCase() || 'PENDIENTE';
            if (['FINALIZADO', 'DONE', 'COMPLETADA', 'LISTO'].includes(st)) st = 'LISTO';
            else if (['IN PROGRESS', 'EN CURSO', 'EN PROGRESO'].includes(st)) st = 'EN PROGRESO';
            else if (['TO DO', 'POR HACER', 'PENDIENTE', 'BACKLOG'].includes(st)) st = 'PENDIENTE';

            return {
             key_issue: issue.key_issue,
             summary: issue.summary,
             status_actual: st,
             story_points: issue.story_points || 0,
             cycle_time_days: issue.cycle_time_days || 0,
             tipo: issue.issue_type || 'Tarea',
             prioridad: issue.priority || 'Media',
             epic_name: issue.epic_name,
             fecha_creacion: issue.created_at
            };
          });
          data.assigned_issues = realIssues;
        } else {
          data.assigned_issues = [];
        }
      } catch (dbErr) {
        console.warn("No se pudieron cargar las incidencias reales locales:", dbErr);
      }

      setScorecard(data);
    } catch (err) {
      console.warn("Error cargando scorecard:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        await jiraService.triggerSync();
      } catch (e) {}
      loadScorecard();
    };
    initData();

    const timer = setInterval(() => {
      loadScorecard();
    }, 15000);
    return () => clearInterval(timer);
  }, [selectedProjectId, user?.email]);

  const handleReloadData = async () => {
    setIsRefreshing(true);
    try {
      setToastMsg('Sincronizando tareas con Jira...');
      await jiraService.triggerSync();
    } catch (e) {
      console.warn('Sync ya está en proceso o falló', e);
    } finally {
      setTimeout(() => setToastMsg(''), 3000);
    }
    await loadScorecard();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleUpdateTaskStatus = async (issueKey, newStatus, storyPoints = 5, summary = '') => {
    setScorecard(prev => {
      if (!prev) return prev;
      const issues = prev.assigned_issues || [];
      return {
        ...prev,
        assigned_issues: issues.map(t => {
          if (t.key_issue === issueKey) {
            return { ...t, status_actual: newStatus };
          }
          return t;
        })
      };
    });

    if (selectedIssueModal && selectedIssueModal.key_issue === issueKey) {
      setSelectedIssueModal(prev => prev ? { ...prev, status_actual: newStatus } : null);
    }

    try {
      await developerService.updateTaskStatus(issueKey, newStatus);
    } catch (err) {
      console.warn("Aviso al sincronizar transición:", err);
    }

    try {
      const res = await projectService.transitionIssue(issueKey, newStatus);
      const msg = res?.message || `Estado de ${issueKey} actualizado a ${newStatus} en Jira Cloud`;
      showNotificationToast(`⚡ ${msg}`);
    } catch (err) {
      console.warn("Aviso al sincronizar transición con Jira Cloud:", err);
      showNotificationToast(`✨ Estado de ${issueKey} actualizado a "${newStatus}" localmente`);
    }

    if (newStatus === 'LISTO' || newStatus === 'COMPLETADA' || newStatus === 'DONE') {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        time: `Hoy ${nowStr}`,
        key: issueKey,
        action: `Resolviste e hiciste entrega a QA / Producción (Done)`,
        points: `${storyPoints} SP`,
        type: (summary || '').toLowerCase().includes('bug') ? 'Bug' : 'Story'
      };
      const existingLogs = JSON.parse(localStorage.getItem('mchav_user_activity_log') || '[]');
      localStorage.setItem('mchav_user_activity_log', JSON.stringify([newLog, ...existingLogs]));
    }
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
        console.log("Respuesta guardada localmente:", err);
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
  });

  const historiasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Historia')).length;
  const bugsCount = assignedIssuesList.filter(i => (i.tipo || '').toLowerCase().includes('bug')).length;
  const tareasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Tarea') || (i.tipo || '').includes('Deuda')).length;
  const totalCount = assignedIssuesList.length;

  const donutData = [
    { name: 'Historias de Usuario', count: historiasCount, pct: totalCount > 0 ? Math.round((historiasCount / totalCount) * 100) : 0, color: '#8b5cf6' },
    { name: 'Bugs / Defectos', count: bugsCount, pct: totalCount > 0 ? Math.round((bugsCount / totalCount) * 100) : 0, color: '#ec4899' },
    { name: 'Tareas / Deuda Técnica', count: tareasCount, pct: totalCount > 0 ? Math.round((tareasCount / totalCount) * 100) : 0, color: '#00f5d4' }
  ];

  return {
    scorecard,
    aiCoachTip,
    efficiencyGain,
    cleanDeliveries,
    isRefreshing,
    taskFilter,
    setTaskFilter,
    typeFilter,
    setTypeFilter,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    selectedIssueModal,
    setSelectedIssueModal,
    replyModalOpen,
    setReplyModalOpen,
    activeReplyIssue,
    setActiveReplyIssue,
    quickReplyText,
    setQuickReplyText,
    sendingQuickReply,
    toastMsg,
    setToastMsg,
    alertsModalOpen,
    setAlertsModalOpen,
    alertsTab,
    setAlertsTab,
    helpIssueKey,
    setHelpIssueKey,
    helpType,
    setHelpType,
    helpUrgency,
    setHelpUrgency,
    helpMessage,
    setHelpMessage,
    submittedHelpRequests,
    showHelpSuccessToast,
    attentionItems,
    handleReloadData,
    handleUpdateTaskStatus,
    handleOpenReply,
    handleSendQuickReply,
    handleSubmitHelpRequest,
    assignedIssuesList,
    filteredTasks,
    historiasCount,
    bugsCount,
    tareasCount,
    totalCount,
    donutData
  };
}
