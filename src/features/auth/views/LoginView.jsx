// ============================================================================
// FEATURE AUTH — VISTA DE INICIO DE SESIÓN CON TARJETA DE ESQUINAS DIAGONALES (CHAMFERED)
// ============================================================================
// - Fondo General: Imagen de oficina nocturna existente (login_bg.jpg).
// - Zona Izquierda: Logo 3D Moneda Giratoria MCHAV, título MCHAV Analytics, eslogan
//   "Convierte datos en decisiones.", subtítulo "Analítica ágil para equipos Jira."
//   y gráfico holográfico 3D de barras en perspectiva isométrica.
// - Zona Derecha: Tarjeta con esquinas cortadas en diagonal (chamfered), borde neón cian-púrpura,
//   insignia hexagonal superior, título "Iniciar sesión", acento decorativo y los 3 botones por rol.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoOfficialImg from '../../../assets/mchav_official_logo.png';
import loginBgImg from '../../../assets/login_bg.jpg';

function LoginView() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth();
  
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

  // Manejar el movimiento del cursor para paralaje sutil 3D en la tarjeta
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

  // Iniciar sesión con un rol específico (Admin, Líder Técnico o Desarrollador)
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
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #ffffff;
        }

        /* Overlay oscuro de alto contraste */
        .bg-overlay-tint {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 75% 50%, rgba(3, 7, 18, 0.4) 0%, rgba(3, 7, 18, 0.78) 100%);
          pointer-events: none;
          z-index: 1;
        }

        /* Contenedor Widescreen Principal */
        .login-main-frame {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1380px;
          height: calc(100vh - 3rem);
          max-height: 780px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
        }

        /* ===================================================================
           TARJETA CON ESQUINAS DIAGONALES (CHAMFERED) Y BORDE NEÓN GRADIENTE
           =================================================================== */
        .auth-card-chamfer-wrapper {
          position: relative;
          width: 100%;
          max-width: 450px;
          padding: 1.5px;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.9) 0%, rgba(168, 85, 247, 0.85) 100%);
          clip-path: polygon(28px 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%, 0 28px);
          filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 25px rgba(6, 182, 212, 0.25));
          transform: perspective(1000px) 
                     rotateX(calc(var(--mouse-norm-y, 0) * -1.8deg)) 
                     rotateY(calc(var(--mouse-norm-x, 0) * 1.8deg));
          transition: transform 0.2s ease-out;
        }

        .auth-card-chamfer-inner {
          width: 100%;
          background: rgba(9, 14, 28, 0.92);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          clip-path: polygon(27px 0, 100% 0, 100% calc(100% - 27px), calc(100% - 27px) 100%, 0 100%, 0 27px);
          padding: 3.25rem 2.25rem;
          text-align: center;
        }

        /* Insignia Hexagonal Superior de la Tarjeta */
        .hex-badge-container {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px auto;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hex-badge-outer {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.8), rgba(168, 85, 247, 0.6));
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          padding: 1.5px;
        }

        .hex-badge-inner {
          width: 100%;
          height: 100%;
          background: #090e1a;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #06b6d4;
          box-shadow: inset 0 0 15px rgba(6, 182, 212, 0.3);
        }

        /* Moneda 3D Rotatoria Pequeña */
        .mchav-coin-small {
          position: relative;
          width: 54px;
          height: 54px;
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
          width: 54px;
          height: 54px;
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

        /* Moneda 3D Rotatoria Grande (Zona Izquierda) */
        .mchav-coin-large {
          position: relative;
          width: 90px;
          height: 90px;
          display: block;
          transform-style: preserve-3d;
        }

        .mchav-coin-wrapper-large {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: coinSpin 4s linear infinite;
        }

        .coin-face-large {
          position: absolute;
          width: 90px;
          height: 90px;
          top: 0;
          left: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          backface-visibility: hidden;
        }

        .coin-face-large img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.7));
        }

        .coin-front-large { transform: translateZ(1.5px); }
        .coin-back-large  { transform: rotateY(180deg) translateZ(1.5px); }

        /* Botón 1: Desarrollador (Cian / Esmeralda) */
        .btn-dev-teal {
          background: linear-gradient(135deg, #0d9488 0%, #06b6d4 50%, #0284c7 100%);
          border: 1px solid rgba(45, 212, 191, 0.4);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 20px rgba(13, 148, 136, 0.3);
        }

        .btn-dev-teal:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(6, 182, 212, 0.45);
          filter: brightness(1.08);
        }

        /* Botón 2: Líder Técnico (Púrpura / Violeta) */
        .btn-manager-purple {
          background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #4c1d95 100%);
          border: 1px solid rgba(167, 139, 250, 0.4);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 20px rgba(109, 40, 217, 0.3);
        }

        .btn-manager-purple:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(124, 58, 237, 0.45);
          filter: brightness(1.08);
        }

        /* Botón 3: Administrador (Azul Marino / Atlassian) */
        .btn-admin-blue {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #0f172a 100%);
          border: 1px solid rgba(96, 165, 250, 0.4);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 20px rgba(29, 78, 216, 0.3);
        }

        .btn-admin-blue:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.45);
          filter: brightness(1.08);
        }

        /* Gráfico de Barras Isométrico 3D (Piso Izquierdo) */
        .iso-chart-container {
          perspective: 800px;
        }

        .iso-grid {
          transform: rotateX(55deg) rotateZ(-30deg);
          transform-style: preserve-3d;
        }
      `}</style>

      {/* Capa de Sombra sobre la Imagen de Fondo */}
      <div className="bg-overlay-tint" />

      {/* MARCO PRINCIPAL EN 2 ZONAS */}
      <div className="login-main-frame">
        
        {/* ===================================================================
            ZONA IZQUIERDA: LOGO 3D MCHAV, BRANDING, ESLOGAN Y GRÁFICO ISOMÉTRICO
            =================================================================== */}
        <div className="hidden lg:flex flex-1 flex-col justify-between h-full pr-12 text-left py-4 z-10">
          
          {/* Header Marca: Logo Moneda 3D Grande + MCHAV + Subtítulo Analytics */}
          <div className="flex items-center gap-5">
            <div className="mchav-coin-large">
              <div className="mchav-coin-wrapper-large">
                <div className="coin-face-large coin-front-large">
                  <img src={logoOfficialImg} alt="MCHAV Logo 3D" />
                </div>
                <div className="coin-face-large coin-back-large">
                  <img src={logoOfficialImg} alt="MCHAV Logo 3D" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 leading-none drop-shadow-lg">
                MCHAV
              </h1>
              <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase mt-1">
                Analytics
              </p>
            </div>
          </div>

          {/* Eslogan Principal y Subtítulo Jira */}
          <div className="my-auto space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
              Convierte datos <br />
              en <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">decisiones.</span>
            </h2>
            
            {/* Barra Decorativa Neón Cian -> Púrpura */}
            <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]" />

            <p className="text-sm font-normal text-slate-300/80 tracking-wide pt-1">
              Analítica ágil para equipos Jira.
            </p>
          </div>

          {/* Gráfico 3D Holográfico en Perspectiva Isométrica */}
          <div className="relative w-full max-w-sm h-36 pt-2">
            <div className="relative w-full h-full flex items-end justify-start gap-4 pl-4 pb-2">
              
              {/* Línea de Onda Luminosa Cyan a Púrpura */}
              <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" viewBox="0 0 300 120">
                <path d="M 10,100 Q 80,40 160,75 T 290,20" fill="none" stroke="url(#cyanPurpGrad)" strokeWidth="3" />
                <defs>
                  <linearGradient id="cyanPurpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>

              {/* 5 Prismas de Barras 3D en perspectiva */}
              <div className="relative z-10 w-7 bg-gradient-to-t from-cyan-900 via-cyan-600 to-cyan-400 rounded-t-md h-[30%] shadow-[0_0_15px_rgba(6,182,212,0.5)] border-t border-cyan-300" />
              <div className="relative z-10 w-7 bg-gradient-to-t from-cyan-900 via-cyan-600 to-cyan-400 rounded-t-md h-[45%] shadow-[0_0_15px_rgba(6,182,212,0.5)] border-t border-cyan-300" />
              <div className="relative z-10 w-7 bg-gradient-to-t from-cyan-900 via-cyan-600 to-cyan-400 rounded-t-md h-[65%] shadow-[0_0_18px_rgba(6,182,212,0.6)] border-t border-cyan-300" />
              <div className="relative z-10 w-7 bg-gradient-to-t from-sky-900 via-sky-600 to-sky-300 rounded-t-md h-[80%] shadow-[0_0_20px_rgba(56,189,248,0.6)] border-t border-sky-200" />
              <div className="relative z-10 w-7 bg-gradient-to-t from-purple-900 via-purple-600 to-purple-400 rounded-t-md h-[100%] shadow-[0_0_25px_rgba(168,85,247,0.7)] border-t border-purple-300" />
            </div>
          </div>

        </div>

        {/* ===================================================================
            ZONA DERECHA: TARJETA CON ESQUINAS DIAGONALES (CHAMFERED) Y BORDE NEÓN
            =================================================================== */}
        <div ref={cardRef} className="auth-card-chamfer-wrapper shrink-0 my-auto z-10">
          <div className="auth-card-chamfer-inner">
            
            {/* Insignia Hexagonal Superior */}
            <div className="hex-badge-container">
              <div className="hex-badge-outer">
                <div className="hex-badge-inner">
                  {/* Ícono de Usuario Profil / Conexión */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Título "Iniciar sesión" */}
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Iniciar sesión
            </h2>

            {/* Línea Decorativa Acento Cyan-Púrpura */}
            <div className="w-10 h-1 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 mb-8 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />

            {/* Mensaje de Error si Ocurre */}
            {(errorMessage || authError) && (
              <div className="w-full p-3 mb-5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                ⚠️ {errorMessage || authError}
              </div>
            )}

            {/* LOS 3 BOTONES DE ACCESO DIRECTO POR ROL */}
            <div className="space-y-4">
              
              {/* Botón 1: Ingresar como Desarrollador */}
              <button 
                type="button"
                onClick={() => handleRoleLogin('dev@mchav.com', 'DEVELOPER')}
                disabled={isSubmitting || authLoading}
                className="btn-dev-teal w-full h-14 px-6 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-3.5 cursor-pointer group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
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
                className="btn-manager-purple w-full h-14 px-6 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-3.5 cursor-pointer group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Ingresar como Líder Técnico</span>
              </button>

              {/* Botón 3: Ingresar como Administrador */}
              <button 
                type="button"
                onClick={() => handleRoleLogin('vhoyos@mchav.com', 'ADMIN')}
                disabled={isSubmitting || authLoading}
                className="btn-admin-blue w-full h-14 px-6 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-3.5 cursor-pointer group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400 group-hover:scale-110 transition-transform">
                  <polygon points="12 2 2 12 12 22 22 12"/>
                </svg>
                <span>Ingresar como Administrador</span>
              </button>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default LoginView;
