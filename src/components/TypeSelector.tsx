import React, { useMemo } from 'react';
import { Representante, ViewMode, isRepComercial, isRepActive } from '../types/contact';
import { RepresentantesList } from './RepresentantesList';
import { LinkedSpreadsheetInfo } from '../services/sheetsService';
import { MultiSelectDropdown, MultiSelectOption } from './MultiSelectDropdown';
import { getMappedUnit } from '../App';
import {
  Users,
  UserPlus,
  Pill,
  Sparkles,
  HeartPulse,
  RefreshCw,
  FileSpreadsheet,
  Search,
  LayoutGrid,
  Table2,
  X,
  Printer,
  RotateCcw,
} from 'lucide-react';

interface TypeSelectorProps {
  reps?: Representante[];
  repsComerciales?: Representante[];
  repsVisitaMedica?: Representante[];
  totalComerciales?: number;
  totalVisitaMedica?: number;
  totalOriginal?: number;
  viewMode: ViewMode;
  onSelectRep: (rep: Representante) => void;
  onFilterByManager: (managerName: string) => void;
  onFilterByRegion: (regionName: string) => void;
  onAddRep?: () => void;
  onEditRep?: (rep: Representante) => void;
  onDeleteRep?: (repId: string) => void;
  onToggleStatus?: (rep: Representante) => void;
  countLaSante?: number;
  countPharmetique?: number;
  countOtc?: number;
  onPullSync?: () => void;
  isPullSyncing?: boolean;
  linkedSheet?: LinkedSpreadsheetInfo | null;
  onAutoConnect?: () => void;
  isAutoConnecting?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onExportExcel?: () => void;
  onOpenPdfModal?: () => void;

