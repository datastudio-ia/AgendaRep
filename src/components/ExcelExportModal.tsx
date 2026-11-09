import React, { useState, useEffect, useMemo } from 'react';
import { Representante, isRepComercial } from '../types/contact';
import { MultiSelectOption } from './MultiSelectDropdown';
import { exportRepsToExcel, REP_EXCEL_COLUMNS, getStandardRegion } from '../utils/excelExport';
import { getMappedUnit, matchGerenteOrCoord } from '../App';
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
  Eye,
  Calendar,
} from 'lucide-react';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reps: Representante[];
  allReps?: Representante[];
  isExportOnly?: boolean;
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
  selectedDateYears?: string[];
  onDateYearsChange?: (years: string[]) => void;
  dateYearOptions?: MultiSelectOption[];
  dateStart?: string;
  onDateStartChange?: (date: string) => void;
  dateEnd?: string;
  onDateEndChange?: (date: string) => void;
  onClearFilters?: () => void;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  isOpen,
  onClose,
  reps,
  allReps,
  isExportOnly = false,
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
  selectedDateYears = [],
  onDateYearsChange,
  dateYearOptions = [],
  dateStart = '',
  onDateStartChange,
  dateEnd = '',
  onDateEndChange,
  onClearFilters,
}) => {
  const [activeTab, setActiveTab] = useState<'filtros' | 'campos'>('filtros');
  const [isExporting, setIsExporting] = useState(false);

  // Local filter states for export-only mode (so parent directory is untouched)
  const [localTypes, setLocalTypes] = useState<string[]>(selectedTypes);
  const [localRegions, setLocalRegions] = useState<string[]>(selectedRegions);
  const [localUnits, setLocalUnits] = useState<string[]>(selectedUnits);
  const [localGerentes, setLocalGerentes] = useState<string[]>(selectedGerentes);
  const [localCoordinadores, setLocalCoordinadores] = useState<string[]>(selectedCoordinadores);
  const [localDateYears, setLocalDateYears] = useState<string[]>(selectedDateYears);
  const [localDateStart, setLocalDateStart] = useState<string>(dateStart);
  const [localDateEnd, setLocalDateEnd] = useState<string>(dateEnd);

  // Selected column keys for Excel (defaults to all 12 columns)
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(
    REP_EXCEL_COLUMNS.map((c) => c.key)
  );

  // Accordion state for filter categories in mobile
  const [expandedSection, setExpandedSection] = useState<string | null>('tipos');

  // Sync filters whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalTypes(selectedTypes);
      setLocalRegions(selectedRegions);
      setLocalUnits(selectedUnits);
      setLocalGerentes(selectedGerentes);
      setLocalCoordinadores(selectedCoordinadores);
      setLocalDateYears(selectedDateYears);
      setLocalDateStart(dateStart);
      setLocalDateEnd(dateEnd);
    }
  }, [isOpen]);

  // Bloquear scroll de la interfaz de fondo en móviles y pantallas táctiles
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  const effectiveTypes = isExportOnly ? localTypes : selectedTypes;
  const effectiveRegions = isExportOnly ? localRegions : selectedRegions;
  const effectiveUnits = isExportOnly ? localUnits : selectedUnits;
  const effectiveGerentes = isExportOnly ? localGerentes : selectedGerentes;
  const effectiveCoordinadores = isExportOnly ? localCoordinadores : selectedCoordinadores;
  const effectiveDateYears = isExportOnly ? localDateYears : selectedDateYears;
  const effectiveDateStart = isExportOnly ? localDateStart : dateStart;
  const effectiveDateEnd = isExportOnly ? localDateEnd : dateEnd;

  const setEffectiveTypes = (vals: string[]) => {
    if (isExportOnly) setLocalTypes(vals);
    else onTypesChange?.(vals);
  };
  const setEffectiveRegions = (vals: string[]) => {
    if (isExportOnly) setLocalRegions(vals);
    else onRegionsChange?.(vals);
  };
  const setEffectiveUnits = (vals: string[]) => {
    if (isExportOnly) setLocalUnits(vals);
    else onUnitsChange?.(vals);
  };
  const setEffectiveGerentes = (vals: string[]) => {
    if (isExportOnly) setLocalGerentes(vals);
    else onGerentesChange?.(vals);
  };
  const setEffectiveCoordinadores = (vals: string[]) => {
    if (isExportOnly) setLocalCoordinadores(vals);
    else onCoordinadoresChange?.(vals);
  };
  const setEffectiveDateYears = (vals: string[]) => {
    if (isExportOnly) setLocalDateYears(vals);
    else onDateYearsChange?.(vals);
  };
  const setEffectiveDateStart = (val: string) => {
    if (isExportOnly) setLocalDateStart(val);
    else onDateStartChange?.(val);
  };
  const setEffectiveDateEnd = (val: string) => {
    if (isExportOnly) setLocalDateEnd(val);
    else onDateEndChange?.(val);
  };

  const handleClearModalFilters = () => {
    if (isExportOnly) {
      setLocalTypes([]);
      setLocalRegions([]);
      setLocalUnits([]);
      setLocalGerentes([]);
      setLocalCoordinadores([]);
      setLocalDateYears([]);
      setLocalDateStart('');
      setLocalDateEnd('');
    } else {
      onClearFilters?.();
    }
  };

  // Base list of representatives: prefer allReps if provided to allow independent filtering
  const baseReps = allReps || reps;

  // Representatives filtered exclusively for Excel export
  const filteredRepsForExport = useMemo(() => {
    if (!isExportOnly) return reps;

    return baseReps.filter((rep) => {
      // 0. Tipo
      if (effectiveTypes.length > 0) {
        const isComercial = isRepComercial(rep);
        const matchesComercial = effectiveTypes.includes('Comerciales') && isComercial;
        const matchesVisita = effectiveTypes.includes('Visita Médica') && !isComercial;
        if (!matchesComercial && !matchesVisita) return false;
      }

      // 1. Región
      if (effectiveRegions.length > 0) {
        const cleanReg = getStandardRegion(rep.region);
        if (!effectiveRegions.includes(cleanReg)) return false;
      }

      // 2. Unidad de Negocio
      if (effectiveUnits.length > 0) {
        const mappedUnit = getMappedUnit(rep.unidadNegocio);
        if (!effectiveUnits.includes(mappedUnit)) return false;
      }

      // 3. Gerente o Coordinador
      if (effectiveGerentes.length > 0 && effectiveCoordinadores.length === 0) {
        const matchesG = effectiveGerentes.some((g) => matchGerenteOrCoord(rep.gerenteDistrito, g));
        if (!matchesG) return false;
      } else if (effectiveCoordinadores.length > 0 && effectiveGerentes.length === 0) {
        const matchesC = effectiveCoordinadores.some((c) => matchGerenteOrCoord(rep.gerenteDistrito, c));
        if (!matchesC) return false;
      } else if (effectiveGerentes.length > 0 && effectiveCoordinadores.length > 0) {
        const matchesG = effectiveGerentes.some((g) => matchGerenteOrCoord(rep.gerenteDistrito, g));
        const matchesC = effectiveCoordinadores.some((c) => matchGerenteOrCoord(rep.gerenteDistrito, c));
        if (!matchesG && !matchesC) return false;
      }

      // 4. Fecha de Ingreso: Años seleccionados
      if (effectiveDateYears.length > 0) {
        const parts = (rep.fechaIngreso || '').trim().split('/');
        const year = parts.length === 3 ? parts[2] : '';
        if (!effectiveDateYears.includes(year)) {
          return false;
        }
      }

      // 5. Fecha de Ingreso: Rango de Fechas específico (Desde / Hasta)
      if (effectiveDateStart || effectiveDateEnd) {
        const repDateStr = (rep.fechaIngreso || '').trim();
        const parts = repDateStr.split('/');
        if (parts.length === 3) {
          const repIso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          if (effectiveDateStart && repIso < effectiveDateStart) return false;
          if (effectiveDateEnd && repIso > effectiveDateEnd) return false;
        } else if (effectiveDateStart || effectiveDateEnd) {
          return false;
        }
      }

      return true;
    });
  }, [
    baseReps,
    reps,
    isExportOnly,
    effectiveTypes,
    effectiveRegions,
    effectiveUnits,
    effectiveGerentes,
    effectiveCoordinadores,
    effectiveDateYears,
    effectiveDateStart,
    effectiveDateEnd,
  ]);

  if (!isOpen) return null;

  const normalizeOptions = (opts: MultiSelectOption[] | string[]): MultiSelectOption[] =>
    opts.map((o) => (typeof o === 'string' ? { label: o, value: o } : o));

  const normTypes = normalizeOptions(typeOptions);
  const normRegions = normalizeOptions(regionOptions);
  const normUnits = normalizeOptions(unitOptions);
  const normGerentes = normalizeOptions(gerenteOptions);
  const normCoords = normalizeOptions(coordinadorOptions);
  const normDateYears = normalizeOptions(dateYearOptions);

  const activeFilterCount =
    effectiveTypes.length +
    effectiveRegions.length +
    effectiveUnits.length +
    effectiveGerentes.length +
    effectiveCoordinadores.length +
    effectiveDateYears.length +
    (effectiveDateStart || effectiveDateEnd ? 1 : 0);

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
        filteredRepsForExport,
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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200"
      style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] overscroll-contain animate-in slide-in-from-bottom duration-300"
        style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
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
                {isExportOnly ? 'Exportar a Excel' : 'Filtros de Visualización/Excel'}
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-100 font-medium truncate">
                {isExportOnly
                  ? 'Filtra los datos y columnas para el archivo Excel'
                  : 'Aplica filtros al directorio o personaliza la exportación a Excel'}
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
            <span>{isExportOnly ? '1. Filtros para Excel' : '1. Filtros a Aplicar'}</span>
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
            <span>2. Columnas a Exportar</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
              {selectedColumnKeys.length}/{REP_EXCEL_COLUMNS.length}
            </span>
          </button>
        </div>

        {/* Tab Content (Scrollable Body) */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {activeTab === 'filtros' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">
                  Filtra los datos que se incluirán en el archivo Excel:
                </span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearModalFilters}
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
                    {effectiveTypes.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                        {effectiveTypes.length}
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
                      const isSelected = effectiveTypes.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleArrayItem(effectiveTypes, opt.value, setEffectiveTypes)}
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
                    {effectiveRegions.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                        {effectiveRegions.length}
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
                      const isSelected = effectiveRegions.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleArrayItem(effectiveRegions, opt.value, setEffectiveRegions)}
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
                    {effectiveUnits.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                        {effectiveUnits.length}
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
                      const isSelected = effectiveUnits.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleArrayItem(effectiveUnits, opt.value, setEffectiveUnits)}
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
                    {effectiveGerentes.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                        {effectiveGerentes.length}
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
                      const isSelected = effectiveGerentes.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            toggleArrayItem(effectiveGerentes, opt.value, setEffectiveGerentes)
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
                    {effectiveCoordinadores.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                        {effectiveCoordinadores.length}
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
                      const isSelected = effectiveCoordinadores.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            toggleArrayItem(effectiveCoordinadores, opt.value, setEffectiveCoordinadores)
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

              {/* 6. Fecha de Ingreso */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSection(expandedSection === 'fecha' ? null : 'fecha')
                  }
                  className="w-full p-3 flex items-center justify-between text-left font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Fecha de Ingreso</span>
                    {(effectiveDateYears.length > 0 || effectiveDateStart || effectiveDateEnd) && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                        {effectiveDateYears.length + (effectiveDateStart || effectiveDateEnd ? 1 : 0)}
                      </span>
                    )}
                  </div>
                  {expandedSection === 'fecha' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {expandedSection === 'fecha' && (
                  <div className="p-3 pt-0 border-t border-slate-100 space-y-3">
                    {/* Años de ingreso */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Por Año de Ingreso
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                        {normDateYears.map((opt) => {
                          const isSelected = effectiveDateYears.includes(opt.value);
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                toggleArrayItem(effectiveDateYears, opt.value, setEffectiveDateYears)
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
                    </div>

                    {/* Rango Desde / Hasta */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Rango de Fechas (Desde / Hasta)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Desde</label>
                          <input
                            type="date"
                            value={effectiveDateStart}
                            onChange={(e) => setEffectiveDateStart(e.target.value)}
                            className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Hasta</label>
                          <input
                            type="date"
                            value={effectiveDateEnd}
                            onChange={(e) => setEffectiveDateEnd(e.target.value)}
                            className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
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
              {filteredRepsForExport.length} {filteredRepsForExport.length === 1 ? 'representante' : 'representantes'} a exportar
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 font-medium">
              {selectedColumnKeys.length} {selectedColumnKeys.length === 1 ? 'campo' : 'campos'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isExportOnly && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#0850FD] hover:bg-[#0640D0] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                title="Aplicar y visualizar los filtros seleccionados en el directorio de representantes"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>Aplicar Filtros</span>
              </button>
            )}
            {isExportOnly && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || selectedColumnKeys.length === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Descargar archivo Excel con los campos y filtros seleccionados"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{isExporting ? 'Generando...' : 'Descargar Excel'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
