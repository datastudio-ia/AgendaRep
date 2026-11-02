import React, { useMemo } from 'react';
import { Representante, GerenteDistrito, isRepComercial, isRepActive, isGdActive } from '../types/contact';
import { getMappedUnit } from '../App';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  Stethoscope,
  Building2,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  reps: Representante[];
  gds: GerenteDistrito[];
  onSelectGd?: (gd: GerenteDistrito) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  reps,
  gds,
  onSelectGd,
}) => {
  // Contabilizar ÚNICAMENTE representantes y líderes activos
  const activeReps = useMemo(() => reps.filter((r) => isRepActive(r)), [reps]);
  const activeGds = useMemo(() => gds.filter((g) => isGdActive(g)), [gds]);

  // 1. Core KPIs
  const totalReps = activeReps.length;
  const countComercial = activeReps.filter((r) => isRepComercial(r)).length;
  const countVisitaMedica = totalReps - countComercial;

  // 2. Units breakdown (Solo representantes activos)
  const unitStats = useMemo(() => {
    const unitsMap: Record<string, number> = {};
    activeReps.forEach((r) => {
      const u = getMappedUnit(r.unidadNegocio) || 'OTRA';
      unitsMap[u] = (unitsMap[u] || 0) + 1;
    });
    return Object.entries(unitsMap)
      .map(([name, count]) => ({
        name,
        count,
        percent: totalReps > 0 ? Math.round((count / totalReps) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [activeReps, totalReps]);

  // 3. Manager Workload (Solo representantes activos asignados)
  const managerWorkload = useMemo(() => {
    const counts: Record<string, number> = {};
    activeReps.forEach((r) => {
      const m = r.gerenteDistrito?.trim() || 'Sin Asignar';
      counts[m] = (counts[m] || 0) + 1;
    });

    return activeGds
      .map((gd) => {
        const teamSize = counts[gd.nombre.trim()] || 0;
        return {
          id: gd.id,
          nombre: gd.nombre,
          cargo: gd.cargo,
          region: gd.region,
          teamSize,
          isCoordinator: gd.cargo.toUpperCase().includes('COORDINADOR'),
          gdObj: gd,
        };
      })
      .sort((a, b) => b.teamSize - a.teamSize);
  }, [activeReps, activeGds]);

  // Average team size
  const activeManagersWithTeams = managerWorkload.filter((m) => m.teamSize > 0);
  const avgTeamSize = activeManagersWithTeams.length
    ? (totalReps / activeManagersWithTeams.length).toFixed(1)
    : '0';

  // 4. Region Distribution (Solo representantes activos)
  const regionDistribution = useMemo(() => {
    const regMap: Record<string, number> = {};
    activeReps.forEach((r) => {
      const reg = r.region?.trim() || 'Sin Región';
      regMap[reg] = (regMap[reg] || 0) + 1;
    });
    return Object.entries(regMap)
      .map(([region, count]) => ({
        region,
        count,
        percent: totalReps > 0 ? ((count / totalReps) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.count - a.count);
  }, [activeReps, totalReps]);

  // 5. Tenure / Antigüedad Cohorts (Solo representantes activos)
  const tenureCohorts = useMemo(() => {
    const now = new Date();
    let lessThan1Year = 0;
    let oneToThreeYears = 0;
    let threeToFiveYears = 0;
    let moreThanFiveYears = 0;

    activeReps.forEach((r) => {
      if (!r.fechaIngreso) return;
      const parts = r.fechaIngreso.split('/');
      if (parts.length === 3) {
        // DD/MM/YYYY
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        const joinDate = new Date(y, m, d);
        const yearsDiff = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

        if (yearsDiff < 1) lessThan1Year++;
        else if (yearsDiff < 3) oneToThreeYears++;
        else if (yearsDiff < 5) threeToFiveYears++;
        else moreThanFiveYears++;
      } else {
        oneToThreeYears++;
      }
    });

    return [
      { label: '< 1 Año (Nuevos Ingresos)', count: lessThan1Year, color: '#38BDF8' },
      { label: '1 a 3 Años (Consolidación)', count: oneToThreeYears, color: '#10B981' },
      { label: '3 a 5 Años (Madurez Comercial)', count: threeToFiveYears, color: '#0284C7' },
      { label: '> 5 Años (Veteranos / Senior)', count: moreThanFiveYears, color: 'var(--app-primary)' },
    ];
  }, [activeReps]);

  const maxManagerTeam = Math.max(...managerWorkload.map((m) => m.teamSize), 1);

  return (
    <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-full overflow-x-hidden animate-in fade-in duration-200">
      {/* Dashboard Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-[#EAE5E1] shadow-2xs flex flex-col gap-2.5 w-full max-w-full">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl theme-gradient-bg flex items-center justify-center text-white shrink-0 shadow-2xs">
              <BarChart3 className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-[#1A1A1E] tracking-tight truncate">
              Distribución de Representantes
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#F8F4F2] px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl border border-[#EAE5E1] shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-700">100% Validados</span>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards: 1 col on mobile, 2 on tablet, 4 on PC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 w-full max-w-full">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#EAE5E1] shadow-2xs flex sm:flex-col items-center sm:items-stretch justify-between gap-2">
          <div className="flex sm:items-center sm:justify-between flex-col sm:flex-row">
            <div className="text-slate-500 text-xs font-bold">
              Fuerza de Ventas
            </div>
            <Users className="hidden sm:block w-4 h-4 text-theme-primary shrink-0" />
            <div className="sm:hidden text-[11px] text-slate-400 font-medium">
              100% activos en territorio
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0">
            <div className="text-lg sm:text-3xl font-black text-[#1A1A1E] font-mono tabular-nums">
              {totalReps}
            </div>
            <Users className="sm:hidden w-4 h-4 text-theme-primary shrink-0" />
            <div className="hidden sm:block mt-2 text-[11px] text-slate-400 font-medium">
              100% activos en territorio
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#EAE5E1] shadow-2xs flex sm:flex-col items-center sm:items-stretch justify-between gap-2">
          <div className="flex sm:items-center sm:justify-between flex-col sm:flex-row">
            <div className="text-slate-500 text-xs font-bold">
              Promedio Equipo / GD
            </div>
            <TrendingUp className="hidden sm:block w-4 h-4 text-emerald-600 shrink-0" />
            <div className="sm:hidden text-[11px] text-slate-400 font-medium">
              Por gerente de distrito
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0">
            <div className="text-lg sm:text-3xl font-black text-emerald-600 font-mono tabular-nums">
              {avgTeamSize} <span className="text-xs sm:text-sm font-bold text-slate-400">reps</span>
            </div>
            <TrendingUp className="sm:hidden w-4 h-4 text-emerald-600 shrink-0" />
            <div className="hidden sm:block mt-2 text-[11px] text-slate-400 font-medium">
              Por gerente de distrito con asignación
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#EAE5E1] shadow-2xs flex sm:flex-col items-center sm:items-stretch justify-between gap-2">
          <div className="flex sm:items-center sm:justify-between flex-col sm:flex-row">
            <div className="text-slate-500 text-xs font-bold">
              Comercial vs Médica
            </div>
            <Briefcase className="hidden sm:block w-4 h-4 text-theme-secondary shrink-0" />
            <div className="sm:hidden text-[11px] text-slate-400 font-medium">
              {countComercial} Comerciales · {countVisitaMedica} Médicos
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0">
            <div className="text-base sm:text-3xl font-black text-[#1A1A1E] font-mono tabular-nums">
              {Math.round((countComercial / totalReps) * 100)}% / {Math.round((countVisitaMedica / totalReps) * 100)}%
            </div>
            <Briefcase className="sm:hidden w-4 h-4 text-theme-secondary shrink-0" />
            <div className="hidden sm:block mt-2 text-[11px] text-slate-400 font-medium">
              {countComercial} Comerciales · {countVisitaMedica} Médicos
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#EAE5E1] shadow-2xs flex sm:flex-col items-center sm:items-stretch justify-between gap-2">
          <div className="flex sm:items-center sm:justify-between flex-col sm:flex-row">
            <div className="text-slate-500 text-xs font-bold">
              Estructura de Líderes
            </div>
            <Award className="hidden sm:block w-4 h-4 text-purple-600 shrink-0" />
            <div className="sm:hidden text-[11px] text-slate-400 font-medium">
              {activeGds.filter((g) => g.cargo.toUpperCase().includes('GERENTE')).length} Gerentes · {activeGds.filter((g) => g.cargo.toUpperCase().includes('COORDINADOR')).length} Coord.
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0">
            <div className="text-lg sm:text-3xl font-black text-[#1A1A1E] font-mono tabular-nums">
              {activeGds.length} <span className="hidden sm:inline text-sm font-bold text-slate-400">líderes</span>
            </div>
            <Award className="sm:hidden w-4 h-4 text-purple-600 shrink-0" />
            <div className="hidden sm:block mt-2 text-[11px] text-slate-400 font-medium">
              {activeGds.filter((g) => g.cargo.toUpperCase().includes('GERENTE')).length} Gerentes y {activeGds.filter((g) => g.cargo.toUpperCase().includes('COORDINADOR')).length} Coordinadores
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Manager Workload Chart & Regional Distribution (1 col on mobile, 12-col split on PC) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 w-full max-w-full">
        {/* Manager Workload Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-[#EAE5E1] shadow-2xs space-y-3 sm:space-y-5 w-full max-w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-[#1A1A1E] tracking-tight">
                Carga Operativa por Gerente de Distrito
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                Representantes supervisados por líder.
              </p>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#0850FD] bg-[#0850FD]/10 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-mono shrink-0">
              {activeGds.length} Líderes
            </span>
          </div>

          <div className="space-y-2.5 sm:space-y-3 pt-1">
            {managerWorkload.map((m) => {
              const barWidth = (m.teamSize / maxManagerTeam) * 100;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectGd && onSelectGd(m.gdObj)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1 gap-2">
                    <span className="font-bold text-[#1A1A1E] group-hover:text-[#0850FD] transition-colors truncate min-w-0">
                      {m.nombre}
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {m.isCoordinator ? 'Coord.' : 'GD'}
                      </span>
                      <span className="font-mono font-black text-xs text-[#1A1A1E]">
                        {m.teamSize} {m.teamSize === 1 ? 'rep' : 'reps'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 sm:h-3 bg-[#F8F4F2] rounded-full overflow-hidden p-0.5 border border-[#EAE5E1]/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.isCoordinator
                          ? 'bg-gradient-to-r from-sky-400 to-sky-500'
                          : m.teamSize > 8
                          ? 'bg-gradient-to-r from-[#0284C7] to-[#00A3FF]'
                          : 'bg-gradient-to-r from-[#0850FD] to-indigo-600'
                      }`}
                      style={{ width: `${Math.max(barWidth, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Share & Cohort Distribution */}
        <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-6 w-full max-w-full">
          {/* Regional Share */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-[#EAE5E1] shadow-2xs space-y-2.5 sm:space-y-4 w-full max-w-full">
            <h3 className="text-sm sm:text-base font-black text-[#1A1A1E] tracking-tight">
              Participación por Región Territorial
            </h3>

            <div className="space-y-2 sm:space-y-2.5">
              {regionDistribution.map((reg) => (
                <div key={reg.region} className="flex items-center justify-between text-xs gap-2">
                  <span className="font-bold text-[#1A1A1E] truncate min-w-0">
                    {reg.region}
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span className="text-slate-400 font-mono text-[11px]">{reg.percent}%</span>
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#F8F4F2] text-[#1A1A1E] font-mono font-bold text-[11px] min-w-[48px] text-right border border-[#EAE5E1]">
                      {reg.count} reps
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tenure & Antigüedad */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-[#EAE5E1] shadow-2xs space-y-2.5 sm:space-y-4 w-full max-w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-[#1A1A1E] tracking-tight">
                Cohortes de Antigüedad
              </h3>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {tenureCohorts.map((cohort) => {
                const percent = Math.round((cohort.count / totalReps) * 100);
                return (
                  <div key={cohort.label}>
                    <div className="flex items-center justify-between text-xs mb-1 font-bold gap-2">
                      <span className="text-[#1A1A1E] truncate">{cohort.label}</span>
                      <span className="font-mono text-slate-500 shrink-0">
                        {cohort.count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F8F4F2] rounded-full overflow-hidden border border-[#EAE5E1]/60">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: cohort.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Unit Breakdown (1 col on mobile, 2 on tablet, 4 on PC) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-[#EAE5E1] shadow-2xs space-y-2.5 sm:space-y-4 w-full max-w-full">
        <h3 className="text-sm sm:text-base font-black text-[#1A1A1E] tracking-tight">
          Desglose Completo por Unidades y Líneas de Negocio
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 pt-1 w-full max-w-full">
          {unitStats.map((u) => (
            <div
              key={u.name}
              className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F8F4F2] border border-[#EAE5E1] flex sm:flex-col items-center sm:items-stretch justify-between gap-2"
            >
              <div className="text-xs font-black text-[#1A1A1E] leading-snug truncate">
                {u.name}
              </div>
              <div className="flex items-baseline justify-between gap-2 sm:mt-3 shrink-0">
                <span className="text-base sm:text-2xl font-black text-[#0850FD] font-mono tabular-nums">
                  {u.count} <span className="text-[11px] sm:text-xs text-slate-500 font-bold">reps</span>
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {u.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
