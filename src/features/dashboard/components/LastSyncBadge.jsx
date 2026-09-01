import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { jiraService } from '../../../services/api';

export default function LastSyncBadge() {
  const [lastSyncText, setLastSyncText] = useState('Hace momentos');

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
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          setLastSyncText(nowFormatted);
        })
        .catch(() => {
          const nowFormatted = new Date().toLocaleString('es-CO', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          setLastSyncText(nowFormatted);
        });
    }
  }, []);

  return (
    <div 
      className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#12142e] text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#33376b] font-medium text-xs shadow-2xs"
      title={`Última sincronización con Jira Cloud: ${lastSyncText}`}
    >
      <Clock size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
      <span className="text-[11px] sm:text-xs">
        Última Sync: <strong className="text-slate-900 dark:text-white font-bold">{lastSyncText}</strong>
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
    </div>
  );
}
