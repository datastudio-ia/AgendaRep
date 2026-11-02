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
      <div className="w-full max-w-full md:max-w-[1440px] mx-auto px-2.5 sm:px-6 lg:px-8 pt-2.5 sm:pt-5 pb-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full max-w-full">
          {/* Card 1: Nro de regiones */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#EAE5E1] shadow-2xs flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 select-none w-full">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-theme-secondary-10 flex items-center justify-center text-theme-secondary shrink-0">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="hidden sm:block text-xl font-black text-[#1A1A1E] font-mono tabular-nums leading-none">
                  {countRegiones}
                </div>
                <div className="text-xs text-slate-600 font-bold sm:font-medium truncate sm:mt-1">
                  Nro de regiones
                </div>
              </div>
            </div>
            <div className="sm:hidden text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
              {countRegiones}
            </div>
          </div>

          {/* Card 2: Estados con Representantes Base */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#EAE5E1] shadow-2xs flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 select-none w-full">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="hidden sm:block text-xl font-black text-[#1A1A1E] font-mono tabular-nums leading-none">
                  {countRegionesCubiertas}
                </div>
                <div className="text-xs text-slate-600 font-bold sm:font-medium truncate sm:mt-1">
                  Estados con Representantes Base
                </div>
              </div>
            </div>
            <div className="sm:hidden text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
              {countRegionesCubiertas}
            </div>
          </div>

          {/* Card 3: Estados sin Representantes Base */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#EAE5E1] shadow-2xs flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 select-none w-full">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <MapPinOff className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="hidden sm:block text-xl font-black text-[#1A1A1E] font-mono tabular-nums leading-none">
                  {countRegionesSinReps}
                </div>
                <div className="text-xs text-slate-600 font-bold sm:font-medium truncate sm:mt-1">
                  Estados sin Representantes Base
                </div>
              </div>
            </div>
            <div className="sm:hidden text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
              {countRegionesSinReps}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full md:max-w-[1440px] mx-auto px-2.5 sm:px-6 lg:px-8 pt-2.5 sm:pt-5 pb-1">
      {/* Segmentación por Tipo de Representante y Liderazgo (1 col en móvil, 2 en tablet, 4 en PC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full max-w-full">
        {/* Card 1: Representantes Comerciales */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#EAE5E1] shadow-2xs flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 select-none w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-theme-secondary-10 flex items-center justify-center text-theme-secondary shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="hidden sm:block text-xl font-black text-[#1A1A1E] font-mono tabular-nums leading-none">
                {countComercial}
              </div>
              <div className="text-xs text-slate-600 font-bold sm:font-medium truncate sm:mt-1">
                Reps Comerciales
              </div>
            </div>
          </div>
          <div className="sm:hidden text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
            {countComercial}
          </div>
        </div>

        {/* Card 2: Representantes Visita Médica */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#EAE5E1] shadow-2xs flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 select-none w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-theme-10 flex items-center justify-center text-theme-primary shrink-0">
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="hidden sm:block text-xl font-black text-[#1A1A1E] font-mono tabular-nums leading-none">
                {countVisitaMedica}
              </div>
              <div className="text-xs text-slate-600 font-bold sm:font-medium truncate sm:mt-1">
                Reps Visita Médica
              </div>
            </div>
          </div>
          <div className="sm:hidden text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
            {countVisitaMedica}
          </div>
        </div>

        {/* Card 3: Gerentes de Distrito */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#EAE5E1] shadow-2xs flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 select-none w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="hidden sm:block text-xl font-black text-[#1A1A1E] font-mono tabular-nums leading-none">
                {countGerentesDistrito}
              </div>
              <div className="text-xs text-slate-600 font-bold sm:font-medium truncate sm:mt-1">
                Gerentes de Distrito
              </div>
            </div>
          </div>
          <div className="sm:hidden text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
            {countGerentesDistrito}
          </div>
        </div>

        {/* Card 4: Coordinadores */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#EAE5E1] shadow-2xs flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 select-none w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="hidden sm:block text-xl font-black text-[#1A1A1E] font-mono tabular-nums leading-none">
                {countCoordinadores}
              </div>
              <div className="text-xs text-slate-600 font-bold sm:font-medium truncate sm:mt-1">
                Coordinadores
              </div>
            </div>
          </div>
          <div className="sm:hidden text-base font-black text-[#1A1A1E] font-mono tabular-nums leading-none shrink-0">
            {countCoordinadores}
          </div>
        </div>
      </div>
    </div>
  );
};

