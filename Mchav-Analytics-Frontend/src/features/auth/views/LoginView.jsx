import React from 'react';
import { authService } from '../../../services/api';
import logoImg from '../../../assets/logo.jpg';

function LoginView() {
  const handleJiraLogin = () => {
    window.location.href = authService.getLoginUrl();
  };

  return (
    <div className="dark-theme dark" style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-dark)', backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(13, 148, 136, 0.2) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(30, 58, 138, 0.2) 0%, transparent 50%)' }}>
      <div className="login-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <div style={{ position: 'absolute', inset: '-4px', borderRadius: '24px', background: 'linear-gradient(135deg, #0d9488, #3b82f6, #8b5cf6)', filter: 'blur(12px)', opacity: 0.6 }} />
          <img 
            src={logoImg} 
            alt="MCHAV Analytics Logo" 
            style={{ position: 'relative', width: '84px', height: '84px', borderRadius: '20px', objectFit: 'cover', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} 
          />
        </div>

        <h1 className="login-title">MCHAV Analytics</h1>
        <p className="login-subtitle">
          Conecta tu espacio de trabajo para visualizar métricas avanzadas y tomar decisiones basadas en datos.
        </p>
        
        <button onClick={handleJiraLogin} className="jira-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.34H22V2h-10.47zm0 10.43c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.34H22v-10.39H11.53zm-9.53-1.3c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.34H12v-10.39H2z"/>
          </svg>
          Iniciar sesión con Jira
        </button>
      </div>
    </div>
  );
}

export default LoginView;
