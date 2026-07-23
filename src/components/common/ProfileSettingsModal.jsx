import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Shield, Lock, RefreshCcw, ExternalLink, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/api';

export default function ProfileSettingsModal({ isOpen, onClose, userProfile }) {
  const [jiraDomainInput, setJiraDomainInput] = useState('');
  const [jiraEmailInput, setJiraEmailInput] = useState('');
  const [jiraTokenInput, setJiraTokenInput] = useState('');
  const [isLinkedToken, setIsLinkedToken] = useState(false);
  const [isTestingCredentials, setIsTestingCredentials] = useState(false);
  const [credentialsSuccessMsg, setCredentialsSuccessMsg] = useState('');
  const [credentialsErrorMsg, setCredentialsErrorMsg] = useState('');

  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      authService.getJiraCredentials()
        .then((data) => {
          if (data) {
            setJiraDomainInput(data.jira_domain || '');
            setJiraEmailInput(data.jira_email || userProfile?.email || '');
            setIsLinkedToken(data.api_token_vinculado);
          }
        })
        .catch(err => console.error("Error fetching Jira credentials in modal:", err));
    }
  }, [isOpen, userProfile]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getUserInitials = () => {
    if (!userProfile || !userProfile.nombre) return "AD";
    const parts = userProfile.nombre.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const handleSaveJiraCredentials = (e) => {
    e.preventDefault();
    setIsTestingCredentials(true);
    setCredentialsErrorMsg('');
    setCredentialsSuccessMsg('');

    authService.saveJiraCredentials({
      jira_domain: jiraDomainInput,
      jira_email: jiraEmailInput,
      jira_api_token: jiraTokenInput
    })
      .then(() => {
        setIsTestingCredentials(false);
        setIsLinkedToken(true);
        setJiraTokenInput('');
        setCredentialsSuccessMsg("¡Credenciales de Jira verificadas y vinculadas con éxito!");
        setTimeout(() => setCredentialsSuccessMsg(''), 5000);
      })
      .catch((err) => {
        setIsTestingCredentials(false);
        const msg = err.response?.data?.detail || "No se pudieron verificar las credenciales con Jira.";
        setCredentialsErrorMsg(msg);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        ref={modalRef}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-left"
      >
        {/* Cabecera del Modal */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-900 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {getUserInitials()}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Perfil de Usuario
              </h2>
              <p className="text-xs text-slate-400">
                Configuración de cuenta y credenciales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Información del Perfil */}
          <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-indigo-500" /> Nombre Completo
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {userProfile?.nombre || 'Usuario'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={13} className="text-teal-500" /> Correo Electrónico
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {userProfile?.email || 'No registrado'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={13} className="text-amber-500" /> Rol asignado
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                {userProfile?.rol || 'Administrador'}
              </span>
            </div>
          </div>

          {/* Formulario Vinculación API Token (Opcional) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="text-indigo-600 dark:text-indigo-400" size={18} />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Vinculación API Token
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  Opcional
                </span>
                {isLinkedToken ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Vinculado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-200">
                    Pendiente
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveJiraCredentials} className="space-y-4">
              {credentialsSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                  {credentialsSuccessMsg}
                </div>
              )}
              {credentialsErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200 break-words">
                  {credentialsErrorMsg}
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Dominio de Jira (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="https://tuempresa.atlassian.net"
                  value={jiraDomainInput}
                  onChange={(e) => setJiraDomainInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Correo de Jira (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={jiraEmailInput}
                  onChange={(e) => setJiraEmailInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    API Token de Jira (Opcional)
                  </label>
                  <a
                    href="https://id.atlassian.com/manage-profile/security/api-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                  >
                    Generar Token <ExternalLink size={10} />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="ATATT3xFfGF0..."
                  value={jiraTokenInput}
                  onChange={(e) => setJiraTokenInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={isTestingCredentials}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTestingCredentials ? (
                  <>
                    <RefreshCcw size={14} className="animate-spin" /> Verificando...
                  </>
                ) : (
                  'Verificar y Guardar Credenciales'
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
