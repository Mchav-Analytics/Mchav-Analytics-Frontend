// ============================================================================
// COMPONENTE DESPLEGABLE DE SELECCIÓN DE RANGO DE FECHA (DESHABILITADO EN PENDING)
// ============================================================================
// Permite al usuario seleccionar opciones rápidas de fecha. En estado PENDING
// se bloquea totalmente para no desplegar nada ni mostrar datos.

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, Check, Lock } from 'lucide-react';

export default function DatePickerDropdown({ dateFilter, setDateFilter, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempOption, setTempOption] = useState('all');
  const [dayVal, setDayVal] = useState('');
  const [monthVal, setMonthVal] = useState('');
  const [yearVal, setYearVal] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const dropdownRef = useRef(null);

  // Sincronizar estado inicial
  useEffect(() => {
    if (typeof dateFilter === 'string') {
      setTempOption(dateFilter);
    } else if (typeof dateFilter === 'object' && dateFilter !== null) {
      setTempOption(dateFilter.type || 'all');
      if (dateFilter.day) setDayVal(dateFilter.day);
      if (dateFilter.month) setMonthVal(dateFilter.month);
      if (dateFilter.year) setYearVal(dateFilter.year);
      if (dateFilter.startDate) setRangeStart(dateFilter.startDate);
      if (dateFilter.endDate) setRangeEnd(dateFilter.endDate);
    }
  }, [dateFilter]);

  // Manejador de clics por fuera del componente para cerrar el menú desplegable
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Si está deshabilitado por estar en estado pendiente, renderizar botón inactivo con candado
  if (disabled) {
    return (
      <div className="relative inline-block text-left">
        <button
          type="button"
          disabled
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-slate-400 opacity-60 cursor-not-allowed shadow-sm"
          title="Filtro de fecha inactivo en estado pendiente"
        >
          <Calendar size={15} className="text-slate-400" />
          <span className="max-w-[140px] truncate">Sin Historial</span>
          <Lock size={12} className="text-amber-500/80 ml-0.5" />
        </button>
      </div>
    );
  }

  const options = [
    { id: 'all', label: 'Todo el historial' },
    { id: '30d', label: 'Últimos 30 días' },
    { id: '60d', label: 'Últimos 60 días' },
    { id: '90d', label: 'Últimos 90 días' },
    { id: 'day', label: 'Día específico' },
    { id: 'month', label: 'Mes específico' },
    { id: 'year', label: 'Año específico' },
    { id: 'range', label: 'Rango personalizado' }
  ];

  const handleApply = () => {
    if (tempOption === 'all' || tempOption === '30d' || tempOption === '60d' || tempOption === '90d') {
      setDateFilter(tempOption);
    } else if (tempOption === 'day') {
      if (dayVal) setDateFilter({ type: 'day', day: dayVal });
    } else if (tempOption === 'month') {
      if (monthVal) setDateFilter({ type: 'month', month: monthVal });
    } else if (tempOption === 'year') {
      if (yearVal) setDateFilter({ type: 'year', year: yearVal });
    } else if (tempOption === 'range') {
      if (rangeStart && rangeEnd) {
        setDateFilter({ type: 'range', startDate: rangeStart, endDate: rangeEnd });
      }
    }
    setIsOpen(false);
  };

  const getButtonLabel = () => {
    if (typeof dateFilter === 'string') {
      const match = options.find(o => o.id === dateFilter);
      return match ? match.label : 'Todo el historial';
    }
    if (typeof dateFilter === 'object' && dateFilter !== null) {
      if (dateFilter.type === 'day') return `Día: ${dateFilter.day}`;
      if (dateFilter.type === 'month') return `Mes: ${dateFilter.month}`;
      if (dateFilter.type === 'year') return `Año: ${dateFilter.year}`;
      if (dateFilter.type === 'range') return `${dateFilter.startDate} - ${dateFilter.endDate}`;
    }
    return 'Todo el historial';
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all cursor-pointer"
        title="Filtrar por Rango de Fecha"
      >
        <Calendar size={15} className="text-teal-600 dark:text-teal-400" />
        <span className="max-w-[140px] truncate">{getButtonLabel()}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-3 space-y-3 text-left animate-in fade-in duration-150">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            Seleccionar Filtro de Fecha
          </div>

          <div className="space-y-1">
            {options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all ${
                  tempOption === opt.id
                    ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dateOption"
                    value={opt.id}
                    checked={tempOption === opt.id}
                    onChange={() => setTempOption(opt.id)}
                    className="accent-teal-500"
                  />
                  <span>{opt.label}</span>
                </div>
                {tempOption === opt.id && <Check size={14} className="text-teal-600 dark:text-teal-400" />}
              </label>
            ))}
          </div>

          {/* Subcampos según opción */}
          {tempOption === 'day' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="date"
                value={dayVal}
                onChange={(e) => setDayVal(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          )}

          {tempOption === 'month' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="month"
                value={monthVal}
                onChange={(e) => setMonthVal(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          )}

          {tempOption === 'year' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="number"
                placeholder="Ej. 2026"
                min="2000"
                max="2099"
                value={yearVal}
                onChange={(e) => setYearVal(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          )}

          {tempOption === 'range' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Desde:</span>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Hasta:</span>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleApply}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-1.5 px-4 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Aplicar Filtro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
