import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, X } from 'lucide-react';

export default function DatePickerDropdown({ dateFilter, setDateFilter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('presets');
  
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayLabel = () => {
    if (!dateFilter || dateFilter === 'all' || (typeof dateFilter === 'object' && dateFilter.type === 'all')) {
      return 'Todos los tiempos';
    }
    if (typeof dateFilter === 'string') {
      if (dateFilter === '30d') return 'Últimos 30 días';
      if (dateFilter === '60d') return 'Últimos 2 meses';
      if (dateFilter === '90d') return 'Últimos 3 meses';
      return dateFilter;
    }
    if (typeof dateFilter === 'object' && dateFilter.label) {
      return dateFilter.label;
    }
    return 'Filtro de Fecha';
  };

  const handleSelectPreset = (mode, label) => {
    setDateFilter({ type: mode, label });
    setIsOpen(false);
  };

  const handleApplyDay = () => {
    if (!selectedDay) return;
    const parts = selectedDay.split('-');
    const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    setDateFilter({
      type: 'day',
      day: selectedDay,
      label: `Día: ${formatted}`
    });
    setIsOpen(false);
  };

  const handleApplyMonth = () => {
    if (!selectedMonth) return;
    const parts = selectedMonth.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    const monthName = dateObj.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    setDateFilter({
      type: 'month',
      month: selectedMonth,
      label: capitalized
    });
    setIsOpen(false);
  };

  const handleApplyYear = () => {
    if (!selectedYear) return;
    setDateFilter({
      type: 'year',
      year: selectedYear,
      label: `Año: ${selectedYear}`
    });
    setIsOpen(false);
  };

  const handleApplyRange = () => {
    if (!startDate && !endDate) return;
    const label = `Rango: ${startDate || '...'} a ${endDate || '...'}`;
    setDateFilter({
      type: 'range',
      startDate,
      endDate,
      label
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setDateFilter({ type: 'all', label: 'Todos los tiempos' });
    setSelectedDay('');
    setSelectedMonth('');
    setStartDate('');
    setEndDate('');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-500/50 transition-all shadow-sm"
      >
        <Calendar size={15} className="text-indigo-600 dark:text-indigo-400" />
        <span>{getDisplayLabel()}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150 text-left">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar size={14} className="text-indigo-500" /> Seleccionar Fecha
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-4 text-[11px] font-semibold gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1 px-1.5 rounded-lg transition-colors text-center ${activeTab === 'presets' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Rápido
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('day')}
              className={`flex-1 py-1 px-1.5 rounded-lg transition-colors text-center ${activeTab === 'day' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Día
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('month')}
              className={`flex-1 py-1 px-1.5 rounded-lg transition-colors text-center ${activeTab === 'month' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Mes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('year')}
              className={`flex-1 py-1 px-1.5 rounded-lg transition-colors text-center ${activeTab === 'year' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Año
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('range')}
              className={`flex-1 py-1 px-1.5 rounded-lg transition-colors text-center ${activeTab === 'range' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Rango
            </button>
          </div>

          {activeTab === 'presets' && (
            <div className="space-y-1">
              {[
                { mode: 'all', label: 'Todos los tiempos' },
                { mode: '30d', label: 'Últimos 30 días' },
                { mode: '60d', label: 'Últimos 2 meses' },
                { mode: '90d', label: 'Últimos 3 meses' }
              ].map(item => (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => handleSelectPreset(item.mode, item.label)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  {(getDisplayLabel() === item.label) && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'day' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Seleccionar Día Específico
                </label>
                <input
                  type="date"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyDay}
                disabled={!selectedDay}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                Aplicar Filtro de Día
              </button>
            </div>
          )}

          {activeTab === 'month' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Seleccionar Mes Específico
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyMonth}
                disabled={!selectedMonth}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                Aplicar Filtro de Mes
              </button>
            </div>
          )}

          {activeTab === 'year' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Seleccionar Año Específico
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleApplyYear}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-colors"
              >
                Aplicar Filtro de Año
              </button>
            </div>
          )}

          {activeTab === 'range' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Fecha Inicial (Desde)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Fecha Final (Hasta)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyRange}
                disabled={!startDate && !endDate}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                Aplicar Rango de Fechas
              </button>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors"
            >
              Restablecer Filtro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
