// ============================================================================
// FEATURE AUTH — VISTA DE INICIO DE SESIÓN EMPRESARIAL 1:1 "MCHAV ANALYTICS"
// ============================================================================
// Réplica 1:1 exacta de la especificación y plantilla de referencia:
// - Formato: Desktop Widescreen 16:9 (100vw x 100vh) responsive.
// - Fondo general oscuro en tonos navy, azul petróleo y negro.
// - ZONA IZQUIERDA (58%): Logo MCHAV, título "Datos que impulsan decisiones.",
//   línea decorativa cyan->violeta, 3 íconos (Visualiza, Analiza, Decide),
//   pedestal 3D holográfico de analítica sobre escena de oficina nocturna.
// - ZONA DERECHA (38%): Tarjeta vertical de autenticación con campos de correo,
//   contraseña con eye toggle, "¿Olvidaste tu contraseña?", botón principal
//   gradient cyan->blue->violet, "o continúa con" y "Continuar con Atlassian".
// - PIE DE PÁGINA: "Seguro", "Confiable", "En tiempo real".

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../../../assets/logo.jpg';

function LoginView() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth();
  
  const [email, setEmail] = useState('usuario@empresa.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const containerRef = useRef(null);

  // Redirigir al Dashboard si ya existe una sesión activa
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Manejar el movimiento global del cursor para el efecto sutil de paralaje 3D
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { innerWidth, innerHeight } = window;
    
    const normX = ((e.clientX / innerWidth) - 0.5) * 2;
    const normY = ((e.clientY / innerHeight) - 0.5) * 2;

    containerRef.current.style.setProperty('--mouse-norm-x', normX);
    containerRef.current.style.setProperty('--mouse-norm-y', normY);
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--mouse-norm-x', 0);
      containerRef.current.style.setProperty('--mouse-norm-y', 0);
    }
  };

  // Manejar submit del formulario de inicio de sesión
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      let targetEmail = email;
      let targetRole = selectedRole;

      if (email.includes('dev')) {
        targetEmail = 'dev@mchav.com';
        targetRole = 'DEVELOPER';
      } else if (email.includes('lider') || email.includes('manager')) {
        targetEmail = 'aftorres@mchav.com';
        targetRole = 'MANAGER';
      } else if (email === 'usuario@empresa.com' || email.includes('admin')) {
        targetEmail = 'vhoyos@mchav.com';
        targetRole = 'ADMIN';
      }

      await login({ email: targetEmail, role: targetRole });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage("No se pudo iniciar sesión. Verifica las credenciales.");
      setIsSubmitting(false);
    }
  };

  // Selector rápido de rol para facilitar pruebas
  const handleQuickSelectRole = (roleKey, roleEmail) => {
    setSelectedRole(roleKey);
    setEmail(roleEmail);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="mchav-enterprise-login"
    >
      <style>{`
        .mchav-enterprise-login {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: row;
          margin: 0;
          padding: 0;
          background: #030712;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          color: #ffffff;
        }

        /* Ambient Lighting */
        .ambient-cyan {
          position: absolute;
          top: -20%;
          left: -10%;
          width: 750px;
          height: 750px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(2, 6, 23, 0) 70%);
          pointer-events: none;
        }

        .ambient-violet {
          position: absolute;
          bottom: -20%;
          right: 25%;
          width: 750px;
          height: 750px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(2, 6, 23, 0) 70%);
          pointer-events: none;
        }

        /* 3D Holographic Pedestal */
        .hologram-3d-pedestal {
          transform: perspective(900px) rotateX(24deg) rotateY(-8deg);
          transform-style: preserve-3d;
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.95);
        }

        /* Main Gradient Button Cyan -> Blue -> Violet */
        .btn-gradient-submit {
          background: linear-gradient(90deg, #00c6ff 0%, #0072ff 48%, #7c3aed 100%);
          box-shadow: 0 10px 25px -5px rgba(0, 198, 255, 0.35);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-gradient-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px -4px rgba(0, 198, 255, 0.5);
          filter: brightness(1.08);
        }

        /* Input styling */
        .login-input {
          background: rgba(15, 23, 42, 0.7);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          transition: all 0.2s ease;
        }

        .login-input:focus-within {
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.15);
        }
      `}</style>

      {/* Luces Ambientales */}
      <div className="ambient-cyan" />
      <div className="ambient-violet" />

      {/* ===================================================================
          ZONA IZQUIERDA (58% ANCHO): BRANDING, ESLOGAN Y DASHBOARD 3D
          =================================================================== */}
      <div className="hidden lg:flex flex-[1.4] h-full flex-col justify-between p-10 lg:p-14 relative overflow-hidden bg-gradient-to-br from-[#040814] via-[#070d1e] to-[#0b1228] border-r border-slate-800/70 text-left">
        
        {/* Fondo sutil de arquitectura de ventana nocturna */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.08),transparent_60%)] pointer-events-none" />
        
        {/* Arco sutil simulando ventanal de oficina nocturna */}
        <div className="absolute -right-20 top-0 bottom-0 w-96 border-l border-cyan-500/10 rounded-full pointer-events-none opacity-40" />

        {/* 1. Logo MCHAV Analytics Respetando Identidad */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-cyan-500/40 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center overflow-hidden shrink-0">
            <img src={logoImg} alt="MCHAV Analytics Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-white">MCHAV</span>
            <span className="text-xs font-bold text-cyan-400 tracking-wider">ANALYTICS</span>
          </div>
        </div>

        {/* 2. Título Principal y Conceptos */}
        <div className="space-y-6 z-10 my-auto pt-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
              Datos que <br />
              impulsan <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">decisiones.</span>
            </h1>
            
            {/* Línea decorativa fina cyan -> violeta */}
            <div className="w-20 h-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 mt-4" />
          </div>

          {/* 3. Tres Pequeños Conceptos: Visualiza, Analiza, Decide */}
          <div className="flex items-center gap-9 pt-2">
            
            {/* Concepto 1: Visualiza */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-13 h-13 rounded-full border border-cyan-500/40 bg-slate-900/90 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)] p-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
              </div>
              <span className="text-xs font-semibold text-slate-300">Visualiza</span>
            </div>

            {/* Concepto 2: Analiza */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-13 h-13 rounded-full border border-purple-500/40 bg-slate-900/90 text-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.25)] p-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <span className="text-xs font-semibold text-slate-300">Analiza</span>
            </div>

            {/* Concepto 3: Decide */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-13 h-13 rounded-full border border-indigo-500/40 bg-slate-900/90 text-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.25)] p-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/></svg>
              </div>
              <span className="text-xs font-semibold text-slate-300">Decide</span>
            </div>

          </div>

          {/* 4. Visualización 3D Holográfica de Analytics */}
          <div className="relative w-full max-w-lg h-52 pt-4">
            <div className="hologram-3d-pedestal w-full h-44 bg-slate-900/75 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 relative overflow-hidden flex items-end justify-between">
              
              {/* Cuadrícula sutil de fondo */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]" />

              {/* Gráfico de línea ascendente holográfico SVG */}
              <svg className="absolute inset-0 w-full h-full opacity-45" viewBox="0 0 300 120">
                <path d="M 0,95 Q 75,25 150,65 T 300,15" fill="none" stroke="#06b6d4" strokeWidth="3.5" />
                <path d="M 0,105 Q 75,40 150,80 T 300,30" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" />
                {/* Puntos de datos brillantes */}
                <circle cx="75" cy="40" r="4" fill="#06b6d4" />
                <circle cx="150" cy="65" r="4" fill="#a855f7" />
                <circle cx="225" cy="35" r="4" fill="#3b82f6" />
              </svg>

              {/* Barras verticales 3D Neón en graduación */}
              <div className="relative z-10 flex items-end justify-end gap-3.5 w-full h-full pr-2 pb-1">
                <div className="w-8 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-t-xl h-[45%] shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                <div className="w-8 bg-gradient-to-t from-sky-600 to-sky-300 rounded-t-xl h-[65%] shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                <div className="w-8 bg-gradient-to-t from-indigo-600 to-indigo-300 rounded-t-xl h-[85%] shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <div className="w-8 bg-gradient-to-t from-purple-600 to-purple-300 rounded-t-xl h-[70%] shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                <div className="w-8 bg-gradient-to-t from-fuchsia-600 to-fuchsia-300 rounded-t-xl h-[100%] shadow-[0_0_22px_rgba(217,70,239,0.6)]" />
              </div>
            </div>
          </div>

        </div>

        {/* 5. Parte Inferior Izquierda: Conceptos de Confianza */}
        <div className="flex items-center gap-7 text-xs text-slate-400 font-semibold z-10 pt-4 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Seguro</span>
          </div>
          <div className="h-3.5 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Confiable</span>
          </div>
          <div className="h-3.5 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
            <span>En tiempo real</span>
          </div>
        </div>

      </div>

      {/* ===================================================================
          ZONA DERECHA (38% ANCHO): TARJETA DE AUTENTICACIÓN
          =================================================================== */}
      <div className="w-full lg:w-[460px] xl:w-[500px] h-full flex flex-col items-center justify-center p-8 sm:p-12 relative bg-[#070b16] border-l border-slate-800/80 shrink-0">
        
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 text-left my-auto">
          
          {/* Isotipo MCHAV en Círculo Pequeño y Bienvenido */}
          <div className="flex flex-col items-center text-center gap-2.5">
            <div className="w-16 h-16 rounded-full bg-slate-950 p-1 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center overflow-hidden">
              <img src={logoImg} alt="MCHAV Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-tight">Bienvenido</h2>
            
            {/* Pequeña línea decorativa cyan/violeta */}
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="w-6 h-1 rounded-full bg-cyan-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </div>
          </div>

          {/* Mensaje de Error */}
          {(errorMessage || authError) && (
            <div className="w-full p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
              ⚠️ {errorMessage || authError}
            </div>
          )}

          {/* CAMPO 1: Correo electrónico */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Correo electrónico
            </label>
            <div className="login-input rounded-xl px-3.5 py-3 flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full bg-transparent text-white text-xs outline-none font-medium placeholder-slate-500"
              />
            </div>
          </div>

          {/* CAMPO 2: Contraseña con Ícono de Candado y Mostrar/Ocultar */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Contraseña
            </label>
            <div className="login-input rounded-xl px-3.5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent text-white text-xs outline-none font-medium placeholder-slate-500"
                />
              </div>
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            
            {/* Link ¿Olvidaste tu contraseña? */}
            <div className="flex justify-end pt-1">
              <button 
                type="button"
                onClick={() => alert("Contacta al Administrador del sistema MCHAV Analytics.")}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {/* BOTÓN PRINCIPAL: Iniciar Sesión (Cyan -> Blue -> Violet) */}
          <button 
            type="submit"
            disabled={isSubmitting || authLoading}
            className="btn-gradient-submit w-full h-13 rounded-2xl text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{isSubmitting ? "Autenticando..." : "Iniciar sesión"}</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* SELECCIÓN RÁPIDA DE ROL PARA DEMO / AMBIENTE SIMULADO */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selección rápida de usuario</span>
            <div className="flex items-center justify-center gap-1.5">
              <button 
                type="button"
                onClick={() => handleQuickSelectRole('ADMIN', 'vhoyos@mchav.com')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  selectedRole === 'ADMIN' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                👑 Admin
              </button>
              <button 
                type="button"
                onClick={() => handleQuickSelectRole('MANAGER', 'aftorres@mchav.com')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  selectedRole === 'MANAGER' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🛡️ Líder Técnico
              </button>
              <button 
                type="button"
                onClick={() => handleQuickSelectRole('DEVELOPER', 'dev@mchav.com')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  selectedRole === 'DEVELOPER' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                💻 Dev
              </button>
            </div>
          </div>

          {/* SEPARADOR: o continúa con */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] font-semibold text-slate-500">o continúa con</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* BOTÓN SECUNDARIO: Continuar con Atlassian */}
          <button 
            type="button"
            onClick={() => handleQuickRole('vhoyos@mchav.com', 'ADMIN')}
            disabled={isSubmitting || authLoading}
            className="btn-role-blue w-full h-13 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-3 cursor-pointer group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.571 1.99998C11.332 2.0007 11.103 2.09676 10.934 2.26698L2.267 10.934C2.09678 11.103 2.00072 11.332 2 11.571C2.00072 11.81 2.09678 12.039 2.267 12.208L10.934 20.875C11.103 21.0452 11.332 21.1413 11.571 21.142C11.81 21.1413 12.039 21.0452 12.208 20.875L20.875 12.208C21.0452 12.039 21.1413 11.81 21.142 11.571C21.1413 11.332 21.0452 11.103 20.875 10.934L12.208 2.26698C12.039 2.09676 11.81 2.0007 11.571 1.99998Z" fill="#0052CC"/>
              <path d="M11.571 1.99998V11.571L20.875 10.934C21.0452 11.103 21.1413 11.332 21.142 11.571C21.1413 11.81 20.934 12.039 20.875 12.208L12.208 20.875V11.571L11.571 1.99998Z" fill="#2684FF"/>
            </svg>
            <span>Continuar con Atlassian</span>
          </button>

        </form>

      </div>

    </div>
  );
}

export default LoginView;