  // Filtros facetados integrados
  showFilters?: boolean;
  selectedTypes?: string[];
  onTypesChange?: (values: string[]) => void;
  typeOptions?: MultiSelectOption[] | string[];
  selectedRegions?: string[];
  onRegionsChange?: (values: string[]) => void;
  regionOptions?: MultiSelectOption[] | string[];
  selectedUnits?: string[];
  onUnitsChange?: (values: string[]) => void;
  unitOptions?: MultiSelectOption[] | string[];
  selectedGerentes?: string[];
  onGerentesChange?: (values: string[]) => void;
  gerenteOptions?: MultiSelectOption[] | string[];
  selectedCoordinadores?: string[];
  onCoordinadoresChange?: (values: string[]) => void;
  coordinadorOptions?: MultiSelectOption[] | string[];
  onClearFilters?: () => void;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  reps,
  repsComerciales = [],
  repsVisitaMedica = [],
  totalComerciales,
  totalVisitaMedica,
  totalOriginal,
  viewMode,
  onSelectRep,
  onFilterByManager,
  onFilterByRegion,
  onAddRep,
  onEditRep,
  onDeleteRep,
  onToggleStatus,
  countLaSante,
  countPharmetique,
  countOtc,
  onPullSync,
  isPullSyncing = false,
  linkedSheet,
  onAutoConnect,
  isAutoConnecting = false,
  searchTerm = '',
  onSearchChange,
  onViewModeChange,
  onExportExcel,
  onOpenPdfModal,
  showFilters = true,
  selectedTypes = [],
  onTypesChange,
  typeOptions,
  selectedRegions = [],
  onRegionsChange,
  regionOptions,
  selectedUnits = [],
  onUnitsChange,
  unitOptions,
  selectedGerentes = [],
  onGerentesChange,
  gerenteOptions,
  selectedCoordinadores = [],
  onCoordinadoresChange,
  coordinadorOptions,
  onClearFilters,
}) => {
  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedTypes.length > 0 ||
    selectedRegions.length > 0 ||
    selectedUnits.length > 0 ||
    selectedGerentes.length > 0 ||
    selectedCoordinadores.length > 0;
  // Combine all representatives into a single unified directory list sorted alphabetically
  const unifiedReps = useMemo(() => {
    const baseList = reps ? reps : [...repsComerciales, ...repsVisitaMedica];
    return [...baseList].sort((a, b) =>
      (a.nombre || '').trim().localeCompare((b.nombre || '').trim(), 'es', { sensitivity: 'base' })
    );
  }, [reps, repsComerciales, repsVisitaMedica]);

  // Informative cards counts (calculated dynamically from unifiedReps for active reps only)
  const isPharmetiqueUnit = (rawUnit: string): boolean => {
    const mapped = getMappedUnit(rawUnit);
    if (
      mapped === 'LINEA 1' ||
      mapped === 'LINEA 2' ||
      mapped === 'LINEA 3' ||
      mapped === 'LINEA HIBRIDA 1' ||
      mapped === 'LINEA HIBRIDA 2' ||
      mapped === 'LINEA HIBRIDA 3'
    ) {
      return true;
    }
    const upper = (rawUnit || '').toUpperCase();
    return upper.includes('LINEA') || upper.includes('HIBRIDA') || upper.includes('PHARMETIQUE');
  };

  const countLaSanteCalc = useMemo(() => {
    return unifiedReps.filter((r) => isRepActive(r) && getMappedUnit(r.unidadNegocio) === 'LA SANTE').length;
  }, [unifiedReps]);

  const countPharmetiqueCalc = useMemo(() => {
    return unifiedReps.filter((r) => isRepActive(r) && isPharmetiqueUnit(r.unidadNegocio)).length;
  }, [unifiedReps]);

  const countOtcCalc = useMemo(() => {
    return unifiedReps.filter((r) => isRepActive(r) && getMappedUnit(r.unidadNegocio) === 'OTC').length;
  }, [unifiedReps]);

  const totalBaseCount =
    totalOriginal ??
    (totalComerciales !== undefined && totalVisitaMedica !== undefined
      ? totalComerciales + totalVisitaMedica
      : unifiedReps.filter((r) => isRepActive(r)).length);

  return (
    <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-full overflow-x-hidden">
      {/* 1. Header del Directorio Unificado */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-[#EAE5E1] shadow-2xs flex flex-col gap-2.5 sm:gap-5 w-full max-w-full">
        {/* Fila superior: Título y Botón Agregar Representante */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 w-full">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl theme-gradient-bg text-white flex items-center justify-center shadow-2xs shrink-0">
              <Users className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-black text-[#1A1A1E] tracking-tight truncate">
                Directorio de Representantes
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                Fuerza de ventas comercial y visita médica
              </p>
            </div>
          </div>

          {/* Botón de acción: Agregar Representante */}
          {onAddRep && (
            <button
              onClick={onAddRep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white text-sm font-bold rounded-xl sm:rounded-full shadow-2xs transition-all cursor-pointer shrink-0"
              title="Agregar nuevo representante"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Agregar Representante</span>
            </button>
          )}
        </div>

        {/* Fila 2: Panel con el buscador y Selector de modo tarjeta o tabla */}
        <div className="pt-2 sm:pt-4 border-t border-[#EAE5E1]/80 w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
          {/* Panel de búsqueda */}
          <div className="relative flex-1 w-full max-w-full">
            <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-primary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Buscar nombre, cédula, ciudad, teléfono..."
              className="w-full max-w-full pl-9 sm:pl-10 pr-8 sm:pr-9 py-2 sm:py-2.5 text-sm bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl sm:rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-all placeholder:text-slate-400 font-medium text-[#1A1A1E]"
            />
            {searchTerm && onSearchChange && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Selector de modo tarjeta o tabla */}
          {onViewModeChange && (
            <div className="inline-flex bg-[#F8F4F2] p-0.5 sm:p-1 rounded-xl sm:rounded-full border border-[#EAE5E1] shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-theme-primary text-white shadow-2xs'
                    : 'text-slate-600 hover:text-theme-primary'
                }`}
                title="Vista Tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                <span>Tarjetas</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-theme-primary text-white shadow-2xs'
                    : 'text-slate-600 hover:text-theme-primary'
                }`}
                title="Vista Tabla"
              >
                <Table2 className="w-3.5 h-3.5 shrink-0" />
                <span>Tabla</span>
              </button>
            </div>
          )}
        </div>

        {/* Fila 3: Panel con los filtros y los botones de exportación en la parte inferior del panel con el buscador */}
        {showFilters && (
          <div className="pt-2 sm:pt-4 border-t border-[#EAE5E1]/80 w-full grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-2">
            {/* 1. Tipo de Representante */}
            {typeOptions && onTypesChange && (
              <MultiSelectDropdown
                label="Tipo de Representante"
                options={typeOptions}
                selectedValues={selectedTypes}
                onChange={onTypesChange}
              />
            )}

            {/* 2. Regiones Filter */}
            {regionOptions && onRegionsChange && (
              <MultiSelectDropdown
                label="Todas las Regiones"
                options={regionOptions}
                selectedValues={selectedRegions}
                onChange={onRegionsChange}
              />
            )}

            {/* 3. Unidades de Negocios Filter */}
            {unitOptions && onUnitsChange && (
              <MultiSelectDropdown
                label="Unidades de Negocios"
                options={unitOptions}
                selectedValues={selectedUnits}
                onChange={onUnitsChange}
              />
            )}

            {/* 4. Gerentes de Distrito Filter */}
            {gerenteOptions && onGerentesChange && (
              <MultiSelectDropdown
                label="Gerentes de Distrito"
                options={gerenteOptions}
                selectedValues={selectedGerentes}
                onChange={onGerentesChange}
              />
            )}

            {/* 5. Coordinadores Filter */}
            {coordinadorOptions && onCoordinadoresChange && (
              <MultiSelectDropdown
                label="Coordinadores"
                options={coordinadorOptions}
                selectedValues={selectedCoordinadores}
                onChange={onCoordinadoresChange}
              />
            )}

            {/* 6. Botón Quitar Filtro (1° en el orden requerido) */}
            {onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className={`w-full sm:w-auto text-sm sm:text-xs rounded-xl sm:rounded-full px-3 sm:px-3.5 py-2 font-bold transition-all cursor-pointer flex items-center justify-center sm:inline-flex gap-1.5 select-none ${
                  hasActiveFilters
                    ? 'bg-[#FF4800]/10 text-[#FF4800] border border-[#FF4800]/30 hover:bg-[#FF4800]/20 shadow-2xs'
                    : 'bg-[#F8F4F2] text-slate-600 hover:text-[#1A1A1E] border border-[#EAE5E1] hover:bg-slate-200/60'
                }`}
                title="Borrar todos los filtros aplicados"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${hasActiveFilters ? 'text-[#FF4800]' : 'text-slate-400'}`} />
                <span>Quitar Filtro</span>
              </button>
            )}

            {/* 7. Botón Exportar Excel (2° en el orden requerido) */}
            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 rounded-xl sm:rounded-full transition-all cursor-pointer truncate shadow-2xs"
                title="Descargar Agenda de Representantes (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Excel</span>
              </button>
            )}

            {/* 8. Botón Exportar PDF (3° en el orden requerido) */}
            {onOpenPdfModal && (
              <button
                type="button"
                onClick={onOpenPdfModal}
                className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#FF4800] to-[#FF8F32] hover:opacity-90 rounded-xl sm:rounded-full transition-all cursor-pointer shadow-2xs truncate"
                title="Exportar a PDF / Imprimir"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">PDF</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Lista Única y Unificada de Representantes */}
      <RepresentantesList
        reps={unifiedReps}
        viewMode={viewMode}
        onSelectRep={onSelectRep}
        onFilterByManager={onFilterByManager}
        onFilterByRegion={onFilterByRegion}
        onEditRep={onEditRep}
        onDeleteRep={onDeleteRep}
        onToggleStatus={onToggleStatus}
      />
    </div>
  );
};
