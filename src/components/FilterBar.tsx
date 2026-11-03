import React from 'react';
import { ViewMode } from '../types/contact';
import {
  Search,
  LayoutGrid,
  Table2,
  X,
  Download,
  Printer,
  RotateCcw,
  FileSpreadsheet,
} from 'lucide-react';
import { MultiSelectDropdown, MultiSelectOption } from './MultiSelectDropdown';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters?: boolean;

  // 0. Tipo de Representante (Multi-select)
  selectedTypes?: string[];
  onTypesChange?: (values: string[]) => void;
  typeOptions?: MultiSelectOption[] | string[];

  // 1. Regiones (Multi-select)
  selectedRegions?: string[];
  onRegionsChange?: (values: string[]) => void;
  regionOptions?: MultiSelectOption[] | string[];

  // 2. Unidades de Negocios (Multi-select)
  selectedUnits?: string[];
  onUnitsChange?: (values: string[]) => void;
  unitOptions?: MultiSelectOption[] | string[];

  // 3. Gerentes de Distrito (Multi-select)
  selectedGerentes?: string[];
  onGerentesChange?: (values: string[]) => void;
  gerenteOptions?: MultiSelectOption[] | string[];

  // 4. Coordinadores (Multi-select)
  selectedCoordinadores?: string[];
  onCoordinadoresChange?: (values: string[]) => void;
  coordinadorOptions?: MultiSelectOption[] | string[];

  // View & Actions
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onExportExcel?: () => void;
  onExportCsv?: () => void;
  onOpenPdfModal?: () => void;
  onClearFilters: () => void;
  totalFiltered: number;
  totalOriginal: number;
  hideSearchAndViewMode?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  showFilters = true,
  hideSearchAndViewMode = false,
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
  viewMode,
  onViewModeChange,
  onExportExcel,
  onExportCsv,
  onOpenPdfModal,
  onClearFilters,
  totalFiltered,
  totalOriginal,
}) => {
  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedTypes.length > 0 ||
    selectedRegions.length > 0 ||
    selectedUnits.length > 0 ||
    selectedGerentes.length > 0 ||
    selectedCoordinadores.length > 0;

  return (
    <div className="w-full max-w-full md:max-w-[1440px] mx-auto px-2.5 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-1">
      <div className="bg-white/95 rounded-2xl sm:rounded-3xl border border-[#EAE5E1] p-2.5 sm:p-4 shadow-2xs flex flex-col gap-2.5 sm:gap-3 w-full max-w-full">
        {/* Row 1: Search and Actions (rendered only if not hidden) */}
        {!hideSearchAndViewMode && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-3 w-full max-w-full">
            {/* Smart Search box */}
            <div className="relative flex-1 w-full max-w-full">
              <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-primary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  showFilters
                    ? 'Buscar nombre, cédula, ciudad, teléfono...'
                    : 'Buscar líder, cédula, cargo, región...'
                }
                className="w-full max-w-full pl-9 sm:pl-10 pr-8 sm:pr-9 py-2 sm:py-2.5 text-sm bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl sm:rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-all placeholder:text-slate-400 font-medium text-[#1A1A1E]"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action cluster: View Mode & Export */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto max-w-full">
              {/* View Mode Switcher */}
              <div className="grid grid-cols-2 sm:inline-flex bg-[#F8F4F2] p-0.5 sm:p-1 rounded-xl sm:rounded-full border border-[#EAE5E1]">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 sm:px-3 rounded-lg sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-theme-primary text-white shadow-2xs'
                      : 'text-slate-600 hover:text-theme-primary'
                  }`}
                  title="Vista Tarjetas"
                >
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Tarjetas</span>
                </button>
                <button
                  onClick={() => onViewModeChange('table')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 sm:px-3 rounded-lg sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-theme-primary text-white shadow-2xs'
                      : 'text-slate-600 hover:text-theme-primary'
                  }`}
                  title="Vista Tabla"
                >
                  <Table2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Tabla</span>
                </button>
              </div>

              {/* Export Excel (.xlsx) Button */}
              <button
                onClick={onExportExcel || onExportCsv}
                className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 rounded-xl sm:rounded-full transition-all cursor-pointer truncate shadow-2xs"
                title="Descargar Agenda de Representantes (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Excel</span>
              </button>

              {/* Export PDF Button */}
              {onOpenPdfModal && (
                <button
                  onClick={onOpenPdfModal}
                  className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#FF4800] to-[#FF8F32] hover:opacity-90 rounded-xl sm:rounded-full transition-all cursor-pointer shadow-2xs truncate"
                  title="Exportar a PDF / Imprimir"
                >
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">PDF</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Row 2: Multi-select Faceted Filters (1 column on mobile, horizontal wrap on sm+) */}
        {showFilters && (
          <div
            className={`grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-2 w-full max-w-full ${
              !hideSearchAndViewMode ? 'pt-2 border-t border-[#EAE5E1]' : ''
            }`}
          >
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

            {/* 6. Botón final: Quitar Filtro */}
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
          </div>
        )}
      </div>
    </div>
  );
};
