import React, { useState } from 'react';
import { Representante, GerenteDistrito } from '../types/contact';
import {
  ChevronDown,
  ChevronRight,
  Phone,
  MessageCircle,
  Mail,
  UserCheck,
  AlertCircle,
  Eye,
  Layers,
} from 'lucide-react';
import { getWhatsAppUrl, getTelUrl } from '../utils/phoneUtils';

interface TeamMatrixProps {
  reps: Representante[];
  gds: GerenteDistrito[];
  onSelectRep: (rep: Representante) => void;
  onSelectGd: (gd: GerenteDistrito) => void;
}

export const TeamMatrix: React.FC<TeamMatrixProps> = ({
  reps,
  gds,
  onSelectRep,
  onSelectGd,
}) => {
  // Group representatives by gerenteDistrito
  const managerGroups: Record<string, Representante[]> = {};
  reps.forEach((rep) => {
    const key = rep.gerenteDistrito ? rep.gerenteDistrito.trim() : 'SIN ASIGNAR';
    if (!managerGroups[key]) {
      managerGroups[key] = [];
    }
    managerGroups[key].push(rep);
  });

  // Map GD lookup
  const gdLookup: Record<string, GerenteDistrito> = {};
  gds.forEach((gd) => {
    gdLookup[gd.nombre.trim()] = gd;
  });

  // Track expanded groups
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    Object.keys(managerGroups).forEach((k) => (init[k] = true));
    return init;
  });

  const toggleGroup = (key: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const collapseAll = () => setExpandedKeys({});
  const expandAll = () => {
    const all: Record<string, boolean> = {};
    Object.keys(managerGroups).forEach((k) => (all[k] = true));
    setExpandedKeys(all);
  };

  const sortedManagerKeys = Object.keys(managerGroups).sort((a, b) => {
    if (a.includes('VACANTE') && !b.includes('VACANTE')) return 1;
    if (!a.includes('VACANTE') && b.includes('VACANTE')) return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {/* Controls strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAE5E1] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0850FD] to-[#00A3FF] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#1A1A1E] tracking-tight">
              Estructura Organizacional &amp; Equipos
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Supervisión de gerencias de distrito y representantes por territorio nacional.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-4 py-2 text-xs font-bold text-[#1A1A1E] bg-[#F8F4F2] hover:bg-slate-200/70 border border-[#EAE5E1] rounded-full transition-all cursor-pointer"
          >
            Expandir todos
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 text-xs font-bold text-[#1A1A1E] bg-[#F8F4F2] hover:bg-slate-200/70 border border-[#EAE5E1] rounded-full transition-all cursor-pointer"
          >
            Contraer todos
          </button>
        </div>
      </div>

      {/* Accordion groups */}
      <div className="space-y-4">
        {sortedManagerKeys.map((managerName) => {
          const teamReps = managerGroups[managerName];
          const isExpanded = Boolean(expandedKeys[managerName]);
          const gdInfo = gdLookup[managerName];
          const isVacant = managerName.includes('VACANTE');

          const teamRegions = Array.from(new Set(teamReps.map((r) => r.region)));
          const teamUnits = Array.from(new Set(teamReps.map((r) => r.unidadNegocio)));

          return (
            <div
              key={managerName}
              className="bg-white rounded-3xl border border-[#EAE5E1] overflow-hidden shadow-xs hover:border-[#0850FD]/30 transition-all"
            >
              {/* Header card for the manager */}
              <div
                onClick={() => toggleGroup(managerName)}
                className={`p-5 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isVacant ? 'bg-sky-50/40 hover:bg-sky-50/70' : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-1.5 mt-0.5 text-slate-400 bg-[#F8F4F2] rounded-full">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#1A1A1E]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#1A1A1E]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-base font-black tracking-tight ${
                          isVacant ? 'text-[#0284C7]' : 'text-[#1A1A1E]'
                        }`}
                      >
                        {managerName}
                      </span>
                      {isVacant && (
                        <span className="text-[10px] font-bold text-[#0284C7] bg-[#0284C7]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Plaza en Cobertura
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2 font-medium">
                      <span>{gdInfo?.cargo || 'Gerencia / Coordinación'}</span>
                      <span>·</span>
                      <span>Regiones: {teamRegions.join(', ')}</span>
                      <span>·</span>
                      <span>Líneas: {teamUnits.length}</span>
                    </div>
                  </div>
                </div>

                {/* Right side of manager card */}
                <div
                  className="flex items-center gap-3 pl-8 md:pl-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs font-bold text-[#0850FD] bg-[#0850FD]/10 px-3 py-1 rounded-full font-mono tabular-nums">
                    {teamReps.length} {teamReps.length === 1 ? 'representante' : 'representantes'}
                  </span>

                  {gdInfo && (
                    <div className="flex items-center gap-1">
                      {gdInfo.telefono && (
                        <a
                          href={getWhatsAppUrl(gdInfo.telefono, gdInfo.nombre)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                          title="WhatsApp Gerente"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      {gdInfo.telefono && (
                        <a
                          href={getTelUrl(gdInfo.telefono)}
                          className="p-2 text-[#0850FD] hover:bg-[#0850FD]/10 rounded-full transition-colors"
                          title="Llamar Gerente"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {gdInfo.correo && (
                        <a
                          href={`mailto:${gdInfo.correo}`}
                          className="p-2 text-slate-500 hover:text-[#1A1A1E] hover:bg-[#F8F4F2] rounded-full transition-colors"
                          title="Correo Gerente"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onSelectGd(gdInfo)}
                        className="p-2 text-slate-500 hover:text-[#0850FD] hover:bg-[#F8F4F2] rounded-full transition-colors cursor-pointer"
                        title="Ver ficha GD"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Collapsible list of representatives */}
              {isExpanded && (
                <div className="border-t border-[#EAE5E1] bg-[#F8F4F2]/50 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {teamReps.map((rep) => (
                      <div
                        key={rep.id}
                        className="bg-white p-4 rounded-2xl border border-[#EAE5E1] shadow-2xs flex flex-col justify-between hover:border-[#0850FD]/30 transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <button
                              onClick={() => onSelectRep(rep)}
                              className="text-left font-black text-[#1A1A1E] hover:text-[#0850FD] text-sm tracking-tight cursor-pointer line-clamp-1"
                            >
                              {rep.nombre}
                            </button>
                            <button
                              onClick={() => onSelectRep(rep)}
                              className="text-slate-400 hover:text-[#0850FD] p-1 cursor-pointer"
                              title="Ver ficha"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-xs text-slate-500 mt-1.5 space-y-0.5">
                            <div>
                              <span className="font-bold text-[#1A1A1E]">{rep.ciudad}</span>
                              <span className="text-slate-300"> · </span>
                              <span>{rep.estado}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium">
                              {rep.unidadNegocio} · Sec: {rep.secuencia}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-2.5 border-t border-[#EAE5E1] flex items-center justify-between text-xs">
                          {rep.telefono ? (
                            <span className="font-mono tabular-nums text-[#1A1A1E] font-bold text-[11px]">
                              {rep.telefono}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px] font-medium">Sin teléfono</span>
                          )}

                          <div className="flex items-center gap-1">
                            {rep.telefono && (
                              <a
                                href={getWhatsAppUrl(rep.telefono, rep.nombre)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {rep.telefono && (
                              <a
                                href={getTelUrl(rep.telefono)}
                                className="p-1.5 text-[#0850FD] hover:bg-[#0850FD]/10 rounded-full transition-colors"
                                title="Llamar"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {rep.correo && (
                              <a
                                href={`mailto:${rep.correo}`}
                                className="p-1.5 text-slate-500 hover:text-[#1A1A1E] hover:bg-slate-100 rounded-full transition-colors"
                                title="Correo"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
