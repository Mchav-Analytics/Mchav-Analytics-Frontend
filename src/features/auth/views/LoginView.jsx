// ============================================================================
// FEATURE AUTH — VISTA DE INICIO DE SESIÓN CON DISEÑO COMPLETO MCHAV ANALYTICS
// ============================================================================
// Réplica exacta de la composición de 2 zonas sobre el fondo real de oficina:
// - Zona Izquierda: Header de Marca, Eslogan con degradado, 3 pilares (Visualiza, Analiza, Decide),
//   Gráfico de Rendimiento Mensual (12 meses con barras duales neón) y Badges de seguridad al pie.
// - Zona Derecha: Tarjeta Glassmorphic con la insignia circular del logo 3D, encabezado "Bienvenido",
//   línea acento neón y los 3 botones de acceso por rol.

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

  // Iniciar sesión con un rol específico
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

  // Datos para las barras del gráfico de rendimiento mensual (12 meses)
  const monthlyData = [
    { month: 'Ene', ventas: 45, objetivo: 60 },
    { month: 'Feb', ventas: 52, objetivo: 68 },
    { month: 'Mar', ventas: 60, objetivo: 75 },
    { month: 'Abr', ventas: 70, objetivo: 82 },
    { month: 'May', ventas: 72, objetivo: 88 },
    { month: 'Jun', ventas: 80, objetivo: 96 },
    { month: 'Jul', ventas: 85, objetivo: 100 },
    { month: 'Ago', ventas: 90, objetivo: 108 },
    { month: 'Sep', ventas: 95, objetivo: 115 },
    { month: 'Oct', ventas: 98, objetivo: 120 },
    { month: 'Nov', ventas: 102, objetivo: 125 },
    { month: 'Dic', ventas: 110, objetivo: 130 },
  ];

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

        /* TARJETA DERECHA DE AUTENTICACIÓN (RÉPLICA EXACTA 1:1) */
        .auth-card-right-screen {
          width: 100%;
          max-width: 460px;
          background: rgba(8, 13, 26, 0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 36px;
          padding: 3.25rem 2.25rem;
          box-shadow:
            0 35px 100px rgba(0, 0, 0, 0.95),
            inset 0 1px 1px rgba(255, 255, 255, 0.15),
            0 0 50px rgba(6, 182, 212, 0.15);
          transform: perspective(1000px) 
                     rotateX(calc(var(--mouse-norm-y, 0) * -1.8deg)) 
                     rotateY(calc(var(--mouse-norm-x, 0) * 1.8deg));
          transition: transform 0.2s ease-out;
        }

        /* Moneda 3D Rotatoria Pequeña (Para Header y Badge) */
        .mchav-coin-small {
          position: relative;
          width: 52px;
          height: 52px;
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
          width: 52px;
          height: 52px;
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
      `}</style>

      {/* Capa de Sombra sobre la Imagen de Fondo */}
      <div className="bg-overlay-tint" />

      {/* MARCO PRINCIPAL EN 2 ZONAS */}
      <div className="login-main-frame">
        
        {/* ===================================================================
            ZONA IZQUIERDA: BRANDING, ESLOGAN, PILARES Y GRÁFICO DE RENDIMIENTO
            =================================================================== */}
        <div className="hidden lg:flex flex-1 flex-col justify-between h-full pr-10 text-left py-2 z-10">
          
          {/* Header Marca: Logo Oficial + MCHAV + Subtítulo ANALYTICS */}
          <div className="flex items-center gap-4">
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
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-none drop-shadow-md">
                MCHAV
              </h1>
              <p className="text-xs font-black tracking-[0.25em] text-cyan-400 uppercase mt-0.5">
                ANALYTICS
              </p>
            </div>
          </div>

          {/* Eslogan Principal */}
          <div className="mt-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
              Datos que <br />
              impulsan <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">decisiones.</span>
            </h2>
            
            {/* Barra Decorativa Neón Cian -> Púrpura */}
            <div className="w-24 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mt-3 shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
          </div>

          {/* 3 Pilares con Separadores Verticales: Visualiza, Analiza, Decide */}
          <div className="flex items-center gap-8 py-2">
            
            {/* Pillar 1: Visualiza */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-cyan-500/50 bg-slate-950/80 backdrop-blur-md text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                  <path d="M22 12A10 10 0 0 0 12 2v10z"/>
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-100 drop-shadow">Visualiza</span>
            </div>

            <div className="h-8 w-px bg-slate-700/80" />

            {/* Pillar 2: Analiza */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-purple-500/50 bg-slate-950/80 backdrop-blur-md text-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-100 drop-shadow">Analiza</span>
            </div>

            <div className="h-8 w-px bg-slate-700/80" />

            {/* Pillar 3: Decide */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-teal-500/50 bg-slate-950/80 backdrop-blur-md text-teal-400 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)] shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="m10 15 5-3-5-3v6z"/>
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-100 drop-shadow">Decide</span>
            </div>

          </div>

          {/* Tarjeta de Gráfico: Rendimiento Mensual (12 Meses con Barras Duales) */}
          <div className="w-full max-w-lg bg-slate-950/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 shadow-2xl">
            
            {/* Header del Gráfico */}
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Rendimiento mensual</h3>
                <p className="text-[10px] text-slate-400">Miles (USD)</p>
              </div>
              {/* Leyenda */}
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                  Ventas
                </div>
                <div className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                  Objetivo
                </div>
              </div>
            </div>

            {/* Cuerpo del Gráfico de Barras */}
            <div className="relative h-36 w-full pt-4 pb-5 flex items-end justify-between border-b border-slate-800">
              
              {/* Guías Y de fondo */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[9px] text-slate-400">
                <div className="border-b border-slate-600 w-full text-right pr-1">120</div>
                <div className="border-b border-slate-600 w-full text-right pr-1">80</div>
                <div className="border-b border-slate-600 w-full text-right pr-1">40</div>
                <div className="border-b border-slate-600 w-full text-right pr-1">0</div>
              </div>

              {/* Las 12 columnas de meses */}
              {monthlyData.map((d, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center flex-1 h-full justify-end group">
                  <div className="flex items-end gap-1 h-full w-full justify-center px-0.5">
                    {/* Barra Ventas (Cian) */}
                    <div 
                      style={{ height: `${(d.ventas / 130) * 100}%` }}
                      className="w-1.5 lg:w-2 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-t-sm shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all group-hover:brightness-125" 
                    />
                    {/* Barra Objetivo (Púrpura) */}
                    <div 
                      style={{ height: `${(d.objetivo / 130) * 100}%` }}
                      className="w-1.5 lg:w-2 bg-gradient-to-t from-purple-700 to-purple-400 rounded-t-sm shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all group-hover:brightness-125" 
                    />
                  </div>
                  {/* Etiqueta del Mes */}
                  <span className="absolute -bottom-5 text-[9px] font-semibold text-slate-400">
                    {d.month}
                  </span>
                </div>
              ))}

            </div>
          </div>

          {/* Insignias de Seguridad al Pie Izquierdo */}
          <div className="flex items-center gap-7 text-xs text-slate-300 font-semibold pt-2">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">🛡️</span> Seguro
            </div>
            <div className="h-3.5 w-px bg-slate-700/80" />
            <div className="flex items-center gap-2">
              <span className="text-purple-400">🔒</span> Confiable
            </div>
            <div className="h-3.5 w-px bg-slate-700/80" />
            <div className="flex items-center gap-2">
              <span className="text-sky-400">☁️</span> En tiempo real
            </div>
          </div>

        </div>

        {/* ===================================================================
            ZONA DERECHA: TARJETA DE AUTENTICACIÓN SOBRE EL VENTANAL NOCTURNO
            =================================================================== */}
        <div ref={cardRef} className="auth-card-right-screen shrink-0 my-auto text-center z-10">
          
          {/* Badge Circular con el Logo 3D Rotatorio */}
          <div className="w-18 h-18 rounded-full bg-slate-950/90 border border-cyan-400/70 p-2 shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center mx-auto mb-4">
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
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            Bienvenido
          </h2>

          {/* Línea Decorativa Acento - • - */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-5 h-0.5 rounded-full bg-cyan-400/90" />
            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
            <div className="w-5 h-0.5 rounded-full bg-purple-400/90" />
          </div>

          {/* Mensaje de Error si Ocurre */}
          {(errorMessage || authError) && (
            <div className="w-full p-3 mb-5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
              ⚠️ {errorMessage || authError}
            </div>
          )}

          {/* LOS 3 BOTONES DE ACCESO POR ROL */}
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
  );
}

export default LoginView;
