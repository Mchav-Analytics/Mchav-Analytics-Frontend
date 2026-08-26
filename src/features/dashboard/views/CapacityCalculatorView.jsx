// ============================================================================
// FEATURE DASHBOARD — VISTA SEPARADA DE CALCULADORA DE CAPACIDAD (LÍDER TÉCNICO)
// ============================================================================

import React, { useState } from 'react';
import CapacitySimulator from '../components/CapacitySimulator';
import { Calculator, Sparkles } from 'lucide-react';
import LiderNotificationBell from '../components/LiderNotificationBell';

export default function CapacityCalculatorView({ isDarkMode }) {
  const [devCount, setDevCount] = useState(4);
  const [sprintDays, setSprintDays] = useState(10);
  const [vacationDays, setVacationDays] = useState(2);
  const [sickDevsCount, setSickDevsCount] = useState(0);
  const [sickDays, setSickDays] = useState(0);
  const [avgDevVelocity, setAvgDevVelocity] = useState(10);

  return (
    <div className="space-y-6 font-sans text-left">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/20">
            <Calculator size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                Liderazgo Técnico
              </span>
              <span className="text-xs text-slate-400">• Herramienta de Planificación</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Calculadora y Simulador de Capacidad
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Simula el impacto de ausencias e incapacidades sobre la velocidad estimada y disponibilidad neta del equipo para el Sprint.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <LiderNotificationBell />
        </div>
      </div>

      {/* Componente Interactivo de Simulador */}
      <CapacitySimulator
        devCount={devCount}
        setDevCount={setDevCount}
        sprintDays={sprintDays}
        setSprintDays={setSprintDays}
        vacationDays={vacationDays}
        setVacationDays={setVacationDays}
        sickDevsCount={sickDevsCount}
        setSickDevsCount={setSickDevsCount}
        sickDays={sickDays}
        setSickDays={setSickDays}
        avgDevVelocity={avgDevVelocity}
        setAvgDevVelocity={setAvgDevVelocity}
        onClose={null}
      />
    </div>
  );
}
