// ============================================================================
// FEATURE AUTH — VISTA DE INICIO DE SESIÓN CON FONDO DE OFICINA Y TARJETA DERECHA
// ============================================================================
// - Fondo General: Imagen real de oficina empresarial con ventanal nocturno (login_bg.jpg).
// - Zona Izquierda: Logo MCHAV, eslogan "Datos que impulsan decisiones.", los 3 íconos
//   (Visualiza, Analiza, Decide), pedestal holográfico 3D sobre el piso y badges al pie.
// - Zona Derecha (Tarjeta Flotante): Réplica exacta de la tarjeta central con el logo
//   cuadrado, título "MCHAV Analytics", subtítulo descriptivo y los 3 botones de rol.

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

        /* Capa de oscurecimiento suave para alto contraste */
        .bg-overlay-tint {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 75% 50%, rgba(3, 7, 18, 0.45) 0%, rgba(3, 7, 18, 0.8) 100%);
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

        /* TARJETA DERECHA DE AUTENTICACIÓN (RÉPLICA EXACTA DE LA CAPTURA SOLICITADA) */
        .auth-card-right-screen {
          width: 100%;
          max-width: 430px;
          background: rgba(13, 19, 35, 0.84);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 32px;
          padding: 2.75rem 2.25rem;
          box-shadow:
            0 30px 90px rgba(0, 0, 0, 0.88),
            0 0 40px rgba(6, 182, 212, 0.08);
          transform: perspective(1000px) 
                     rotateX(calc(var(--mouse-norm-y, 0) * -2deg)) 
                     rotateY(calc(var(--mouse-norm-x, 0) * 2deg));
          transition: transform 0.2s ease-out;
        }

        /* Pedestal 3D Holográfico */
        .pedestal-plate {
          transform: perspective(900px) rotateX(20deg) rotateY(-8deg);
          transform-style: preserve-3d;
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.95);
        }

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
            ZONA IZQUIERDA: BRANDING, ESLOGAN Y METRICAS SOBRE EL FONDO REAL
            =================================================================== */}
        <div className="hidden lg:flex flex-1 flex-col justify-between h-full pr-12 text-left py-2">

          {/* Header Marca: Logo Oficial + MCHAV + Píldora ANALYTICS */}
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-full bg-slate-900/90 border border-cyan-400/60 p-1 shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center overflow-hidden shrink-0">
              <img src={logoOfficialImg} alt="MCHAV Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">MCHAV</span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 backdrop-blur-md uppercase tracking-widest">ANALYTICS</span>
            </div>
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
            ZONA DERECHA: TARJETA SOLICITADA EN EL LADO DERECHO SOBRE EL FONDO
            =================================================================== */}
        <div ref={cardRef} className="auth-card-right-screen shrink-0 my-auto text-center">

          {/* Badge Cuadrado Oscuro del Logo Superior */}
          <div className="w-18 h-18 rounded-2xl bg-slate-950/90 border border-slate-700/80 p-2 shadow-xl flex items-center justify-center mx-auto mb-4">
            <img src={logoOfficialImg} alt="MCHAV Official Logo" className="w-full h-full object-contain" />
          </div>

          {/* Título Principal MCHAV Analytics */}
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            MCHAV Analytics
          </h1>

          {/* Subtítulo Descriptivo */}
          <p className="text-xs text-slate-300/80 leading-relaxed max-w-xs mx-auto mb-7 font-normal">
            Conecta tu espacio de trabajo para visualizar métricas avanzadas y tomar decisiones basadas en datos.
          </p>

          {/* Mensaje de Error si Ocurre */}
          {(errorMessage || authError) && (
            <div className="w-full p-3 mb-5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
              ⚠️ {errorMessage || authError}
            </div>
          )}

          {/* LOS 3 BOTONES DE ROL */}
          <div className="space-y-3.5">

            {/* Botón 1: Ingresar como Desarrollador */}
            <button
              type="button"
              onClick={() => handleRoleLogin('dev@mchav.com', 'DEVELOPER')}
              disabled={isSubmitting || authLoading}
              className="btn-dev-teal w-full h-13 px-5 rounded-2xl text-white font-extrabold text-xs flex items-center justify-center gap-3 cursor-pointer group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span>Ingresar como Desarrollador</span>
            </button>

            {/* Botón 2: Ingresar como Líder Técnico */}
            <button
              type="button"
              onClick={() => handleRoleLogin('aftorres@mchav.com', 'MANAGER')}
              disabled={isSubmitting || authLoading}
              className="btn-manager-purple w-full h-13 px-5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-3 cursor-pointer group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Ingresar como Líder Técnico</span>
            </button>

            {/* Botón 3: Ingresar como Administrador */}
            <button
              type="button"
              onClick={() => handleRoleLogin('vhoyos@mchav.com', 'ADMIN')}
              disabled={isSubmitting || authLoading}
              className="btn-admin-blue w-full h-13 px-5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-3 cursor-pointer group"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400 group-hover:scale-110 transition-transform">
                <polygon points="12 2 2 12 12 22 22 12" />
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
