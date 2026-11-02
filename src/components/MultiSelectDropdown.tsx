import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface MultiSelectOption {
  label: string;
  value: string;
  count?: number;
}

interface MultiSelectDropdownProps {
  label: string;
  options: MultiSelectOption[] | string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to MultiSelectOption[]
  const normalizedOptions: MultiSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

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

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const selectAll = () => {
    onChange(normalizedOptions.map((o) => o.value));
  };

  const clearAll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange([]);
  };

  const hasSelections = selectedValues.length > 0;

  // Determine button title label
  const getButtonText = () => {
    if (selectedValues.length === 0) {
      return label;
    }
    if (selectedValues.length === 1) {
      const match = normalizedOptions.find((o) => o.value === selectedValues[0]);
      return match ? match.label : selectedValues[0];
    }
    return `${label} (${selectedValues.length})`;
  };

  return (
    <div className={`relative block sm:inline-block w-full sm:w-auto max-w-full text-left ${className}`} ref={dropdownRef}>
      {/* Dropdown trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full sm:w-auto max-w-full text-sm sm:text-xs rounded-xl sm:rounded-full px-3 sm:px-3.5 py-2 font-medium transition-all cursor-pointer flex items-center justify-between sm:justify-start gap-2 select-none ${
          hasSelections
            ? 'bg-theme-10 text-theme-primary border border-theme-30 shadow-2xs font-bold'
            : 'bg-[#F8F4F2] text-[#1A1A1E] border border-[#EAE5E1] hover:bg-slate-200/60'
        }`}
        title={hasSelections ? `${selectedValues.length} seleccionados` : label}
      >
        <span className="truncate flex-1 sm:flex-initial sm:max-w-[170px] text-left">{getButtonText()}</span>

        {hasSelections ? (
          <span
            onClick={clearAll}
            className="hover:bg-theme-20 rounded-full p-0.5 text-theme-primary transition-colors shrink-0 cursor-pointer"
            title="Quitar filtro"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        ) : (
          <ChevronDown
            className={`w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform shrink-0 ${
              isOpen ? 'rotate-180 text-theme-primary' : ''
            }`}
          />
        )}
      </button>

      {/* Popover menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 sm:right-auto mt-1.5 w-full sm:w-64 max-w-full sm:max-w-none bg-white rounded-2xl border border-[#EAE5E1] shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Header controls: select all / clear */}
          <div className="flex items-center justify-between px-3 pb-2 mb-1 border-b border-[#EAE5E1] text-xs">
            <span className="font-extrabold text-slate-400 uppercase tracking-wider truncate">
              {label}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={selectAll}
                className="text-theme-primary hover:underline font-bold cursor-pointer"
              >
                Todos
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => clearAll()}
                className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto px-1.5 space-y-0.5">
            {normalizedOptions.map((opt) => {
              const isSelected = selectedValues.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleOption(opt.value)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-sm transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-theme-10 text-theme-primary font-bold'
                      : 'text-slate-700 hover:bg-[#F8F4F2] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-theme-primary border-theme-primary text-white shadow-2xs'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {typeof opt.count === 'number' && (
                    <span
                      className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded-full shrink-0 ml-1.5 ${
                        isSelected
                          ? 'bg-theme-20 text-theme-primary'
                          : 'bg-slate-100 text-slate-500'
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
      )}
    </div>
  );
};
