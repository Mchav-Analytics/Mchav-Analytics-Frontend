import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeveloperModals } from '../DeveloperModals';

describe('DeveloperModals Component', () => {
  const defaultProps = {
    replyModalOpen: false,
    activeReplyIssue: null,
    setReplyModalOpen: vi.fn(),
    quickReplyText: '',
    setQuickReplyText: vi.fn(),
    handleSendQuickReply: vi.fn((e) => e.preventDefault()),
    sendingQuickReply: false,
    selectedIssueModal: null,
    setSelectedIssueModal: vi.fn(),
    alertsModalOpen: false,
    setAlertsModalOpen: vi.fn(),
    alertsTab: 'request_form',
    setAlertsTab: vi.fn(),
    submittedHelpRequests: [],
    showHelpSuccessToast: false,
    handleSubmitHelpRequest: vi.fn((e) => e.preventDefault()),
    helpIssueKey: '',
    setHelpIssueKey: vi.fn(),
    assignedIssuesList: [],
    helpType: 'Bloqueo Técnico',
    setHelpType: vi.fn(),
    helpMessage: '',
    setHelpMessage: vi.fn(),
    alerts: []
  };

  it('renders reply modal when open and active issue exists', () => {
    const props = {
      ...defaultProps,
      replyModalOpen: true,
      activeReplyIssue: { key_issue: 'MCHAV-1', message: 'Need help' }
    };
    render(<DeveloperModals {...props} />);
    
    expect(screen.getByText('MCHAV-1')).toBeInTheDocument();
    expect(screen.getByText('Responder solicitud')).toBeInTheDocument();
    expect(screen.getByText('"Need help"')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escribe tu respuesta...')).toBeInTheDocument();
  });

  it('calls setQuickReplyText when typing in reply modal', () => {
    const props = {
      ...defaultProps,
      replyModalOpen: true,
      activeReplyIssue: { key_issue: 'MCHAV-1', message: 'Need help' }
    };
    render(<DeveloperModals {...props} />);
    
    const textarea = screen.getByPlaceholderText('Escribe tu respuesta...');
    fireEvent.change(textarea, { target: { value: 'This is my reply' } });
    
    expect(props.setQuickReplyText).toHaveBeenCalledWith('This is my reply');
  });

  it('submits reply form correctly', () => {
    const props = {
      ...defaultProps,
      replyModalOpen: true,
      activeReplyIssue: { key_issue: 'MCHAV-1', message: 'Need help' }
    };
    render(<DeveloperModals {...props} />);
    
    const submitButton = screen.getByText('Enviar respuesta');
    fireEvent.submit(submitButton.closest('form'));
    
    expect(props.handleSendQuickReply).toHaveBeenCalled();
  });

  it('renders issue detail modal', () => {
    const props = {
      ...defaultProps,
      selectedIssueModal: {
        key_issue: 'MCHAV-2',
        status_actual: 'IN PROGRESS',
        summary: 'Test summary',
        descripcion: 'Test description',
        prioridad: 'High',
        story_points: 5,
        cycle_time_days: 2,
        tipo: 'Bug'
      }
    };
    render(<DeveloperModals {...props} />);
    
    expect(screen.getByText('MCHAV-2')).toBeInTheDocument();
    expect(screen.getByText('Test summary')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('5 SP')).toBeInTheDocument();
    expect(screen.getByText('2 días')).toBeInTheDocument();
  });

  it('closes issue detail modal', () => {
    const props = {
      ...defaultProps,
      selectedIssueModal: {
        key_issue: 'MCHAV-2',
        status_actual: 'IN PROGRESS',
        summary: 'Test summary'
      }
    };
    render(<DeveloperModals {...props} />);
    
    const closeButton = screen.getByText('Cerrar');
    fireEvent.click(closeButton);
    
    expect(props.setSelectedIssueModal).toHaveBeenCalledWith(null);
  });

  it('renders alerts modal - request form tab', () => {
    const props = {
      ...defaultProps,
      alertsModalOpen: true,
      alertsTab: 'request_form',
      assignedIssuesList: [
        { key_issue: 'MCHAV-1', summary: 'A very very long summary that should be truncated' }
      ]
    };
    render(<DeveloperModals {...props} />);
    
    expect(screen.getByText('Centro de Alertas & Solicitar Ayuda (Dev Workspace)')).toBeInTheDocument();
    expect(screen.getByText('MCHAV-1 - A very very long summary ...')).toBeInTheDocument();
    
    const textarea = screen.getByPlaceholderText('Describe el bloqueo o duda técnica requerida...');
    fireEvent.change(textarea, { target: { value: 'Help me' } });
    expect(props.setHelpMessage).toHaveBeenCalledWith('Help me');

    const submitBtn = screen.getByText('Enviar a Líder');
    fireEvent.submit(submitBtn.closest('form'));
    expect(props.handleSubmitHelpRequest).toHaveBeenCalled();
  });

  it('renders alerts modal - sent requests tab', () => {
    const props = {
      ...defaultProps,
      alertsModalOpen: true,
      alertsTab: 'sent_requests',
      submittedHelpRequests: [
        { id: 1, issueKey: 'MCHAV-3', type: 'Bloqueo Técnico', status: 'Enviado', message: 'I need help here', date: '2026-08-30' }
      ]
    };
    render(<DeveloperModals {...props} />);
    
    expect(screen.getByText('MCHAV-3 (Bloqueo Técnico)')).toBeInTheDocument();
    expect(screen.getByText('"I need help here"')).toBeInTheDocument();
  });

  it('renders alerts modal - alerts tab with items', () => {
    const props = {
      ...defaultProps,
      alertsModalOpen: true,
      alertsTab: 'alerts',
      alerts: [
        { id: 1, description: 'Alert message 1' },
        { id: 2, title: 'Alert message 2' }
      ]
    };
    render(<DeveloperModals {...props} />);
    
    expect(screen.getByText('Alert message 1')).toBeInTheDocument();
    expect(screen.getByText('Alert message 2')).toBeInTheDocument();
  });

  it('renders alerts modal - alerts tab empty state', () => {
    const props = {
      ...defaultProps,
      alertsModalOpen: true,
      alertsTab: 'alerts',
      alerts: []
    };
    render(<DeveloperModals {...props} />);
    
    expect(screen.getByText('No hay alertas recientes.')).toBeInTheDocument();
  });

  it('shows success toast when showHelpSuccessToast is true', () => {
    const props = {
      ...defaultProps,
      alertsModalOpen: true,
      showHelpSuccessToast: true
    };
    render(<DeveloperModals {...props} />);
    
    expect(screen.getByText('✨ Solicitud enviada exitosamente al Líder Técnico.')).toBeInTheDocument();
  });
  
  it('changes alert tabs', () => {
    const props = {
      ...defaultProps,
      alertsModalOpen: true
    };
    render(<DeveloperModals {...props} />);
    
    fireEvent.click(screen.getByText('Mis Solicitudes (0)'));
    expect(props.setAlertsTab).toHaveBeenCalledWith('sent_requests');
    
    fireEvent.click(screen.getByText('Mis Alertas (0)'));
    expect(props.setAlertsTab).toHaveBeenCalledWith('alerts');
  });
});
