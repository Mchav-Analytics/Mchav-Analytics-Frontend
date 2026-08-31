import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function useLogin() {
  const navigate = useNavigate();
  const { loginWithJira, isAuthenticated, loading: authLoading, error: authError } = useAuth();

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

  const handleLocalDevLogin = () => {
    setIsSubmitting(true);
    const userSession = {
      email: 'admin@mchav.com',
      rol: 'ADMIN',
      name: 'Administrador MCHAV',
      activo: true
    };
    localStorage.setItem('mock_user_session', JSON.stringify(userSession));
    window.location.href = '/dashboard';
  };

  return {
    isFlipped, setIsFlipped,
    isSubmitting,
    errorMessage,
    authLoading,
    authError,
    containerRef,
    cardRef,
    handleMouseMove,
    handleMouseLeave,
    handleJiraAuth,
    handleLocalDevLogin
  };
}
