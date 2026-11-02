import React from 'react';
import { RepCategory } from '../types/contact';
import { Briefcase, Stethoscope, LayoutGrid } from 'lucide-react';

interface SegmentSelectorProps {
  selectedCategory: RepCategory;
  onSelectCategory: (category: RepCategory) => void;
  countComercial: number;
  countVisitaMedica: number;
  totalFiltered: number;
}

export const SegmentSelector: React.FC<SegmentSelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  countComercial,
  countVisitaMedica,
  totalFiltered,
}) => {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Button 1: Representantes Comerciales */}
        <button
          onClick={() => onSelectCategory('comercial')}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            selectedCategory === 'comercial'
              ? 'bg-white border-[#0850FD] ring-2 ring-[#0850FD]/20 shadow-md'
              : 'bg-white/70 hover:bg-white border-[#EAE5E1] hover:border-[#0850FD]/40 shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                  selectedCategory === 'comercial'
                    ? 'bg-gradient-to-br from-[#0284C7] to-[#00A3FF] text-white shadow-xs'
                    : 'bg-[#0284C7]/10 text-[#0284C7]'
                }`}
              >
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase font-extrabold text-[#0284C7] tracking-wider">
                  3 - Comercial
                </div>
                <h3 className="text-base font-black text-[#1A1A1E] tracking-tight group-hover:text-[#0850FD] transition-colors">
                  Representantes Comerciales
                </h3>
              </div>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full text-xs font-black font-mono tabular-nums shrink-0 transition-colors ${
                selectedCategory === 'comercial'
                  ? 'bg-[#0850FD] text-white shadow-xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border border-[#EAE5E1]'
              }`}
            >
              {countComercial} Reps
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#EAE5E1] text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Canal Farmacias &amp; Cuentas Clave</span>
            {selectedCategory === 'comercial' && (
              <span className="text-[#0850FD] font-bold">● Directorio activo</span>
            )}
          </div>
        </button>

        {/* Button 2: Representantes Visita Médica */}
        <button
          onClick={() => onSelectCategory('visita_medica')}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            selectedCategory === 'visita_medica'
              ? 'bg-white border-[#0850FD] ring-2 ring-[#0850FD]/20 shadow-md'
              : 'bg-white/70 hover:bg-white border-[#EAE5E1] hover:border-[#0850FD]/40 shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                  selectedCategory === 'visita_medica'
                    ? 'bg-[#0850FD] text-white shadow-xs'
                    : 'bg-[#0850FD]/10 text-[#0850FD]'
                }`}
              >
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase font-extrabold text-[#0850FD] tracking-wider">
                  Líneas Éticas &amp; Híbridas
                </div>
                <h3 className="text-base font-black text-[#1A1A1E] tracking-tight group-hover:text-[#0850FD] transition-colors">
                  Representantes Visita Médica
                </h3>
              </div>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full text-xs font-black font-mono tabular-nums shrink-0 transition-colors ${
                selectedCategory === 'visita_medica'
                  ? 'bg-[#0850FD] text-white shadow-xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border border-[#EAE5E1]'
              }`}
            >
              {countVisitaMedica} Reps
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#EAE5E1] text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>La Santé, Líneas 1-3, Híbridas &amp; OTC</span>
            {selectedCategory === 'visita_medica' && (
              <span className="text-[#0850FD] font-bold">● Directorio activo</span>
            )}
          </div>
        </button>

        {/* Button 3: Desplegar Ambos Directorios */}
        <button
          onClick={() => onSelectCategory('split')}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            selectedCategory === 'split'
              ? 'bg-white border-[#0850FD] ring-2 ring-[#0850FD]/20 shadow-md'
              : 'bg-white/70 hover:bg-white border-[#EAE5E1] hover:border-[#0850FD]/40 shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                  selectedCategory === 'split'
                    ? 'bg-gradient-to-br from-[#1A1A1E] to-slate-700 text-white shadow-xs'
                    : 'bg-slate-200/80 text-[#1A1A1E]'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                  Ambos Segmentos
                </div>
                <h3 className="text-base font-black text-[#1A1A1E] tracking-tight group-hover:text-[#0850FD] transition-colors">
                  Desplegar Ambos Directorios
                </h3>
              </div>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full text-xs font-black font-mono tabular-nums shrink-0 transition-colors ${
                selectedCategory === 'split'
                  ? 'bg-[#0850FD] text-white shadow-xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border border-[#EAE5E1]'
              }`}
            >
              {totalFiltered} Totales
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#EAE5E1] text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Vista simultánea segmentada</span>
            {selectedCategory === 'split' && (
              <span className="text-[#0850FD] font-bold">● Ambos desplegados</span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
