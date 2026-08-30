import React from 'react';
import { Search, BookOpen, FileCode2 } from 'lucide-react';

const JQL_DICTIONARY = [
  { field: 'project', description: 'Filtra por clave o ID del proyecto.', example: 'project = "MCHAV" OR project = "PROJ-01"', type: 'Texto / ID' },
  { field: 'status', description: 'Estado del flujo (To Do, In Progress, Done).', example: 'status in ("In Progress", "Code Review")', type: 'Estado' },
  { field: 'assignee', description: 'Usuario asignado a la incidencia.', example: 'assignee = currentUser() OR assignee is EMPTY', type: 'Usuario' },
  { field: 'priority', description: 'Nivel de prioridad del ticket (Highest, High, Medium, Low).', example: 'priority in (High, Highest)', type: 'Prioridad' },
  { field: 'issuetype', description: 'Tipo de tarea (Story, Bug, Task, Epic).', example: 'issuetype in (Bug, Error)', type: 'Tipo Incidencia' },
  { field: 'updated', description: 'Fecha o antigüedad de la última actualización.', example: 'updated >= -7d ORDER BY updated DESC', type: 'Fecha' },
  { field: 'created', description: 'Rango de fechas de creación de la incidencia.', example: 'created >= "2026-01-01"', type: 'Fecha' },
  { field: 'story_points', description: 'Estimación en Puntos de Historia.', example: 'story_points > 3', type: 'Número' }
];

export function JqlDictionary({
  dictionarySearch,
  setDictionarySearch,
  setJqlQuery,
  jqlAuditLog
}) {
  const filteredDictionary = JQL_DICTIONARY.filter(item =>
    item.field.toLowerCase().includes(dictionarySearch.toLowerCase()) ||
    item.description.toLowerCase().includes(dictionarySearch.toLowerCase()) ||
    item.type.toLowerCase().includes(dictionarySearch.toLowerCase())
  );

  return (
    <div className="lg:col-span-4 space-y-6">
      
      {/* DICCIONARIO DE CAMPOS JQL */}
      <div className="bg-white/80 dark:bg-[#191c3d]/80 backdrop-blur-xl border border-slate-200/50 dark:border-[#33376b]/50 rounded-[2rem] p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <BookOpen className="text-indigo-600 dark:text-indigo-400" size={18} />
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Diccionario de Campos JQL
          </h3>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={dictionarySearch}
            onChange={(e) => setDictionarySearch(e.target.value)}
            placeholder="Buscar campo (ej. assignee, status)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
          />
        </div>

        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
          {filteredDictionary.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => setJqlQuery(item.example)}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  {item.field}
                </span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{item.description}</p>
              <code className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1.5 truncate">
                {item.example}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* HISTORIAL / AUDITORÍA DE CONSULTAS JQL */}
      <div className="bg-white/80 dark:bg-[#191c3d]/80 backdrop-blur-xl border border-slate-200/50 dark:border-[#33376b]/50 rounded-[2rem] p-6 shadow-2xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <FileCode2 size={16} className="text-indigo-500" />
            <span>Auditoría de Consultas JQL</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-400">Últimas 10</span>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {jqlAuditLog.map(item => (
            <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[180px]">
                  {item.query}
                </span>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  {item.count} res ({item.timeMs}ms)
                </span>
              </div>
              <span className="text-[9px] text-slate-400 block">{item.date}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
