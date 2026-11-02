import React, { useState, useEffect } from 'react';
import { GerenteDistrito, Representante } from '../types/contact';
import {
  X,
  Save,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  IdCard,
  Calendar,
  AlertCircle,
  Plus,
  Check,
  Users,
} from 'lucide-react';
import { REGION_OPTIONS, getCleanRegion, matchGerenteOrCoord } from '../App';

interface GdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gd: GerenteDistrito, updateAssignedReps: boolean, originalName?: string) => Promise<void> | void;
  onDelete?: (id: string) => void;
  gdToEdit: GerenteDistrito | null;
  reps: Representante[];
}

const CARGO_PRESETS = [
  'GERENTE DE DISTRITO',
  'COORDINADOR TRADE MARKETING',
  'COORDINADOR COMERCIAL',
  'COORDINADOR DE VENTAS',
];

export const GdFormModal: React.FC<GdFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  gdToEdit,
  reps,
}) => {
  const isEditMode = Boolean(gdToEdit);

  // Form states
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState(CARGO_PRESETS[0]);
  const [customCargo, setCustomCargo] = useState(false);
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [region, setRegion] = useState(REGION_OPTIONS[0]);
  const [ciudad, setCiudad] = useState('');
  const [estado, setEstado] = useState('');
  const [codigoSector, setCodigoSector] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [status, setStatus] = useState('ACTIVO');
  const [updateAssignedReps, setUpdateAssignedReps] = useState(true);

  // Validation & confirmation
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate assigned reps count
  const originalName = gdToEdit?.nombre?.trim() || '';
  const assignedRepsCount = React.useMemo(() => {
    if (!originalName) return 0;
    return reps.filter((r) => matchGerenteOrCoord(r.gerenteDistrito, originalName)).length;
  }, [reps, originalName]);

  // Sync state on open/change
  useEffect(() => {
    if (gdToEdit) {
      setNombre(gdToEdit.nombre || '');
      const existingCargo = gdToEdit.cargo || CARGO_PRESETS[0];
      if (CARGO_PRESETS.includes(existingCargo)) {
        setCargo(existingCargo);
        setCustomCargo(false);
      } else {
        setCargo(existingCargo);
        setCustomCargo(true);
      }
      setCedula(gdToEdit.cedula || '');
      setTelefono(gdToEdit.telefono || '');
      setCorreo(gdToEdit.correo || '');
      const cleanReg = gdToEdit.region ? getCleanRegion(gdToEdit.region) : REGION_OPTIONS[0];
      setRegion(REGION_OPTIONS.includes(cleanReg) ? cleanReg : gdToEdit.region || REGION_OPTIONS[0]);
      setCiudad(gdToEdit.ciudad || '');
      setEstado(gdToEdit.estado || '');
      setCodigoSector(gdToEdit.codigoSector || '');
      setSupervisor(gdToEdit.supervisor || '');
      setFechaIngreso(gdToEdit.fechaIngreso || '');
      setStatus(gdToEdit.status || 'ACTIVO');
      setUpdateAssignedReps(true);
    } else {
      setNombre('');
      setCargo(CARGO_PRESETS[0]);
      setCustomCargo(false);
      setCedula('');
      setTelefono('');
      setCorreo('');
      setRegion(REGION_OPTIONS[0]);
      setCiudad('');
      setEstado('');
      setCodigoSector('');
      setSupervisor('ISABEL MEDINA');
      const today = new Date();
      setFechaIngreso(
        `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
      );
      setStatus('ACTIVO');
      setUpdateAssignedReps(true);
    }
    setError(null);
    setShowDeleteConfirm(false);
  }, [gdToEdit, isOpen]);

  if (!isOpen) return null;

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 8);
    setCedula(onlyNums);
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.length < telefono.length) {
      setTelefono(val);
      return;
    }
    const digitsOnly = val.replace(/\D/g, '');
    if (val.length === 3 && !val.includes('-')) {
      val = `${val}-`;
    } else if (!val.includes('-') && digitsOnly.length > 3) {
      val = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 10)}`;
    }
    if (val.length > 11) {
      val = val.slice(0, 11);
    }
    setTelefono(val);
  };

  const handleFechaIngresoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    if (inputVal.length < fechaIngreso.length) {
      setFechaIngreso(inputVal);
      return;
    }
    const digits = inputVal.replace(/\D/g, '').slice(0, 8);
    if (digits.length === 0) {
      setFechaIngreso('');
      return;
    }
    let formatted = '';
    if (digits.length <= 2) {
      formatted = digits.length === 2 ? `${digits}/` : digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      if (digits.length === 4) {
        formatted += '/';
      }
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    setFechaIngreso(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del líder o gerente es obligatorio.');
      return;
    }

    const cleanCedula = cedula.replace(/\D/g, '');
    if (!cleanCedula) {
      setError('La cédula de identidad es obligatoria (ej. 29904478).');
      return;
    }
    if (cleanCedula.length < 7 || cleanCedula.length > 8) {
      setError('La cédula de identidad debe contener entre 7 y 8 números (ej. 29904478).');
      return;
    }

    if (!telefono.trim()) {
      setError('El teléfono móvil es obligatorio y debe contener exactamente 11 caracteres (ej. 414-1234567).');
      return;
    }
    if (telefono.trim().length !== 11) {
      setError('El teléfono móvil debe tener exactamente 11 caracteres (ej. 414-1234567).');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const updatedGd: GerenteDistrito = {
        id: gdToEdit ? gdToEdit.id : `GD-${cleanCedula || Date.now()}`,
        status,
        cedula: cleanCedula,
        nombre: nombre.trim().toUpperCase(),
        cargo: cargo.trim().toUpperCase(),
        region: region.trim(),
        ciudad: ciudad.trim().toUpperCase(),
        estado: estado.trim().toUpperCase(),
        codigoSector: codigoSector.trim(),
        supervisor: supervisor.trim().toUpperCase(),
        fechaIngreso: fechaIngreso.trim(),
        telefono: telefono.trim(),
        correo: correo.trim().toLowerCase(),
      };

      await onSave(updatedGd, updateAssignedReps, originalName);
      onClose();
    } catch (err: any) {
      console.error('Error saving GD:', err);
      setError(err?.message || 'Error al guardar los datos.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (gdToEdit && onDelete) {
      onDelete(gdToEdit.id);
      onClose();
    }
  };

  const isNameChanged = isEditMode && originalName.toUpperCase() !== nombre.trim().toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 backdrop-blur-xs overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#EAE5E1] w-full max-w-full sm:max-w-lg max-h-[96vh] flex flex-col overflow-x-hidden overflow-y-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-[#1A1A1E] to-[#2B2B36] text-white px-3.5 py-2.5 flex items-center justify-between shrink-0 w-full max-w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl theme-gradient-bg flex items-center justify-center text-white shadow-2xs shrink-0">
              {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black tracking-tight truncate">
                {isEditMode ? 'Modificar Líder' : 'Nuevo Líder'}
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                {isEditMode
                  ? 'Actualiza contacto y asignación territorial'
                  : 'Registra un nuevo líder en el directorio'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Flex container with scrollable fields */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 w-full max-w-full overflow-hidden">
          {/* Scrollable Fields Body - Single Column Stack */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 w-full max-w-full">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 w-full">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Sección 1: Identificación y Contacto */}
            <div className="space-y-2.5 w-full">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#EAE5E1] pb-1">
                <User className="w-3.5 h-3.5 text-theme-primary" />
                <span>Identificación y Contacto</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 w-full">
                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                    Nombre Completo <span className="text-theme-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: JUAN PEREZ"
                    className="w-full max-w-full px-3 py-2 text-sm font-semibold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                    Cédula de Identidad <span className="text-theme-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={7}
                    maxLength={8}
                    value={cedula}
                    onChange={handleCedulaChange}
                    placeholder="Ej: 29904478"
                    className="w-full max-w-full px-3 py-2 text-sm font-mono font-medium bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-theme-primary" />
                    <span>Teléfono Móvil <span className="text-theme-primary">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={11}
                    maxLength={11}
                    value={telefono}
                    onChange={handleTelefonoChange}
                    placeholder="414-1234567"
                    className="w-full max-w-full px-3 py-2 text-sm font-mono font-medium bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-theme-primary" />
                    <span>Correo Electrónico</span>
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="gabriel.navas@lasante.com.ve"
                    className="w-full max-w-full px-3 py-2 text-sm font-medium bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Territorio y Ubicación */}
            <div className="space-y-2.5 pt-1 w-full">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#EAE5E1] pb-1">
                <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                <span>Territorio y Ubicación</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 w-full">
                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                    Región
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full max-w-full px-3 py-2 text-sm font-bold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  >
                    {REGION_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                    {!REGION_OPTIONS.includes(region) && <option value={region}>{region}</option>}
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Ej: CARACAS"
                    className="w-full max-w-full px-3 py-2 text-sm font-semibold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    placeholder="Ej: DISTRITO CAPITAL"
                    className="w-full max-w-full px-3 py-2 text-sm font-semibold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Rol Corporativo y Liderazgo */}
            <div className="space-y-2.5 pt-1 w-full">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#EAE5E1] pb-1">
                <Briefcase className="w-3.5 h-3.5 text-theme-primary" />
                <span>Rol Corporativo y Liderazgo</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 w-full">
                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                    Cargo / Rol
                  </label>
                  <select
                    value={customCargo ? 'CUSTOM' : cargo}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setCustomCargo(true);
                      } else {
                        setCustomCargo(false);
                        setCargo(e.target.value);
                      }
                    }}
                    className="w-full max-w-full px-3 py-2 text-sm font-bold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  >
                    {CARGO_PRESETS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="CUSTOM">Otro (Personalizado...)</option>
                  </select>
                  {customCargo && (
                    <input
                      type="text"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      placeholder="Escribe el cargo o rol personalizado"
                      className="w-full max-w-full mt-1.5 px-3 py-2 text-sm font-semibold bg-white border border-theme-primary rounded-xl focus:outline-none text-[#1A1A1E]"
                    />
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-theme-primary" />
                    <span>Supervisor Inmediato (Reporta a)</span>
                  </label>
                  <input
                    type="text"
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    placeholder="Ej: ISABEL MEDINA"
                    className="w-full max-w-full px-3 py-2 text-sm font-semibold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1 flex items-center gap-1">
                    <IdCard className="w-3 h-3 text-slate-500" />
                    <span>Código de Sector</span>
                  </label>
                  <input
                    type="text"
                    value={codigoSector}
                    onChange={(e) => setCodigoSector(e.target.value)}
                    placeholder="Ej: 100001"
                    className="w-full max-w-full px-3 py-2 text-sm font-mono font-medium bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Fecha de Ingreso</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={fechaIngreso}
                    onChange={handleFechaIngresoChange}
                    placeholder="DD/MM/AAAA"
                    className="w-full max-w-full px-3 py-2 text-sm font-mono font-medium bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                    Estado Operativo
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full max-w-full px-3 py-2 text-sm font-bold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="VACANTE">VACANTE</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sincronización en cascada con representantes asignados */}
            {isEditMode && assignedRepsCount > 0 && (
              <div className="p-2.5 bg-emerald-50/90 border border-emerald-200 rounded-xl flex flex-col gap-2 text-xs w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-emerald-950 truncate text-xs">
                      Equipo asignado: {assignedRepsCount} representantes
                    </div>
                    <div className="text-[11px] text-emerald-800 font-medium">
                      {isNameChanged
                        ? `Al cambiar a "${nombre.trim().toUpperCase()}", se actualizará en el equipo.`
                        : `Los representantes mantienen relación con este líder.`}
                    </div>
                  </div>
                </div>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-emerald-900 bg-white/90 px-2.5 py-1.5 rounded-lg border border-emerald-200 w-fit">
                  <input
                    type="checkbox"
                    checked={updateAssignedReps}
                    onChange={(e) => setUpdateAssignedReps(e.target.checked)}
                    className="rounded text-theme-primary focus:ring-theme-primary"
                  />
                  <span>Auto-sincronizar fichas</span>
                </label>
              </div>
            )}
          </div>

          {/* Modal Actions - Sticky Bottom Footer */}
          <div className="shrink-0 p-3 border-t border-[#EAE5E1] bg-[#FAF8F7] flex flex-col gap-2 w-full max-w-full">
            {isEditMode && onDelete && (
              <div className="w-full">
                {showDeleteConfirm ? (
                  <div className="flex items-center justify-between gap-2 bg-red-50 p-2 rounded-xl border border-red-200">
                    <span className="text-xs text-red-600 font-bold">¿Confirmar eliminación?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50/70 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar líder</span>
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-3 py-2 text-sm font-bold text-slate-600 hover:text-[#1A1A1E] bg-white hover:bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50 text-center"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span className="truncate">{isSaving ? 'Guardando...' : isEditMode ? 'Guardar' : 'Registrar'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
