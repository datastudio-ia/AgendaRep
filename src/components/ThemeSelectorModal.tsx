import React from 'react';
import { ThemeId, APP_THEMES } from '../types/theme';
import { Palette, Check, Sparkles, X, ArrowRight, ShieldCheck, HeartPulse, Building2 } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme-10 text-theme-primary flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                3 Diseños &amp; Paletas de Color para la Interfaz
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Al cambiar de diseño, los fondos, botones, iconos y etiquetas se adaptan al instante.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: The 3 Design Cards */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Object.values(APP_THEMES).map((theme) => {
              const isSelected = currentTheme === theme.id;
              const p = theme.palette;

              return (
                <div
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  style={{
                    borderColor: isSelected ? p.primary : undefined,
                    backgroundColor: isSelected ? `${p.primary}08` : undefined,
                  }}
                  className={`rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden relative group p-5 ${
                    isSelected
                      ? 'shadow-md ring-2'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white'
                  }`}
                >
                  {/* Active Selection Badge */}
                  {isSelected && (
                    <div
                      className="absolute top-3 right-3 text-white p-1 rounded-full shadow-xs"
                      style={{ backgroundColor: p.primary }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Visual Color Preview Strip */}
                    <div className="rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs">
                      {/* Simulated Mini Banner */}
                      <div
                        className={`h-5 w-full bg-gradient-to-r ${p.bannerGradient}`}
                      />
                      {/* Simulated Mini Body */}
                      <div
                        className="p-3 flex items-center justify-between"
                        style={{ backgroundColor: p.bgMain }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full shadow-2xs"
                            style={{ backgroundColor: p.primary }}
                            title="Color Principal de Iconos y Tabs"
                          />
                          <span
                            className="w-4 h-4 rounded-full shadow-2xs"
                            style={{ backgroundColor: p.secondary }}
                            title="Color Secundario de Etiquetas"
                          />
                          <span
                            className="w-4 h-4 rounded-full shadow-2xs"
                            style={{ backgroundColor: p.accent }}
                            title="Acento"
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300"
                            style={{ backgroundColor: p.bgCard }}
                            title="Fondo de Tarjetas"
                          />
                        </div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: p.primary,
                            color: '#FFFFFF',
                          }}
                        >
                          {theme.id === 'calox' ? 'Farma' : theme.id === 'nordic' ? 'Clinical' : 'Bio'}
                        </span>
                      </div>
                    </div>

                    {/* Live Sample of Icons & Badges for this theme */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Muestra de Iconos &amp; Etiquetas
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Sample badge Visita Médica */}
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1"
                          style={{
                            backgroundColor: p.primary10,
                            color: p.primary,
                            borderColor: `${p.primary}33`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: p.primary }}
                          />
                          Visita Médica
                        </span>

                        {/* Sample badge Comercial */}
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1"
                          style={{
                            backgroundColor: p.secondary10,
                            color: p.secondary,
                            borderColor: `${p.secondary}33`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: p.secondary }}
                          />
                          Comercial
                        </span>
                      </div>
                    </div>

                    {/* Titles */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{
                            backgroundColor: `${p.primary}18`,
                            color: p.primary,
                          }}
                        >
                          {theme.badge}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {theme.name}
                      </h3>
                      <div className="text-[11px] font-bold text-slate-500">
                        {theme.subtitle}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {theme.description}
                    </p>

                    {/* Feature Bullets */}
                    <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
                      {theme.characteristics.map((char, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                            style={{ backgroundColor: p.primary }}
                          />
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply Button */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button
                      type="button"
                      style={{
                        backgroundColor: isSelected ? p.primary : undefined,
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Diseño Activo</span>
                        </>
                      ) : (
                        <>
                          <span>Aplicar Este Diseño</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>El tema seleccionado se guarda automáticamente en tu navegador.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
