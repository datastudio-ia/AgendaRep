import React, { useState, useEffect } from 'react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ShieldCheck, Lock, User, Eye, EyeOff, X, AlertCircle, UserCheck } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
}

const ADMIN_USER = 'Administrador26';
const ADMIN_PASS = 'Lasante26*';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isAdmin,
  onLogoutAdmin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  // Bloquear scroll del fondo (scroll lock) reutilizable mientras el modal esté abierto
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      onLoginSuccess();
      onClose();
    } else {
      setError('Usuario o clave incorrectos. Verifica las credenciales de Administrador.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden overscroll-none flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-[#EAE5E1] w-full max-w-md overflow-hidden overscroll-contain animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="theme-gradient-bg text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center shadow-2xs shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Perfiles de Usuario
              </h3>
              <p className="text-xs text-white/85 font-medium">
                Control de acceso y permisos del aplicativo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Selector visual del estado actual */}
          <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-[#F8F4F2] rounded-2xl border border-[#EAE5E1]">
            <div
              className={`p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                !isAdmin
                  ? 'bg-white border-theme-primary shadow-xs'
                  : 'bg-transparent border-transparent opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-theme-primary">
                  Principal
                </span>
                {!isAdmin && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </div>
              <div className="flex items-center gap-1.5 font-black text-xs text-[#1A1A1E]">
                <UserCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Invitado</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Solo lectura y navegación completa
              </p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                isAdmin
                  ? 'bg-white border-emerald-600 shadow-xs'
                  : 'bg-transparent border-transparent opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  Secundario
                </span>
                {isAdmin && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </div>
              <div className="flex items-center gap-1.5 font-black text-xs text-[#1A1A1E]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Administrador</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Agregar, editar, eliminar y bloquear
              </p>
            </div>
          </div>

          {isAdmin ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm text-emerald-950">
                    Sesión de Administrador Activa
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    Tienes permisos completos para agregar, editar, eliminar, bloquear o desbloquear representantes y líderes en el directorio.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Continuar como Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLogoutAdmin();
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  Cambiar a Invitado
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                  Acceso de Administrador
                </h4>

                {error && (
                  <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Usuario
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ingresa el usuario administrador"
                        autoComplete="username"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-primary font-medium text-[#1A1A1E]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Clave de Acceso
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••"
                        autoComplete="current-password"
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-primary font-medium text-[#1A1A1E]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                        tabIndex={-1}
                        title={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Seguir como Invitado
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Ingresar como Admin</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
