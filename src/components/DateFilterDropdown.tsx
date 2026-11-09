import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, X, ArrowRight } from 'lucide-react';
import { MultiSelectOption } from './MultiSelectDropdown';

interface DateFilterDropdownProps {
  label?: string;
  yearOptions: MultiSelectOption[];
  selectedYears: string[];
  onYearsChange: (years: string[]) => void;
  dateStart?: string;
  onDateStartChange?: (date: string) => void;
  dateEnd?: string;
  onDateEndChange?: (date: string) => void;
  className?: string;
}

export const DateFilterDropdown: React.FC<DateFilterDropdownProps> = ({
  label = 'Fecha de Ingreso',
  yearOptions,
  selectedYears,
  onYearsChange,
  dateStart = '',
  onDateStartChange,
  dateEnd = '',
  onDateEndChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const hasRange = Boolean(dateStart || dateEnd);
  const hasSelections = selectedYears.length > 0 || hasRange;

  const toggleYear = (yr: string) => {
    if (selectedYears.includes(yr)) {
      onYearsChange(selectedYears.filter((y) => y !== yr));
    } else {
      onYearsChange([...selectedYears, yr]);
    }
  };

  const handleClearAll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onYearsChange([]);
    onDateStartChange?.('');
    onDateEndChange?.('');
  };

  const getButtonText = () => {
    if (!hasSelections) return label;
    if (hasRange && selectedYears.length === 0) {
      if (dateStart && dateEnd) {
        return `${dateStart.slice(0, 4)} a ${dateEnd.slice(0, 4)}`;
      }
      return dateStart ? `Desde ${dateStart}` : `Hasta ${dateEnd}`;
    }
    if (selectedYears.length === 1 && !hasRange) {
      return selectedYears[0];
    }
    const count = selectedYears.length + (hasRange ? 1 : 0);
    return `${label} (${count})`;
  };

  return (
    <div
      className={`relative block sm:inline-block w-full sm:w-auto max-w-full text-left ${className}`}
      ref={dropdownRef}
    >
      {/* Dropdown trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full sm:w-auto max-w-full text-sm sm:text-xs rounded-xl sm:rounded-full px-3 sm:px-3.5 py-2 font-medium transition-all cursor-pointer flex items-center justify-between sm:justify-start gap-2 select-none ${
          hasSelections
            ? 'bg-theme-10 text-theme-primary border border-theme-30 shadow-2xs font-bold'
            : 'bg-[#F8F4F2] text-[#1A1A1E] border border-[#EAE5E1] hover:bg-slate-200/60'
        }`}
        title={hasSelections ? `Filtro por fecha de ingreso activo` : label}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Calendar
            className={`w-3.5 h-3.5 shrink-0 ${
              hasSelections ? 'text-theme-primary' : 'text-slate-500'
            }`}
          />
          <span className="truncate flex-1 sm:flex-initial sm:max-w-[170px] text-left">
            {getButtonText()}
          </span>
        </div>

        {hasSelections ? (
          <span
            onClick={handleClearAll}
            className="hover:bg-theme-20 rounded-full p-0.5 text-theme-primary transition-colors shrink-0 cursor-pointer"
            title="Quitar filtro de fecha"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-theme-primary" />
              <span className="text-xs font-black text-slate-800">
                Filtro por Fecha de Ingreso
              </span>
            </div>
            {hasSelections && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="p-3 max-h-[360px] overflow-y-auto space-y-3.5">
            {/* 1. Selector de Años de Ingreso */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Por Año de Ingreso
                </span>
                {selectedYears.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onYearsChange([])}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Deseleccionar años
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1 max-h-44 overflow-y-auto pr-1">
                {yearOptions.map((opt) => {
                  const isChecked = selectedYears.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleYear(opt.value)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer border ${
                        isChecked
                          ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                          : 'bg-slate-50 border-slate-200/70 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                            isChecked
                              ? 'bg-theme-primary border-theme-primary text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {typeof opt.count === 'number' && (
                        <span
                          className={`text-[10px] font-mono px-1 rounded-full shrink-0 ${
                            isChecked
                              ? 'bg-blue-200 text-blue-900'
                              : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          {opt.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Rango Personalizado de Fechas (Desde / Hasta) */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                O Rango Exacto (Desde / Hasta)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={dateStart}
                    onChange={(e) => onDateStartChange?.(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-theme-primary font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={dateEnd}
                    onChange={(e) => onDateEndChange?.(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-theme-primary font-medium text-slate-800"
                  />
                </div>
              </div>
              {(dateStart || dateEnd) && (
                <button
                  type="button"
                  onClick={() => {
                    onDateStartChange?.('');
                    onDateEndChange?.('');
                  }}
                  className="mt-1.5 text-[10px] text-rose-600 hover:text-rose-700 underline font-semibold cursor-pointer"
                >
                  Limpiar fechas desde/hasta
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {hasSelections
                ? `${selectedYears.length} años ${hasRange ? '+ rango' : ''}`
                : 'Sin filtro de fecha'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-theme-primary text-white text-xs font-bold rounded-lg hover:bg-theme-primary-hover transition-colors cursor-pointer"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
