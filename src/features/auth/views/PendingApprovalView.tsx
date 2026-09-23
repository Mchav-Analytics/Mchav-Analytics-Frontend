import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from '../../../components/layout/Logo';
import { ShieldAlert, RefreshCw, LogOut, Clock, CheckCircle2, UserCheck } from 'lucide-react';

export default function PendingApprovalView() {
  const { user, logout, checkAuthSession } = useAuth();
  const [checking, setChecking] = useState(false);
  const [checkedMessage, setCheckedMessage] = useState<string | null>(null);

  const handleRefreshStatus = async () => {
    setChecking(true);
    setCheckedMessage(null);
    try {
      await checkAuthSession();
      setCheckedMessage('Estado verificado. Si tu rol ya fue aprobado, la página se actualizará automáticamente.');
    } catch (err) {
      setCheckedMessage('No se pudo verificar el estado en este momento.');
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-4 sm:p-8 relative overflow-hidden font-sans select-none">
      {/* Fondos ambientales de luz (Glow effects) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header con Marca */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-3">
          <Logo size={42} />
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              MCHAV <span className="text-indigo-400 font-extrabold">Analytics</span>
            </span>
            <span className="text-[11px] font-bold text-slate-400 block tracking-wider uppercase">
              Control de Calidad &amp; Flujo Jira
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          title="Cerrar Sesión"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </header>

      {/* Contenido Principal — Tarjeta Centrada */}
      <main className="w-full max-w-lg z-10 my-auto py-6">
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center space-y-6">
          {/* Acento superior de color */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500" />

          {/* Icono central de estado */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/5 relative">
            <Clock size={32} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
            </span>
          </div>

          {/* Título y Descripción */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              <ShieldAlert size={13} />
              <span>Acceso en Espera</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pendiente de Autorización
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto pt-1">
              Tu cuenta ha sido creada exitosamente. Por políticas de seguridad y control de acceso (ReBAC), un <strong className="text-slate-200">Administrador</strong> debe autorizar tu ingreso y asignarte un rol operativo antes de que puedas acceder al aplicativo.
            </p>
          </div>

          {/* Resumen del Usuario conectado */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/70 text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Usuario:</span>
              <span className="text-slate-200 font-bold">{user?.name || user?.email?.split('@')[0] || 'Nuevo Usuario'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Correo Electrónico:</span>
              <span className="text-slate-200 font-mono font-semibold text-[11px] sm:text-xs">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
              <span className="text-slate-400 font-medium">Rol Asignado:</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Usuario (Sin permisos asignados)
              </span>
            </div>
          </div>

          {/* Feedback message */}
          {checkedMessage && (
            <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs text-center flex items-center justify-center gap-2">
              <CheckCircle2 size={15} className="shrink-0 text-indigo-400" />
              <span>{checkedMessage}</span>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleRefreshStatus}
              disabled={checking}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
              <span>{checking ? 'Verificando con el servidor...' : 'Comprobar Estado de Aprobación'}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-2xl border border-slate-800 hover:bg-slate-800/70 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer informativo */}
      <footer className="w-full max-w-4xl text-center text-xs text-slate-500 z-10 py-2">
        <p>MCHAV Analytics &bull; Sistema de Gestión y Métricas de Rendimiento &copy; 2026</p>
      </footer>
    </div>
  );
}
