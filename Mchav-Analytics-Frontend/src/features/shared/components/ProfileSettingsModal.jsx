import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Shield, Lock, RefreshCcw, ExternalLink, CheckCircle2, Globe, Key, Link2, AlertCircle } from 'lucide-react';
import { authService } from '../../../services/api';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="w-full max-w-2xl bg-[#090F1B] border border-[#162032] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[85vh]"
      >
        
        {/* CABECERA DEL MODAL */}
        <div className="px-6 sm:px-7 py-5 border-b border-[#162032] bg-[#070D18] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-cyan-500/20 shrink-0 font-mono">
              {getUserInitials()}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white leading-tight">
                {userProfile?.nombre || 'Usuario'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">
                  {userProfile?.email || 'No registrado'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#1D263B] text-indigo-300 border border-[#2D3958]">
                  {userProfile?.rol || 'Administrador'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE DEL MODAL */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
          
          {/* PASO 1: INFORMACIÓN DE LA CUENTA */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#00B894] text-slate-950 font-black text-xs flex items-center justify-center shrink-0 font-mono">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-200">
                Información de la cuenta
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Tarjeta Nombre */}
              <div className="bg-[#070D18] border border-[#162032] rounded-2xl p-4 flex flex-col justify-between h-[104px]">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">NOMBRE</p>
                  <p className="text-sm font-bold text-white truncate mt-0.5">{userProfile?.nombre || 'Usuario'}</p>
                </div>
              </div>

              {/* Tarjeta Correo */}
              <div className="bg-[#070D18] border border-[#162032] rounded-2xl p-4 flex flex-col justify-between h-[104px]">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">CORREO</p>
                  <p className="text-sm font-bold text-white truncate mt-0.5">{userProfile?.email || 'No registrado'}</p>
                </div>
              </div>

              {/* Tarjeta Rol */}
              <div className="bg-[#070D18] border border-[#162032] rounded-2xl p-4 flex flex-col justify-between h-[104px]">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">ROL</p>
                  <p className="text-sm font-bold text-white truncate mt-0.5">{userProfile?.rol || 'Administrador'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* PASO 2: INTEGRACIÓN CON JIRA */}
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#5D5FEF] text-white font-black text-xs flex items-center justify-center shrink-0 font-mono">
                  2
                </div>
                <h3 className="text-sm font-bold text-slate-200">
                  Integración con Jira
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#131C2E] text-slate-400 border border-[#1E2B45] rounded-lg">
                  OPCIONAL
                </span>
                {isLinkedToken ? (
                  <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Vinculado
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg flex items-center gap-1.5">
                    <AlertCircle size={13} /> Pendiente
                  </span>
                )}
              </div>
            </div>

            {/* CONTENEDOR VINCULACIÓN API TOKEN */}
            <div className="bg-[#070D18] border border-[#162032] rounded-2xl p-5 space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <Link2 size={18} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Vinculación API Token</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Conecta tu cuenta de Atlassian para habilitar sincronización y reportes.
                  </p>
                </div>
              </div>

              {credentialsSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                  {credentialsSuccessMsg}
                </div>
              )}
              {credentialsErrorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 text-rose-300 text-xs font-medium border border-rose-500/30 break-words">
                  {credentialsErrorMsg}
                </div>
              )}

              {/* FORMULARIO */}
              <form id="jira-credentials-form" onSubmit={handleSaveJiraCredentials} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Globe size={13} className="text-slate-400" /> DOMINIO DE JIRA
                    </label>
                    <input
                      type="text"
                      placeholder="https://tuempresa.atlassian.net"
                      value={jiraDomainInput}
                      onChange={(e) => setJiraDomainInput(e.target.value)}
                      className="w-full bg-[#050A14] border border-[#162032] rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-teal-500 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Mail size={13} className="text-slate-400" /> CORREO DE JIRA
                    </label>
                    <input
                      type="email"
                      placeholder="usuario@empresa.com"
                      value={jiraEmailInput}
                      onChange={(e) => setJiraEmailInput(e.target.value)}
                      className="w-full bg-[#050A14] border border-[#162032] rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Key size={13} className="text-slate-400" /> API TOKEN
                    </label>
                    <a
                      href="https://id.atlassian.com/manage-profile/security/api-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#00B894] hover:underline font-semibold flex items-center gap-1 transition-colors"
                    >
                      Generar Token <ExternalLink size={12} />
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="ATATT3xFfGF0..."
                    value={jiraTokenInput}
                    onChange={(e) => setJiraTokenInput(e.target.value)}
                    className="w-full bg-[#050A14] border border-[#162032] rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-teal-500 transition-all font-mono"
                  />
                </div>
              </form>

            </div>
          </div>

        </div>

        {/* PIE DE PÁGINA FIJO CON ACCIONES */}
        <div className="px-6 sm:px-7 py-4 border-t border-[#162032] bg-[#070D18] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-[#1E2B45] bg-[#131C2E] hover:bg-[#1A263D] text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Cerrar
          </button>

          <button
            type="submit"
            form="jira-credentials-form"
            disabled={isTestingCredentials}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00B894] to-[#5D5FEF] hover:opacity-90 text-white text-xs font-black transition-all shadow-lg shadow-[#00B894]/20 cursor-pointer border-none disabled:opacity-50"
          >
            {isTestingCredentials ? (
              <>
                <RefreshCcw size={15} className="animate-spin" /> Verificando...
              </>
            ) : (
              <>
                <Lock size={15} /> Verificar y Guardar Credenciales
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

