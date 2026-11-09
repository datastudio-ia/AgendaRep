import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, MoreVertical, CheckCircle2, X, Wifi } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'menu';
  onActionComplete?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  onActionComplete,
}) => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  if (isInstalled && variant === 'header') {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await promptInstall();
      if (outcome === 'accepted' && onActionComplete) {
        onActionComplete();
      }
    } else {
      setIsGuideOpen(true);
    }
  };

  return (
    <>
      {variant === 'header' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer border bg-white/15 hover:bg-white/25 text-white border-white/25 shadow-2xs shrink-0"
          title="Instalar AgendaRep como aplicación en tu dispositivo móvil o PC"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Instalar App</span>
          <span className="sm:hidden">App</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold">
                {isInstalled ? 'App Instalada' : 'Instalar Aplicación (PWA)'}
              </div>
              <div className="text-[10px] text-slate-500 font-normal">
                {isInstalled
                  ? 'Ejecutando como aplicación móvil'
                  : 'Usar en celular o PC sin conexión'}
              </div>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-100 text-blue-800">
            {isInstalled ? 'Activa' : 'App'}
          </span>
        </button>
      )}

      {isGuideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsGuideOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsGuideOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <img
                src="./icon.svg"
                alt="AgendaRep"
                className="w-12 h-12 rounded-2xl shadow-md shrink-0"
              />
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Instalar AgendaRep en tu Móvil
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Acceso directo en pantalla de inicio y modo sin conexión
                </p>
              </div>
            </div>

            {isInstallable ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tu navegador permite la instalación directa. Pulsa el botón inferior para agregar{' '}
                  <strong>AgendaRep</strong> a tu pantalla de inicio.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await promptInstall();
                    setIsGuideOpen(false);
                    if (onActionComplete) onActionComplete();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-[#0850FD] hover:bg-[#0535B8] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Ahora</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* iOS / Safari Instructions */}
                <div
                  className={`p-3.5 rounded-2xl border ${
                    isIOS
                      ? 'bg-blue-50/70 border-blue-200'
                      : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="text-xs font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#0850FD]" />
                    <span>En iPhone / iPad (Safari):</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-[#0850FD] shrink-0">1.</span>
                      <span>
                        Toca el botón <strong>Compartir</strong>{' '}
                        <Share className="w-3.5 h-3.5 inline text-[#0850FD] mx-0.5" /> en la barra inferior de Safari.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-[#0850FD] shrink-0">2.</span>
                      <span>
                        Desliza hacia abajo y selecciona{' '}
                        <strong>&ldquo;Agregar a inicio&rdquo;</strong>{' '}
                        <PlusSquare className="w-3.5 h-3.5 inline text-[#0850FD] mx-0.5" />.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-[#0850FD] shrink-0">3.</span>
                      <span>
                        Pulsa <strong>Agregar</strong> en la esquina superior derecha.
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Android / Chrome Instructions */}
                <div
                  className={`p-3.5 rounded-2xl border ${
                    !isIOS
                      ? 'bg-blue-50/70 border-blue-200'
                      : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="text-xs font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>En Android (Chrome / Edge):</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-emerald-600 shrink-0">1.</span>
                      <span>
                        Abre el aplicativo en una pestaña directa del navegador y toca el menú de tres puntos{' '}
                        <MoreVertical className="w-3.5 h-3.5 inline text-slate-700 mx-0.5" /> arriba a la derecha.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-emerald-600 shrink-0">2.</span>
                      <span>
                        Selecciona <strong>&ldquo;Instalar aplicación&rdquo;</strong> o{' '}
                        <strong>&ldquo;Agregar a la pantalla principal&rdquo;</strong>.
                      </span>
                    </li>
                  </ol>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Una vez instalada, AgendaRep funciona en pantalla completa y permite consultar el directorio incluso sin internet.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsGuideOpen(false);
                    if (onActionComplete) onActionComplete();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
