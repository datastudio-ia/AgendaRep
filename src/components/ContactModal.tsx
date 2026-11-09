import React, { useState, useEffect } from 'react';
import { Representante, GerenteDistrito, isRepComercial } from '../types/contact';
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  Download,
  Copy,
  Check,
  MapPin,
  Building2,
  Calendar,
  Briefcase,
  IdCard,
  Tag,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  getWhatsAppUrl,
  getTelUrl,
  downloadVCard,
} from '../utils/phoneUtils';
import { getMappedUnit } from '../App';

interface ContactModalProps {
  contact: Representante | GerenteDistrito | null;
  isRep: boolean;
  onClose: () => void;
  onSelectManager?: (managerName: string) => void;
  onEditRep?: (rep: Representante) => void;
  onEditGd?: (gd: GerenteDistrito) => void;
  onDeleteRep?: (repId: string) => void;
  onDeleteGd?: (gdId: string) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  contact,
  isRep,
  onClose,
  onSelectManager,
  onEditRep,
  onEditGd,
  onDeleteRep,
  onDeleteGd,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Bloquear scroll de la interfaz de fondo (scroll lock) mientras el modal está abierto
  useEffect(() => {
    if (!contact) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [contact]);

  if (!contact) return null;

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const rep = isRep ? (contact as Representante) : null;
  const gd = !isRep ? (contact as GerenteDistrito) : null;

  // Formatting Unidad de Negocio using standardized nomenclature
  const unidadDisplay = rep
    ? getMappedUnit(rep.unidadNegocio) || 'No asignada'
    : gd?.cargo || 'Líder / Gerente';

  // Manager or Supervisor display
  const managerDisplay = rep
    ? rep.gerenteDistrito || 'No asignado'
    : gd?.supervisor || 'N/A';

  // Geographic location for header badge
  const locationDisplay = isRep && rep
    ? [rep.ciudad, rep.estado].filter(Boolean).join(', ') || 'Venezuela'
    : gd && (gd.ciudad || gd.estado)
    ? [gd.ciudad, gd.estado].filter(Boolean).join(', ')
    : gd?.region || contact.region || 'Venezuela';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/45 backdrop-blur-xs overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#EAE5E1] w-full max-w-full sm:max-w-md max-h-[96vh] overflow-x-hidden overflow-y-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar in Theme Gradient */}
        <div className="theme-gradient-bg text-white px-3.5 py-3 shrink-0 w-full max-w-full">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-white tracking-tight break-words leading-snug">
                  {contact.nombre}
                </h3>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/20">
                    <Tag className="w-2.5 h-2.5 shrink-0" />
                    <span>Sector: {contact.codigoSector || 'N/A'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/95 bg-black/20 px-2 py-0.5 rounded-full border border-white/15">
                    <MapPin className="w-2.5 h-2.5 shrink-0 text-white/90" />
                    <span className="truncate max-w-[150px]">{locationDisplay}</span>
                  </div>
                  {contact.region && (
                    <div className="inline-flex items-center text-[10px] font-semibold text-white/95 bg-black/20 px-2 py-0.5 rounded-full border border-white/15">
                      <span>{contact.region}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer shrink-0"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Header action buttons row */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/15">
              {isRep && rep && onDeleteRep && (
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="py-1 px-2.5 flex items-center gap-1 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer border border-rose-300"
                >
                  <Trash2 className="w-3 h-3 shrink-0" />
                  <span>Eliminar</span>
                </button>
              )}

              {!isRep && gd && onDeleteGd && (
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="py-1 px-2.5 flex items-center gap-1 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer border border-rose-300"
                >
                  <Trash2 className="w-3 h-3 shrink-0" />
                  <span>Eliminar</span>
                </button>
              )}

              <button
                onClick={() => downloadVCard(contact, isRep)}
                className="py-1 px-2.5 flex items-center gap-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-theme-primary text-xs font-bold transition-all cursor-pointer border border-white/25"
              >
                <Download className="w-3 h-3 shrink-0" />
                <span>vCard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation ribbon if user clicks Eliminar */}
        {isConfirmingDelete && (
          <div className="bg-rose-50 border-b border-rose-200 p-2.5 px-3.5 flex items-center justify-between gap-2 animate-in fade-in duration-150 shrink-0">
            <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold min-w-0">
              <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">¿Eliminar a {contact.nombre}?</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isRep && rep && onDeleteRep) {
                    onDeleteRep(rep.id);
                  } else if (!isRep && gd && onDeleteGd) {
                    onDeleteGd(gd.id);
                  }
                  setIsConfirmingDelete(false);
                  onClose();
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        )}

        {/* Quick Action Ribbon */}
        <div className="grid grid-cols-3 p-2 bg-[#F8F4F2] border-b border-[#EAE5E1] gap-1.5 shrink-0">
          <a
            href={contact.telefono ? getTelUrl(contact.telefono) : undefined}
            className={`py-2 px-2 flex items-center justify-center gap-1 rounded-xl transition-all border border-[#EAE5E1] ${
              contact.telefono
                ? 'bg-white hover:bg-emerald-50 text-emerald-700 shadow-2xs cursor-pointer'
                : 'bg-white/60 text-slate-300 pointer-events-none'
            }`}
          >
            <Phone className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span className="text-xs font-bold">Llamar</span>
          </a>

          <a
            href={contact.telefono ? getWhatsAppUrl(contact.telefono, contact.nombre) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`py-2 px-2 flex items-center justify-center gap-1 rounded-xl transition-all border border-[#EAE5E1] ${
              contact.telefono
                ? 'bg-white hover:bg-emerald-50 text-emerald-700 shadow-2xs cursor-pointer'
                : 'bg-white/60 text-slate-300 pointer-events-none'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span className="text-xs font-bold">WhatsApp</span>
          </a>

          <a
            href={contact.correo ? `mailto:${contact.correo}` : undefined}
            className={`py-2 px-2 flex items-center justify-center gap-1 rounded-xl transition-all border border-[#EAE5E1] ${
              contact.correo
                ? 'bg-white hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer'
                : 'bg-white/60 text-slate-300 pointer-events-none'
            }`}
          >
            <Mail className="w-3.5 h-3.5 shrink-0 text-slate-600" />
            <span className="text-xs font-bold">Correo</span>
          </a>
        </div>

        {/* Detailed Data List - Single-column stack with 14px values */}
        <div className="p-3 space-y-2 flex-1 overflow-y-auto overflow-x-hidden">
          {/* 1. Cédula */}
          <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE5E1]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-theme-primary shrink-0 border border-[#EAE5E1]">
                <IdCard className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">
                  Cédula
                </div>
                <div className="text-sm font-bold text-[#1A1A1E] font-mono tabular-nums mt-0.5 truncate">
                  {contact.cedula || 'No registrada'}
                </div>
              </div>
            </div>
            {contact.cedula && (
              <button
                onClick={() => handleCopy(contact.cedula, 'cedula')}
                className="p-1.5 text-slate-400 hover:text-theme-primary hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
                title="Copiar cédula"
              >
                {copiedField === 'cedula' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* 2. Teléfono */}
          <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE5E1]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-theme-primary shrink-0 border border-[#EAE5E1]">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">
                  Teléfono Móvil
                </div>
                <div className="text-sm font-bold text-[#1A1A1E] font-mono tabular-nums mt-0.5 truncate">
                  {contact.telefono || 'No registrado'}
                </div>
              </div>
            </div>
            {contact.telefono && (
              <button
                onClick={() => handleCopy(contact.telefono, 'telefono')}
                className="p-1.5 text-slate-400 hover:text-theme-primary hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
                title="Copiar teléfono"
              >
                {copiedField === 'telefono' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* 3. Correo */}
          <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE5E1]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-theme-primary shrink-0 border border-[#EAE5E1]">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">
                  Correo Electrónico
                </div>
                <div
                  className="text-sm font-bold text-[#1A1A1E] truncate mt-0.5"
                  title={contact.correo || 'No registrado'}
                >
                  {contact.correo || 'No registrado'}
                </div>
              </div>
            </div>
            {contact.correo && (
              <button
                onClick={() => handleCopy(contact.correo, 'correo')}
                className="p-1.5 text-slate-400 hover:text-theme-primary hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
                title="Copiar correo"
              >
                {copiedField === 'correo' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* 4. Unidad de Negocio (Rep) o Cargo (GD) */}
          <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE5E1]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-theme-primary shrink-0 border border-[#EAE5E1]">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">
                  {isRep ? 'Unidad de Negocio' : 'Cargo / Rol'}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-sm font-bold text-[#1A1A1E] truncate">
                    {unidadDisplay}
                  </span>
                  {isRep && rep && (
                    isRepComercial(rep) ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Comercial
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-300 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Visita Médica
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Gerente de Distrito (Rep) o Supervisor Inmediato (GD) */}
          <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE5E1]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-theme-primary shrink-0 border border-[#EAE5E1]">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">
                  {isRep ? 'Gerente / Coordinador' : 'Supervisor Inmediato'}
                </div>
                <div className="text-sm font-bold text-[#1A1A1E] truncate mt-0.5">
                  {managerDisplay}
                </div>
              </div>
            </div>
            {isRep && rep?.gerenteDistrito && onSelectManager && (
              <button
                onClick={() => {
                  onClose();
                  onSelectManager(rep.gerenteDistrito);
                }}
                className="text-xs text-theme-primary hover:underline font-bold bg-white px-2.5 py-1 rounded-lg border border-[#EAE5E1] cursor-pointer shrink-0 ml-1"
              >
                Ver ficha
              </button>
            )}
          </div>

          {/* 6. Fecha de Ingreso */}
          <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE5E1]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 shrink-0 border border-[#EAE5E1]">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">
                  Fecha de Ingreso
                </div>
                <div className="text-sm font-bold text-[#1A1A1E] font-mono tabular-nums mt-0.5 truncate">
                  {contact.fechaIngreso || 'No especificada'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Botón Cerrar Ficha */}
        <div className="bg-[#F8F4F2] p-3 border-t border-[#EAE5E1] flex items-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-sm font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-xl transition-all shadow-2xs cursor-pointer text-center"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
