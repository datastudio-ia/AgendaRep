import React, { useState } from 'react';
import { Representante, ViewMode, isRepComercial, isRepActive } from '../types/contact';
import {
  Phone,
  MessageCircle,
  Mail,
  Download,
  MapPin,
  Building,
  User,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';
import {
  getWhatsAppUrl,
  getTelUrl,
  downloadVCard,
} from '../utils/phoneUtils';
import { getMappedUnit } from '../App';

interface RepresentantesListProps {
  reps: Representante[];
  viewMode: ViewMode;
  onSelectRep: (rep: Representante) => void;
  onFilterByManager: (managerName: string) => void;
  onFilterByRegion: (regionName: string) => void;
  onEditRep?: (rep: Representante) => void;
  onDeleteRep?: (repId: string) => void;
  onToggleStatus?: (rep: Representante) => void;
}

export const RepresentantesList: React.FC<RepresentantesListProps> = ({
  reps,
  viewMode,
  onSelectRep,
  onFilterByManager,
  onFilterByRegion,
  onEditRep,
  onDeleteRep,
  onToggleStatus,
}) => {
  const [repToDelete, setRepToDelete] = useState<Representante | null>(null);
  if (reps.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#EAE5E1] p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-theme-10 text-theme-primary flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#1A1A1E]">
          No se encontraron representantes
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Intenta ajustar los términos de búsqueda o limpiar los filtros seleccionados.
        </p>
      </div>
    );
  }

  const renderUnidadNegocio = (rep: Representante) => {
    const unitName = getMappedUnit(rep.unidadNegocio);
    const isComercial = isRepComercial(rep);

    return (
      <div className="flex flex-col leading-tight whitespace-nowrap">
        <span className="font-bold text-[#1A1A1E] text-xs tracking-tight whitespace-nowrap">
          {unitName}
        </span>
        <span className="text-[11px] font-medium mt-0.5 text-slate-500 whitespace-nowrap">
          {isComercial ? 'Comercial' : 'Visita Médica'}
        </span>
      </div>
    );
  };

  if (viewMode === 'table') {
    return (
      <div className="bg-white rounded-2xl border border-[#EAE5E1] overflow-hidden shadow-2xs w-full max-w-full">
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F4F2] border-b border-[#EAE5E1] text-[#1A1A1E] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Representante</th>
                <th className="py-2.5 px-3">Cédula</th>
                <th className="py-2.5 px-3">Ubicación</th>
                <th className="py-2.5 px-3">Región</th>
                <th className="py-2.5 px-3">Unidad de Negocio</th>
                <th className="py-2.5 px-3">Gerente de Distrito</th>
                <th className="py-2.5 px-3">Contacto</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5E1] text-slate-700">
              {reps.map((rep) => (
                <tr
                  key={rep.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => onSelectRep(rep)}
                      className="text-left font-bold text-[#1A1A1E] group-hover:text-theme-primary transition-colors cursor-pointer"
                    >
                      {rep.nombre}
                    </button>
                  </td>

                  <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600 font-medium">
                    {rep.cedula || 'N/A'}
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[#1A1A1E]">{rep.ciudad}</div>
                    <div className="text-[11px] text-slate-500">{rep.estado}</div>
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <button
                      onClick={() => onFilterByRegion(rep.region)}
                      className="text-slate-700 hover:text-theme-primary hover:underline font-medium cursor-pointer whitespace-nowrap"
                    >
                      {rep.region}
                    </button>
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {renderUnidadNegocio(rep)}
                  </td>

                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => onFilterByManager(rep.gerenteDistrito)}
                      className={`text-left hover:underline cursor-pointer font-semibold ${
                        rep.gerenteDistrito.includes('VACANTE')
                          ? 'text-sky-700 font-semibold'
                          : 'text-theme-primary'
                      }`}
                    >
                      {rep.gerenteDistrito}
                    </button>
                  </td>

                  <td className="py-2.5 px-3">
                    {rep.telefono && (
                      <div className="font-mono tabular-nums text-[#1A1A1E] font-bold">
                        {rep.telefono}
                      </div>
                    )}
                    {rep.correo && (
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                        {rep.correo}
                      </div>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus?.(rep);
                        }}
                        className={`w-7 h-7 rounded-full inline-flex items-center justify-center border transition-all cursor-pointer shadow-2xs shrink-0 ${
                          (rep.status || 'ACTIVO').toUpperCase() === 'ACTIVO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title={
                          (rep.status || 'ACTIVO').toUpperCase() === 'ACTIVO'
                            ? 'Representante activo (Clic para bloquear/desactivar)'
                            : 'Representante inactivo (Clic para desbloquear/activar)'
                        }
                        aria-label={
                          (rep.status || 'ACTIVO').toUpperCase() === 'ACTIVO'
                            ? 'Desactivar representante'
                            : 'Activar representante'
                        }
                      >
                        {(rep.status || 'ACTIVO').toUpperCase() === 'ACTIVO' ? (
                          <Unlock className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {rep.telefono && (
                        <>
                          <a
                            href={getTelUrl(rep.telefono)}
                            className="p-1.5 text-slate-500 hover:text-theme-primary hover:bg-theme-10 rounded-full transition-colors"
                            title="Llamar"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={getWhatsAppUrl(rep.telefono, rep.nombre)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                      {rep.correo && (
                        <a
                          href={`mailto:${rep.correo}`}
                          className="p-1.5 text-slate-500 hover:text-[#1A1A1E] hover:bg-slate-100 rounded-full transition-colors"
                          title="Enviar correo"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {onEditRep && (
                        <button
                          onClick={() => onEditRep(rep)}
                          className="p-1.5 text-slate-500 hover:text-theme-primary hover:bg-theme-10 rounded-full transition-colors cursor-pointer"
                          title="Modificar campos del representante"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteRep && (
                        <button
                          onClick={() => setRepToDelete(rep)}
                          className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-600 rounded-full transition-colors cursor-pointer"
                          title="Eliminar representante de la agenda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Mobile-First single column (1fr) vertical cards stack
  return (
    <>
      <div className="grid grid-cols-1 gap-2.5 w-full max-w-full">
        {reps.map((rep) => {
          const isActive = isRepActive(rep);
          const initials = rep.nombre
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((n) => n[0])
            .join('');

          return (
            <div
              key={rep.id}
              className={`bg-white rounded-2xl border w-full max-w-full overflow-hidden ${
                !isActive ? 'border-dashed border-rose-300/80 bg-rose-50/15 opacity-85' : 'border-[#EAE5E1]'
              } p-3 shadow-2xs hover:border-theme-30 transition-all flex flex-col justify-between group`}
            >
              <div>
                {/* Card top row */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl theme-gradient-bg text-white flex items-center justify-center font-bold text-[11px] tracking-wider shrink-0 shadow-2xs">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <button
                        onClick={() => onSelectRep(rep)}
                        className="text-left font-black text-[#1A1A1E] group-hover:text-theme-primary transition-colors text-xs sm:text-sm tracking-tight cursor-pointer line-clamp-1 block truncate"
                        title={rep.nombre}
                      >
                        {rep.nombre}
                      </button>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono tabular-nums">C.I. {rep.cedula || 'N/A'}</span>
                        {!isActive && (
                          <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full border border-rose-200">
                            Inactivo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onEditRep && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRep(rep);
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-2xs bg-[#F8F4F2] text-slate-600 border-[#EAE5E1] hover:bg-theme-10 hover:text-theme-primary hover:border-theme-30"
                        title="Modificar campos del representante"
                        aria-label="Editar representante"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus?.(rep);
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-2xs ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                          : 'bg-rose-50 text-rose-700 border-rose-200/90 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                      }`}
                      title={
                        isActive
                          ? 'Representante activo (Clic para bloquear/desactivar)'
                          : 'Representante inactivo (Clic para desbloquear/activar)'
                      }
                      aria-label={
                        isActive
                          ? 'Desactivar representante'
                          : 'Activar representante'
                      }
                    >
                      {isActive ? (
                        <Unlock className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {onDeleteRep && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRepToDelete(rep);
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-2xs bg-rose-50 text-rose-600 border-rose-200/80 hover:bg-rose-600 hover:text-white hover:border-rose-600"
                        title="Eliminar representante"
                        aria-label="Eliminar representante"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Location & Division Info */}
                <div className="mt-2.5 pt-2 border-t border-[#EAE5E1] space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3 h-3 text-theme-primary shrink-0" />
                    <span className="font-bold text-[#1A1A1E] truncate">{rep.ciudad}, {rep.estado}</span>
                    <span className="text-slate-300">/</span>
                    <button
                      onClick={() => onFilterByRegion(rep.region)}
                      className="text-slate-500 hover:text-theme-primary hover:underline truncate cursor-pointer font-medium"
                    >
                      {rep.region}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-700 flex-wrap">
                    <Building className="w-3 h-3 text-theme-primary shrink-0" />
                    <span className="font-semibold text-[#1A1A1E]">{getMappedUnit(rep.unidadNegocio)}</span>
                    {isRepComercial(rep) ? (
                      <span className="text-[9px] font-bold text-theme-secondary bg-theme-secondary-10 px-1.5 py-0.2 rounded-full">
                        Comercial
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-theme-primary bg-theme-10 px-1.5 py-0.2 rounded-full">
                        Visita Médica
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-slate-600 pt-0.5">
                    <span className="text-slate-400 font-medium">GD:</span>
                    <button
                      onClick={() => onFilterByManager(rep.gerenteDistrito)}
                      className={`font-bold hover:underline text-left truncate cursor-pointer ${
                        rep.gerenteDistrito.includes('VACANTE')
                          ? 'text-sky-700'
                          : 'text-theme-primary'
                      }`}
                    >
                      {rep.gerenteDistrito}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Ribbon with Pill Buttons */}
              <div className="mt-3 pt-2 border-t border-[#EAE5E1] flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1 min-w-0">
                  {rep.telefono ? (
                    <>
                      <a
                        href={getWhatsAppUrl(rep.telefono, rep.nombre)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-full transition-all text-[11px] font-bold cursor-pointer shrink-0"
                        title="Escribir por WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>

                      <a
                        href={getTelUrl(rep.telefono)}
                        className="flex items-center gap-1 px-2 py-1 bg-[#F8F4F2] hover:bg-theme-primary text-[#1A1A1E] hover:text-white rounded-full transition-all text-[11px] font-bold font-mono tabular-nums group/call truncate"
                        title={`Llamar al ${rep.telefono}`}
                      >
                        <Phone className="w-3 h-3 text-theme-primary group-hover/call:text-white shrink-0" />
                        <span className="truncate">{rep.telefono}</span>
                      </a>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic font-medium">Sin teléfono</span>
                  )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {rep.correo && (
                    <a
                      href={`mailto:${rep.correo}`}
                      className="p-1.5 text-slate-500 hover:text-theme-primary hover:bg-[#F8F4F2] rounded-full transition-colors"
                      title={rep.correo}
                    >
                      <Mail className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => downloadVCard(rep, true)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
                    title="Descargar vCard"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal to safely delete representative */}
      {repToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setRepToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-rose-100 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1A1A1E] text-center">
              ¿Eliminar representante?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              ¿Estás seguro de que deseas eliminar a <strong className="text-[#1A1A1E]">{repToDelete.nombre}</strong> de la agenda? Esta acción removerá su ficha y actualizará todas las estadísticas.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setRepToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteRep) {
                    onDeleteRep(repToDelete.id);
                  }
                  setRepToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer text-center"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
