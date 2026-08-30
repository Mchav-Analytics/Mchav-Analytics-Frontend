import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DevAlertsEmpty() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-[#272b5c]/80 text-center shadow-sm">
      <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Selecciona un Proyecto</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
        Para ver tus alertas, selecciona en qué proyecto deseas trabajar desde el selector superior.
      </p>
    </div>
  );
}
