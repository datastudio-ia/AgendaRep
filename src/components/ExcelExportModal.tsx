import React, { useState } from 'react';
import { Representante } from '../types/contact';
import { MultiSelectOption } from './MultiSelectDropdown';
import { exportRepsToExcel, REP_EXCEL_COLUMNS } from '../utils/excelExport';
import {
  X,
  FileSpreadsheet,
  Download,
  Filter,
  Columns,
  Check,
  RotateCcw,
  CheckSquare,
  Square,
  Users,
  MapPin,
  Layers,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reps: Representante[];
  // Filters
  selectedTypes?: string[];
  onTypesChange?: (types: string[]) => void;
  typeOptions?: MultiSelectOption[] | string[];
  selectedRegions?: string[];
  onRegionsChange?: (regions: string[]) => void;
  regionOptions?: MultiSelectOption[] | string[];
  selectedUnits?: string[];
  onUnitsChange?: (units: string[]) => void;
  unitOptions?: MultiSelectOption[] | string[];
  selectedGerentes?: string[];
  onGerentesChange?: (gerentes: string[]) => void;
  gerenteOptions?: MultiSelectOption[] | string[];
  selectedCoordinadores?: string[];
  onCoordinadoresChange?: (coordinadores: string[]) => void;
  coordinadorOptions?: MultiSelectOption[] | string[];
  onClearFilters?: () => void;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  isOpen,
  onClose,
  reps,
  selectedTypes = [],
  onTypesChange,
  typeOptions = [],
  selectedRegions = [],
  onRegionsChange,
  regionOptions = [],
  selectedUnits = [],
  onUnitsChange,
  unitOptions = [],
  selectedGerentes = [],
  onGerentesChange,
  gerenteOptions = [],
  selectedCoordinadores = [],
  onCoordinadoresChange,
  coordinadorOptions = [],
  onClearFilters,
}) => {
  const [activeTab, setActiveTab] = useState<'filtros' | 'campos'>('filtros');
  const [isExporting, setIsExporting] = useState(false);

  // Selected column keys for Excel (defaults to all 12 columns)
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(
    REP_EXCEL_COLUMNS.map((c) => c.key)
  );

  // Accordion state for filter categories in mobile
  const [expandedSection, setExpandedSection] = useState<string | null>('tipos');

  if (!isOpen) return null;

  const normalizeOptions = (opts: MultiSelectOption[] | string[]): MultiSelectOption[] =>
    opts.map((o) => (typeof o === 'string' ? { label: o, value: o } : o));

  const normTypes = normalizeOptions(typeOptions);
  const normRegions = normalizeOptions(regionOptions);
  const normUnits = normalizeOptions(unitOptions);
  const normGerentes = normalizeOptions(gerenteOptions);
  const normCoords = normalizeOptions(coordinadorOptions);

  const activeFilterCount =
    selectedTypes.length +
    selectedRegions.length +
    selectedUnits.length +
    selectedGerentes.length +
    selectedCoordinadores.length;

  const toggleColumn = (key: string) => {
    setSelectedColumnKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllColumns = () => {
    setSelectedColumnKeys(REP_EXCEL_COLUMNS.map((c) => c.key));
  };

  const handleDeselectAllColumns = () => {
    // Keep at least the name
    setSelectedColumnKeys(['representante']);
  };

  const handleSelectContactPreset = () => {
    setSelectedColumnKeys([
      'codigo',
      'cedula',
      'representante',
      'telefono',
      'correo',
      'ciudad',
      'estado',
    ]);
  };

  const handleSelectTerritoryPreset = () => {
    setSelectedColumnKeys([
      'codigo',
      'representante',
      'region',
      'estado',
      'ciudad',
      'unidadNegocio',
      'gerenteDistrito',
      'estatus',
    ]);
  };

  const toggleArrayItem = (current: string[], item: string, setter?: (vals: string[]) => void) => {
    if (!setter) return;
    if (current.includes(item)) {
      setter(current.filter((i) => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportRepsToExcel(
        reps,
        `Agenda_Representantes_Calox_${new Date().toISOString().slice(0, 10)}.xlsx`,
        selectedColumnKeys
      );
      onClose();
    } catch (err) {
      console.error('Error al exportar Excel:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0 border border-white/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg leading-tight truncate">
                Exportar a Excel
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-100 font-medium truncate">
                Personaliza filtros y campos a exportar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers: Filtros vs Campos */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('filtros')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'filtros'
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Filtros a Aplicar</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('campos')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'campos'
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Campos (Columnas)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
              {selectedColumnKeys.length}/{REP_EXCEL_COLUMNS.length}
            </span>
          </button>
        </div>

        {/* Tab Content (Scrollable Body) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'filtros' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">
                  Filtra los datos que se incluirán en el archivo Excel:
                </span>
                {activeFilterCount > 0 && onClearFilters && (
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpiar filtros</span>
                  </button>
                )}
              </div>

              {/* 1. Tipo de Representante */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSection(expandedSection === 'tipos' ? null : 'tipos')
                  }
                  className="w-full p-3 flex items-center justify-between text-left font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Tipo de Representante</span>
                    {selectedTypes.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                        {selectedTypes.length}
                      </span>
                    )}
                  </div>
                  {expandedSection === 'tipos' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {expandedSection === 'tipos' && (
                  <div className="p-3 pt-0 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {normTypes.map((opt) => {
                      const isSelected = selectedTypes.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleArrayItem(selectedTypes, opt.value, onTypesChange)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{opt.label}</span>
                          {typeof opt.count === 'number' && (
                            <span
                              className={`text-[10px] font-mono px-1 py-0.2 rounded-full ${
                                isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {opt.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Regiones */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSection(expandedSection === 'regiones' ? null : 'regiones')
                  }
                  className="w-full p-3 flex items-center justify-between text-left font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Regiones Geográficas</span>
                    {selectedRegions.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                        {selectedRegions.length}
                      </span>
                    )}
                  </div>
                  {expandedSection === 'regiones' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {expandedSection === 'regiones' && (
                  <div className="p-3 pt-0 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {normRegions.map((opt) => {
                      const isSelected = selectedRegions.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleArrayItem(selectedRegions, opt.value, onRegionsChange)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{opt.label}</span>
                          {typeof opt.count === 'number' && (
                            <span
                              className={`text-[10px] font-mono px-1 py-0.2 rounded-full ${
                                isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {opt.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Unidades de Negocio */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSection(expandedSection === 'unidades' ? null : 'unidades')
                  }
                  className="w-full p-3 flex items-center justify-between text-left font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Unidades de Negocio</span>
                    {selectedUnits.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                        {selectedUnits.length}
                      </span>
                    )}
                  </div>
                  {expandedSection === 'unidades' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {expandedSection === 'unidades' && (
                  <div className="p-3 pt-0 border-t border-slate-100 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {normUnits.map((opt) => {
                      const isSelected = selectedUnits.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleArrayItem(selectedUnits, opt.value, onUnitsChange)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{opt.label}</span>
                          {typeof opt.count === 'number' && (
                            <span
                              className={`text-[10px] font-mono px-1 py-0.2 rounded-full ${
                                isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {opt.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Gerentes de Distrito */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSection(expandedSection === 'gerentes' ? null : 'gerentes')
                  }
                  className="w-full p-3 flex items-center justify-between text-left font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Gerentes de Distrito</span>
                    {selectedGerentes.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                        {selectedGerentes.length}
                      </span>
                    )}
                  </div>
                  {expandedSection === 'gerentes' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {expandedSection === 'gerentes' && (
                  <div className="p-3 pt-0 border-t border-slate-100 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {normGerentes.map((opt) => {
                      const isSelected = selectedGerentes.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            toggleArrayItem(selectedGerentes, opt.value, onGerentesChange)
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{opt.label}</span>
                          {typeof opt.count === 'number' && (
                            <span
                              className={`text-[10px] font-mono px-1 py-0.2 rounded-full ${
                                isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {opt.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Coordinadores */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSection(expandedSection === 'coords' ? null : 'coords')
                  }
                  className="w-full p-3 flex items-center justify-between text-left font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Coordinadores</span>
                    {selectedCoordinadores.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                        {selectedCoordinadores.length}
                      </span>
                    )}
                  </div>
                  {expandedSection === 'coords' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {expandedSection === 'coords' && (
                  <div className="p-3 pt-0 border-t border-slate-100 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {normCoords.map((opt) => {
                      const isSelected = selectedCoordinadores.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            toggleArrayItem(selectedCoordinadores, opt.value, onCoordinadoresChange)
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{opt.label}</span>
                          {typeof opt.count === 'number' && (
                            <span
                              className={`text-[10px] font-mono px-1 py-0.2 rounded-full ${
                                isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {opt.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">
                  Selecciona las columnas a incluir en el Excel:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllColumns}
                    className="text-emerald-700 hover:underline font-bold cursor-pointer"
                  >
                    Todos
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllColumns}
                    className="text-slate-500 hover:underline font-bold cursor-pointer"
                  >
                    Mínimo
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={handleSelectContactPreset}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  📋 Solo Contacto
                </button>
                <button
                  type="button"
                  onClick={handleSelectTerritoryPreset}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  🗺️ Solo Territorio
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllColumns}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap cursor-pointer transition-colors"
                >
                  ✨ Todas las Columnas
                </button>
              </div>

              {/* Columns Checkbox Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {REP_EXCEL_COLUMNS.map((col) => {
                  const isChecked = selectedColumnKeys.includes(col.key);
                  return (
                    <button
                      key={col.key}
                      type="button"
                      onClick={() => toggleColumn(col.key)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/60 text-slate-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-500 font-medium hover:border-slate-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="text-xs truncate">{col.header}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Summary and Action Button */}
        <div className="p-3.5 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 text-xs">
            <span className="font-bold text-slate-800">
              {reps.length} {reps.length === 1 ? 'representante' : 'representantes'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 font-medium">
              {selectedColumnKeys.length} {selectedColumnKeys.length === 1 ? 'campo' : 'campos'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || selectedColumnKeys.length === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generando...' : 'Descargar Excel'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
