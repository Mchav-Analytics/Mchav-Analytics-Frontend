import React, { useState, useEffect } from 'react';
import { X, Sliders, Save, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Target } from 'lucide-react';

const PRESETS = [
  {
    id: 'standard',
    name: 'Modelo Estándar MCHAV',
    description: 'Equilibrio idóneo entre volumen (45%), eficiencia temporal (40%) y calidad (15%).',
    threshold: 80,
    weights: { w_tp: 25, w_sp: 20, w_ct: 20, w_com: 20, w_qual: 15 }
  },
  {
    id: 'quality',
    name: 'Enfoque en Calidad Estricta',
    description: 'Prioriza la solidez del código y la ausencia de defectos devueltos por QA (40%).',
    threshold: 90,
    weights: { w_tp: 15, w_sp: 15, w_ct: 15, w_com: 15, w_qual: 40 }
  },
  {
    id: 'speed',
    name: 'Entrega Rápida / Velocidad',
    description: 'Enfocado en alto throughput y volumen de puntos de historia entregados (70%).',
    threshold: 70,
    weights: { w_tp: 35, w_sp: 35, w_ct: 15, w_com: 15, w_qual: 0 }
  }
];

function MatrixSettingsModal({
  isOpen,
  onClose,
  initialThreshold = 80,
  initialWeights = { w_tp: 25, w_sp: 20, w_ct: 20, w_com: 20, w_qual: 15 },
  selectedProjectName = 'Proyecto',
  onSaveConfig,
  onApplyPreview
}) {
  const [threshold, setThreshold] = useState(initialThreshold);
  const [weights, setWeights] = useState(initialWeights);
  const [presetActive, setPresetActive] = useState('standard');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setThreshold(initialThreshold);
      setWeights(initialWeights || { w_tp: 25, w_sp: 20, w_ct: 20, w_com: 20, w_qual: 15 });
      setSuccessMsg('');
    }
  }, [isOpen, initialThreshold, initialWeights]);

  if (!isOpen) return null;

  const totalWeight = (Number(weights.w_tp) || 0) +
    (Number(weights.w_sp) || 0) +
    (Number(weights.w_ct) || 0) +
    (Number(weights.w_com) || 0) +
    (Number(weights.w_qual) || 0);

  const isValidTotal = totalWeight === 100;

  const handleWeightChange = (key, val) => {
    const num = Math.max(0, Math.min(100, Number(val) || 0));
    setWeights(prev => ({ ...prev, [key]: num }));
    setPresetActive('custom');
  };

  const handleSelectPreset = (preset) => {
    setPresetActive(preset.id);
    setThreshold(preset.threshold);
    setWeights(preset.weights);
  };

  const handleSave = async (isPermanent = true) => {
    if (!isValidTotal) return;
    setSaving(true);
    try {
      if (isPermanent && onSaveConfig) {
        await onSaveConfig({
          quality_threshold: Number(threshold),
          weight_throughput: Number(weights.w_tp),
          weight_velocity: Number(weights.w_sp),
          weight_cycletime: Number(weights.w_ct),
          weight_commitment: Number(weights.w_com),
          weight_quality: Number(weights.w_qual),
          nombre_modelo: PRESETS.find(p => p.id === presetActive)?.name || 'Modelo Personalizado'
        });
        setSuccessMsg('¡Configuración guardada permanentemente en la base de datos!');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1200);
      } else if (onApplyPreview) {
        onApplyPreview({
          threshold: Number(threshold),
          weights
        });
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-left">
        
        {/* ENCABEZADO MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#141738]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Configuración del Modelo de Desempeño
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajusta los umbrales y la fórmula de ponderación para <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedProjectName}</span>
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

        {/* CUERPO DEL MODAL CON SCROLL */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          
          {/* MENSAJE DE ÉXITO */}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}

          {/* PERFILES / PRESETS RÁPIDOS */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">
              Modelos de Medición Preconfigurados
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESETS.map((preset) => {
                const isActive = presetActive === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-900 dark:text-white shadow-sm ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{preset.name}</span>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                        {preset.description}
                      </p>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-1.5">
                      <span>Umbral: {preset.threshold}%</span>
                      <span>Qual: {preset.weights.w_qual}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN UMBRAL DE CALIDAD */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Umbral de Calidad Mínima Esperada
                </span>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm rounded-lg border border-emerald-500/20">
                {threshold}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define la puntuación límite en el eje X para clasificar a los desarrolladores en los cuadrantes de **Alta Calidad** (*Estrella / Metódico*) vs **En Riesgo QA** (*Alto Volumen / Atascado*).
            </p>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={threshold}
              onChange={(e) => {
                setThreshold(Number(e.target.value));
                setPresetActive('custom');
              }}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>50% (Permisivo)</span>
              <span>75%</span>
              <span>80% (Estándar)</span>
              <span>90% (Estricto)</span>
              <span>95% (Exigencia Máxima)</span>
            </div>
          </div>

          {/* SECCIÓN DE PONDERACIONES DE DESEMPEÑO (5 PILARES) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Ponderación de los 5 Pilares de Rendimiento
                </span>
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                isValidTotal
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                <span>Total: {totalWeight}%</span>
                {!isValidTotal && <AlertTriangle className="w-3.5 h-3.5" />}
              </div>
            </div>

            <div className="space-y-3">
              {/* Throughput */}
              <div className="flex items-center justify-between gap-4 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <div className="min-w-[160px]">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">1. Throughput (Tickets)</span>
                  <span className="text-[10px] text-slate-400">Volumen de tareas resueltas</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={weights.w_tp}
                  onChange={(e) => handleWeightChange('w_tp', e.target.value)}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.w_tp}
                  onChange={(e) => handleWeightChange('w_tp', e.target.value)}
                  className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-slate-800 dark:text-white"
                />
              </div>

              {/* Velocity SP */}
              <div className="flex items-center justify-between gap-4 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <div className="min-w-[160px]">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">2. Velocidad SP</span>
                  <span className="text-[10px] text-slate-400">Puntos de Historia completados</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={weights.w_sp}
                  onChange={(e) => handleWeightChange('w_sp', e.target.value)}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.w_sp}
                  onChange={(e) => handleWeightChange('w_sp', e.target.value)}
                  className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-slate-800 dark:text-white"
                />
              </div>

              {/* Cycle Time */}
              <div className="flex items-center justify-between gap-4 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <div className="min-w-[160px]">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">3. Cycle Time (Agilidad)</span>
                  <span className="text-[10px] text-slate-400">Velocidad de flujo de desarrollo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={weights.w_ct}
                  onChange={(e) => handleWeightChange('w_ct', e.target.value)}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.w_ct}
                  onChange={(e) => handleWeightChange('w_ct', e.target.value)}
                  className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-slate-800 dark:text-white"
                />
              </div>

              {/* Commitment Reliability */}
              <div className="flex items-center justify-between gap-4 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <div className="min-w-[160px]">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">4. Cumplimiento Sprint</span>
                  <span className="text-[10px] text-slate-400">% Tareas del sprint entregadas</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={weights.w_com}
                  onChange={(e) => handleWeightChange('w_com', e.target.value)}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.w_com}
                  onChange={(e) => handleWeightChange('w_com', e.target.value)}
                  className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-slate-800 dark:text-white"
                />
              </div>

              {/* Quality / Bugs */}
              <div className="flex items-center justify-between gap-4 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <div className="min-w-[160px]">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">5. Índice de Calidad</span>
                  <span className="text-[10px] text-slate-400">Ausencia de re-apertura de bugs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={weights.w_qual}
                  onChange={(e) => handleWeightChange('w_qual', e.target.value)}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.w_qual}
                  onChange={(e) => handleWeightChange('w_qual', e.target.value)}
                  className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

        </div>

        {/* PIE DEL MODAL (BOTONES ACCIÓN) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#141738]">
          <button
            onClick={() => handleSave(false)}
            disabled={!isValidTotal}
            className="px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
          >
            Vista Previa (Sesión)
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={!isValidTotal || saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Configuración Permanente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MatrixSettingsModal;
