// ============================================================================
// FEATURE AUTH — VISTA DE INICIO DE SESIÓN CON TARJETA 3D FLIP (UIVERSE)
// ============================================================================
// - Posición: Izquierda de la pantalla para dejar libre la vista de la oficina.
// - Cara Principal (Front): Logo 3D MCHAV, marca "MCHAV Analytics", eslogan.
// - Cara Reverso (Back): Controles de inicio de sesión por rol y Atlassian.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoOfficialImg from '../../../assets/mchav_official_logo.png';
import loginBgImg from '../../../assets/login_bg.jpg';
import snoopyWelcomeImg from '../../../assets/snoopy_welcome.jpg';

function LoginView() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth();

  const [isFlipped, setIsFlipped] = useState(false);
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
          background: radial-gradient(circle at 75% 50%, rgba(3, 7, 18, 0.4) 0%, rgba(3, 7, 18, 0.78) 100%);
          pointer-events: none;
        }

        /* MARCO PRINCIPAL ADAPTATIVO UNIVERSAL (RESPONSIVE PARA TODAS LAS PANTALLAS) */
        .login-main-frame {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1280px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
        }

        @media (min-width: 1280px) {
          .login-main-frame {
            justify-content: flex-start;
            padding-left: 8rem;
          }
        }

        /* ===================================================================
           ESTRUCTURA TARJETA 3D FLIP ADAPTATIVA (UIVERSE)
           =================================================================== */
        .flip-card-container {
          width: 100%;
          max-width: 380px;
          height: clamp(480px, 82vh, 530px);
          perspective: 1000px;
          cursor: pointer;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85);
          border-radius: 20px;
        }

        /* Giro por clic y hover */
        .flip-card-container:hover .flip-card-inner,
        .flip-card-container.is-flipped .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front, .flip-card-back {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: center;
        }

        /* CARA FRONTAL (FRONT): ILUSTRACIÓN COMPLETA DE SNOOPY ATLASSIAN */
        .flip-card-front {
          background-color: #060b17;
          border: 1.5px solid rgba(6, 182, 212, 0.4);
          box-shadow: inset 0 0 25px rgba(6, 182, 212, 0.15);
          transform: rotateY(0deg);
        }

        /* CARA REVERSO (BACK): ACCESO DE INICIO DE SESIÓN CON LOGO 3D */
        .flip-card-back {
          background-color: rgba(3, 7, 18, 0.76);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1.5px solid rgba(6, 182, 212, 0.4);
          transform: rotateY(180deg);
        }

        /* Borde Giratorio Neón Cian para la cara posterior */
        .flip-card-back::before {
          position: absolute;
          content: ' ';
          display: block;
          top: -20%;
          left: -20%;
          width: 200px;
          height: 200%;
          background: linear-gradient(90deg, transparent, #06b6d4, #38bdf8, #06b6d4, transparent);
          filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.85));
          animation: rotation_481 5s infinite linear;
          z-index: 0;
        }

        @keyframes rotation_481 {
          0%   { transform: rotateZ(0deg); }
          100% { transform: rotateZ(360deg); }
        }

        .flip-card-back-content {
          position: absolute;
          inset: 2px;
          background-color: rgba(6, 11, 23, 0.94);
          border-radius: 18px;
          padding: clamp(24px, 4vh, 36px) clamp(18px, 4vw, 28px);
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow-y: auto;
        }

        /* Moneda 3D Rotatoria Grande para la Cara Frontal */
        .mchav-coin-loader-card {
          position: relative;
          width: 150px;
          height: 150px;
          display: block;
          transform-style: preserve-3d;
          margin: 0 auto;
        }

        .mchav-coin-wrapper-card {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: coinSpin 3s linear infinite;
        }

        @keyframes coinSpin {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        .coin-face-card {
          position: absolute;
          width: 150px;
          height: 150px;
          top: 0;
          left: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          backface-visibility: hidden;
        }

        .coin-face-card img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 0 16px rgba(6, 182, 212, 0.75));
        }

        .coin-front-card { transform: translateZ(1px); }
        .coin-back-card  { transform: rotateY(180deg) translateZ(1px); }

        /* Botón 1: Desarrollador (Cian Sobrio / Degradé Elegante) */
        .btn-dev-teal {
          background: linear-gradient(135deg, #093b44 0%, #0e5b6a 50%, #15798c 100%);
          border: 1px solid rgba(45, 212, 191, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-dev-teal:hover {
          transform: translateY(-2px) scale(1.015);
          background: linear-gradient(135deg, #0d4a55 0%, #136f82 50%, #1a95ad 100%);
          border-color: rgba(45, 212, 191, 0.7);
          box-shadow: 0 8px 24px rgba(6, 182, 212, 0.25);
          filter: brightness(1.1);
        }

        /* Botón 2: Líder Técnico (Púrpura Sobrio / Degradé Elegante) */
        .btn-manager-purple {
          background: linear-gradient(135deg, #24143a 0%, #3a1d5c 50%, #522780 100%);
          border: 1px solid rgba(167, 139, 250, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-manager-purple:hover {
          transform: translateY(-2px) scale(1.015);
          background: linear-gradient(135deg, #2e1a4a 0%, #482473 50%, #66319e 100%);
          border-color: rgba(167, 139, 250, 0.7);
          box-shadow: 0 8px 24px rgba(168, 85, 247, 0.25);
          filter: brightness(1.1);
        }

        /* Botón 3: Administrador (Azul Sobrio / Degradé Elegante) */
        .btn-admin-blue {
          background: linear-gradient(135deg, #0e2246 0%, #18386c 50%, #225199 100%);
          border: 1px solid rgba(96, 165, 250, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-admin-blue:hover {
          transform: translateY(-2px) scale(1.015);
          background: linear-gradient(135deg, #132d5c 0%, #20488a 50%, #2c68c2 100%);
          border-color: rgba(96, 165, 250, 0.7);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
          filter: brightness(1.1);
        }

        /* Moneda 3D Rotatoria Pequeña */
        .mchav-coin-small {
          position: relative;
          width: 44px;
          height: 44px;
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

        .coin-face-small {
          position: absolute;
          width: 44px;
          height: 44px;
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
      `}</style>

      {/* Capa de Sombra sobre la Imagen de Fondo */}
      <div className="bg-overlay-tint" />

      {/* MARCO PRINCIPAL EN EL LADO IZQUIERDO */}
      <div className="login-main-frame">

        {/* TARJETA 3D FLIP UIVERSE */}
        <div
          ref={cardRef}
          onClick={() => setIsFlipped(!isFlipped)}
          className={`flip-card-container z-10 ${isFlipped ? 'is-flipped' : ''}`}
        >
          <div className="flip-card-inner">

            {/* ===============================================================
                CARA FRONTAL (FRONT): ILUSTRACIÓN COMPLETA DE SNOOPY ATLASSIAN
                =============================================================== */}
            <div className="flip-card-front !p-0 overflow-hidden relative group">
              
              <img 
                src={snoopyWelcomeImg} 
                alt="Snoopy Atlassian Welcome" 
                className="w-full h-full object-cover rounded-2xl"
              />

              {/* Píldora interactiva de indicación de giro en la parte inferior */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-950/85 border border-cyan-500/50 text-cyan-300 text-xs font-bold backdrop-blur-md flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse shrink-0">
                <span>Girar para iniciar sesión</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </div>

            </div>

            {/* ===============================================================
                CARA REVERSO (BACK): ACCESO DE INICIO DE SESIÓN CON LOGO 3D
                =============================================================== */}
            <div className="flip-card-back">
              <div className="flip-card-back-content">

                <div>
                  {/* Badge con Moneda Pequeña 3D MCHAV */}
                  <div className="w-13 h-13 rounded-full bg-slate-950/90 border border-cyan-400/60 p-1 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center mx-auto mb-2">
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

                  {/* Título "Bienvenido" */}
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Bienvenido
                  </h2>
                  <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mx-auto mt-1 mb-3 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />

                  {/* Mensaje de Error si Ocurre */}
                  {(errorMessage || authError) && (
                    <div className="w-full p-2 mb-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                      ⚠️ {errorMessage || authError}
                    </div>
                  )}

                  {/* LOS 3 BOTONES DE ROL */}
                  <div className="space-y-2.5 my-2">

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRoleLogin('dev@mchav.com', 'DEVELOPER'); }}
                      disabled={isSubmitting || authLoading}
                      className="btn-dev-teal w-full h-11 px-4 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-3 cursor-pointer group"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                      <span>Ingresar como Desarrollador</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRoleLogin('aftorres@mchav.com', 'MANAGER'); }}
                      disabled={isSubmitting || authLoading}
                      className="btn-manager-purple w-full h-11 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-3 cursor-pointer group"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Ingresar como Líder Técnico</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRoleLogin('vhoyos@mchav.com', 'ADMIN'); }}
                      disabled={isSubmitting || authLoading}
                      className="btn-admin-blue w-full h-11 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-3 cursor-pointer group"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400 group-hover:scale-110 transition-transform">
                        <polygon points="12 2 2 12 12 22 22 12" />
                      </svg>
                      <span>Ingresar como Administrador</span>
                    </button>

                  </div>

                  {/* SEPARADOR "O CONTINÚA CON" */}
                  <div className="relative flex items-center justify-center my-2.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800" />
                    </div>
                    <span className="relative px-3 bg-[#060b17] text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      o continúa con
                    </span>
                  </div>

                  {/* BOTÓN CONTINUAR CON ATLASSIAN */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRoleLogin('aftorres@mchav.com', 'MANAGER'); }}
                    disabled={isSubmitting || authLoading}
                    className="w-full h-10 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                      <polygon points="12 2 2 12 12 22 22 12" />
                    </svg>
                    <span>Continuar con Atlassian</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors pt-2">
                  <span>Volver a la vista principal ↩</span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default LoginView;
