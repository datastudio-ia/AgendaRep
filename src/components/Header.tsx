import React, { useState, useRef, useEffect } from 'react';
import { AuthUser } from '../services/firebaseAuth';
import { ActiveTab } from '../types/contact';
import { ThemeId, APP_THEMES } from '../types/theme';
import { LogOut, FileSpreadsheet, Users, UserCheck, Network, Compass, BarChart3, Palette, Settings, ChevronDown, UserPlus, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  user: AuthUser | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  currentTheme?: ThemeId;
  onOpenThemeModal?: () => void;
  onAddRep?: () => void;
  onAddGd?: () => void;
  totalRepsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  currentTheme = 'calox',
  onOpenThemeModal,
  onAddRep,
  onAddGd,
  totalRepsCount = 83,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const configMenuRef = useRef<HTMLDivElement>(null);
  const themeConfig = APP_THEMES[currentTheme] || APP_THEMES.calox;

  const isGdsTab = activeTab === 'gds';
  const handleAddClick = isGdsTab ? onAddGd : onAddRep;
  const addLabel = isGdsTab ? 'Nuevo Líder / GD' : 'Agregar Representante';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configMenuRef.current && !configMenuRef.current.contains(event.target as Node)) {
        setIsConfigOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full max-w-full bg-gradient-to-r ${themeConfig.palette.bannerGradient} text-white shadow-md border-b border-white/10 transition-all duration-300`}
    >
      <div className="w-full max-w-full md:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-12 sm:h-16">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => onTabChange('reps')}
            className="flex items-center gap-1.5 group cursor-pointer focus:outline-none min-w-0 shrink-0"
            aria-label="Ir a inicio de representantes"
          >
            <span className="text-lg sm:text-2xl font-black tracking-tight text-white drop-shadow-xs truncate">
              AgendaRep
            </span>
          </button>

          {/* Zone 2 (Desktop): Centered Main Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-black/15 p-1 rounded-full border border-white/15 backdrop-blur-xs">
            <button
              onClick={() => onTabChange('reps')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reps'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Representantes ({totalRepsCount})</span>
            </button>
            <button
              onClick={() => onTabChange('gds')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gds'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>GD - Coordinadores</span>
            </button>
            <button
              onClick={() => onTabChange('map')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Mapa Territorial</span>
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Resumen</span>
            </button>
            <button
              onClick={() => onTabChange('matrix')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Organigrama</span>
            </button>
          </nav>

          {/* Zone 3: Botón Configuración */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex items-center shrink-0" ref={configMenuRef}>
              <button
                onClick={() => setIsConfigOpen((prev) => !prev)}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all cursor-pointer shadow-sm border shrink-0 ${
                  isConfigOpen || activeTab === 'sheets'
                    ? 'bg-white text-slate-900 border-white shadow-md'
                    : 'bg-white/15 hover:bg-white/25 text-white border-white/25'
                }`}
                title="Configuración"
                aria-label="Configuración"
              >
                <Settings className={`w-4 h-4 transition-transform duration-300 ${isConfigOpen ? 'rotate-90' : ''}`} />
              </button>

              {isConfigOpen && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] max-w-[270px] sm:w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 text-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Opciones de Configuración
                    </p>
                  </div>

                  <div className="py-1 space-y-1">
                    {/* Function 1: Google Sheets */}
                    <button
                      onClick={() => {
                        onTabChange('sheets');
                        setIsConfigOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'sheets'
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${activeTab === 'sheets' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-50 text-emerald-600'}`}>
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold">Google Sheets</div>
                          <div className="text-[10px] text-slate-500 font-normal">Sincronización de datos</div>
                        </div>
                      </div>
                      {activeTab === 'sheets' && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </button>

                    {/* Function 2: Paletas (3) */}
                    {onOpenThemeModal && (
                      <button
                        onClick={() => {
                          onOpenThemeModal();
                          setIsConfigOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                            <Palette className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold">Paletas (3)</div>
                            <div className="text-[10px] text-slate-500 font-normal">Cambiar diseño y colores</div>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Function 3: Google Account / Conectar Sheets */}
                  <div className="pt-1.5 mt-1 border-t border-slate-100">
                    {user ? (
                      <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/70">
                        <div className="flex items-center gap-2 min-w-0">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName || 'Usuario'}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full border border-slate-300 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {user.email?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {user.displayName || user.email?.split('@')[0]}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              Google Conectado
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            onLogout();
                            setIsConfigOpen(false);
                          }}
                          title="Cerrar sesión"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          onLogin();
                          setIsConfigOpen(false);
                        }}
                        disabled={isLoggingIn}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer disabled:opacity-60"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>{isLoggingIn ? 'Conectando...' : 'Conectar Sheets'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Strip (visible only below md) */}
        <nav className="md:hidden flex overflow-x-auto gap-1.5 py-2 border-t border-white/15 text-xs font-semibold scrollbar-none w-full max-w-full">
          <button
            onClick={() => onTabChange('reps')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'reps'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'bg-white/15 text-white/90 border border-white/20 hover:bg-white/25'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Representantes ({totalRepsCount})</span>
          </button>
          <button
            onClick={() => onTabChange('gds')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'gds'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'bg-white/15 text-white/90 border border-white/20 hover:bg-white/25'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span>GD - Coordinadores</span>
          </button>
          <button
            onClick={() => onTabChange('map')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'map'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'bg-white/15 text-white/90 border border-white/20 hover:bg-white/25'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Mapa Territorial</span>
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'bg-white/15 text-white/90 border border-white/20 hover:bg-white/25'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>Resumen</span>
          </button>
          <button
            onClick={() => onTabChange('matrix')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'matrix'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'bg-white/15 text-white/90 border border-white/20 hover:bg-white/25'
            }`}
          >
            <Network className="w-3.5 h-3.5 shrink-0" />
            <span>Organigrama</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
