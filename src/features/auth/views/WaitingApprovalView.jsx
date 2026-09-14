import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, RefreshCw, LogOut, ShieldAlert, CheckCircle2, User, Mail, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function WaitingApprovalView({ isDarkMode, setIsDarkMode }) {
  const { user, logout, checkAuthSession } = useAuth();
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleCheckStatus = async () => {
    setChecking(true);
    setFeedback(null);
    try {
      await checkAuthSession();
      setFeedback({
        type: 'info',
        message: 'Estado verificado. Si el administrador ya activó tu cuenta, ingresarás automáticamente.'
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'No fue posible verificar el estado. Inténtalo de nuevo en unos momentos.'
      });
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const userName = user?.nombre || user?.name || user?.email?.split('@')[0] || 'Usuario';
  const userEmail = user?.email || 'Sin correo asociado';
  const userAvatar = user?.picture || user?.avatarUrl;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      {/* Luces de fondo decorativas y gradientes glassmorphism */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Contenedor principal estilo Glassmorphism Card */}
      <div className="relative w-full max-w-xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-indigo-950/40 transition-all duration-300">
        
        {/* Header con Logo y Badge de Estado */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight leading-none">MCHAV Analytics</h1>
              <p className="text-xs text-slate-400 mt-0.5">Control de Gobernanza & Acceso</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Pendiente de Aprobación</span>
          </div>
        </div>

        {/* Tarjeta de Identidad del Usuario Logueado */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 sm:p-5 mb-6 flex items-center gap-4">
          <div className="relative">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xl shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 border-2 border-slate-900 rounded-full" title="Pendiente de activación" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate flex items-center gap-2">
              {userName}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{userEmail}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 border border-slate-600/50">
                Atlassian Jira OAuth
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/40">
                Rol: Desactivado
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje Informativo Central */}
        <div className="space-y-4 text-center sm:text-left mb-8">
          <div className="flex items-start gap-3 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-4 text-slate-300">
            <Clock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed text-left">
              <p className="font-semibold text-white mb-1">
                Tu cuenta ha sido vinculada correctamente.
              </p>
              <p className="text-slate-300">
                Por políticas de seguridad corporativa, un <span className="text-indigo-300 font-semibold">Administrador</span> del sistema debe autorizar tu ingreso y asignarte un perfil de trabajo (<span className="text-slate-200">Desarrollador, Líder Técnico o Administrador</span>) antes de que puedas explorar la plataforma.
              </p>
            </div>
          </div>

          {/* Pasos a seguir */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              ¿Qué debes hacer a continuación?
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 text-left">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>Notifica al Administrador (<strong className="text-indigo-300">salamancamai12@gmail.com</strong>) sobre tu nuevo registro.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>Una vez recibida la confirmación de alta, pulsa <strong>"Comprobar Estado"</strong> a continuación para ingresar de inmediato.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feedback dinámico si el usuario presiona comprobar estado */}
        {feedback && (
          <div className={`mb-6 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            feedback.type === 'error' 
              ? 'bg-rose-950/30 border-rose-800/40 text-rose-300' 
              : 'bg-indigo-950/40 border-indigo-700/50 text-indigo-200'
          }`}>
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Consultando autorización...' : 'Comprobar Estado'}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-[0.98] text-slate-300 hover:text-white font-medium text-sm border border-slate-700/70 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 text-center">
          <p className="text-[11px] text-slate-500">
            MCHAV Analytics Platform &bull; Seguridad Corporativa OAuth 2.0 (3LO) &bull; Todos los derechos reservados
          </p>
        </div>

      </div>
    </div>
  );
}
