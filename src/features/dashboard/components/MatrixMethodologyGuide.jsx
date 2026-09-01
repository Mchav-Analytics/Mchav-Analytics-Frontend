import React, { useState } from 'react';
import { X, BookOpen, Calculator, Target, HelpCircle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

function MatrixMethodologyGuide({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('PILLARS'); // 'PILLARS' | 'QUADRANTS' | 'FORMULAS'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] text-left">
        
        {/* ENCABEZADO MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#141738]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Metodología y Especificación de Métricas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guía técnica de cálculo del Performance Score y Matriz de 4 Cuadrantes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-white/5 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('PILLARS')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'PILLARS'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Target className="w-4 h-4" />
            Los 5 Pilares de Desempeño
          </button>
          <button
            onClick={() => setActiveTab('QUADRANTS')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'QUADRANTS'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Los 4 Cuadrantes Operativos
          </button>
          <button
            onClick={() => setActiveTab('FORMULAS')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'FORMULAS'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Fórmulas Matemáticas
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          
          {/* TAB 1: PILARES */}
          {activeTab === 'PILLARS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                El **Performance Score (0-100 pts)** evalúa holísticamente el desempeño de un desarrollador combinando volumen entregado, velocidad de flujo, confiabilidad de compromisos y calidad sin errores devueltos por QA.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">1. Throughput (Volumen)</span>
                    <span className="text-[11px] font-bold text-indigo-500">25% (defecto)</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Cantidad total de incidencias resueltas (`Done`) en el período. Compara el volumen individual con el promedio del equipo.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">2. Velocidad SP</span>
                    <span className="text-[11px] font-bold text-indigo-500">20% (defecto)</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Suma total de Story Points entregados. Refleja la complejidad de las tareas técnicas abordadas y cerradas con éxito.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">3. Cycle Time (Agilidad)</span>
                    <span className="text-[11px] font-bold text-indigo-500">20% (defecto)</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tiempo promedio transcurrido desde que una tarea entra a `In Progress` hasta su resolución. A menor tiempo respecto al promedio, mayor puntuación.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">4. Cumplimiento de Sprint</span>
                    <span className="text-[11px] font-bold text-indigo-500">20% (defecto)</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Porcentaje de compromiso cumplido (`Commitment Reliability`). Mide la previsibilidad de entrega del desarrollador sobre sus tareas planificadas.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">5. Índice de Calidad / Clean Code</span>
                    <span className="text-[11px] font-bold text-emerald-500">15% (defecto)</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tasa de entregables sin observaciones ni re-apertura de bugs por parte de QA. Penaliza las incidencias devueltas a revisión o re-desarrollo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUADRANTES */}
          {activeTab === 'QUADRANTS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* ESTRELLA */}
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                    <Sparkles className="w-4 h-4" />
                    1. ESTRELLA (Top Performance)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    **Criterio:** Cycle Time ≤ Promedio Equipo **Y** Calidad ≥ Umbral (ej. 80%).
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    **Acción de Liderazgo:** Reconocimiento público, asignación de tareas de arquitectura compleja y mentoría a pares.
                  </p>
                </div>

                {/* METÓDICO */}
                <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    2. METÓDICO (Alta Precisión)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    **Criterio:** Cycle Time &gt; Promedio Equipo **Y** Calidad ≥ Umbral (ej. 80%).
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    **Acción de Liderazgo:** Apoyo para agilizar la descomposición de tareas grandes en piezas más pequeñas.
                  </p>
                </div>

                {/* ALTO VOLUMEN */}
                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                    <HelpCircle className="w-4 h-4" />
                    3. ALTO VOLUMEN (Riesgo QA)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    **Criterio:** Cycle Time ≤ Promedio Equipo **Y** Calidad &lt; Umbral (ej. 80%).
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    **Acción de Liderazgo:** Reforzar pruebas unitarias locales y revisión de pares antes de enviar a QA.
                  </p>
                </div>

                {/* ATASCADO */}
                <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    4. ATASCADO (Requiere Apoyo)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    **Criterio:** Cycle Time &gt; Promedio Equipo **Y** Calidad &lt; Umbral (ej. 80%).
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    **Acción de Liderazgo:** Pair programming inmediato, revisión de bloqueos técnicos o ajuste de carga asignada.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: FÓRMULAS */}
          {activeTab === 'FORMULAS' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 font-mono space-y-3 overflow-x-auto">
                <div>
                  <span className="text-indigo-400 font-bold"># 1. Performance Score Ponderado</span>
                  <p className="text-slate-300">Score = (w_tp * S_tp) + (w_sp * S_sp) + (w_ct * S_ct) + (w_com * S_com) + (w_qual * S_qual)</p>
                </div>
                
                <div>
                  <span className="text-indigo-400 font-bold"># 2. Score de Cycle Time Inverso (S_ct)</span>
                  <p className="text-slate-300">ratio = CycleTime_dev / CycleTime_promedio_equipo</p>
                  <p className="text-slate-300">Si ratio &lt;= 1.0: S_ct = min(100, 80 + (1.0 - ratio) * 20)</p>
                  <p className="text-slate-300">Si ratio &gt; 1.0: S_ct = max(10, 80 - (ratio - 1.0) * 35)</p>
                </div>

                <div>
                  <span className="text-indigo-400 font-bold"># 3. Score de Calidad (S_qual)</span>
                  <p className="text-slate-300">Si TotalBugs &gt; 0: S_qual = (1.0 - (BugsReabiertos / TotalBugs)) * 100</p>
                  <p className="text-slate-300">Si TotalBugs == 0: S_qual = 95.0</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* PIE DEL MODAL */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#141738]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}

export default MatrixMethodologyGuide;
