import React, { useState } from 'react';
import { Sparkles, Plus, Edit2, Trash2, Power, AlertCircle } from 'lucide-react';
import ContextMenu from '../../../components/ui/ContextMenu';

export default function AiRulesView() {
  const [rules, setRules] = useState([
    {
      id: 'rule-1',
      name: 'Alerta de Lead Time Crítico',
      description: 'Dispara alerta si el Lead Time Medio supera los 14 días.',
      condition: 'Lead Time > 14 días',
      action: 'Alerta Naranja',
      active: true,
      lastTriggered: 'Hace 2 horas',
    },
    {
      id: 'rule-2',
      name: 'Detector de Cuello de Botella',
      description: 'Identifica si un desarrollador tiene más de 3 tareas en progreso.',
      condition: 'Tareas "In Progress" > 3 por Dev',
      action: 'Notificar al Líder',
      active: true,
      lastTriggered: 'Ayer',
    },
    {
      id: 'rule-3',
      name: 'Aviso de Scope Creep',
      description: 'Avisa si se agregan más de 20 puntos de historia en pleno sprint.',
      condition: 'Puntos agregados > 20 SP post-inicio',
      action: 'Alerta Roja',
      active: false,
      lastTriggered: 'Hace 5 días',
    }
  ]);

  const toggleRule = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="w-full space-y-6 font-sans text-left pb-10">
      {/* BARRA SUPERIOR */}
      <div className="w-full rounded-3xl bg-[#f8faff] dark:bg-[#14192b] p-5 sm:p-6 shadow-2xs border border-indigo-100/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white font-extrabold shadow-md shrink-0">
            <Sparkles size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-fuchsia-50 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-500/30">
                Automatización Inteligente
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Reglas Heurísticas y Alertas IA
            </h1>
          </div>
        </div>

        <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer">
          <Plus size={16} />
          Nueva Regla
        </button>
      </div>

      <div className="w-full bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/20">
          <AlertCircle size={18} className="text-slate-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Reglas Configuradas ({rules.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/70 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Regla</th>
                <th className="px-6 py-4">Condición Lógica</th>
                <th className="px-6 py-4">Acción / Salida</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Último Disparo</th>
                <th className="px-6 py-4 text-center w-16">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    No hay reglas configuradas.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className={`transition-colors ${!rule.active ? 'opacity-60 bg-slate-50/30 dark:bg-slate-900/40' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">{rule.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{rule.description}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] font-semibold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50/50 dark:bg-fuchsia-500/10 rounded-lg inline-block mt-2">
                      {rule.condition}
                    </td>
                    <td className="px-6 py-4 font-bold text-xs">
                      {rule.action}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${rule.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                        {rule.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-500 dark:text-slate-400">
                      {rule.lastTriggered}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <ContextMenu actions={[
                          { label: 'Editar regla', icon: Edit2, onClick: () => alert('Editar regla: ' + rule.name) },
                          { label: rule.active ? 'Desactivar regla' : 'Activar regla', icon: Power, onClick: () => toggleRule(rule.id) },
                          { label: 'Eliminar regla', icon: Trash2, onClick: () => deleteRule(rule.id), variant: 'danger' }
                        ]} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
