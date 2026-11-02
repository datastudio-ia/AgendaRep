import React, { useMemo } from 'react';
import { Representante, ViewMode, isRepComercial, isRepActive } from '../types/contact';
import { RepresentantesList } from './RepresentantesList';
import { LinkedSpreadsheetInfo } from '../services/sheetsService';
import { getMappedUnit } from '../App';
import { Users, UserPlus, Pill, Sparkles, HeartPulse, RefreshCw, FileSpreadsheet } from 'lucide-react';

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
}) => {
  // Combine all representatives into a single unified directory list sorted alphabetically
  const unifiedReps = useMemo(() => {
    const baseList = reps ? reps : [...repsComerciales, ...repsVisitaMedica];
    return [...baseList].sort((a, b) =>
      (a.nombre || '').trim().localeCompare((b.nombre || '').trim(), 'es', { sensitivity: 'base' })
    );
  }, [reps, repsComerciales, repsVisitaMedica]);

  // Contabilizar ÚNICAMENTE representantes activos (no inactivos)
  const countComerciales = useMemo(() => {
    return unifiedReps.filter((r) => isRepActive(r) && isRepComercial(r)).length;
  }, [unifiedReps]);

  const countVisitaMedica = useMemo(() => {
    return unifiedReps.filter((r) => isRepActive(r) && !isRepComercial(r)).length;
  }, [unifiedReps]);

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
              <p className="text-xs text-slate-500 font-medium truncate">
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

        {/* Las tres etiquetas informativas: 1 col en móvil, 3 cols en PC */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-2 sm:pt-4 border-t border-[#EAE5E1]/80 w-full">
          {/* Selector 1: La Santé */}
          <div
            className="bg-[#F8F4F2]/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#EAE5E1] flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3.5 select-none w-full"
            title="Unidad de Negocio: La Santé"
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600 shrink-0">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5 -rotate-45" />
              </div>
              <div className="min-w-0">
                <div className="hidden sm:block text-xl font-black text-[#1A1A1E] font-mono tabular-nums leading-none">
                  {countLaSanteCalc}
                </div>
                <div className="text-sm sm:text-xs text-[#1A1A1E] sm:text-slate-600 font-black sm:font-bold truncate tracking-tight sm:mt-1">
                  La Santé
                </div>
              </div>
            </div>
            <div className="sm:hidden text-sm font-black text-[#1A1A1E] font-mono tabular-nums bg-white px-2.5 py-1 rounded-lg border border-[#EAE5E1]/70 shadow-2xs shrink-0">
              {countLaSanteCalc}
            </div>
          </div>

          {/* Selector 2: Pharmetique */}
          <div
            className="bg-[#F8F4F2]/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#EAE5E1] flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3.5 select-none w-full"
            title="Unidad de Negocio: Pharmetique"
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="hidden sm:block text-xl font-black text-[#1A1A1E] font-mono tabular-nums leading-none">
                  {countPharmetiqueCalc}
                </div>
                <div className="text-sm sm:text-xs text-[#1A1A1E] sm:text-slate-600 font-black sm:font-bold truncate tracking-tight sm:mt-1">
                  Pharmetique
                </div>
              </div>
            </div>
            <div className="sm:hidden text-sm font-black text-[#1A1A1E] font-mono tabular-nums bg-white px-2.5 py-1 rounded-lg border border-[#EAE5E1]/70 shadow-2xs shrink-0">
              {countPharmetiqueCalc}
            </div>
          </div>

          {/* Selector 3: OTC */}
          <div
            className="bg-[#F8F4F2]/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#EAE5E1] flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3.5 select-none w-full"
            title="Unidad de Negocio: OTC"
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-600 shrink-0">
                <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="hidden sm:block text-xl font-black text-[#1A1A1E] font-mono tabular-nums leading-none">
                  {countOtcCalc}
                </div>
                <div className="text-sm sm:text-xs text-[#1A1A1E] sm:text-slate-600 font-black sm:font-bold truncate tracking-tight sm:mt-1">
                  OTC
                </div>
              </div>
            </div>
            <div className="sm:hidden text-sm font-black text-[#1A1A1E] font-mono tabular-nums bg-white px-2.5 py-1 rounded-lg border border-[#EAE5E1]/70 shadow-2xs shrink-0">
              {countOtcCalc}
            </div>
          </div>
        </div>
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
