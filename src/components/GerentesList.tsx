import React from 'react';
import { GerenteDistrito, ViewMode } from '../types/contact';
import {
  Phone,
  MessageCircle,
  Mail,
  Download,
  Eye,
  Users,
  ShieldCheck,
  UserCheck,
  Award,
  Pencil,
  Plus,
  Trash2,
  MapPin,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  getWhatsAppUrl,
  getTelUrl,
  downloadVCard,
} from '../utils/phoneUtils';

interface GerentesListProps {
  gds: GerenteDistrito[];
  viewMode: ViewMode;
  teamCounts: Record<string, number>;
  onSelectGd: (gd: GerenteDistrito) => void;
  onEditGd: (gd: GerenteDistrito) => void;
  onAddGd?: () => void;
  onViewTeam: (gdName: string) => void;
  onFilterByRegion: (regionName: string) => void;
  roleFilter?: 'all' | 'gerentes' | 'coordinadores';
  onRoleFilterChange?: (role: 'all' | 'gerentes' | 'coordinadores') => void;
  onToggleStatus?: (gd: GerenteDistrito) => void;
  onDeleteGd?: (gdId: string) => void;
}

export const GerentesList: React.FC<GerentesListProps> = ({
  gds,
  viewMode,
  teamCounts,
  onSelectGd,
  onEditGd,
  onAddGd,
  onViewTeam,
  onFilterByRegion,
  roleFilter = 'all',
  onRoleFilterChange,
  onToggleStatus,
  onDeleteGd,
}) => {
  const [gdToDelete, setGdToDelete] = React.useState<GerenteDistrito | null>(null);
  const [internalRoleFilter, setInternalRoleFilter] = React.useState<'all' | 'gerentes' | 'coordinadores'>('all');
  const currentRole = onRoleFilterChange ? roleFilter : internalRoleFilter;
  const setRole = onRoleFilterChange || setInternalRoleFilter;

  const countGerentes = gds.filter((g) => g.cargo.toUpperCase().includes('GERENTE') && (g.status || 'ACTIVO').toUpperCase() === 'ACTIVO').length;
  const countCoordinadores = gds.filter((g) => g.cargo.toUpperCase().includes('COORDINADOR') && (g.status || 'ACTIVO').toUpperCase() === 'ACTIVO').length;

  const displayedGds = React.useMemo(() => {
    if (currentRole === 'gerentes') {
      return gds.filter((g) => g.cargo.toUpperCase().includes('GERENTE'));
    }
    if (currentRole === 'coordinadores') {
      return gds.filter((g) => g.cargo.toUpperCase().includes('COORDINADOR'));
    }
    return gds;
  }, [gds, currentRole]);

  if (gds.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#EAE5E1] p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-theme-10 text-theme-primary flex items-center justify-center mx-auto mb-3">
          <Award className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#1A1A1E]">
          No se encontraron gerentes o coordinadores
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Intenta ajustar los términos de búsqueda o limpiar los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-full overflow-x-hidden">
      {/* Interactive Role Buttons stacked in 1 column */}
      <div className="grid grid-cols-1 gap-2 w-full max-w-full">
        {/* Button 1: Gerentes de Distrito */}
        <button
          onClick={() => setRole('gerentes')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group w-full ${
            currentRole === 'gerentes'
              ? 'bg-white border-theme-primary ring-2 ring-theme-20 shadow-xs'
              : 'bg-white/80 hover:bg-white border-[#EAE5E1] shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                  currentRole === 'gerentes'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-purple-500/10 text-purple-600'
                }`}
              >
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-extrabold text-purple-600 tracking-wider">
                  Distrito
                </div>
                <h3 className="text-sm font-black text-[#1A1A1E] tracking-tight truncate">
                  Gerentes de Distrito
                </h3>
              </div>
            </div>

            <div
              className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono tabular-nums shrink-0 ${
                currentRole === 'gerentes'
                  ? 'bg-theme-primary text-white shadow-2xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border border-[#EAE5E1]'
              }`}
            >
              {countGerentes} GDs
            </div>
          </div>
        </button>

        {/* Button 2: Coordinadores */}
        <button
          onClick={() => setRole('coordinadores')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group w-full ${
            currentRole === 'coordinadores'
              ? 'bg-white border-theme-primary ring-2 ring-theme-20 shadow-xs'
              : 'bg-white/80 hover:bg-white border-[#EAE5E1] shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                  currentRole === 'coordinadores'
                    ? 'bg-theme-secondary text-white shadow-2xs'
                    : 'bg-theme-secondary-10 text-theme-secondary'
                }`}
              >
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-extrabold text-theme-secondary tracking-wider">
                  Coordinación
                </div>
                <h3 className="text-sm font-black text-[#1A1A1E] tracking-tight truncate">
                  Coordinadores
                </h3>
              </div>
            </div>

            <div
              className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono tabular-nums shrink-0 ${
                currentRole === 'coordinadores'
                  ? 'bg-theme-primary text-white shadow-2xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border border-[#EAE5E1]'
              }`}
            >
              {countCoordinadores} Coord.
            </div>
          </div>
        </button>

        {/* Button 3: Todos los Líderes */}
        <button
          onClick={() => setRole('all')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group w-full ${
            currentRole === 'all'
              ? 'bg-white border-theme-primary ring-2 ring-theme-20 shadow-xs'
              : 'bg-white/80 hover:bg-white border-[#EAE5E1] shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                  currentRole === 'all'
                    ? 'bg-[#1A1A1E] text-white shadow-2xs'
                    : 'bg-slate-200/80 text-[#1A1A1E]'
                }`}
              >
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                  Consolidado
                </div>
                <h3 className="text-sm font-black text-[#1A1A1E] tracking-tight truncate">
                  Todos los Líderes
                </h3>
              </div>
            </div>

            <div
              className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono tabular-nums shrink-0 ${
                currentRole === 'all'
                  ? 'bg-theme-primary text-white shadow-2xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border border-[#EAE5E1]'
              }`}
            >
              {gds.length} Totales
            </div>
          </div>
        </button>
      </div>

      {displayedGds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAE5E1] p-6 text-center w-full shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-theme-10 text-theme-primary flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#1A1A1E]">
            No se encontraron contactos en esta categoría
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Prueba seleccionando otra categoría o limpiando los filtros.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-[#EAE5E1] overflow-hidden shadow-2xs w-full max-w-full">
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F4F2] border-b border-[#EAE5E1] text-[#1A1A1E] font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Líder / GD</th>
                  <th className="py-2.5 px-3">Cargo</th>
                  <th className="py-2.5 px-3">Región Supervisada</th>
                  <th className="py-2.5 px-3">Equipo Asignado</th>
                  <th className="py-2.5 px-3">Supervisor</th>
                  <th className="py-2.5 px-3">Contacto</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5E1] text-slate-700">
                {displayedGds.map((gd) => {
                  const count = teamCounts[gd.nombre.trim()] || 0;
                  const isVacant = gd.nombre.includes('VACANTE') || gd.status === 'INACTIVO';

                  return (
                    <tr
                      key={gd.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onSelectGd(gd)}
                          className={`text-left font-bold cursor-pointer transition-colors ${
                            isVacant ? 'text-sky-700 font-semibold' : 'text-[#1A1A1E] group-hover:text-theme-primary'
                          }`}
                        >
                          {gd.nombre}
                        </button>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                          C.I. {gd.cedula || 'N/A'} {gd.codigoSector && `· Sector: ${gd.codigoSector}`}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-[#1A1A1E] font-semibold">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          gd.cargo.toUpperCase().includes('GERENTE')
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                          {gd.cargo}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        {gd.region ? (
                          <div>
                            <button
                              onClick={() => onFilterByRegion(gd.region)}
                              className="text-slate-700 hover:text-theme-primary hover:underline font-bold cursor-pointer"
                            >
                              {gd.region}
                            </button>
                            {(gd.ciudad || gd.estado) && (
                              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{[gd.ciudad, gd.estado].filter(Boolean).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        {count > 0 ? (
                          <button
                            onClick={() => onViewTeam(gd.nombre)}
                            className="inline-flex items-center gap-1 font-bold text-theme-primary bg-theme-10 hover:bg-theme-primary hover:text-white px-2.5 py-1 rounded-full transition-all cursor-pointer font-mono tabular-nums"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{count} Reps</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">0 asignados</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {gd.supervisor || 'N/A'}
                      </td>

                      <td className="py-2.5 px-3">
                        {gd.telefono && (
                          <div className="font-mono tabular-nums text-[#1A1A1E] font-bold">
                            {gd.telefono}
                          </div>
                        )}
                        {gd.correo && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                            {gd.correo}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus?.(gd);
                            }}
                            className={`w-7 h-7 rounded-full inline-flex items-center justify-center border transition-all cursor-pointer shadow-2xs shrink-0 ${
                              (gd.status || 'ACTIVO').toUpperCase() === 'ACTIVO'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                            title={
                              (gd.status || 'ACTIVO').toUpperCase() === 'ACTIVO'
                                ? 'Líder activo (Clic para bloquear/desactivar)'
                                : 'Líder inactivo (Clic para desbloquear/activar)'
                            }
                          >
                            {(gd.status || 'ACTIVO').toUpperCase() === 'ACTIVO' ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {gd.telefono && (
                            <>
                              <a
                                href={getTelUrl(gd.telefono)}
                                className="p-1.5 text-slate-500 hover:text-theme-primary hover:bg-theme-10 rounded-full transition-colors"
                                title="Llamar"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={getWhatsAppUrl(gd.telefono, gd.nombre)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                          {gd.correo && (
                            <a
                              href={`mailto:${gd.correo}`}
                              className="p-1.5 text-slate-500 hover:text-[#1A1A1E] hover:bg-slate-100 rounded-full transition-colors"
                              title="Enviar correo"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => onEditGd(gd)}
                            className="p-1.5 text-slate-500 hover:text-theme-primary hover:bg-theme-10 rounded-full transition-colors cursor-pointer"
                            title="Editar datos de este líder"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteGd && (
                            <button
                              onClick={() => setGdToDelete(gd)}
                              className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-600 rounded-full transition-colors cursor-pointer"
                              title="Eliminar líder de la agenda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 w-full max-w-full">
          {displayedGds.map((gd) => {
            const count = teamCounts[gd.nombre.trim()] || 0;
            const isVacant = gd.nombre.includes('VACANTE') || gd.status === 'INACTIVO';

            return (
              <div
                key={gd.id}
                className="bg-white rounded-2xl border border-[#EAE5E1] p-3 shadow-2xs hover:border-theme-30 transition-all flex flex-col justify-between group w-full max-w-full overflow-hidden"
              >
                <div>
                  {/* Header: Role Pill & Name */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          gd.cargo.toUpperCase().includes('GERENTE')
                            ? 'text-purple-700 bg-purple-50 border border-purple-200'
                            : 'text-sky-700 bg-sky-50 border border-sky-200'
                        }`}>
                          {gd.cargo}
                        </span>
                        {isVacant && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            {gd.status}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onSelectGd(gd)}
                        className={`text-left font-black transition-colors text-sm tracking-tight cursor-pointer truncate block w-full ${
                          isVacant
                            ? 'text-sky-700'
                            : 'text-[#1A1A1E] group-hover:text-theme-primary'
                        }`}
                      >
                        {gd.nombre}
                      </button>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                        <span className="font-mono tabular-nums">C.I. {gd.cedula || 'N/A'}</span>
                        {gd.codigoSector && (
                          <>
                            <span>·</span>
                            <span className="font-mono tabular-nums">Sector {gd.codigoSector}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onEditGd && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditGd(gd);
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-2xs bg-white text-slate-600 border-slate-200 hover:text-theme-primary hover:border-theme-primary"
                          title="Editar datos del líder"
                          aria-label="Editar líder"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus?.(gd);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-2xs ${
                          (gd.status || 'ACTIVO').toUpperCase() === 'ACTIVO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-rose-50 text-rose-700 border-rose-200/90 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title={
                          (gd.status || 'ACTIVO').toUpperCase() === 'ACTIVO'
                            ? 'Líder activo (Clic para bloquear/desactivar)'
                            : 'Líder inactivo (Clic para desbloquear/activar)'
                        }
                      >
                        {(gd.status || 'ACTIVO').toUpperCase() === 'ACTIVO' ? (
                          <Unlock className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {onDeleteGd && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGdToDelete(gd);
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-2xs bg-rose-50 text-rose-600 border-rose-200/80 hover:bg-rose-600 hover:text-white"
                          title="Eliminar líder de la agenda"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Middle details */}
                  <div className="mt-2.5 pt-2 border-t border-[#EAE5E1] space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-theme-primary shrink-0" />
                      <span className="text-slate-500 font-medium shrink-0">Región:</span>
                      <button
                        onClick={() => gd.region && onFilterByRegion(gd.region)}
                        className="font-bold text-[#1A1A1E] hover:text-theme-primary hover:underline cursor-pointer truncate"
                      >
                        {gd.region || 'No asignada'}
                      </button>
                    </div>

                    {(gd.ciudad || gd.estado) && (
                      <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-theme-primary shrink-0" />
                        <span className="text-slate-500 font-medium shrink-0">Ubicación:</span>
                        <span className="font-bold text-[#1A1A1E] truncate">
                          {[gd.ciudad, gd.estado].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                      <UserCheck className="w-3.5 h-3.5 text-theme-primary shrink-0" />
                      <span className="text-slate-500 font-medium shrink-0">Reporta a:</span>
                      <span className="font-bold text-[#1A1A1E] truncate">{gd.supervisor || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-500 font-medium">Equipo:</span>
                      </div>
                      {count > 0 ? (
                        <button
                          onClick={() => onViewTeam(gd.nombre)}
                          className="font-bold text-theme-primary bg-theme-10 hover:bg-theme-primary hover:text-white px-2.5 py-0.5 rounded-full text-xs transition-all cursor-pointer font-mono tabular-nums"
                        >
                          {count} reps →
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">0 asignados</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom contact bar */}
                <div className="mt-3 pt-2 border-t border-[#EAE5E1] flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 min-w-0">
                    {gd.telefono ? (
                      <>
                        <a
                          href={getWhatsAppUrl(gd.telefono, gd.nombre)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-full transition-all text-xs font-bold cursor-pointer shrink-0"
                          title="Escribir por WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={getTelUrl(gd.telefono)}
                          className="flex items-center gap-1 px-2 py-1 bg-[#F8F4F2] hover:bg-theme-primary text-[#1A1A1E] hover:text-white rounded-full transition-all text-xs font-bold font-mono tabular-nums group/call truncate"
                          title={`Llamar al ${gd.telefono}`}
                        >
                          <Phone className="w-3 h-3 text-theme-primary group-hover/call:text-white shrink-0" />
                          <span className="truncate">{gd.telefono}</span>
                        </a>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic font-medium">Sin teléfono</span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    {gd.correo && (
                      <a
                        href={`mailto:${gd.correo}`}
                        className="p-1.5 text-slate-500 hover:text-theme-primary hover:bg-[#F8F4F2] rounded-full transition-colors"
                        title={gd.correo}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => downloadVCard(gd, false)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
                      title="Descargar vCard"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal to safely delete gerente/coordinador */}
      {gdToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setGdToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-rose-100 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1A1A1E] text-center">
              ¿Eliminar líder / gerente?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              ¿Estás seguro de que deseas eliminar a <strong className="text-[#1A1A1E]">{gdToDelete.nombre}</strong> de la agenda de líderes? Esta acción removerá su ficha del directorio.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setGdToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteGd) {
                    onDeleteGd(gdToDelete.id);
                  }
                  setGdToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer text-center"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
