import React from 'react';
import loginBgImg from '../../../assets/login_bg.jpg';

export default function LoginStyles() {
  return (
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
        background: linear-gradient(90deg, rgba(3, 7, 18, 0.45) 0%, rgba(3, 7, 18, 0.05) 40%, rgba(3, 7, 18, 0.15) 100%);
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

      /* CONTENEDOR SECCIÓN MASCOTA (APOYADA EN LA ACERA AL PIE DE LA PANTALLA) */
      .login-mascot-section {
        position: absolute;
        bottom: 0;
        right: clamp(1.5rem, 6vw, 10vw);
        width: auto;
        height: auto;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        z-index: 20;
        pointer-events: none;
        padding-bottom: 0;
      }

      @media (min-width: 1536px) {
        .login-mascot-section {
          right: clamp(2.5rem, 8vw, 12vw);
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

      /* ===================================================================
          ZONAS DE LUZ INTERACTIVAS SOBRE LAS FAROLAS REALES DEL FONDO
          =================================================================== */
      .real-streetlamp-target {
        position: absolute;
        width: 70px;
        height: 70px;
        transform: translate(-50%, -50%);
        cursor: pointer;
        pointer-events: auto;
        z-index: 30;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Resplandor neón radiante que se enciende sobre el farol de la foto al hacer hover */
      .real-streetlamp-target .lamp-light-bloom {
        position: absolute;
        width: 65px;
        height: 65px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, var(--lamp-glow, #c084fc) 40%, transparent 80%);
        opacity: 0;
        transform: scale(0.4);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: none;
      }

      /* Pulsación sutil de farola interactiva en reposo */
      .real-streetlamp-target .lamp-beacon-pulse {
        position: absolute;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: #ffffff;
        box-shadow: 0 0 12px var(--lamp-glow, #c084fc), 0 0 24px var(--lamp-glow, #c084fc);
        animation: beaconPulse 2.5s ease-in-out infinite;
        pointer-events: none;
        opacity: 0.85;
        transition: opacity 0.3s ease;
      }

      @keyframes beaconPulse {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.4); opacity: 1; filter: drop-shadow(0 0 10px var(--lamp-glow, #c084fc)); }
      }

      /* ESTADO HOVER */
      .real-streetlamp-target:hover .lamp-light-bloom {
        opacity: 1;
        transform: scale(2.4);
        filter: drop-shadow(0 0 25px #ffffff) drop-shadow(0 0 50px var(--lamp-glow, #c084fc));
      }

      .real-streetlamp-target:hover .lamp-beacon-pulse {
        opacity: 0;
      }

      /* Tarjeta de información desplegable al hacer hover */
      .real-streetlamp-target .lamp-tooltip-card {
        position: absolute;
        left: 108%;
        top: 50%;
        transform: translateY(-50%) scale(0.9);
        width: 240px;
        padding: 15px;
        border-radius: 16px;
        background-color: rgba(6, 11, 23, 0.96);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.95), 0 0 35px var(--lamp-glow, #c084fc);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), visibility 0.3s ease;
        pointer-events: none;
        z-index: 40;
      }

      .real-streetlamp-target:hover .lamp-tooltip-card {
        opacity: 1;
        visibility: visible;
        transform: translateY(-50%) scale(1);
        pointer-events: auto;
      }
    `}</style>
  );
}
