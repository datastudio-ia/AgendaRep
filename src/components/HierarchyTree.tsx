import React, { useState, useMemo } from 'react';
import { Representante, GerenteDistrito, isRepActive, isGdActive } from '../types/contact';
import {
  Search,
  X,
  Stethoscope,
  ShoppingBag,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Network,
} from 'lucide-react';

interface HierarchyTreeProps {
  reps: Representante[];
  gds: GerenteDistrito[];
  onSelectRep: (rep: Representante) => void;
  onSelectGd: (gd: GerenteDistrito) => void;
}

type OrgPaletteKey = 'sage_sand' | 'ocean_mist' | 'warm_pastel';

interface OrgPaletteConfig {
  label: string;
  canvasBg: string;
  connectorColor: string;
  rootNode: string;
  leaderMedicaNode: string;
  leaderComercialNode: string;
  managerNode: string;
  rowStyles: string[];
}

const ORG_PALETTES: Record<OrgPaletteKey, OrgPaletteConfig> = {
  sage_sand: {
    label: 'Salvia & Arena',
    canvasBg: 'bg-gradient-to-b from-[#EAF3FF] via-[#EFF6FF] to-[#E5F0FE] border-blue-200/80',
    connectorColor: 'bg-[#94A3B8]',
    rootNode: 'bg-[#1F2933] text-[#F8FAFC] border-[#111827]',
    leaderMedicaNode: 'bg-[#2C5E55] text-white border-[#1F463F]',
    leaderComercialNode: 'bg-[#3D4E6D] text-white border-[#2B3952]',
    managerNode: 'bg-[#323F4B] hover:bg-[#1F2933] text-white border-[#1F2933]',
    rowStyles: [
      'bg-[#E3EFEA] hover:bg-[#D2E5DD] border-[#B3CFC3] text-[#1B332A]', // Salvia suave
      'bg-[#F4ECE1] hover:bg-[#EADBC8] border-[#D5C3AA] text-[#3A2E1F]', // Arena cálida
      'bg-[#E6EBF2] hover:bg-[#D5DFEC] border-[#B6C5D8] text-[#1F2D3D]', // Bruma azulada
      'bg-[#F3E5E2] hover:bg-[#E9D2CD] border-[#D4B5AE] text-[#3D2520]', // Arcilla suave
    ],
  },
  ocean_mist: {
    label: 'Océano & Bruma',
    canvasBg: 'bg-gradient-to-b from-[#EAF3FF] via-[#EFF6FF] to-[#E5F0FE] border-blue-200/80',
    connectorColor: 'bg-[#94A3B8]',
    rootNode: 'bg-[#0F172A] text-white border-[#020617]',
    leaderMedicaNode: 'bg-[#0E7490] text-white border-[#155E75]',
    leaderComercialNode: 'bg-[#1D4ED8] text-white border-[#1E40AF]',
    managerNode: 'bg-[#1E293B] hover:bg-[#0F172A] text-white border-[#0F172A]',
    rowStyles: [
      'bg-[#E0F2FE] hover:bg-[#BAE6FD] border-[#93C5FD] text-[#0C4A6E]', // Cielo tenue
      'bg-[#CCFBF1] hover:bg-[#99F6E4] border-[#5EEAD4] text-[#134E4A]', // Turquesa pálido
      'bg-[#E0E7FF] hover:bg-[#C7D2FE] border-[#A5B4FC] text-[#1E1B4B]', // Índigo bruma
      'bg-[#F8FAFC] hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#0F172A]', // Pizarra perla
    ],
  },
  warm_pastel: {
    label: 'Pastel Suave',
    canvasBg: 'bg-gradient-to-b from-[#EAF3FF] via-[#EFF6FF] to-[#E5F0FE] border-blue-200/80',
    connectorColor: 'bg-[#94A3B8]',
    rootNode: 'bg-[#292524] text-white border-[#1C1917]',
    leaderMedicaNode: 'bg-[#44403C] text-white border-[#292524]',
    leaderComercialNode: 'bg-[#57534E] text-white border-[#44403C]',
    managerNode: 'bg-[#3F3B39] hover:bg-[#292524] text-white border-[#292524]',
    rowStyles: [
      'bg-[#F9F0C7] hover:bg-[#F3E5A8] border-[#DEC983] text-[#3B3212]', // Crema vainilla
      'bg-[#E5E3F7] hover:bg-[#D4D0F2] border-[#B7B2E0] text-[#262344]', // Lavanda tenue
      'bg-[#E2F4DC] hover:bg-[#CFEBC6] border-[#AFD4A3] text-[#1D3616]', // Menta pastel
      'bg-[#F7DFDC] hover:bg-[#F0CBC6] border-[#D9AEA8] text-[#401F1B]', // Coral empolvado
    ],
  },
};

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  reps,
  gds,
  onSelectRep,
  onSelectGd,
}) => {
  const [activeDivision, setActiveDivision] = useState<'medica' | 'comercial' | 'all'>('medica');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [zoom, setZoom] = useState<number>(100);

  const palette = ORG_PALETTES.sage_sand;

  // Unique regions list for quick filtering
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    gds.forEach((g) => {
      if (g.region) set.add(g.region.trim().toUpperCase());
    });
    return Array.from(set).sort();
  }, [gds]);

  // Robust lookup of reps by manager with alias and canonical resolution
  const managerToReps = useMemo(() => {
    const map: Record<string, Representante[]> = {};
    gds.forEach((g) => {
      map[g.nombre.trim()] = [];
    });
    reps.forEach((r) => {
      const repMgr = r.gerenteDistrito?.trim();
      if (!repMgr) return;
      const matched = gds.find(
        (g) =>
          g.nombre.toUpperCase() === repMgr.toUpperCase() ||
          (g.nombre.includes('RICARDO GUEVARA') && repMgr.includes('CENTRO VACANTE')) ||
          ((g.nombre.includes('ORIENTE') || g.nombre.includes('EI-LING')) &&
            (repMgr.includes('EI-LING') || repMgr.includes('ORIENTE')))
      );
      if (matched) {
        map[matched.nombre.trim()].push(r);
      } else {
        if (!map[repMgr]) map[repMgr] = [];
        map[repMgr].push(r);
      }
    });
    return map;
  }, [reps, gds]);

  // Group managers by division
  const medicaGds = useMemo(() => {
    return gds.filter(
      (g) =>
        g.supervisor?.toUpperCase() === 'ISABEL MEDINA' ||
        !g.cargo.toUpperCase().includes('COORDINADOR')
    );
  }, [gds]);

  const comercialGds = useMemo(() => {
    return gds.filter(
      (g) =>
        g.supervisor?.toUpperCase() === 'JUANITA HURTADO' ||
        g.cargo.toUpperCase().includes('COORDINADOR')
    );
  }, [gds]);

  // Filter managers based on search query and region
  const filterManagers = (list: GerenteDistrito[]) => {
    return list.filter((gd) => {
      const team = managerToReps[gd.nombre.trim()] || [];
      const matchesRegion =
        selectedRegion === 'all' ||
        gd.region?.toUpperCase().includes(selectedRegion.toUpperCase());

      if (!matchesRegion) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchGd =
        gd.nombre.toLowerCase().includes(q) ||
        gd.region.toLowerCase().includes(q);

      const matchAnyRep = team.some((r) => r.nombre.toLowerCase().includes(q));
      return matchGd || matchAnyRep;
    });
  };

  const filteredMedicaGds = useMemo(
    () => filterManagers(medicaGds),
    [medicaGds, managerToReps, selectedRegion, searchQuery]
  );
  const filteredComercialGds = useMemo(
    () => filterManagers(comercialGds),
    [comercialGds, managerToReps, selectedRegion, searchQuery]
  );

  // Render an organigrama branch with the selected color palette
  const renderOrgChartBranch = (
    secondLeaderName: string,
    managers: GerenteDistrito[],
    branchType: 'medica' | 'comercial'
  ) => {
    const q = searchQuery.toLowerCase().trim();
    const leaderNodeClass =
      branchType === 'medica' ? palette.leaderMedicaNode : palette.leaderComercialNode;

    return (
      <div className="flex flex-col items-center w-full">
        {/* National Division Leader Pill Node */}
        <div
          className={`px-8 py-3.5 rounded-full border shadow-sm min-w-[220px] max-w-[290px] text-center ${leaderNodeClass}`}
        >
          <span className="text-xs sm:text-sm font-extrabold tracking-tight block leading-snug">
            {secondLeaderName}
          </span>
        </div>

        {/* Vertical Stem from Leader down to Horizontal Branching Bar */}
        {managers.length > 0 && <div className={`w-0.5 h-7 ${palette.connectorColor}`} />}

        {/* Manager Columns + Subordinate Vertical Chains */}
        {managers.length > 0 ? (
          <div className="flex items-start justify-center w-full">
            {managers.map((gd, colIdx) => {
              const rawTeam = managerToReps[gd.nombre.trim()] || [];
              const teamReps = q
                ? rawTeam.filter(
                    (r) =>
                      r.nombre.toLowerCase().includes(q) ||
                      gd.nombre.toLowerCase().includes(q)
                  )
                : rawTeam;

              const isFirst = colIdx === 0;
              const isLast = colIdx === managers.length - 1;
              const isSingle = managers.length === 1;
              const gdActive = isGdActive(gd);

              return (
                <div
                  key={gd.id}
                  className="flex flex-col items-center relative px-2 sm:px-2.5 flex-1 min-w-[175px] max-w-[225px]"
                >
                  {/* Horizontal connector line across columns */}
                  {!isSingle && (
                    <div className="w-full flex items-center h-0.5">
                      <div
                        className={`w-1/2 h-0.5 ${
                          isFirst ? 'bg-transparent' : palette.connectorColor
                        }`}
                      />
                      <div
                        className={`w-1/2 h-0.5 ${
                          isLast ? 'bg-transparent' : palette.connectorColor
                        }`}
                      />
                    </div>
                  )}

                  {/* Vertical drop stem into Manager Box */}
                  <div className={`w-0.5 h-6 ${palette.connectorColor}`} />

                  {/* Manager / Coordinator Rectangular Node (Name Only) */}
                  <button
                    type="button"
                    onClick={() => onSelectGd(gd)}
                    className={`w-full min-h-[58px] px-3.5 py-3 rounded-xl border shadow-xs flex items-center justify-center text-center transition-all cursor-pointer ${palette.managerNode} ${
                      !gdActive ? 'opacity-75' : ''
                    }`}
                    title={`Ver ficha de ${gd.nombre}`}
                  >
                    <span className="text-xs font-bold tracking-tight leading-snug break-words">
                      {gd.nombre}
                    </span>
                  </button>

                  {/* Vertical Chain of Collaborators (Representantes) */}
                  {teamReps.map((rep, rowIdx) => {
                    const rowStyle =
                      palette.rowStyles[rowIdx % palette.rowStyles.length];
                    const repActive = isRepActive(rep);

                    return (
                      <React.Fragment key={rep.id}>
                        {/* Vertical connector line between boxes */}
                        <div className={`w-0.5 h-4 ${palette.connectorColor}`} />

                        {/* Collaborator Rectangular Node (Name Only) */}
                        <button
                          type="button"
                          onClick={() => onSelectRep(rep)}
                          className={`w-full min-h-[52px] px-3 py-2.5 rounded-xl border shadow-2xs flex items-center justify-center text-center transition-all cursor-pointer ${rowStyle} ${
                            !repActive ? 'opacity-60' : ''
                          }`}
                          title={`Ver ficha de ${rep.nombre}`}
                        >
                          <span className="text-xs font-semibold leading-snug break-words">
                            {rep.nombre}
                          </span>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/80 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs mt-4">
            No se encontraron colaboradores con los filtros seleccionados.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full max-w-full overflow-x-hidden animate-in fade-in duration-200">
      {/* Header & Filter Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#EAE5E1] shadow-2xs flex flex-col gap-3.5 w-full">
        {/* Top Row: Title + Palette Selector + Division Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#2C5E55] text-white flex items-center justify-center shadow-2xs shrink-0">
              <Network className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-[#1A1A1E] tracking-tight truncate">
                Organigrama de Colaboradores
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate">
                Haz clic sobre cualquier líder o colaborador para consultar su ficha
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Division Selector */}
            <div className="grid grid-cols-3 sm:inline-flex p-1 bg-[#F8F4F2] rounded-xl sm:rounded-full border border-[#EAE5E1] w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveDivision('medica')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeDivision === 'medica'
                    ? 'bg-[#2C5E55] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                <span>Promoción Médica</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDivision('comercial')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeDivision === 'comercial'
                    ? 'bg-[#3D4E6D] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>Comercial</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDivision('all')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeDivision === 'all'
                    ? 'bg-[#1F2933] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Ambas Divisiones</span>
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Search Input, Region Pills & Zoom Controls */}
        <div className="pt-2.5 border-t border-[#EAE5E1]/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar colaborador por nombre..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl sm:rounded-full text-[#1A1A1E] placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#2C5E55] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto scrollbar-none">
            {/* Region Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              <span className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider shrink-0 mr-0.5">
                Región:
              </span>
              <button
                type="button"
                onClick={() => setSelectedRegion('all')}
                className={`px-3 py-1.5 rounded-xl sm:rounded-full font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap border ${
                  selectedRegion === 'all'
                    ? 'bg-[#1F2933] text-white border-[#1F2933] shadow-2xs'
                    : 'bg-[#F8F4F2] text-slate-700 border-[#EAE5E1] hover:bg-slate-200/60'
                }`}
              >
                Todas
              </button>
              {availableRegions.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-1.5 rounded-xl sm:rounded-full font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap border ${
                    selectedRegion === reg
                      ? 'bg-[#2C5E55] text-white border-[#2C5E55] shadow-2xs'
                      : 'bg-[#F8F4F2] text-slate-700 border-[#EAE5E1] hover:bg-slate-200/60'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="inline-flex items-center gap-1 bg-[#F8F4F2] px-2.5 py-1 rounded-xl sm:rounded-full border border-[#EAE5E1] shrink-0">
              <button
                type="button"
                onClick={() =>
                  setZoom((z) => (z === 110 ? 100 : z === 100 ? 90 : 75))
                }
                className="p-1 text-slate-600 hover:text-slate-900 rounded cursor-pointer transition-colors"
                title="Alejar"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-700 px-1 tabular-nums">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() =>
                  setZoom((z) => (z === 75 ? 90 : z === 90 ? 100 : 110))
                }
                className="p-1 text-slate-600 hover:text-slate-900 rounded cursor-pointer transition-colors"
                title="Acercar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              {zoom !== 100 && (
                <button
                  type="button"
                  onClick={() => setZoom(100)}
                  className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer transition-colors"
                  title="Restablecer zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Soft Blue Organigrama Canvas (Fondo Azul Tenue) */}
      <div
        className={`rounded-2xl sm:rounded-3xl border p-6 sm:p-10 overflow-x-auto shadow-inner min-h-[620px] transition-colors duration-200 ${palette.canvasBg}`}
      >
        <div
          className={`origin-top transition-transform duration-150 min-w-max mx-auto flex flex-col gap-14 pb-8 ${
            zoom === 75
              ? 'scale-75'
              : zoom === 90
              ? 'scale-90'
              : zoom === 110
              ? 'scale-110'
              : 'scale-100'
          }`}
        >
          {/* Branch 1: Promoción Médica */}
          {(activeDivision === 'medica' || activeDivision === 'all') &&
            renderOrgChartBranch(
              'Isabel Medina',
              filteredMedicaGds,
              'medica'
            )}

          {/* Branch 2: Comercial & Trade Marketing */}
          {(activeDivision === 'comercial' || activeDivision === 'all') &&
            renderOrgChartBranch(
              'Juanita Hurtado',
              filteredComercialGds,
              'comercial'
            )}
        </div>
      </div>
    </div>
  );
};
