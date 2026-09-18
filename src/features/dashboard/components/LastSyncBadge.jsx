import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { jiraService } from '../../../services/api';

export function formatSpanishSyncDate(dateStr) {
  if (!dateStr) {
    const now = new Date();
    const day = now.getDate();
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
    const month = months[now.getMonth()];
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    return `${day} de ${month}, ${hoursStr}:${minutes} ${ampm}`;
  }
  
  const iso = String(dateStr).endsWith('Z') ? String(dateStr) : `${dateStr}Z`;
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return String(dateStr);

  const day = dt.getDate();
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const month = months[dt.getMonth()];
  let hours = dt.getHours();
  const minutes = String(dt.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');

  return `${day} de ${month}, ${hoursStr}:${minutes} ${ampm}`;
}

export default function LastSyncBadge() {
  const [lastSyncText, setLastSyncText] = useState(() => formatSpanishSyncDate(null));

  const loadLastSync = () => {
    if (jiraService?.getSyncLogs) {
      jiraService.getSyncLogs()
        .then((logs) => {
          if (Array.isArray(logs) && logs.length > 0) {
            const latest = logs[0];
            const rawDate = latest.fecha_ejecucion || latest.created_at || latest.timestamp;
            if (rawDate) {
              setLastSyncText(formatSpanishSyncDate(rawDate));
              return;
            }
          }
          setLastSyncText(formatSpanishSyncDate(null));
        })
        .catch(() => {
          setLastSyncText(formatSpanishSyncDate(null));
        });
    }
  };

  useEffect(() => {
    loadLastSync();
    window.addEventListener('mchav-sync-completed', loadLastSync);
    return () => window.removeEventListener('mchav-sync-completed', loadLastSync);
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
