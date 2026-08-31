import React from 'react';
import { useLogin } from '../hooks/useLogin';

import LoginStyles from '../components/LoginStyles';
import Login3DCard from '../components/Login3DCard';
import LoginStreetlamps from '../components/LoginStreetlamps';
import LoginMascot from '../components/LoginMascot';

export default function LoginView() {
  const {
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
  } = useLogin();

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="login-view-container"
    >
      <LoginStyles />

      {/* Capa de Sombra sobre la Imagen de Fondo */}
      <div className="bg-overlay-tint" />

      <Login3DCard
        cardRef={cardRef}
        isFlipped={isFlipped}
        setIsFlipped={setIsFlipped}
        errorMessage={errorMessage}
        authError={authError}
        isSubmitting={isSubmitting}
        authLoading={authLoading}
        handleJiraAuth={handleJiraAuth}
        handleLocalDevLogin={handleLocalDevLogin}
      />

      <LoginStreetlamps />
      
      <LoginMascot />
    </div>
  );
}
