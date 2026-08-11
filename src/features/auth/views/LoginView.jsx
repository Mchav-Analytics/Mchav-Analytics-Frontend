// ============================================================================
// FEATURE AUTH — VISTA DE INICIO DE SESIÓN CON MASCOTA EXTERNA Y TARJETA 3D
// ============================================================================
// - Lado Izquierdo: Tarjeta 3D Flip (Front: Logo 3D Grande; Back: Bienvenido a MCHAV + Atlassian)
// - Lado Derecho: Mascota Búho con bocadillo de diálogo "¡Hola! Estoy aquí para ayudarte..."

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoOfficialImg from '../../../assets/mchav_official_logo.png';
import loginBgImg from '../../../assets/login_bg.jpg';
import owlMascotImg from '../../../assets/owl_mascot.png';

function LoginView() {
  const navigate = useNavigate();
  const { login, loginWithJira, isAuthenticated, loading: authLoading, error: authError } = useAuth();

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

  // Autenticación real con Atlassian OAuth (Jira)
  const handleJiraAuth = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await loginWithJira();
    } catch (err) {
      console.error("Error al iniciar autenticación Jira:", err);
      setErrorMessage("No se pudo conectar con Atlassian Jira. Inténtalo nuevamente.");
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

        /* CONTENEDOR SECCIÓN TARJETA 3D (LADO IZQUIERDO, ADAPTATIVO A PANTALLAS GRANDES Y PC) */
        .login-card-section {
          position: absolute;
          top: 0;
          left: 0;
          width: 380px;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-left: clamp(1.5rem, 4vw, 6rem);
          z-index: 10;
          box-sizing: content-box;
        }

        @media (min-width: 1280px) {
          .login-card-section {
            width: 480px;
          }
        }

        @media (min-width: 1536px) and (min-height: 800px) {
          .login-card-section {
            width: 540px;
          }
        }

        /* CONTENEDOR SECCIÓN MASCOTA (LADO DERECHO, ADAPTATIVO A PANTALLAS GRANDES Y PC) */
        .login-mascot-section {
          position: absolute;
          top: 0;
          right: 0;
          width: auto;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: clamp(3rem, 10vw, 15vw);
          z-index: 10;
          pointer-events: none;
        }

        @media (min-width: 1536px) {
          .login-mascot-section {
            padding-right: clamp(4rem, 12vw, 16vw);
          }
        }

        /* ===================================================================
           ESTRUCTURA TARJETA 3D FLIP ADAPTATIVA MULTI-PANTALLA
           =================================================================== */
        .flip-card-container {
          width: 100%;
          max-width: 380px;
          height: clamp(480px, 80vh, 520px);
          perspective: 1000px;
          cursor: pointer;
          transition: max-width 0.3s ease, height 0.3s ease;
        }

        @media (min-width: 1280px) {
          .flip-card-container {
            max-width: 480px;
            height: clamp(560px, 78vh, 620px);
          }
        }

        @media (min-width: 1536px) and (min-height: 800px) {
          .flip-card-container {
            max-width: 540px;
            height: clamp(620px, 76vh, 680px);
          }
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

        /* CARA FRONTAL (FRONT): LOGO 3D EN GRANDE */
        .flip-card-front {
          background-color: rgba(6, 11, 23, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(6, 182, 212, 0.45);
          box-shadow: inset 0 0 30px rgba(6, 182, 212, 0.15), 0 10px 40px rgba(0,0,0,0.6);
          transform: rotateY(0deg);
        }

        /* CARA REVERSO (BACK): ACCESO DE INICIO DE SESIÓN CON ATLASSIAN */
        .flip-card-back {
          background-color: rgba(3, 7, 18, 0.88);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1.5px solid rgba(6, 182, 212, 0.45);
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
          background-color: rgba(6, 11, 23, 0.95);
          border-radius: 18px;
          padding: clamp(24px, 4vh, 36px) clamp(18px, 4vw, 28px);
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow-y: auto;
        }

        /* Moneda 3D Rotatoria Grande para la Cara Frontal (Adaptativa para PC) */
        .mchav-coin-large {
          position: relative;
          width: 230px;
          height: 230px;
          display: block;
          transform-style: preserve-3d;
          margin: 0 auto;
        }

        @media (min-width: 1280px) {
          .mchav-coin-large {
            width: 270px;
            height: 270px;
          }
        }

        @media (min-width: 1536px) {
          .mchav-coin-large {
            width: 310px;
            height: 310px;
          }
        }

        .mchav-coin-wrapper-large {
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

        .coin-face-large {
          position: absolute;
          width: 230px;
          height: 230px;
          top: 0;
          left: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          backface-visibility: hidden;
        }

        @media (min-width: 1280px) {
          .coin-face-large {
            width: 270px;
            height: 270px;
          }
        }

        @media (min-width: 1536px) {
          .coin-face-large {
            width: 310px;
            height: 310px;
          }
        }

        .coin-face-large img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 0 38px rgba(6, 182, 212, 0.95));
        }

        .coin-front-large { transform: translateZ(1px); }
        .coin-back-large  { transform: rotateY(180deg) translateZ(1px); }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float-mascot {
          animation: floatSlow 4s ease-in-out infinite;
        }
      `}</style>

      {/* Capa de Sombra sobre la Imagen de Fondo */}
      <div className="bg-overlay-tint" />

      {/* LADO IZQUIERDO: TARJETA 3D FLIP UIVERSE */}
      <div className="login-card-section">
        <div
          ref={cardRef}
          onClick={() => setIsFlipped(!isFlipped)}
          className={`flip-card-container z-10 ${isFlipped ? 'is-flipped' : ''}`}
        >
          <div className="flip-card-inner">

            {/* CARA FRONTAL (FRONT): LOGO 3D EN GRANDE */}
            <div className="flip-card-front !p-6 overflow-hidden relative group flex flex-col items-center justify-between">

              {/* Encabezado Principal */}
              <div className="pt-3 xl:pt-5 text-center z-10 shrink-0">
                <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-extrabold text-white tracking-tight">
                  MCHAV Analytics
                </h2>
                <p className="text-xs xl:text-sm 2xl:text-base text-cyan-400 font-medium mt-1">Plataforma de Métricas y KPIs</p>
                <div className="w-12 xl:w-16 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mx-auto mt-2 shadow-[0_0_10px_rgba(6,182,212,0.7)]" />
              </div>

              {/* Logo 3D MCHAV Rotatorio Grande */}
              <div className="w-full flex-1 flex items-center justify-center my-4 relative">
                <div className="mchav-coin-large">
                  <div className="mchav-coin-wrapper-large">
                    <div className="coin-face-large coin-front-large">
                      <img src={logoOfficialImg} alt="MCHAV Logo 3D Grande" />
                    </div>
                    <div className="coin-face-large coin-back-large">
                      <img src={logoOfficialImg} alt="MCHAV Logo 3D Grande" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicador de Giro en la Parte Inferior */}
              <div className="mb-2 px-5 xl:px-6 py-2 xl:py-2.5 rounded-full bg-slate-950/90 border border-cyan-500/50 text-cyan-300 text-xs xl:text-sm font-bold backdrop-blur-md flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.45)] animate-pulse shrink-0 z-10">
                <span>Girar para iniciar sesión</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="xl:w-4 xl:h-4">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </div>

            </div>

            {/* CARA REVERSO (BACK): ACCESO DE INICIO DE SESIÓN CON ATLASSIAN */}
            <div className="flip-card-back">
              <div className="flip-card-back-content flex flex-col justify-center items-center pt-8 pb-6 px-6">

                <div className="w-full my-auto flex flex-col items-center">

                  {/* Título "Bienvenido a MCHAV" */}
                  <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-extrabold text-white tracking-tight text-center">
                    Bienvenido a MCHAV
                  </h2>
                  <p className="text-xs xl:text-sm 2xl:text-base text-slate-400 mt-1.5 text-center">Ingresa con tu cuenta corporativa de Atlassian</p>
                  <div className="w-12 xl:w-16 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mx-auto mt-2 mb-6 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />

                  {/* Mensaje de Error si Ocurre */}
                  {(errorMessage || authError) && (
                    <div className="w-full p-2.5 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold text-center">
                      ⚠️ {errorMessage || authError}
                    </div>
                  )}

                  {/* BOTÓN ÚNICO DE AUTENTICACIÓN CON ATLASSIAN (JIRA) */}
                  <div className="my-4 w-full">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleJiraAuth(); }}
                      disabled={isSubmitting || authLoading}
                      className="w-full h-12 xl:h-14 2xl:h-16 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm xl:text-base 2xl:text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 hover:shadow-cyan-500/40 transition-all cursor-pointer group"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-200 group-hover:scale-110 transition-transform xl:w-6 xl:h-6">
                        <polygon points="12 2 2 12 12 22 22 12" />
                      </svg>
                      <span>Continuar con Atlassian (Jira)</span>
                    </button>
                  </div>

                  <div className="text-xs xl:text-sm text-slate-400 hover:text-cyan-300 transition-colors pt-4 cursor-pointer">
                    <span>Volver a la vista principal ↩</span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DERECHO: MASCOTA BÚHO ADAPTATIVA A PANTALLAS DE PC Y MONITORES GRANDES */}
      <div className="login-mascot-section">
        <div className="hidden lg:flex flex-col items-center justify-center relative z-10 max-w-md xl:max-w-lg 2xl:max-w-xl pointer-events-none select-none animate-float-mascot">

          {/* Bocadillo de Diálogo (Speech Bubble Escalable) */}
          <div className="relative mb-6 p-5 xl:p-6 2xl:p-7 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-indigo-500/40 shadow-[0_15px_35px_rgba(0,0,0,0.7),0_0_25px_rgba(6,182,212,0.25)] max-w-xs xl:max-w-sm 2xl:max-w-md transition-all duration-300">
            <h3 className="text-xl xl:text-2xl 2xl:text-3xl font-black text-white mb-2 flex items-center gap-2">
              ¡Hola! <span className="w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-full bg-cyan-400 animate-ping inline-block" />
            </h3>
            <p className="text-sm xl:text-base 2xl:text-lg text-slate-200 font-medium leading-relaxed">
              Estoy aquí para ayudarte a <span className="text-cyan-400 font-bold">conectar tu equipo</span> con lo que importa.
            </p>
            <div className="w-10 xl:w-14 h-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mt-3 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />

            {/* Flecha del Bocadillo apuntando al búho */}
            <div className="absolute -bottom-3 right-14 xl:right-16 2xl:right-20 w-0 h-0 border-l-[10px] xl:border-l-[12px] border-l-transparent border-r-[10px] xl:border-r-[12px] border-r-transparent border-t-[12px] xl:border-t-[14px] border-t-slate-950/90" />
          </div>

          {/* Imagen de la Mascota Búho (Escalado Proporcional para PC: de 320px a 420px y 480px) */}
          <div className="relative w-80 h-96 xl:w-[420px] xl:h-[500px] 2xl:w-[480px] 2xl:h-[570px] flex items-center justify-center transition-all duration-300">
            <img
              src={owlMascotImg}
              alt="Mascota Búho MCHAV Analytics"
              className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(6,182,212,0.55)] transition-transform duration-500"
            />
          </div>

        </div>
      </div>

    </div>
  );
}

export default LoginView;
