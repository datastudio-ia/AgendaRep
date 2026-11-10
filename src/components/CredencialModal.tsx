import React, { useState, useEffect } from 'react';
import { CredencialDrogueria, Representante } from '../types/contact';
import {
  X,
  Save,
  KeyRound,
  User,
  Lock,
  Building2,
  MapPin,
  Briefcase,
  IdCard,
  Mail,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
} from 'lucide-react';
import { DROGUERIAS_METADATA } from './CredencialesDrogueriasView';

interface CredencialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cred: CredencialDrogueria) => void;
  credencialToEdit: CredencialDrogueria | null;
  reps?: Representante[];
}

const DEFAULT_DROGUERIA_URLS: Record<string, string> = {
  BLV: 'https://blv-orders.greicodex.com/',
  INSUAMINCA: 'https://portalprv.insuaminca.org/login',
  VITALCLINIC: 'https://ct.vitalclinicdrogueria.com/',
  ZAKIPHARMA: 'https://zakipharma.com/',
};

export const CredencialModal: React.FC<CredencialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  credencialToEdit,
  reps = [],
}) => {
  const isEditMode = Boolean(credencialToEdit);

  // Form states
  const [drogueria, setDrogueria] = useState('BLV');
  const [customDrogueria, setCustomDrogueria] = useState('');
  const [representante, setRepresentante] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [cargo, setCargo] = useState('REPRESENTANTE COMERCIAL');
  const [region, setRegion] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [portalUrl, setPortalUrl] = useState(DEFAULT_DROGUERIA_URLS.BLV || '');
  const [estatus, setEstatus] = useState<'Activo' | 'Desactivar'>('Activo');

  const [error, setError] = useState<string | null>(null);

  // Sync state when modal opens or credencialToEdit changes
  useEffect(() => {
    if (credencialToEdit) {
      const drogUpper = (credencialToEdit.drogueria || 'BLV').trim().toUpperCase();
      if (['BLV', 'INSUAMINCA', 'VITALCLINIC', 'ZAKIPHARMA'].includes(drogUpper)) {
        setDrogueria(drogUpper);
        setCustomDrogueria('');
      } else {
        setDrogueria('OTHER');
        setCustomDrogueria(credencialToEdit.drogueria || '');
      }
      setRepresentante(credencialToEdit.representante || '');
      setCedula(credencialToEdit.cedula || '');
      setCorreo(credencialToEdit.correo || '');
      setCargo(credencialToEdit.cargo || 'REPRESENTANTE COMERCIAL');
      setRegion(credencialToEdit.region || '');
      setUsuario(credencialToEdit.usuario || '');
      setPassword(credencialToEdit.password || '');
      setPortalUrl(credencialToEdit.portalUrl || DEFAULT_DROGUERIA_URLS[drogUpper] || '');
      setEstatus(
        (credencialToEdit.estatus || 'Activo').toUpperCase() === 'DESACTIVAR'
          ? 'Desactivar'
          : 'Activo'
      );
    } else {
      setDrogueria('BLV');
      setCustomDrogueria('');
      setRepresentante('');
      setCedula('');
      setCorreo('');
      setCargo('REPRESENTANTE COMERCIAL');
      setRegion('');
      setUsuario('');
      setPassword('');
      setPortalUrl(DEFAULT_DROGUERIA_URLS.BLV);
      setEstatus('Activo');
    }
    setShowPassword(false);
    setError(null);
  }, [credencialToEdit, isOpen]);

  // Bloquear scroll de la interfaz de fondo (scroll lock) mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-fill from existing representative when selected
  const handleSelectExistingRep = (repName: string) => {
    setRepresentante(repName);
    const found = reps.find(
      (r) => r.nombre.trim().toUpperCase() === repName.trim().toUpperCase()
    );
    if (found) {
      if (found.cedula) setCedula(found.cedula);
      if (found.correo) setCorreo(found.correo);
      if (found.region) setRegion(found.region);
      if (found.tipoRepresentante) {
        setCargo(
          found.tipoRepresentante === 'Comercial'
            ? 'REPRESENTANTE COMERCIAL'
            : 'REPRESENTANTE VISITA MEDICA'
        );
      }
    }
  };

  const handleDrogueriaChange = (drog: string) => {
    setDrogueria(drog);
    if (drog !== 'OTHER') {
      const suggestedUrl = DEFAULT_DROGUERIA_URLS[drog] || '';
      if (!portalUrl || Object.values(DEFAULT_DROGUERIA_URLS).includes(portalUrl)) {
        setPortalUrl(suggestedUrl);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDrogueria =
      drogueria === 'OTHER' ? customDrogueria.trim().toUpperCase() : drogueria.trim().toUpperCase();

    if (!finalDrogueria) {
      setError('Por favor indica el nombre de la droguería.');
      return;
    }

    if (!representante.trim()) {
      setError('Por favor ingresa el nombre del representante.');
      return;
    }

    if (!usuario.trim()) {
      setError('Por favor ingresa el usuario de acceso a la droguería.');
      return;
    }

    const payload: CredencialDrogueria = {
      id: credencialToEdit?.id || `cred_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      drogueria: finalDrogueria,
      representante: representante.trim(),
      cedula: cedula.trim(),
      correo: correo.trim(),
      cargo: cargo.trim() || 'REPRESENTANTE COMERCIAL',
      region: region.trim(),
      usuario: usuario.trim(),
      password: password.trim(),
      portalUrl: portalUrl.trim() || DEFAULT_DROGUERIA_URLS[finalDrogueria] || '',
      estatus,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden overscroll-none bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto overscroll-contain animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="theme-gradient-bg px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                {isEditMode ? 'Editar Representante / Credencial' : 'Agregar Representante y Credencial'}
              </h3>
              <p className="text-xs text-white/80">
                {isEditMode
                  ? 'Modifica los datos de acceso del representante a la droguería'
                  : 'Registra un nuevo usuario con sus credenciales de droguería'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with Contained Scroll */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-4 flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

          {/* Droguería Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Droguería comercial <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {['BLV', 'INSUAMINCA', 'VITALCLINIC', 'ZAKIPHARMA'].map((drog) => {
                const isSelected = drogueria === drog;
                const meta = DROGUERIAS_METADATA[drog];
                return (
                  <button
                    key={drog}
                    type="button"
                    onClick={() => handleDrogueriaChange(drog)}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border text-center ${
                      isSelected
                        ? `${meta?.badgeBg || 'bg-blue-50'} ${meta?.textColor || 'text-blue-700'} ${meta?.borderColor || 'border-blue-300'} ring-2 ring-blue-400/40 shadow-xs`
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {drog}
                  </button>
                );
              })}
            </div>
            {drogueria === 'OTHER' && (
              <input
                type="text"
                value={customDrogueria}
                onChange={(e) => setCustomDrogueria(e.target.value)}
                placeholder="Nombre de la droguería..."
                className="w-full px-3.5 py-2 text-xs bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Representante Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nombre del Representante <span className="text-rose-500">*</span>
              </label>
              {reps.length > 0 && (
                <span className="text-[10px] text-slate-400 font-medium">
                  Autocompleta seleccionando de la lista
                </span>
              )}
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                list="reps-list-suggestions"
                value={representante}
                onChange={(e) => handleSelectExistingRep(e.target.value)}
                placeholder="Ej. CARLOS RAMIREZ"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 placeholder:text-slate-400 uppercase"
                required
              />
              <datalist id="reps-list-suggestions">
                {reps.map((r) => (
                  <option key={r.id} value={r.nombre}>
                    {r.nombre} ({r.tipoRepresentante || r.region || r.unidadNegocio})
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Grid: Usuario y Contraseña (Foco Principal del requerimiento) */}
          <div className="bg-blue-50/70 p-3.5 sm:p-4 rounded-2xl border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                Credenciales de Acceso al Portal
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                Portal Droguería
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Usuario */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Usuario / Login <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder=""
                    className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña / Clave
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña de acceso"
                    className="w-full pl-8 pr-9 py-2 text-xs font-mono font-bold bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    title={showPassword ? 'Ocultar' : 'Ver'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Portal URL */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Enlace directo al Portal
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="url"
                  value={portalUrl}
                  onChange={(e) => setPortalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Grid de Datos Adicionales: Cédula, Cargo, Región, Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Cédula */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cédula</label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ej: 29904478"
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cargo</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ej. REPRESENTANTE COMERCIAL"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            {/* Región */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Región</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Ej. CENTRO, OCCIDENTE, CAPITAL"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="nombre.apellido@lasante.com.ve"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Estatus */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Estatus del Usuario
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="radio"
                  name="estatus-radio"
                  value="Activo"
                  checked={estatus === 'Activo'}
                  onChange={() => setEstatus('Activo')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3" />
                  Activo
                </span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="radio"
                  name="estatus-radio"
                  value="Desactivar"
                  checked={estatus === 'Desactivar'}
                  onChange={() => setEstatus('Desactivar')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <X className="w-3 h-3" />
                  Desactivar
                </span>
              </label>
            </div>
          </div>
          </div>

          {/* Footer Buttons Pinned */}
          <div className="p-3.5 sm:px-6 sm:py-3.5 bg-slate-50/90 border-t border-[#EAE5E1] flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl theme-gradient-bg text-white text-xs font-black shadow-xs hover:opacity-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditMode ? 'Guardar Cambios' : 'Registrar Representante'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
