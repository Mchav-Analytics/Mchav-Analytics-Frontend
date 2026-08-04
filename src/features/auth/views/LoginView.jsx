// ============================================================================
// FEATURE AUTH — VISTA DE INICIO DE SESIÓN PREMIUM (SIN GOTAS Y CON PARALLAX)
// ============================================================================
// Réplica exacta del diseño con soporte para selección de rol (Administrador vs Desarrollador):
// - En Modo Desarrollo (USE_MOCK_DATA = true), permite ingresar como Administrador o Desarrollador.
// - Fondo limpio con Aurora Blobs resplandecientes, malla tecnológica y tarjeta Glassmorphism 3D.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../../../assets/logo.jpg';

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

  // Manejar el movimiento global del cursor para la animación interactiva de paralaje
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { innerWidth, innerHeight } = window;
    
    // Normalizar coordenadas del cursor de -1 a 1
    const normX = ((e.clientX / innerWidth) - 0.5) * 2;
    const normY = ((e.clientY / innerHeight) - 0.5) * 2;

    containerRef.current.style.setProperty('--mouse-norm-x', normX);
    containerRef.current.style.setProperty('--mouse-norm-y', normY);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current.style.setProperty('--mouse-x', `${x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  // Restablecer posición suavemente cuando el cursor sale de la pantalla
  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--mouse-norm-x', 0);
      containerRef.current.style.setProperty('--mouse-norm-y', 0);
    }
  };

  // Iniciar sesión con un rol específico (Admin o Desarrollador)
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
      className="login-wrapper"
    >
      <style>{`
        .login-wrapper {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #ffffff;
        }

        .stars-bg-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        #stars, #stars2, #stars3 {
          position: absolute;
          background: transparent;
        }

        .card-blob-wrapper {
          position: relative;
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
          box-sizing: border-box;
          border-radius: 36px;
          z-index: 10;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.7);
          transform: perspective(1000px) 
                     rotateX(calc(var(--mouse-norm-y, 0) * -5deg)) 
                     rotateY(calc(var(--mouse-norm-x, 0) * 5deg));
          transition: transform 0.15s ease-out, box-shadow 0.3s ease;
        }

        .card-blob-wrapper:hover {
          transform: perspective(1000px) 
                     rotateX(calc(var(--mouse-norm-y, 0) * -7deg)) 
                     rotateY(calc(var(--mouse-norm-x, 0) * 7deg))
                     translateY(-4px);
          box-shadow: 0 40px 80px -15px rgba(0, 0, 0, 0.85);
        }

        /* Gota animada en degradado cian/violeta que emerge activamente al hacer hover sobre la tarjeta (Uiverse.io por dylanharriscameron) */
        .blob {
          position: absolute;
          z-index: 1;
          top: 50%;
          left: 50%;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00f2fe 0%, #38bdf8 35%, #8b5cf6 70%, #d946ef 100%);
          opacity: 0;
          filter: blur(30px);
          transition: opacity 0.35s ease-in-out;
          animation: blob-bounce 6s infinite ease-in-out;
          pointer-events: none;
        }

        .card-blob-wrapper:hover .blob {
          opacity: 0.95;
        }

        @keyframes blob-bounce {
          0% {
            transform: translate(-100%, -100%) translate3d(0, 0, 0);
          }
          25% {
            transform: translate(-100%, -100%) translate3d(120%, 0, 0);
          }
          50% {
            transform: translate(-100%, -100%) translate3d(120%, 120%, 0);
          }
          75% {
            transform: translate(-100%, -100%) translate3d(0, 120%, 0);
          }
          100% {
            transform: translate(-100%, -100%) translate3d(0, 0, 0);
          }
        }

        .exact-glass-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
          box-sizing: border-box;
          padding: 3.25rem 2.5rem 2.75rem;
          border-radius: 36px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1.5px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .exact-glass-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 36px;
          padding: 1.5px;
          background: radial-gradient(
            500px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(255, 255, 255, 0.35),
            transparent 45%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .mchav-icon-box {
          width: 80px;
          height: 80px;
          border-radius: 22px;
          background: rgba(15, 23, 42, 0.75);
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .exact-title {
          font-size: 2.1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-bottom: 0.85rem;
          line-height: 1.1;
        }

        .exact-subtitle {
          font-size: 0.925rem;
          color: #cbd5e1;
          line-height: 1.55;
          margin-bottom: 2rem;
          padding: 0 0.5rem;
          font-weight: 400;
        }

        .role-btn-primary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(30, 58, 138, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%);
          color: #ffffff;
          font-weight: 600;
          font-size: 0.95rem;
          border: 1.5px solid rgba(59, 130, 246, 0.4);
          cursor: pointer;
          box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.6);
          transition: all 0.25s ease;
        }

        .role-btn-primary:hover {
          transform: translateY(-2px);
          background: linear-gradient(180deg, rgba(37, 99, 235, 0.95) 0%, rgba(30, 58, 138, 0.95) 100%);
          border-color: rgba(96, 165, 250, 0.6);
        }

        .role-btn-secondary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(13, 148, 136, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
          color: #ffffff;
          font-weight: 600;
          font-size: 0.95rem;
          border: 1.5px solid rgba(45, 212, 191, 0.4);
          cursor: pointer;
          box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.6);
          transition: all 0.25s ease;
        }

        .role-btn-secondary:hover {
          transform: translateY(-2px);
          background: linear-gradient(180deg, rgba(20, 184, 166, 0.95) 0%, rgba(13, 148, 136, 0.95) 100%);
          border-color: rgba(45, 212, 191, 0.6);
        }

        .role-btn-manager {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
          color: #ffffff;
          font-weight: 600;
          font-size: 0.95rem;
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          cursor: pointer;
          box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.6);
          transition: all 0.25s ease;
        }

        .role-btn-manager:hover {
          transform: translateY(-2px);
          background: linear-gradient(180deg, rgba(124, 58, 237, 0.95) 0%, rgba(109, 40, 217, 0.95) 100%);
          border-color: rgba(167, 139, 250, 0.6);
        }
      `}</style>

      {/* Fondo Animado Espacial con Estrellas (Uiverse.io por jaykdoe) */}
      <div className="stars-bg-container">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      {/* Luces Neón de Fondo (Cian y Violeta) */}
      <div className="neon-blob neon-cyan" />
      <div className="neon-blob neon-purple" />

      {/* Tarjeta Glassmorphism Central */}
      <div 
        ref={cardRef}
        className="exact-glass-card"
      >
        {/* Contenedor Cuadrado con Logo MCHAV */}
        <div className="mchav-icon-box">
          <img 
            src={logoImg} 
            alt="MCHAV Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>

        {/* Título Principal */}
        <h1 className="exact-title">
          MCHAV Analytics
        </h1>

        {/* Subtítulo / Descripción */}
        <p className="exact-subtitle">
          Conecta tu espacio de trabajo para visualizar métricas avanzadas y tomar decisiones basadas en datos.
        </p>

        {/* Alerta de Error */}
        {(errorMessage || authError) && (
          <div style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: '0.825rem', marginBottom: '1.5rem' }}>
            ⚠️ {errorMessage || authError}
          </div>
        )}

        {/* Botones de Selección de Rol en Modo Mock / Atlassian */}
        <div className="w-full space-y-3">
          <button 
            type="button"
            onClick={() => handleRoleLogin('dev@mchav.com', 'DEVELOPER')}
            disabled={isSubmitting || authLoading}
            className="role-btn-secondary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>{isSubmitting ? "Conectando..." : "Ingresar como Desarrollador"}</span>
          </button>

          <button 
            type="button"
            onClick={() => handleRoleLogin('aftorres@mchav.com', 'MANAGER')}
            disabled={isSubmitting || authLoading}
            className="role-btn-manager"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>{isSubmitting ? "Conectando..." : "Ingresar como Líder Técnico"}</span>
          </button>

          <button 
            type="button"
            onClick={() => handleRoleLogin('vhoyos@mchav.com', 'ADMIN')}
            disabled={isSubmitting || authLoading}
            className="role-btn-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.571 1.99998C11.332 2.0007 11.103 2.09676 10.934 2.26698L2.267 10.934C2.09678 11.103 2.00072 11.332 2 11.571C2.00072 11.81 2.09678 12.039 2.267 12.208L10.934 20.875C11.103 21.0452 11.332 21.1413 11.571 21.142C11.81 21.1413 12.039 21.0452 12.208 20.875L20.875 12.208C21.0452 12.039 21.1413 11.81 21.142 11.571C21.1413 11.332 21.0452 11.103 20.875 10.934L12.208 2.26698C12.039 2.09676 11.81 2.0007 11.571 1.99998Z" fill="#0052CC"/>
              <path d="M11.571 1.99998V11.571L20.875 10.934C21.0452 11.103 21.1413 11.332 21.142 11.571C21.1413 11.81 20.934 12.039 20.875 12.208L12.208 20.875V11.571L11.571 1.99998Z" fill="#2684FF"/>
            </svg>
            <span>{isSubmitting ? "Conectando..." : "Ingresar como Administrador"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default LoginView;
