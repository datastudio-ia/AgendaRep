import React, { useState, useMemo } from 'react';
import { Representante, GerenteDistrito, isRepComercial, isRepActive, isGdActive } from '../types/contact';
import {
  Network,
  Users,
  Briefcase,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Eye,
  Building,
  UserCheck,
  Stethoscope,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import { getWhatsAppUrl } from '../utils/phoneUtils';
import { getMappedUnit } from '../App';

interface HierarchyTreeProps {
  reps: Representante[];
  gds: GerenteDistrito[];
  onSelectRep: (rep: Representante) => void;
  onSelectGd: (gd: GerenteDistrito) => void;
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  reps,
  gds,
  onSelectRep,
  onSelectGd,
}) => {
  // Default to Promoción Médica (Isabel Medina)
  const [activeDivision, setActiveDivision] = useState<'medica' | 'comercial' | 'all'>('medica');

  const activeReps = useMemo(() => reps.filter((r) => isRepActive(r)), [reps]);
  const activeGds = useMemo(() => gds.filter((g) => isGdActive(g)), [gds]);

  // Baseline metrics (Solo representantes y líderes activos)
  const countGerentesDistrito = useMemo(() => {
    return activeGds.filter((g) => g.supervisor?.toUpperCase() === 'ISABEL MEDINA' || !g.cargo.toUpperCase().includes('COORDINADOR')).length;
  }, [activeGds]);

  const countCoordinadores = useMemo(() => {
    return activeGds.filter((g) => g.supervisor?.toUpperCase() === 'JUANITA HURTADO' || g.cargo.toUpperCase().includes('COORDINADOR')).length;
  }, [activeGds]);

  const countVisitaMedica = useMemo(() => {
    return activeReps.filter((r) => !isRepComercial(r)).length;
  }, [activeReps]);

  const countComerciales = useMemo(() => {
    return activeReps.filter((r) => isRepComercial(r)).length;
  }, [activeReps]);

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

  // Track expanded nodes
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    gds.forEach((g) => (init[g.nombre.trim()] = true));
    init['ROOT'] = true;
    return init;
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = { ROOT: true };
    gds.forEach((g) => (all[g.nombre.trim()] = true));
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes({ ROOT: true });
  };

  // Group managers by supervisor from database adjustments
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

  const renderManagerCard = (gd: GerenteDistrito) => {
    const teamReps = managerToReps[gd.nombre.trim()] || [];
    const isExpanded = expandedNodes[gd.nombre.trim()] ?? true;
    const isCoordinator = gd.cargo.toUpperCase().includes('COORDINADOR');

    return (
      <div
        key={gd.id}
        className="bg-white rounded-2xl border border-[#EAE5E1] shadow-2xs flex flex-col justify-between overflow-hidden transition-all hover:shadow-sm hover:border-theme-30"
      >
        {/* Manager Header Card */}
        <div className="p-3 border-b border-[#EAE5E1] bg-gradient-to-b from-white to-[#F8F4F2]/40">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs ${
                  isCoordinator
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                    : 'theme-gradient-bg'
                }`}
              >
                <UserCheck className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h4
                  onClick={() => onSelectGd(gd)}
                  className="text-xs md:text-sm font-bold text-[#1A1A1E] tracking-tight hover:text-theme-primary cursor-pointer transition-colors truncate"
                  title={gd.nombre}
                >
                  {gd.nombre}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {gd.region} {gd.codigoSector && `· Sector ${gd.codigoSector}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-[#1A1A1E] text-white font-mono font-bold text-[10px]">
                {teamReps.length} reps
              </span>
              {teamReps.length > 0 && (
                <button
                  onClick={() => toggleNode(gd.nombre.trim())}
                  className="p-1 text-slate-400 hover:text-theme-primary cursor-pointer transition-colors rounded-lg hover:bg-slate-100"
                  title={isExpanded ? 'Colapsar equipo' : 'Desplegar equipo'}
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subordinate Reps Branch */}
        {isExpanded && teamReps.length > 0 && (
          <div className="p-2 bg-[#F8F4F2]/60 flex-1 space-y-1.5">
            {teamReps.map((rep) => {
              const isComercial = isRepComercial(rep);
              return (
                <div
                  key={rep.id}
                  className="px-2.5 py-1.5 bg-white rounded-xl border border-[#EAE5E1] flex items-center justify-between gap-2 group hover:border-theme-primary transition-all shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isComercial ? 'bg-theme-secondary' : 'bg-theme-primary'
                        }`}
                      />
                      <span
                        onClick={() => onSelectRep(rep)}
                        className="text-[11px] font-bold text-[#1A1A1E] group-hover:text-theme-primary cursor-pointer truncate block"
                        title={rep.nombre}
                      >
                        {rep.nombre}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pl-3 truncate">
                      {rep.ciudad} · {getMappedUnit(rep.unidadNegocio)}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <a
                      href={getWhatsAppUrl(rep.telefono, `Hola ${rep.nombre}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-emerald-600 transition-colors rounded hover:bg-slate-50"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => onSelectRep(rep)}
                      className="p-1 text-slate-400 hover:text-theme-primary transition-colors cursor-pointer rounded hover:bg-slate-50"
                      title="Ver ficha"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-5 w-full max-w-full overflow-x-hidden animate-in fade-in duration-200">
      {/* Header Card with Division Switcher & Collapse/Expand */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-[#EAE5E1] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 w-full max-w-full">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#0850FD] to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Network className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <h2 className="text-base md:text-lg font-black text-[#1A1A1E] tracking-tight truncate">
              Organigrama Jerárquico
            </h2>
          </div>

          <div className="flex sm:hidden items-center gap-1 shrink-0">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#1A1A1E] bg-[#F8F4F2] hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Expandir todos los equipos"
            >
              Expandir
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#1A1A1E] bg-[#F8F4F2] hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Colapsar todos los equipos"
            >
              Colapsar
            </button>
          </div>
        </div>

        {/* Division Selector & Desktop Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="grid grid-cols-3 sm:inline-flex gap-1 p-1 sm:p-0.5 bg-[#F8F4F2] rounded-xl border border-[#EAE5E1] w-full sm:w-auto">
            <button
              onClick={() => setActiveDivision('medica')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                activeDivision === 'medica'
                  ? 'bg-white text-theme-primary shadow-2xs'
                  : 'text-slate-600 hover:text-[#1A1A1E]'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate sm:hidden">Médica</span>
              <span className="hidden sm:inline">Promoción Médica</span>
            </button>
            <button
              onClick={() => setActiveDivision('comercial')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                activeDivision === 'comercial'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-[#1A1A1E]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Comercial</span>
            </button>
            <button
              onClick={() => setActiveDivision('all')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                activeDivision === 'all'
                  ? 'bg-white text-[#1A1A1E] shadow-2xs'
                  : 'text-slate-600 hover:text-[#1A1A1E]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">General</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-[#1A1A1E] bg-[#F8F4F2] hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Expandir todos los equipos"
            >
              Expandir todo
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-[#1A1A1E] bg-[#F8F4F2] hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Colapsar todos los equipos"
            >
              Colapsar todo
            </button>
          </div>
        </div>
      </div>

      {/* Visual Hierarchical Tree Container */}
      <div className="flex flex-col gap-5 sm:gap-8 w-full max-w-full">
        {/* Tree Branch 1: Promoción Médica (Isabel Medina) */}
        {(activeDivision === 'medica' || activeDivision === 'all') && (
          <div className="flex flex-col gap-2 sm:gap-4 w-full max-w-full">
            {/* Level 1: Root Node (Isabel Medina) */}
            <div className="flex flex-col items-center w-full">
              <div className="bg-gradient-to-r from-[#1A1A1E] to-slate-800 text-white p-3 sm:p-3.5 rounded-2xl shadow-md border border-slate-700 w-full max-w-full sm:max-w-sm text-center relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl theme-gradient-bg flex items-center justify-center text-white mx-auto mb-1 sm:mb-1.5 shadow-2xs">
                  <Building className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <h3 className="text-sm font-black tracking-tight text-white">
                  Isabel Medina
                </h3>
                <p className="text-[11px] text-slate-300 font-medium">
                  Gerente Nacional de Promoción Médica
                </p>
                <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-center gap-3 text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold">● {countGerentesDistrito} Gerentes</span>
                  <span className="text-theme-primary font-bold">● {countVisitaMedica} Visita Médica</span>
                </div>
              </div>

              {/* Central Stem Line */}
              <div className="w-0.5 h-4 sm:h-6 bg-theme-primary opacity-40 my-0.5" />
              <div className="w-2 h-2 rounded-full bg-theme-primary ring-2 ring-theme-20 mb-1 sm:mb-3" />
            </div>

            {/* Level 2: The 7 District Managers (1 col on mobile, up to 4 cols on PC) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-full">
              {medicaGds.map(renderManagerCard)}
            </div>
          </div>
        )}

        {/* Tree Branch 2: Comercial & Trade Marketing (Juanita Hurtado) */}
        {(activeDivision === 'comercial' || activeDivision === 'all') && (
          <div className="flex flex-col gap-2 sm:gap-4 pt-1 sm:pt-2 w-full max-w-full">
            {/* Level 1: Root Node (Juanita Hurtado) */}
            <div className="flex flex-col items-center w-full">
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3 sm:p-3.5 rounded-2xl shadow-md border border-indigo-900/60 w-full max-w-full sm:max-w-sm text-center relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-1 sm:mb-1.5 shadow-2xs">
                  <Building className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <h3 className="text-sm font-black tracking-tight text-white">
                  Juanita Hurtado
                </h3>
                <p className="text-[11px] text-indigo-200 font-medium">
                  Coordinación Comercial &amp; Trade Marketing
                </p>
                <div className="mt-2 pt-2 border-t border-indigo-800/60 flex items-center justify-center gap-3 text-[11px] font-mono">
                  <span className="text-sky-300 font-bold">● {countCoordinadores} Coordinadores</span>
                  <span className="text-indigo-300 font-bold">● {countComerciales} Comerciales</span>
                </div>
              </div>

              {/* Central Stem Line */}
              <div className="w-0.5 h-4 sm:h-6 bg-indigo-500 opacity-40 my-0.5" />
              <div className="w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-indigo-200 mb-1 sm:mb-3" />
            </div>

            {/* Level 2: The Coordinators (1 col on mobile, up to 4 cols on PC) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-full">
              {comercialGds.map(renderManagerCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
