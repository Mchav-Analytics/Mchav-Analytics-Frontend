// ============================================================================
// FEATURE AUTH — GUARDIÁN DE RUTAS PROTEGIDAS (PROTECTED ROUTE)
// ============================================================================
// Restringe el acceso a rutas protegidas (como /dashboard). Si el usuario no ha
// iniciado sesión, lo redirige automáticamente a la pantalla de Login (/).

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Muestra spinner de carga mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', color: '#94a3b8' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(13, 148, 136, 0.2)', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }} />
        <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>Verificando credenciales de acceso...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirige al Login si no hay sesión activa
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
