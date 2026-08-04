// ============================================================================
// FEATURE AUTH — VISTA DE INICIO DE SESIÓN CON RÉPLICA EXACTA DE LA TARJETA
// ============================================================================
// - Fondo General: Imagen de oficina empresarial nocturna (login_bg.jpg).
// - Tarjeta de Autenticación (Derecha): Réplica 1:1 de la tarjeta con borde sutil
//   bicolor, logo circular MCHAV, "Bienvenido", la barra cian y los 3 botones de rol.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../../../assets/logo.jpg';
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          color: #ffffff;
        }

        /* Capa de oscurecimiento suave para alto contraste */
        .bg-overlay-tint {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 75% 50%, rgba(3, 7, 18, 0.45) 0%, rgba(3, 7, 18, 0.75) 100%);
          pointer-events: none;
          z-index: 1;
        }

        /* Marco Principal de 2 Zonas */
        .login-main-frame {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1280px;
          height: calc(100vh - 4rem);
          max-height: 720px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
        }

        /* TARJETA DERECHA DE AUTENTICACIÓN (RÉPLICA EXACTA DE LA IMAGEN DE REFERENCIA) */
        .auth-card-right {
          width: 100%;
          max-width: 420px;
          background: rgba(11, 17, 32, 0.82);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1.5px solid rgba(56, 189, 248, 0.25);
          border-radius: 32px;
          padding: 3rem 2.25rem;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.9), 
                      0 0 35px rgba(168, 85, 247, 0.15),
                      inset 0 1px 1px rgba(255, 255, 255, 0.15);
          transform: perspective(1000px) 
                     rotateX(calc(var(--mouse-norm-y, 0) * -2deg)) 
                     rotateY(calc(var(--mouse-norm-x, 0) * 2deg));
          transition: transform 0.2s ease-out;
        }

        /* Pedestal 3D Holográfico */
        .pedestal-plate {
          transform: perspective(900px) rotateX(24deg) rotateY(-8deg);
          transform-style: preserve-3d;
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.95);
        }

        /* Botón de Rol 1 (Cian / Violeta Iniciar Sesión) */
        .btn-role-cyan {
          background: linear-gradient(90deg, #00c6ff 0%, #0072ff 50%, #7c3aed 100%);
          transition: all 0.25s ease;
          box-shadow: 0 10px 25px -5px rgba(0, 198, 255, 0.35);
        }

        .btn-role-cyan:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px -4px rgba(0, 198, 255, 0.5);
          filter: brightness(1.1);
        }

        /* Botón de Rol 2 (Líder Técnico Vidrio Púrpura) */
        .btn-role-purple {
          background: rgba(124, 58, 237, 0.18);
          border: 1.5px solid rgba(167, 139, 250, 0.4);
          transition: all 0.25s ease;
        }

        .btn-role-purple:hover {
          transform: translateY(-2px);
          background: rgba(124, 58, 237, 0.35);
          border-color: rgba(167, 139, 250, 0.7);
        }

        /* Botón de Rol 3 (Administrador Atlassian Blue) */
        .btn-role-blue {
          background: rgba(15, 23, 42, 0.85);
          border: 1.5px solid rgba(59, 130, 246, 0.4);
          transition: all 0.25s ease;
        }

        .btn-role-blue:hover {
          transform: translateY(-2px);
          background: rgba(30, 58, 138, 0.4);
          border-color: rgba(96, 165, 250, 0.7);
        }
      `}</style>

      {/* Capa de Sombra sobre la Imagen de Fondo */}
      <div className="bg-overlay-tint" />

      {/* MARCO PRINCIPAL EN 2 ZONAS */}
      <div className="login-main-frame">
        
        {/* ===================================================================
            ZONA IZQUIERDA: BRANDING, ESLOGAN Y METRICAS SOBRE EL FONDO REAL
            =================================================================== */}
        <div className="hidden lg:flex flex-1 flex-col justify-between h-full pr-12 text-left py-2">
          
          {/* Logo MCHAV Analytics Superior Izquierdo */}
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-full bg-slate-900/90 border border-cyan-500/50 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center overflow-hidden shrink-0">
              <img src={logoImg} alt="MCHAV Analytics Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">MCHAV</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">ANALYTICS</span>
            </div>
          </div>

          {/* Eslogan Principal e Íconos Circulares */}
          <div className="space-y-6 my-auto pt-2 z-10">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
                Datos que <br />
                impulsan <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">decisiones.</span>
              </h1>
              
              {/* Línea decorativa fina cyan -> violeta */}
              <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 mt-4 shadow-sm" />
            </div>

            {/* Los 3 Íconos Circulares: Visualiza, Analiza, Decide */}
            <div className="flex items-center gap-9 pt-2">
              <div className="flex flex-col items-center gap-2">
                <div className="w-13 h-13 rounded-full border border-cyan-500/50 bg-slate-950/80 backdrop-blur-md text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] p-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                </div>
                <span className="text-xs font-bold text-slate-200 drop-shadow">Visualiza</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-13 h-13 rounded-full border border-purple-500/50 bg-slate-950/80 backdrop-blur-md text-purple-400 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] p-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <span className="text-xs font-bold text-slate-200 drop-shadow">Analiza</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-13 h-13 rounded-full border border-indigo-500/50 bg-slate-950/80 backdrop-blur-md text-indigo-400 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] p-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/></svg>
                </div>
                <span className="text-xs font-bold text-slate-200 drop-shadow">Decide</span>
              </div>
            </div>

            {/* Pedestal de Gráficos 3D Holográfico sobre el Piso */}
            <div className="relative w-full max-w-md h-48 pt-2">
              <div className="pedestal-plate w-full h-40 bg-slate-950/75 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 relative overflow-hidden flex items-end justify-between">
                
                {/* SVG de Ondas Flotantes de Análisis */}
                <svg className="absolute inset-0 w-full h-full opacity-45" viewBox="0 0 300 120">
                  <path d="M 0,90 Q 75,25 150,65 T 300,15" fill="none" stroke="#06b6d4" strokeWidth="3.5" />
                  <path d="M 0,100 Q 75,40 150,80 T 300,30" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" />
                </svg>

                {/* Barras 3D Neón en Ángulo */}
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

          {/* Insignias de Seguridad al Pie Izquierdo */}
          <div className="flex items-center gap-7 text-xs text-slate-300 font-semibold z-10 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">🛡️</span> Seguro
            </div>
            <div className="h-3.5 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-purple-400">🔒</span> Confiable
            </div>
            <div className="h-3.5 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-sky-400">☁️</span> En tiempo real
            </div>
          </div>

        </div>

        {/* ===================================================================
            ZONA DERECHA: TARJETA DE AUTENTICACIÓN (RECREACIÓN 1:1 CON LOS 3 BOTONES)
            =================================================================== */}
        <div ref={cardRef} className="auth-card-right shrink-0 my-auto text-center">
          
          <div className="space-y-6">
            
            {/* Isotipo Circular Flotante MCHAV con Anillo Neón Cian */}
            <div className="w-20 h-20 rounded-full bg-slate-950/90 p-1 border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center relative mx-auto">
              <img src={logoImg} alt="MCHAV Logo" className="w-full h-full object-cover rounded-full" />
            </div>

            {/* Título Bienvenido y Barra Cian */}
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Bienvenido</h2>
              <div className="w-8 h-1 rounded-full bg-cyan-400 mx-auto mt-2" />
            </div>

            {/* Mensaje de Error */}
            {(errorMessage || authError) && (
              <div className="w-full p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                ⚠️ {errorMessage || authError}
              </div>
            )}

            {/* BOTONES DE INGRESO DIRECTO POR ROL (RÉPLICA EXACTA DE LA TARJETA) */}
            <div className="space-y-3.5 pt-2">
              
              {/* Botón 1: Desarrollador */}
              <button 
                type="button"
                onClick={() => handleRoleLogin('dev@mchav.com', 'DEVELOPER')}
                disabled={isSubmitting || authLoading}
                className="btn-role-cyan w-full h-13 px-5 rounded-2xl text-white font-extrabold text-xs flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  </div>
                  <span className="text-left font-extrabold text-slate-100">Ingresar como Desarrollador</span>
                </div>
                <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
              </button>

              {/* Botón 2: Líder Técnico */}
              <button 
                type="button"
                onClick={() => handleRoleLogin('aftorres@mchav.com', 'MANAGER')}
                disabled={isSubmitting || authLoading}
                className="btn-role-purple w-full h-13 px-5 rounded-2xl text-white font-bold text-xs flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <span className="text-left font-bold text-slate-100">Ingresar como Líder Técnico</span>
                </div>
                <span className="text-purple-300 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              {/* Botón 3: Administrador */}
              <button 
                type="button"
                onClick={() => handleRoleLogin('vhoyos@mchav.com', 'ADMIN')}
                disabled={isSubmitting || authLoading}
                className="btn-role-blue w-full h-13 px-5 rounded-2xl text-white font-bold text-xs flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.571 1.99998C11.332 2.0007 11.103 2.09676 10.934 2.26698L2.267 10.934C2.09678 11.103 2.00072 11.332 2 11.571C2.00072 11.81 2.09678 12.039 2.267 12.208L10.934 20.875C11.103 21.0452 11.332 21.1413 11.571 21.142C11.81 21.1413 12.039 21.0452 12.208 20.875L20.875 12.208C21.0452 12.039 21.1413 11.81 21.142 11.571C21.1413 11.332 21.0452 11.103 20.875 10.934L12.208 2.26698C12.039 2.09676 11.81 2.0007 11.571 1.99998Z" fill="#0052CC"/>
                      <path d="M11.571 1.99998V11.571L20.875 10.934C21.0452 11.103 21.1413 11.332 21.142 11.571C21.1413 11.81 20.934 12.039 20.875 12.208L12.208 20.875V11.571L11.571 1.99998Z" fill="#2684FF"/>
                    </svg>
                  </div>
                  <span className="text-left font-bold text-slate-100">Ingresar como Administrador</span>
                </div>
                <span className="text-blue-300 group-hover:translate-x-1 transition-transform">→</span>
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LoginView;
