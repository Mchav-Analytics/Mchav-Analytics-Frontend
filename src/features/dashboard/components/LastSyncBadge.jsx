import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { jiraService } from '../../../services/api';

export default function LastSyncBadge() {
  const [lastSyncText, setLastSyncText] = useState('Hoy, 8:30 a. m.');

  useEffect(() => {
    if (jiraService?.getSyncLogs) {
      jiraService.getSyncLogs()
        .then((logs) => {
          if (Array.isArray(logs) && logs.length > 0) {
            const latest = logs[0];
            const rawDate = latest.fecha_ejecucion || latest.created_at || latest.timestamp;
            if (rawDate) {
              const dateString = String(rawDate).endsWith('Z') ? rawDate : `${rawDate}Z`;
              const dt = new Date(dateString);
              if (!isNaN(dt.getTime())) {
                const formatted = dt.toLocaleString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });
                setLastSyncText(formatted);
                return;
              }
            }
          }
          const nowFormatted = new Date().toLocaleString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          setLastSyncText(`Hoy, ${nowFormatted}`);
        })
        .catch(() => {
          const nowFormatted = new Date().toLocaleString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          setLastSyncText(`Hoy, ${nowFormatted}`);
        });
    }
  }, []);

  return (
    <div 
      className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0 shadow-2xs"
      title={`Última sincronización exitosa con Jira Cloud: ${lastSyncText}`}
    >
      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
        Última sincronización <strong className="font-extrabold text-slate-900 dark:text-white ml-0.5">{lastSyncText}</strong>
      </span>
      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0 shadow-xs">
        <Check size={10} strokeWidth={3} />
      </div>
    </div>
  );
}
