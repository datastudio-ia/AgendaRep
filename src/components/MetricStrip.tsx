import React from 'react';
import { UserCheck, Briefcase, Stethoscope, Award, Compass, MapPin, MapPinOff } from 'lucide-react';
import { ActiveTab } from '../types/contact';

interface MetricStripProps {
  activeTab?: ActiveTab;
  countComercial?: number;
  countVisitaMedica?: number;
  countGerentesDistrito?: number;
  countCoordinadores?: number;
  countLaSante?: number;
  countPharmetique?: number;
  countOtc?: number;
  countRegiones?: number;
  countRegionesCubiertas?: number;
  countRegionesSinReps?: number;
}

export const MetricStrip: React.FC<MetricStripProps> = ({
  activeTab,
  countComercial = 19,
  countVisitaMedica = 64,
  countGerentesDistrito = 7,
  countCoordinadores = 5,
  countRegiones = 7,
  countRegionesCubiertas = 15,
  countRegionesSinReps = 9,
}) => {
  if (activeTab === 'map') {
    return (
      <div className="w-full max-w-full mx-auto px-2.5 pt-2.5 pb-1">
        <div className="grid grid-cols-1 gap-2 w-full max-w-full">
          {/* Card 1: Nro de regiones */}
          <div className="bg-white rounded-xl p-2.5 border border-[#EAE5E1] shadow-2xs flex items-center justify-between gap-2.5 select-none w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-theme-secondary-10 flex items-center justify-center text-theme-secondary shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-600 font-bold truncate">
                Nro de regiones
              </div>
            </div>
            <div className="text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
              {countRegiones}
            </div>
          </div>

          {/* Card 2: Estados con Representantes Base */}
          <div className="bg-white rounded-xl p-2.5 border border-[#EAE5E1] shadow-2xs flex items-center justify-between gap-2.5 select-none w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-600 font-bold truncate">
                Estados con Representantes Base
              </div>
            </div>
            <div className="text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
              {countRegionesCubiertas}
            </div>
          </div>

          {/* Card 3: Estados sin Representantes Base */}
          <div className="bg-white rounded-xl p-2.5 border border-[#EAE5E1] shadow-2xs flex items-center justify-between gap-2.5 select-none w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <MapPinOff className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-600 font-bold truncate">
                Estados sin Representantes Base
              </div>
            </div>
            <div className="text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
              {countRegionesSinReps}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto px-2.5 pt-2.5 pb-1">
      {/* Segmentación por Tipo de Representante y Liderazgo en una sola columna vertical */}
      <div className="grid grid-cols-1 gap-2 w-full max-w-full">
        {/* Card 1: Representantes Comerciales */}
        <div className="bg-white rounded-xl p-2.5 border border-[#EAE5E1] shadow-2xs flex items-center justify-between gap-2.5 select-none w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-theme-secondary-10 flex items-center justify-center text-theme-secondary shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-600 font-bold truncate">
              Reps Comerciales
            </div>
          </div>
          <div className="text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
            {countComercial}
          </div>
        </div>

        {/* Card 2: Representantes Visita Médica */}
        <div className="bg-white rounded-xl p-2.5 border border-[#EAE5E1] shadow-2xs flex items-center justify-between gap-2.5 select-none w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-theme-10 flex items-center justify-center text-theme-primary shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-600 font-bold truncate">
              Reps Visita Médica
            </div>
          </div>
          <div className="text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
            {countVisitaMedica}
          </div>
        </div>

        {/* Card 3: Gerentes de Distrito */}
        <div className="bg-white rounded-xl p-2.5 border border-[#EAE5E1] shadow-2xs flex items-center justify-between gap-2.5 select-none w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-600 font-bold truncate">
              Gerentes de Distrito
            </div>
          </div>
          <div className="text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
            {countGerentesDistrito}
          </div>
        </div>

        {/* Card 4: Coordinadores */}
        <div className="bg-white rounded-xl p-2.5 border border-[#EAE5E1] shadow-2xs flex items-center justify-between gap-2.5 select-none w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-600 font-bold truncate">
              Coordinadores
            </div>
          </div>
          <div className="text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
            {countCoordinadores}
          </div>
        </div>
      </div>
    </div>
  );
};

