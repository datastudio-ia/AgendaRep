import React from 'react';
import { UserCheck, Briefcase, Award, Compass, MapPin, MapPinOff, Pill, Sparkles, HeartPulse, Users } from 'lucide-react';
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
  countLaSante = 29,
  countPharmetique = 52,
  countOtc = 2,
  countRegiones = 7,
  countRegionesCubiertas = 15,
  countRegionesSinReps = 9,
}) => {
  if (activeTab === 'map') {
    return (
      <div className="w-full max-w-full md:max-w-[1440px] mx-auto px-2.5 sm:px-6 lg:px-8 pt-1 sm:pt-2.5 pb-0.5">
        <div className="bg-white rounded-xl sm:rounded-2xl px-2.5 sm:px-6 py-1.5 sm:py-3 border border-[#EAE5E1] shadow-2xs w-full select-none">
          {/* Vista Móvil: Micro-pills discretos en una sola línea horizontal */}
          <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-theme-secondary-10 border border-theme-secondary-20 shrink-0 text-[11px]">
              <Compass className="w-3 h-3 text-theme-secondary" />
              <span className="text-slate-600 font-medium">Regiones:</span>
              <span className="font-mono font-black text-[#1A1A1E]">{countRegiones}</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 shrink-0 text-[11px]">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span className="text-slate-600 font-medium">Cobertura:</span>
              <span className="font-mono font-black text-emerald-700">{countRegionesCubiertas}</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 shrink-0 text-[11px]">
              <MapPinOff className="w-3 h-3 text-amber-600" />
              <span className="text-slate-600 font-medium">Sin Cobertura:</span>
              <span className="font-mono font-black text-amber-700">{countRegionesSinReps}</span>
            </div>
          </div>

          {/* Vista Escritorio: Grid de 3 columnas completo */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-2.5 sm:gap-6 items-center w-full">
            {/* Item 1: Nro de regiones */}
            <div className="flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50/70 sm:bg-transparent sm:hover:bg-slate-50/60 transition-colors w-full min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-theme-secondary-10 flex items-center justify-center text-theme-secondary shrink-0 shadow-2xs">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-slate-700 truncate">Nro de Regiones</span>
              </div>
              <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-0.5 sm:py-1 rounded-lg shrink-0 bg-slate-100 text-[#1A1A1E] shadow-2xs">
                {countRegiones}
              </span>
            </div>

            {/* Item 2: Estados con Representantes Base */}
            <div className="flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50/70 sm:bg-transparent sm:hover:bg-slate-50/60 transition-colors w-full min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-slate-700 truncate">Estados con Cobertura</span>
              </div>
              <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-0.5 sm:py-1 rounded-lg shrink-0 bg-emerald-50 text-emerald-700 shadow-2xs">
                {countRegionesCubiertas}
              </span>
            </div>

            {/* Item 3: Estados sin Representantes Base */}
            <div className="flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50/70 sm:bg-transparent sm:hover:bg-slate-50/60 transition-colors w-full min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
                  <MapPinOff className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-slate-700 truncate">Sin Representantes Base</span>
              </div>
              <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-0.5 sm:py-1 rounded-lg shrink-0 bg-amber-50 text-amber-700 shadow-2xs">
                {countRegionesSinReps}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full md:max-w-[1440px] mx-auto px-2.5 sm:px-6 lg:px-8 pt-1 sm:pt-2.5 pb-0.5">
      {/* Recuadro de métricas */}
      <div className="bg-white rounded-xl sm:rounded-2xl px-2.5 sm:px-5 py-1.5 sm:py-3 border border-[#EAE5E1] shadow-2xs w-full select-none">
        {/* Vista Móvil: Micro-pills discretos en una sola línea horizontal compacta */}
        <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {/* Item 1: Reps Comerciales */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 shrink-0 text-[11px]">
            <Briefcase className="w-3 h-3 text-emerald-600" />
            <span className="text-slate-600 font-medium">Com:</span>
            <span className="font-mono font-black text-emerald-700">{countComercial}</span>
          </div>

          {/* Item 2: Visita Médica */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 shrink-0 text-[11px]">
            <UserCheck className="w-3 h-3 text-indigo-600" />
            <span className="text-slate-600 font-medium">Méd:</span>
            <span className="font-mono font-black text-indigo-700">{countVisitaMedica}</span>
          </div>

          {/* Item 3: La Santé */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 shrink-0 text-[11px]">
            <Pill className="w-3 h-3 text-blue-600 -rotate-45" />
            <span className="text-slate-600 font-medium">La Santé:</span>
            <span className="font-mono font-black text-blue-700">{countLaSante}</span>
          </div>

          {/* Item 4: Pharmetique */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 shrink-0 text-[11px]">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span className="text-slate-600 font-medium">Pharm:</span>
            <span className="font-mono font-black text-amber-700">{countPharmetique}</span>
          </div>

          {/* Item 5: OTC */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 shrink-0 text-[11px]">
            <HeartPulse className="w-3 h-3 text-rose-600" />
            <span className="text-slate-600 font-medium">OTC:</span>
            <span className="font-mono font-black text-rose-700">{countOtc}</span>
          </div>
        </div>

        {/* Vista Escritorio: Grid de 5 columnas completo */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 items-center w-full">
          {/* Item 1: Reps Comerciales */}
          <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50/70 sm:bg-transparent sm:hover:bg-slate-50/60 transition-colors w-full min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-slate-700 truncate">Reps Comerciales</span>
            </div>
            <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-0.5 sm:py-1 rounded-lg shrink-0 bg-emerald-50 text-emerald-700 shadow-2xs">
              {countComercial}
            </span>
          </div>

          {/* Item 2: Visita Médica (del lado derecho de Reps Comercial) */}
          <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50/70 sm:bg-transparent sm:hover:bg-slate-50/60 transition-colors w-full min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-slate-700 truncate">Visita Médica</span>
            </div>
            <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-0.5 sm:py-1 rounded-lg shrink-0 bg-indigo-50 text-indigo-700 shadow-2xs">
              {countVisitaMedica}
            </span>
          </div>

          {/* Item 3: La Santé */}
          <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50/70 sm:bg-transparent sm:hover:bg-slate-50/60 transition-colors w-full min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                <Pill className="w-3.5 h-3.5 sm:w-4 sm:h-4 -rotate-45" />
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-slate-700 truncate">La Santé</span>
            </div>
            <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-0.5 sm:py-1 rounded-lg shrink-0 bg-blue-50 text-blue-700 shadow-2xs">
              {countLaSante}
            </span>
          </div>

          {/* Item 4: Pharmetique */}
          <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50/70 sm:bg-transparent sm:hover:bg-slate-50/60 transition-colors w-full min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-slate-700 truncate">Pharmetique</span>
            </div>
            <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-0.5 sm:py-1 rounded-lg shrink-0 bg-amber-50 text-amber-700 shadow-2xs">
              {countPharmetique}
            </span>
          </div>

          {/* Item 5: OTC */}
          <div className="col-span-2 sm:col-span-1 flex items-center justify-between gap-2 sm:gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50/70 sm:bg-transparent sm:hover:bg-slate-50/60 transition-colors w-full min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
                <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-slate-700 truncate">OTC</span>
            </div>
            <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-0.5 sm:py-1 rounded-lg shrink-0 bg-rose-50 text-rose-700 shadow-2xs">
              {countOtc}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

