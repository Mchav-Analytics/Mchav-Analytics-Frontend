import React from 'react';

export const STAGE_EXPLANATIONS = {
  'Desarrollo Activo': {
    icon: '⚙️',
    description: 'Tiempo real en que los desarrolladores están escribiendo código, creando lógica o corrigiendo bugs activos.',
    type: 'Tiempo Activo'
  },
  'Revisión de Código': {
    icon: '🔍',
    description: 'Tiempo en que las Pull Requests (PRs) están abiertas esperando revisión por pares o por el Líder Técnico.',
    type: 'Tiempo de Fricción / Espera'
  },
  'Pruebas de Calidad (QA)': {
    icon: '🧪',
    description: 'Tiempo en que las tareas entregadas están en ambiente de pruebas siendo validadas por el equipo de QA.',
    type: 'Tiempo de Validación'
  },
  'En Cola de Espera': {
    icon: '⏳',
    description: 'Tiempo inactivo o congelado en backlog / Por Hacer antes de que el trabajo sea iniciado.',
    type: 'Tiempo Inactivo / Cola'
  }
};

export const CustomFlowTooltip = ({ active, payload, isDark }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const stageName = data.spanishStage || data.stage;
    const info = STAGE_EXPLANATIONS[stageName] || {
      icon: '📊',
      description: 'Días acumulados en esta fase del flujo de trabajo.',
      type: 'Etapa del Sprint'
    };

    return (
      <div className={`p-3.5 rounded-xl border shadow-2xl max-w-xs font-sans text-xs space-y-2 backdrop-blur-md ${
        isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-bold flex items-center gap-1.5 text-sm">
            <span>{info.icon}</span>
            <span>{stageName}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
            {info.type}
          </span>
        </div>
        
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-slate-500 dark:text-slate-400">Tiempo Acumulado:</span>
          <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">{data.days} días</span>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
          💡 <strong>¿Qué significa?</strong> {info.description}
        </p>
      </div>
    );
  }
  return null;
};
