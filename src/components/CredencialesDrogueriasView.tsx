import React, { useState, useMemo } from 'react';
import { CredencialDrogueria, ViewMode } from '../types/contact';
import {
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  Search,
  LayoutGrid,
  Table2,
  FileSpreadsheet,
  Building2,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  MapPin,
  Briefcase,
  X,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  Pencil,
  RotateCcw,
  UserCheck,
} from 'lucide-react';

interface CredencialesDrogueriasViewProps {
  credenciales: CredencialDrogueria[];
  isAdmin?: boolean;
  onAddCredencial?: () => void;
  onEditCredencial?: (cred: CredencialDrogueria) => void;
  onDeleteCredencial?: (credId: string) => void;
  onToggleStatus?: (credId: string) => void;
  onBatchToggleStatus?: (credIds: string[], newStatus: 'Activo' | 'Desactivar') => void;
  onExportExcel?: () => void;
}

export const DROGUERIAS_METADATA: Record<string, { name: string; color: string; badgeBg: string; textColor: string; borderColor: string; portal: string }> = {
  BLV: {
    name: 'BLV',
    color: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    portal: 'https://blv-orders.greicodex.com/',
  },
  INSUAMINCA: {
    name: 'INSUAMINCA',
    color: 'from-emerald-600 to-teal-600',
    badgeBg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    portal: 'https://portalprv.insuaminca.org/login',
  },
  VITALCLINIC: {
    name: 'VITALCLINIC',
    color: 'from-cyan-600 to-blue-600',
    badgeBg: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    portal: 'https://ct.vitalclinicdrogueria.com/',
  },
  ZAKIPHARMA: {
    name: 'ZAKIPHARMA',
    color: 'from-purple-600 to-pink-600',
    badgeBg: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    portal: 'https://drogueriazakipharma.net/portal/',
  },
  DROVENCENTRO: {
    name: 'DROVENCENTRO',
    color: 'from-amber-600 to-orange-600',
    badgeBg: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    portal: 'https://www.drovencentro.com/portal/',
  },
};

