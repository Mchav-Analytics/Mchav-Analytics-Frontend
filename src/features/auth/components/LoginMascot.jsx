import React from 'react';
import owlMascotImg from '../../../assets/owl_mascot.png';

export default function LoginMascot() {
  return (
    <div className="login-mascot-section">
      <div className="hidden lg:flex flex-col items-center justify-end relative z-10 pointer-events-none select-none">
        
        {/* Globito de Diálogo Tipo Chat (Mensaje de Conversación) */}
        <div className="relative mb-3 p-4 xl:p-5 rounded-2xl rounded-bl-xs bg-slate-950/90 backdrop-blur-xl border border-cyan-500/45 shadow-[0_15px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(6,182,212,0.25)] max-w-[270px] xl:max-w-[300px] 2xl:max-w-[330px] transition-all duration-300 pointer-events-auto">
          <p className="text-xs xl:text-sm text-slate-100 font-semibold leading-relaxed">
            “No buscamos mostrar más datos. Buscamos <span className="text-cyan-400 font-bold">transformar datos en decisiones</span>.”
          </p>
          <div className="w-10 xl:w-12 h-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mt-2.5 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />

          {/* Cola del Globito de Conversación apuntando a la mascota */}
          <div className="absolute -bottom-3.5 left-6 w-0 h-0 border-r-[12px] border-r-transparent border-l-[2px] border-l-transparent border-t-[14px] border-t-slate-950/95" />
        </div>

        {/* Imagen de la Mascota Búho (Volteada horizontalmente mirando a la izquierda) */}
        <div className="relative w-[280px] h-[340px] xl:w-[360px] xl:h-[430px] 2xl:w-[420px] 2xl:h-[490px] flex items-end justify-center transition-all duration-300">
          <img
            src={owlMascotImg}
            alt="Mascota Búho MCHAV Analytics"
            className="w-full h-full object-contain -scale-x-100 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] transition-transform duration-500"
          />
        </div>

      </div>
    </div>
  );
}
