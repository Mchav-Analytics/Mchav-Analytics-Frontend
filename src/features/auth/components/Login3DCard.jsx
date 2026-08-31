import React from 'react';
import logoOfficialImg from '../../../assets/mchav_official_logo.png';

export default function Login3DCard({
  cardRef,
  isFlipped,
  setIsFlipped,
  errorMessage,
  authError,
  isSubmitting,
  authLoading,
  handleJiraAuth,
  handleLocalDevLogin
}) {
  return (
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
                <div className="my-4 w-full flex flex-col gap-2.5">
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

                  {/* Acceso de Desarrollo Directo */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleLocalDevLogin(); }}
                    className="w-full h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>⚡ Acceso Rápido Desarrollo (Demo)</span>
                  </button>
                </div>

                <div
                  onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                  className="text-xs xl:text-sm text-slate-400 hover:text-cyan-300 transition-colors pt-2 cursor-pointer"
                >
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
