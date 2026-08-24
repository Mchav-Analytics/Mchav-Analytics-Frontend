// ============================================================================
// FEATURE AUTH — MENÚ DE PERFIL DESPLEGABLE CON TODA LA INFORMACIÓN COMPLETA
// ============================================================================
// Conserva la estructura de menú desplegable estilo Google y la información completa
// original: Nombre Completo, Correo Electrónico, Rol Asignado, integración Jira y Cierre de Sesión.

import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, User, Mail, Shield, Lock, RefreshCcw, ExternalLink, CheckCircle2, LogOut } from 'lucide-react';
import { authService } from '../../../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfileSettingsModal({ isOpen, onClose, userProfile }) {
  const [jiraDomainInput, setJiraDomainInput] = useState('');
  const [jiraEmailInput, setJiraEmailInput] = useState('');
  const [jiraTokenInput, setJiraTokenInput] = useState('');
  const [isLinkedToken, setIsLinkedToken] = useState(false);
  const [isTestingCredentials, setIsTestingCredentials] = useState(false);
  const [credentialsSuccessMsg, setCredentialsSuccessMsg] = useState('');
  const [credentialsErrorMsg, setCredentialsErrorMsg] = useState('');

  const { logout } = useAuth(); // Hook de autenticación global para cerrar sesión
  const dropdownRef = useRef(null);

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      authService.getJiraCredentials()
        .then((data) => {
          if (data) {
            setJiraDomainInput(data.jira_domain || '');
            setJiraEmailInput(data.jira_email || userProfile?.email || '');
            setIsLinkedToken(data.api_token_vinculado);
          }
        })
        .catch(err => console.error("Error fetching Jira credentials in profile menu:", err));
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, userProfile?.email]);

  if (!shouldRender) return null;

  // Extraer el primer nombre para el saludo estilo Google ("¡Hola, Valka!")
  const firstName = userProfile?.nombre ? userProfile.nombre.trim().split(" ")[0] : "Usuario";

  // Obtener iniciales para el avatar circular
  const getUserInitials = () => {
    if (!userProfile || !userProfile.nombre) return "VH";
    const parts = userProfile.nombre.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Guardar credenciales de Jira
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

  // Cierre de sesión exclusivo de la plataforma
  const handleLogoutClick = async () => {
    onClose();
    if (userProfile && typeof userProfile.onLogout === 'function') {
      await userProfile.onLogout();
    } else {
      await logout();
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex justify-start p-0 bg-slate-900/40 backdrop-blur-[2px] ${isClosing ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'}`} onClick={onClose}>
      <div 
        className={`relative w-full max-w-sm h-full bg-white/70 dark:bg-[#18181b]/70 backdrop-blur-3xl border-r border-slate-200/50 dark:border-white/10 rounded-none sm:rounded-r-[2rem] shadow-2xl p-6 sm:p-8 space-y-4 text-left overflow-y-auto no-scrollbar ${isClosing ? 'animate-out slide-out-to-left duration-300' : 'animate-in slide-in-from-left duration-300'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Elemento Decorativo (Glow Blob) */}
        <div className="absolute top-[15%] left-0 w-[300px] h-[300px] bg-gradient-to-br from-fuchsia-500/30 via-purple-500/20 to-orange-400/20 rounded-full blur-[60px] -z-10 pointer-events-none animate-float" />
      {/* 1. BARRA SUPERIOR: CORREO DEL USUARIO Y BOTÓN DE CIERRE (X) */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
            {getUserInitials()}
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[220px]">
            {userProfile?.email || 'salamancamai12@gmail.com'}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          title="Cerrar ventana"
        >
          <X size={15} />
        </button>
      </div>

      {/* 2. ENCABEZADO CENTRAL: AVATAR GRANDE Y SALUDO GOOGLE ("¡Hola, Michael!") */}
      <div className="flex flex-col items-center text-center space-y-1.5 py-1">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-teal-500 text-white font-extrabold text-xl flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800">
            {getUserInitials()}
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-sm">
            <Camera size={11} />
          </div>
        </div>

        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          ¡Hola, {firstName}!
        </h3>
      </div>

      {/* 3. TARJETA DE INFORMACIÓN DE PERFIL COMPLETA (NOMBRE, EMAIL, ROL) */}
      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-800/60 shadow-sm">
        
        {/* Fila 1: Nombre Completo */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
              <User size={14} />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Nombre Completo
            </span>
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {userProfile?.nombre || 'Michael Salamanca'}
          </span>
        </div>

        {/* Fila 2: Correo Electrónico */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-500 shrink-0">
              <Mail size={14} />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Correo Electrónico
            </span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
            {userProfile?.email || 'salamancamai12@gmail.com'}
          </span>
        </div>

        {/* Fila 3: Rol Asignado */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
              <Shield size={14} />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Rol Asignado
            </span>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
            {userProfile?.rol === 'MANAGER' ? 'LÍDER TÉCNICO' : (userProfile?.rol || 'ADMIN')}
          </span>
        </div>

      </div>

      {/* 4. SECCIÓN DE CONFIGURACIÓN E INTEGRACIÓN JIRA COMPLETA */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock size={13} className="text-amber-500" /> Integración Directa con Jira
          </span>
          {isLinkedToken && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle2 size={11} /> Token Activo
            </span>
          )}
        </div>

        {credentialsSuccessMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{credentialsSuccessMsg}</span>
          </div>
        )}

        {credentialsErrorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium">
            {credentialsErrorMsg}
          </div>
        )}

        <form onSubmit={handleSaveJiraCredentials} className="space-y-2.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Dominio de Jira (Opcional)
            </label>
            <input
              type="text"
              placeholder="https://tu-instancia.atlassian.net"
              value={jiraDomainInput}
              onChange={(e) => setJiraDomainInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Correo de Jira (Opcional)
            </label>
            <input
              type="email"
              placeholder="usuario@empresa.com"
              value={jiraEmailInput}
              onChange={(e) => setJiraEmailInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                API Token de Jira (Opcional)
              </label>
              <a
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
              >
                Generar Token <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="password"
              placeholder="ATATT3xFfGF0..."
              value={jiraTokenInput}
              onChange={(e) => setJiraTokenInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {/* Botón de Guardar / Testear Credenciales con efecto */}
            <button
              type="submit"
              disabled={isTestingCredentials}
              className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md transform hover:-translate-y-0.5 active:scale-95 ${
                credentialsSuccessMsg
                  ? 'bg-emerald-500 text-white shadow-emerald-500/40 ring-2 ring-emerald-400 ring-offset-1 dark:ring-offset-slate-900 animate-in zoom-in'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-500/30'
              }`}
            >
              {isTestingCredentials ? (
                <>
                  <RefreshCcw size={16} className="animate-spin" />
                  Verificando...
                </>
              ) : credentialsSuccessMsg ? (
                <>
                  <CheckCircle2 size={16} className="animate-bounce" />
                  ¡Guardado y Vinculado!
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Guardar y Vincular API
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 5. ÚNICO BOTÓN DE CERRAR SESIÓN DE LA PLATAFORMA */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handleLogoutClick}
          className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold py-2.5 px-4 rounded-xl text-xs border border-rose-200 dark:border-rose-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <LogOut size={15} /> Cerrar Sesión de la Plataforma
        </button>
      </div>

      </div>
    </div>
  );
}