export const CredencialesDrogueriasView: React.FC<CredencialesDrogueriasViewProps> = ({
  credenciales,
  isAdmin = false,
  onAddCredencial,
  onEditCredencial,
  onDeleteCredencial,
  onToggleStatus,
  onBatchToggleStatus,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrogueria, setSelectedDrogueria] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Track copied state for user/passwords
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  // Show / hide all passwords globally
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  // Show / hide individual passwords
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Distinct droguerías with counts
  const drogueriaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    credenciales.forEach((c) => {
      const drog = (c.drogueria || '').trim().toUpperCase();
      counts[drog] = (counts[drog] || 0) + 1;
    });
    return counts;
  }, [credenciales]);

  // Filtered credenciales
  const filteredCredenciales = useMemo(() => {
    return credenciales.filter((c) => {
      // Droguería filter
      if (selectedDrogueria !== 'all') {
        if (c.drogueria.trim().toUpperCase() !== selectedDrogueria.toUpperCase()) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all') {
        const estatus = (c.estatus || 'ACTIVO').trim().toUpperCase();
        if (selectedStatus === 'activo' && estatus !== 'ACTIVO') return false;
        if (selectedStatus === 'desactivar' && estatus === 'ACTIVO') return false;
      }

      // Search term
      if (searchTerm) {
        const terms = searchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const searchable = `${c.drogueria} ${c.representante} ${c.cedula} ${c.correo} ${c.cargo} ${c.region} ${c.usuario} ${c.portalUrl}`.toLowerCase();
        const matches = terms.every((t) => searchable.includes(t));
        if (!matches) return false;
      }

      return true;
    });
  }, [credenciales, selectedDrogueria, selectedStatus, searchTerm]);

  // Total counts
  const totalActivas = useMemo(() => {
    return credenciales.filter((c) => (c.estatus || 'ACTIVO').toUpperCase() === 'ACTIVO').length;
  }, [credenciales]);

  const totalInactivas = useMemo(() => {
    return credenciales.filter((c) => (c.estatus || 'ACTIVO').toUpperCase() !== 'ACTIVO').length;
  }, [credenciales]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDrogueria('all');
    setSelectedStatus('all');
  };

  const hasActiveFilters = searchTerm !== '' || selectedDrogueria !== 'all' || selectedStatus !== 'all';

  return (
    <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-full overflow-x-hidden">
      {/* 1. Header Card similar al de GD-Coordinadores */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-[#EAE5E1] shadow-2xs flex flex-col gap-2.5 sm:gap-5 w-full max-w-full">
        {/* Fila superior: Título, badges y botón de exportar/agregar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 w-full">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl theme-gradient-bg text-white flex items-center justify-center shadow-2xs shrink-0">
              <KeyRound className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black text-[#1A1A1E] tracking-tight truncate">
                  Credenciales de Droguerías
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-100 text-blue-800 shrink-0">
                  {credenciales.length} accesos
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                Portales, usuarios, claves y enlaces directos de droguerías comerciales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
            {/* Botón Ver / Ocultar todas las claves */}
            <button
              type="button"
              onClick={() => setShowAllPasswords((prev) => !prev)}
              className={`inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3 sm:px-3.5 rounded-xl sm:rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 ${
                showAllPasswords
                  ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-white text-slate-700 border-[#EAE5E1] hover:bg-slate-50'
              }`}
              title={showAllPasswords ? 'Ocultar todas las claves' : 'Visualizar todas las claves de acceso'}
            >
              {showAllPasswords ? (
                <EyeOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <span>{showAllPasswords ? 'Ocultar Claves' : 'Ver Todas las Claves'}</span>
            </button>

            {onAddCredencial && isAdmin && (
              <button
                onClick={onAddCredencial}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl sm:rounded-full shadow-2xs transition-all cursor-pointer shrink-0"
                title="Agregar representante con su usuario y clave"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Usuario</span>
              </button>
            )}
          </div>
        </div>

        {/* Fila 2: Barra de búsqueda, Selectores de modo tarjeta/tabla */}
        <div className="pt-2 sm:pt-4 border-t border-[#EAE5E1]/80 w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
          {/* Input Buscador */}
          <div className="relative flex-1 w-full max-w-full">
            <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-primary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar representante, droguería, usuario, cédula, región..."
              className="w-full max-w-full pl-9 sm:pl-10 pr-8 sm:pr-9 py-2 sm:py-2.5 text-sm bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl sm:rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-all placeholder:text-slate-400 font-medium text-[#1A1A1E]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle de Modo Tarjetas / Tabla */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <div className="inline-flex bg-[#F8F4F2] p-0.5 sm:p-1 rounded-xl sm:rounded-full border border-[#EAE5E1] shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-theme-primary text-white shadow-2xs'
                    : 'text-slate-600 hover:text-theme-primary'
                }`}
                title="Vista Tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                <span>Tarjetas</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-theme-primary text-white shadow-2xs'
                    : 'text-slate-600 hover:text-theme-primary'
                }`}
                title="Vista Tabla"
              >
                <Table2 className="w-3.5 h-3.5 shrink-0" />
                <span>Tabla</span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-full bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Fila 3: Filtros por Droguería, Región y Estatus en la misma línea unificada */}
        <div className="pt-2 sm:pt-4 border-t border-[#EAE5E1]/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Filtrar por Droguería y Criterios
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Mostrando {filteredCredenciales.length} de {credenciales.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
            {/* Botón Todas */}
            <button
              type="button"
              onClick={() => setSelectedDrogueria('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                selectedDrogueria === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-[#F8F4F2] text-slate-700 border-[#EAE5E1] hover:bg-slate-200/60'
              }`}
            >
              <span>Todas</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${selectedDrogueria === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {credenciales.length}
              </span>
            </button>

            {/* Botones por cada Droguería */}
            {Object.keys(DROGUERIAS_METADATA).map((drogKey) => {
              const meta = DROGUERIAS_METADATA[drogKey];
              const isSelected = selectedDrogueria.toUpperCase() === drogKey.toUpperCase();
              const count = drogueriaCounts[drogKey] || 0;
              return (
                <button
                  key={drogKey}
                  type="button"
                  onClick={() => setSelectedDrogueria(isSelected ? 'all' : drogKey)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? `${meta.badgeBg} ${meta.textColor} ${meta.borderColor} ring-2 ring-blue-400/30 shadow-2xs`
                      : 'bg-[#F8F4F2] text-slate-700 border-[#EAE5E1] hover:bg-slate-200/60'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{meta.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isSelected ? 'bg-white text-slate-800' : 'bg-slate-200 text-slate-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Divisor vertical */}
            <div className="h-6 w-px bg-slate-300 mx-1 shrink-0" />

            {/* Filtro Estatus al lado de los filtros de droguerías */}
            <div className="flex items-center gap-1.5 shrink-0 bg-[#F8F4F2] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-full border border-[#EAE5E1]">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500">Estatus:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Todos ({credenciales.length})</option>
                <option value="activo">Activos ({totalActivas})</option>
                <option value="desactivar">Desactivar ({totalInactivas})</option>
              </select>
            </div>

            {/* Botón Exportar Excel alineado al lado derecho del filtro de estatus */}
            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full border border-emerald-300 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs shrink-0"
                title="Exportar listado a Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Excel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Visualización: Grid de Tarjetas o Tabla */}
      {filteredCredenciales.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EAE5E1] p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-theme-10 text-theme-primary flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A1E]">
            No se encontraron credenciales
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Intenta cambiar los filtros seleccionados o el término de búsqueda.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Tarjetas con estilo idéntico a GD-Coordinadores / Representantes */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
          {filteredCredenciales.map((cred) => {
            const meta = DROGUERIAS_METADATA[cred.drogueria.toUpperCase()] || {
              name: cred.drogueria,
              color: 'from-slate-600 to-slate-800',
              badgeBg: 'bg-slate-100',
              textColor: 'text-slate-800',
              borderColor: 'border-slate-200',
              portal: cred.portalUrl,
            };
            const isPasswordVisible = showAllPasswords || Boolean(visiblePasswords[cred.id]);
            const isActivo = (cred.estatus || 'ACTIVO').toUpperCase() === 'ACTIVO';

            return (
              <div
                key={cred.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAE5E1] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 relative overflow-hidden group"
              >
                {/* Header de la tarjeta */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black tracking-wide border ${meta.badgeBg} ${meta.textColor} ${meta.borderColor}`}>
                        {cred.drogueria}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleStatus && onToggleStatus(cred.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer border shadow-2xs hover:scale-105 active:scale-95 ${
                          isActivo
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300'
                        }`}
                        title={`Clic para ${isActivo ? 'desactivar' : 'activar'} usuario`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActivo ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        <span>{cred.estatus || 'Activo'}</span>
                      </button>
                    </div>

                    {/* Portal link button */}
                    {cred.portalUrl && (
                      <a
                        href={cred.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 transition-colors"
                        title={`Abrir portal de ${cred.drogueria}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Portal</span>
                      </a>
                    )}
                  </div>

                  {/* Nombre y Cargo */}
                  <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                    {cred.representante}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cred.cargo}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cred.region}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-600">C.I. {cred.cedula}</span>
                  </div>
                </div>

                {/* Recuadro de Credenciales (Usuario y Clave) */}
                <div className="bg-[#F8F4F2] rounded-2xl p-3 border border-[#EAE5E1] space-y-2">
                  {/* Usuario */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-500">Usuario:</span>
                      <span className="font-mono font-bold text-slate-800 truncate" title={cred.usuario}>
                        {cred.usuario || 'N/A'}
                      </span>
                    </div>
                    {cred.usuario && (
                      <button
                        type="button"
                        onClick={() => handleCopy(cred.usuario, `user-${cred.id}`)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-colors cursor-pointer shrink-0"
                        title="Copiar usuario"
                      >
                        {copiedKey === `user-${cred.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Contraseña */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-1.5 border-t border-[#EAE5E1]/80">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-500">Clave:</span>
                      <span className="font-mono font-bold text-slate-800 truncate" title={cred.password}>
                        {isPasswordVisible ? cred.password || 'N/A' : '••••••••'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {cred.password && (
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(cred.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-colors cursor-pointer"
                          title={isPasswordVisible ? 'Ocultar clave' : 'Mostrar clave'}
                        >
                          {isPasswordVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {cred.password && (
                        <button
                          type="button"
                          onClick={() => handleCopy(cred.password || '', `pass-${cred.id}`)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                          title="Copiar contraseña"
                        >
                          {copiedKey === `pass-${cred.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer de la tarjeta con acciones si es admin */}
                {isAdmin && (onEditCredencial || onDeleteCredencial) && (
                  <div className="flex items-center justify-between gap-1.5 pt-2.5 border-t border-slate-100 mt-1">
                    <span className="text-[10px] font-semibold text-slate-400">
                      Administrador
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onEditCredencial && (
                        <button
                          type="button"
                          onClick={() => onEditCredencial(cred)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                          title="Editar representante y credenciales de usuario"
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />
                          <span>Editar</span>
                        </button>
                      )}
                      {onDeleteCredencial && (
                        <button
                          type="button"
                          onClick={() => onDeleteCredencial(cred.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar credencial"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista Tabla Compacta */
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAE5E1] shadow-2xs overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F4F2] border-b border-[#EAE5E1] text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">Droguería</th>
                  <th className="py-3 px-3.5">Representante</th>
                  <th className="py-3 px-3.5">Cédula</th>
                  <th className="py-3 px-3.5">Cargo</th>
                  <th className="py-3 px-3.5">Región</th>
                  <th className="py-3 px-3.5">Usuario</th>
                  <th className="py-3 px-3.5">Contraseña</th>
                  <th className="py-3 px-3.5">Portal</th>
                  <th className="py-3 px-3.5 text-center">Estatus</th>
                  {isAdmin && <th className="py-3 px-3.5 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5E1]/70">
                {filteredCredenciales.map((cred) => {
                  const meta = DROGUERIAS_METADATA[cred.drogueria.toUpperCase()] || {
                    badgeBg: 'bg-slate-100',
                    textColor: 'text-slate-800',
                    borderColor: 'border-slate-200',
                  };
                  const isPasswordVisible = showAllPasswords || Boolean(visiblePasswords[cred.id]);
                  const isActivo = (cred.estatus || 'ACTIVO').toUpperCase() === 'ACTIVO';

                  return (
                    <tr key={cred.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${meta.badgeBg} ${meta.textColor} ${meta.borderColor}`}>
                          {cred.drogueria}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {cred.representante}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {cred.cedula}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600 whitespace-nowrap">
                        {cred.cargo}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600 whitespace-nowrap">
                        {cred.region}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                          <span>{cred.usuario}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(cred.usuario, `tbl-user-${cred.id}`)}
                            className="p-0.5 text-slate-400 hover:text-blue-600"
                            title="Copiar usuario"
                          >
                            {copiedKey === `tbl-user-${cred.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                          <span>{isPasswordVisible ? cred.password : '••••••••'}</span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(cred.id)}
                            className="p-0.5 text-slate-400 hover:text-slate-700"
                            title={isPasswordVisible ? 'Ocultar' : 'Ver'}
                          >
                            {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(cred.password || '', `tbl-pass-${cred.id}`)}
                            className="p-0.5 text-slate-400 hover:text-blue-600"
                            title="Copiar clave"
                          >
                            {copiedKey === `tbl-pass-${cred.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {cred.portalUrl && (
                          <a
                            href={cred.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Abrir</span>
                          </a>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onToggleStatus && onToggleStatus(cred.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer border shadow-2xs hover:scale-105 active:scale-95 ${
                            isActivo
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300'
                          }`}
                          title={`Clic para ${isActivo ? 'desactivar' : 'activar'} usuario`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActivo ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          <span>{cred.estatus || 'Activo'}</span>
                        </button>
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {onEditCredencial && (
                              <button
                                type="button"
                                onClick={() => onEditCredencial(cred)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer transition-colors"
                                title="Editar representante con su usuario"
                              >
                                <Pencil className="w-3 h-3 text-blue-600" />
                                <span>Editar</span>
                              </button>
                            )}
                            {onDeleteCredencial && (
                              <button
                                type="button"
                                onClick={() => onDeleteCredencial(cred.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
