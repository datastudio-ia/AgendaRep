import React, { useState } from 'react';
import { Representante, ViewMode } from '../types/contact';
import { RepresentantesList } from './RepresentantesList';
import { Pill, Sparkles, HeartPulse, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface BusinessUnitSelectorProps {
  repsLaSante: Representante[];
  repsPharmetique: Representante[];
  repsOtc: Representante[];
  totalLaSante: number;
  totalPharmetique: number;
  totalOtc: number;
  viewMode: ViewMode;
  onSelectRep: (rep: Representante) => void;
  onFilterByManager: (managerName: string) => void;
  onFilterByRegion: (regionName: string) => void;
}

export type UnitCategory = 'lasante' | 'pharmetique' | 'otc' | 'all' | null;

export const BusinessUnitSelector: React.FC<BusinessUnitSelectorProps> = ({
  repsLaSante,
  repsPharmetique,
  repsOtc,
  totalLaSante,
  totalPharmetique,
  totalOtc,
  viewMode,
  onSelectRep,
  onFilterByManager,
  onFilterByRegion,
}) => {
  // Currently active unit to deploy, default to 'lasante' or toggleable
  const [activeUnit, setActiveUnit] = useState<UnitCategory>('lasante');

  const toggleUnit = (unit: UnitCategory) => {
    setActiveUnit((prev) => (prev === unit ? null : unit));
  };

  return (
    <div className="mt-12 pt-8 border-t-2 border-[#EAE5E1] space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-[#EAE5E1] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0850FD] to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0850FD] mb-0.5">
              Desglose Operativo por Líneas
            </div>
            <h2 className="text-xl font-black text-[#1A1A1E] tracking-tight">
              Directorios por Unidad de Negocio
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Presiona cualquiera de los 3 botones para desplegar los representantes correspondientes a cada unidad.
            </p>
          </div>
        </div>

        {/* View all button toggle */}
        <button
          onClick={() => setActiveUnit((prev) => (prev === 'all' ? null : 'all'))}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto ${
            activeUnit === 'all'
              ? 'bg-[#0850FD] text-white shadow-xs'
              : 'bg-[#F8F4F2] text-[#1A1A1E] hover:bg-slate-200/70 border border-[#EAE5E1]'
          }`}
        >
          {activeUnit === 'all' ? 'Contraer Todos' : 'Desplegar las 3 Unidades'}
        </button>
      </div>

      {/* The 3 Interactive Buttons by Business Unit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Primer Botón: La Santé (6 - LA SANTE) */}
        <button
          onClick={() => toggleUnit('lasante')}
          className={`p-5 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeUnit === 'lasante' || activeUnit === 'all'
              ? 'bg-white border-[#0850FD] ring-2 ring-[#0850FD]/20 shadow-md'
              : 'bg-white/80 hover:bg-white border-[#EAE5E1] hover:border-[#0850FD]/40 shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                  activeUnit === 'lasante' || activeUnit === 'all'
                    ? 'bg-[#0850FD] text-white shadow-xs'
                    : 'bg-[#0850FD]/10 text-[#0850FD]'
                }`}
              >
                <Pill className="w-6 h-6 -rotate-45" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-extrabold text-[#0850FD] tracking-wider">
                  6 - LA SANTE
                </div>
                <h3 className="text-lg font-black text-[#1A1A1E] tracking-tight group-hover:text-[#0850FD] transition-colors">
                  La Santé
                </h3>
              </div>
            </div>

            {/* Número (Primero nombre, luego número) */}
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-black font-mono tabular-nums shrink-0 transition-colors ${
                activeUnit === 'lasante' || activeUnit === 'all'
                  ? 'bg-[#0850FD] text-white shadow-xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border border-[#EAE5E1]'
              }`}
            >
              {repsLaSante.length} Reps
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-[#EAE5E1] text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span className="truncate">Línea Ética Principal La Santé</span>
            <span className="flex items-center gap-1 font-bold text-[#0850FD]">
              {activeUnit === 'lasante' || activeUnit === 'all' ? (
                <>
                  <span>Desplegado</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Ver equipo</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </span>
          </div>
        </button>

        {/* Segundo Botón: Pharmetique (Líneas 1, 2, 3 e Híbridas 1, 2, 3) */}
        <button
          onClick={() => toggleUnit('pharmetique')}
          className={`p-5 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeUnit === 'pharmetique' || activeUnit === 'all'
              ? 'bg-white border-[#0850FD] ring-2 ring-[#0850FD]/20 shadow-md'
              : 'bg-white/80 hover:bg-white border-[#EAE5E1] hover:border-[#0850FD]/40 shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                  activeUnit === 'pharmetique' || activeUnit === 'all'
                    ? 'bg-gradient-to-br from-[#0284C7] to-[#00A3FF] text-white shadow-xs'
                    : 'bg-[#0284C7]/10 text-[#0284C7]'
                }`}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-extrabold text-[#0284C7] tracking-wider">
                  Líneas 1, 2, 3 &amp; Híbridas
                </div>
                <h3 className="text-lg font-black text-[#1A1A1E] tracking-tight group-hover:text-[#0850FD] transition-colors">
                  Pharmetique
                </h3>
              </div>
            </div>

            {/* Número (Primero nombre, luego número) */}
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-black font-mono tabular-nums shrink-0 transition-colors ${
                activeUnit === 'pharmetique' || activeUnit === 'all'
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border border-[#EAE5E1]'
              }`}
            >
              {repsPharmetique.length} Reps
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-[#EAE5E1] text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span className="truncate">Línea 1, 2, 3 · Híbrida 1, 2, 3</span>
            <span className="flex items-center gap-1 font-bold text-[#0284C7]">
              {activeUnit === 'pharmetique' || activeUnit === 'all' ? (
                <>
                  <span>Desplegado</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Ver equipo</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </span>
          </div>
        </button>

        {/* Tercer Botón: OTC (7 - OTC) */}
        <button
          onClick={() => toggleUnit('otc')}
          className={`p-5 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeUnit === 'otc' || activeUnit === 'all'
              ? 'bg-white border-[#0850FD] ring-2 ring-[#0850FD]/20 shadow-md'
              : 'bg-white/80 hover:bg-white border-[#EAE5E1] hover:border-[#0850FD]/40 shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                  activeUnit === 'otc' || activeUnit === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-500/10 text-emerald-600'
                }`}
              >
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-extrabold text-emerald-600 tracking-wider">
                  7 - OTC
                </div>
                <h3 className="text-lg font-black text-[#1A1A1E] tracking-tight group-hover:text-[#0850FD] transition-colors">
                  OTC
                </h3>
              </div>
            </div>

            {/* Número (Primero nombre, luego número) */}
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-black font-mono tabular-nums shrink-0 transition-colors ${
                activeUnit === 'otc' || activeUnit === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border border-[#EAE5E1]'
              }`}
            >
              {repsOtc.length} Reps
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-[#EAE5E1] text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span className="truncate">Medicamentos de Venta Libre</span>
            <span className="flex items-center gap-1 font-bold text-emerald-600">
              {activeUnit === 'otc' || activeUnit === 'all' ? (
                <>
                  <span>Desplegado</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Ver equipo</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </span>
          </div>
        </button>
      </div>

      {/* Deployed Content Area */}
      <div className="space-y-8">
        {/* 1. Despliegue La Santé */}
        {(activeUnit === 'lasante' || activeUnit === 'all') && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-5 border border-[#EAE5E1] shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0850FD]/10 text-[#0850FD] flex items-center justify-center">
                  <Pill className="w-5 h-5 -rotate-45" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#1A1A1E] tracking-tight">
                      Directorio Unidad: La Santé
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase bg-[#0850FD]/10 text-[#0850FD] px-2.5 py-0.5 rounded-full">
                      6 - LA SANTE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Línea Ética y Especialidades Médicas
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-[#0850FD]/10 text-[#0850FD] font-black text-xs font-mono tabular-nums">
                {repsLaSante.length} de {totalLaSante} Representantes
              </span>
            </div>

            <RepresentantesList
              reps={repsLaSante}
              viewMode={viewMode}
              onSelectRep={onSelectRep}
              onFilterByManager={onFilterByManager}
              onFilterByRegion={onFilterByRegion}
            />
          </div>
        )}

        {/* 2. Despliegue Pharmetique */}
        {(activeUnit === 'pharmetique' || activeUnit === 'all') && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-5 border border-[#EAE5E1] shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#1A1A1E] tracking-tight">
                      Directorio Unidad: Pharmetique
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase bg-[#0284C7]/10 text-[#0284C7] px-2.5 py-0.5 rounded-full">
                      6 Líneas Éticas &amp; Híbridas
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    8 - LINEA 1 · 9 - LINEA 2 · 4 - LINEA 3 · 1 - LINEA HIBRIDA 1 · 2 - LINEA HIBRIDA 2 · 5 - LINEA HIBRIDA 3
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-[#0284C7]/10 text-[#0284C7] font-black text-xs font-mono tabular-nums">
                {repsPharmetique.length} de {totalPharmetique} Representantes
              </span>
            </div>

            <RepresentantesList
              reps={repsPharmetique}
              viewMode={viewMode}
              onSelectRep={onSelectRep}
              onFilterByManager={onFilterByManager}
              onFilterByRegion={onFilterByRegion}
            />
          </div>
        )}

        {/* 3. Despliegue OTC */}
        {(activeUnit === 'otc' || activeUnit === 'all') && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-5 border border-[#EAE5E1] shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#1A1A1E] tracking-tight">
                      Directorio Unidad: OTC
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      7 - OTC
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Línea de Consumo Masivo y Farmacias (Over-The-Counter)
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-xs font-mono tabular-nums">
                {repsOtc.length} de {totalOtc} Representantes
              </span>
            </div>

            <RepresentantesList
              reps={repsOtc}
              viewMode={viewMode}
              onSelectRep={onSelectRep}
              onFilterByManager={onFilterByManager}
              onFilterByRegion={onFilterByRegion}
            />
          </div>
        )}
      </div>
    </div>
  );
};
