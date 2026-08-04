// ============================================================================
// FEATURE AUTH — VISTA DE INICIO DE SESIÓN EMPRESARIAL SAAS (TARJETA COMPACTA 380PX)
// ============================================================================
// Réplica visual exacta de la tarjeta empresarial SaaS sobre el fondo existente:
// - Dimensión: Width 380px, min-height 600px, padding 32px, border-radius 20px.
// - Fondo: #0B1220 con ligera transparencia y glassmorphism discreto.
// - Jerarquía: Logo 3D -> Bienvenido -> Separador Cian/Azul/Morado -> Campos Email/Pass ->
//   Botón Iniciar Sesión -> Separador -> Botón Atlassian -> Botones de Acceso por Rol.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoOfficialImg from '../../../assets/mchav_official_logo.png';
import loginBgImg from '../../../assets/login_bg.jpg';

function LoginView() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const containerRef = useRef(null);
  const cardRef = useRef(null);

  // Redirigir al Dashboard si ya existe una sesión activa
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Paralaje 3D discreto
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

  // Iniciar sesión con credenciales directas
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await login({ email: email || 'dev@mchav.com', role: 'DEVELOPER' });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage("No se pudo iniciar sesión. Verifica tus credenciales.");
      setIsSubmitting(false);
    }
  };

  // Iniciar sesión rápida con un rol específico
  const handleRoleLogin = async (targetEmail, targetRole) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await login({ email: targetEmail, role: targetRole });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage("No se pudo iniciar sesión. Inténtalo nuevamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="login-view-container"
    >
      <style>{`
        .login-view-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: url(${loginBgImg});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #ffffff;
        }

        .bg-overlay-tint {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 75% 50%, rgba(3, 7, 18, 0.45) 0%, rgba(3, 7, 18, 0.8) 100%);
          pointer-events: none;
          z-index: 1;
        }

        .login-main-frame {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1280px;
          height: calc(100vh - 4rem);
          max-height: 750px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
        }

        /* TARJETA COMPACTA SAAS EMPRESARIAL (380px) */
        .auth-card-saas {
          width: 100%;
          max-width: 380px;
          min-height: 600px;
          background: rgba(11, 18, 32, 0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(6, 182, 212, 0.22);
          border-radius: 20px;
          padding: 32px;
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.65),
            inset 0 1px 1px rgba(255, 255, 255, 0.15),
            0 0 25px rgba(6, 182, 212, 0.08);
          transform: perspective(1000px) 
                     rotateX(calc(var(--mouse-norm-y, 0) * -1.5deg)) 
                     rotateY(calc(var(--mouse-norm-x, 0) * 1.5deg));
          transition: transform 0.2s ease-out;
        }

        /* Moneda 3D Rotatoria para Badge de Tarjeta */
        .mchav-coin-small {
          position: relative;
          width: 48px;
          height: 48px;
          display: block;
          transform-style: preserve-3d;
        }

        .mchav-coin-wrapper-small {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: coinSpin 3.5s linear infinite;
        }

        @keyframes coinSpin {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        .coin-face-small {
          position: absolute;
          width: 48px;
          height: 48px;
          top: 0;
          left: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          backface-visibility: hidden;
        }

        .coin-face-small img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.6));
        }

        .coin-front-small { transform: translateZ(1px); }
        .coin-back-small  { transform: rotateY(180deg) translateZ(1px); }

        /* Moneda 3D Grande (Zona Izquierda) */
        .mchav-coin-loader {
          position: relative;
          width: 270px;
          height: 270px;
          display: block;
          transform-style: preserve-3d;
          margin: 0 0 -50px -25px;
        }

        .mchav-coin-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: coinSpin 3s linear infinite;
        }

        .coin-face {
          position: absolute;
          width: 270px;
          height: 270px;
          top: 0;
          left: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          box-shadow: none;
          backface-visibility: hidden;
        }

        .coin-face img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 0 22px rgba(6, 182, 212, 0.75));
        }

        .coin-front { transform: translateZ(1px); }
        .coin-back  { transform: rotateY(180deg) translateZ(1px); }

        .coin-shadow {
          width: 170px;
          height: 16px;
          background: radial-gradient(ellipse, rgba(6, 182, 212, 0.45) 0%, rgba(112, 0, 255, 0.2) 40%, transparent 70%);
          position: absolute;
          bottom: -10px;
          left: 50%;
          margin-left: -85px;
          border-radius: 50%;
          filter: blur(9px);
          animation: coinShadowPulse 2s ease-in-out infinite alternate;
        }

        @keyframes coinShadowPulse {
          0%   { opacity: 0.3; transform: scaleX(0.8); }
          100% { opacity: 0.65; transform: scaleX(1.2); }
        }

        /* Botón Principal Gradiente Cian -> Azul -> Púrpura */
        .btn-primary-gradient {
          background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%);
          transition: all 0.2s ease;
        }

        .btn-primary-gradient:hover {
          filter: brightness(1.1);
          box-shadow: 0 4px 20px rgba(6, 182, 212, 0.35);
        }

        /* Botones de Rol Compactos */
        .btn-role-dev {
          background: rgba(13, 148, 136, 0.2);
          border: 1px solid rgba(45, 212, 191, 0.35);
          color: #2dd4bf;
          transition: all 0.2s ease;
        }
        .btn-role-dev:hover {
          background: rgba(13, 148, 136, 0.35);
          border-color: rgba(45, 212, 191, 0.6);
        }

        .btn-role-manager {
          background: rgba(124, 58, 237, 0.2);
          border: 1px solid rgba(167, 139, 250, 0.35);
          color: #c084fc;
          transition: all 0.2s ease;
        }
        .btn-role-manager:hover {
          background: rgba(124, 58, 237, 0.35);
          border-color: rgba(167, 139, 250, 0.6);
        }

        .btn-role-admin {
          background: rgba(29, 78, 216, 0.2);
          border: 1px solid rgba(96, 165, 250, 0.35);
          color: #60a5fa;
          transition: all 0.2s ease;
        }
        .btn-role-admin:hover {
          background: rgba(29, 78, 216, 0.35);
          border-color: rgba(96, 165, 250, 0.6);
        }
      `}</style>

      {/* Capa de Sombra sobre la Imagen de Fondo */}
      <div className="bg-overlay-tint" />

      {/* MARCO PRINCIPAL EN 2 ZONAS */}
      <div className="login-main-frame">

        {/* ===================================================================
            ZONA IZQUIERDA: LOGO 3D Y ESLOGAN
            =================================================================== */}
        <div className="hidden lg:flex flex-1 flex-col justify-between h-full pl-12 lg:pl-28 pr-12 text-left py-2">

          {/* Logo Moneda 3D Rotatoria */}
          <div className="mchav-coin-loader z-10 mt-10 lg:mt-14">
            <div className="mchav-coin-wrapper">
              <div className="coin-face coin-front">
                <img src={logoOfficialImg} alt="MCHAV Logo 3D" />
              </div>
              <div className="coin-face coin-back">
                <img src={logoOfficialImg} alt="MCHAV Logo 3D" />
              </div>
            </div>
            <span className="coin-shadow"></span>
          </div>

          {/* Eslogan Principal e Íconos Circulares */}
          <div className="space-y-6 my-auto pt-2 z-10">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
                Datos que <br />
                impulsan <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">decisiones.</span>
              </h1>

              {/* Línea decorativa fina cyan -> violeta debajo de impulsan */}
              <div className="w-24 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mt-2 shadow-sm" />
            </div>

            {/* Los 3 Íconos Circulares: Visualiza, Analiza, Decide */}
            <div className="flex items-center gap-9 pt-2">
              <div className="flex flex-col items-center gap-2">
                <div className="w-13 h-13 rounded-full border border-cyan-500/50 bg-slate-950/80 backdrop-blur-md text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] p-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                </div>
                <span className="text-xs font-bold text-slate-200 drop-shadow">Visualiza</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-13 h-13 rounded-full border border-purple-500/50 bg-slate-950/80 backdrop-blur-md text-purple-400 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] p-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                </div>
                <span className="text-xs font-bold text-slate-200 drop-shadow">Analiza</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-13 h-13 rounded-full border border-indigo-500/50 bg-slate-950/80 backdrop-blur-md text-indigo-400 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] p-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m10 15 5-3-5-3v6z" /></svg>
                </div>
                <span className="text-xs font-bold text-slate-200 drop-shadow">Decide</span>
              </div>
            </div>

          </div>

        </div>

        {/* ===================================================================
            ZONA DERECHA: TARJETA DE LOGIN COMPACTA SAAS (380PX)
            =================================================================== */}
        <div ref={cardRef} className="auth-card-saas shrink-0 my-auto text-center z-10 flex flex-col justify-between">
          
          <div>
            {/* 1. LOGO ARRIBA (Insignia Circular con Moneda 3D) */}
            <div className="w-15 h-15 rounded-full bg-slate-950/90 border border-cyan-400/60 p-1 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center mx-auto mb-2.5">
              <div className="mchav-coin-small">
                <div className="mchav-coin-wrapper-small">
                  <div className="coin-face-small coin-front-small">
                    <img src={logoOfficialImg} alt="MCHAV Logo" />
                  </div>
                  <div className="coin-face-small coin-back-small">
                    <img src={logoOfficialImg} alt="MCHAV Logo" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TÍTULO "Bienvenido" */}
            <h2 className="text-xl font-bold text-white tracking-tight">
              Bienvenido
            </h2>

            {/* 3. PEQUEÑO SEPARADOR DECORATIVO CON DEGRADADO CIAN -> AZUL -> MORADO */}
            <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mx-auto mt-1.5 mb-5 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />

            {/* Mensaje de Error si Ocurre */}
            {(errorMessage || authError) && (
              <div className="w-full p-2.5 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                ⚠️ {errorMessage || authError}
              </div>
            )}

            {/* LOS 3 BOTONES DE ROL BIEN ORGANIZADOS */}
            <div className="space-y-3.5 my-2">
              
              {/* Botón 1: Ingresar como Desarrollador */}
              <button 
                type="button"
                onClick={() => handleRoleLogin('dev@mchav.com', 'DEVELOPER')}
                disabled={isSubmitting || authLoading}
                className="btn-dev-teal w-full h-12 px-5 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-3 cursor-pointer group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                <span>Ingresar como Desarrollador</span>
              </button>

              {/* Botón 2: Ingresar como Líder Técnico */}
              <button 
                type="button"
                onClick={() => handleRoleLogin('aftorres@mchav.com', 'MANAGER')}
                disabled={isSubmitting || authLoading}
                className="btn-manager-purple w-full h-12 px-5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-3 cursor-pointer group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Ingresar como Líder Técnico</span>
              </button>

              {/* Botón 3: Ingresar como Administrador */}
              <button 
                type="button"
                onClick={() => handleRoleLogin('vhoyos@mchav.com', 'ADMIN')}
                disabled={isSubmitting || authLoading}
                className="btn-admin-blue w-full h-12 px-5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-3 cursor-pointer group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400 group-hover:scale-110 transition-transform">
                  <polygon points="12 2 2 12 12 22 22 12"/>
                </svg>
                <span>Ingresar como Administrador</span>
              </button>

            </div>

            {/* SEPARADOR "O CONTINÚA CON" */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 bg-[#0B1220] text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                o continúa con
              </span>
            </div>

            {/* BOTÓN CONTINUAR CON ATLASSIAN (44px) */}
            <button 
              type="button"
              onClick={() => handleRoleLogin('aftorres@mchav.com', 'MANAGER')}
              disabled={isSubmitting || authLoading}
              className="w-full h-11 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                <polygon points="12 2 2 12 12 22 22 12"/>
              </svg>
              <span>Continuar con Atlassian</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default LoginView;
