import React, { useState } from 'react';
import { AuthUser } from '../services/firebaseAuth';
import { Representante, GerenteDistrito } from '../types/contact';
import {
  createAgendaSpreadsheet,
  ExportSheetsResult,
  LinkedSpreadsheetInfo,
  getSpreadsheetDetails,
  extractSpreadsheetId,
  CANONICAL_DATABASE_TITLE,
} from '../services/sheetsService';
import { exportToCsvFile } from '../utils/phoneUtils';
import { exportRepsToExcel, exportGdsToExcel } from '../utils/excelExport';
import {
  FileSpreadsheet,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Link as LinkIcon,
  Unlink,
  ArrowDownUp,
  Info,
} from 'lucide-react';

interface GoogleSheetsSyncProps {
  user: AuthUser | null;
  onLogin: () => void;
  onLogout?: () => void;
  isLoggingIn: boolean;
  loginError?: string | null;
  reps: Representante[];
  gds: GerenteDistrito[];
  linkedSheet: LinkedSpreadsheetInfo | null;
  onUpdateLinkedSheet: (info: LinkedSpreadsheetInfo | null) => void;
  onPullSync: () => Promise<void>;
  isPullSyncing: boolean;
  syncStats?: { added: number; updated: number; unchanged: number; totalRemote: number } | null;
  syncError?: string | null;
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  loginError,
  reps,
  gds,
  linkedSheet,
  onUpdateLinkedSheet,
  onPullSync,
  isPullSyncing,
  syncStats,
  syncError,
}) => {
  const [sheetTitle, setSheetTitle] = useState(CANONICAL_DATABASE_TITLE);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportSheetsResult | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Link existing sheet state
  const [existingInput, setExistingInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const handleStartExport = () => {
    setExportError(null);
    setShowConfirmModal(true);
  };

  const executeExport = async () => {
    setShowConfirmModal(false);
    setIsExporting(true);
    setExportError(null);
    try {
      const result = await createAgendaSpreadsheet(sheetTitle, reps, gds);
      setExportResult(result);
      onUpdateLinkedSheet({
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
        title: result.title,
        sheetTabName: 'Representantes',
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error(err);
      setExportError(err.message || 'Error al exportar a Google Sheets');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingInput.trim()) return;
    setLinkError(null);
    setIsLinking(true);

    try {
      const sheetId = extractSpreadsheetId(existingInput);
      if (!sheetId) throw new Error('Ingresa un enlace o ID de Google Sheets válido.');

      const details = await getSpreadsheetDetails(sheetId);
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
      const tabName = details.sheets.find(s => s.toLowerCase().includes('representante')) || details.sheets[0] || 'Representantes';

      const newInfo: LinkedSpreadsheetInfo = {
        spreadsheetId: sheetId,
        spreadsheetUrl: url,
        title: details.title,
        sheetTabName: tabName,
        lastSyncedAt: new Date().toISOString(),
      };

      onUpdateLinkedSheet(newInfo);
      setExistingInput('');
    } catch (err: any) {
      console.error(err);
      setLinkError(err.message || 'No se pudo acceder a la hoja indicada.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = () => {
    if (window.confirm('¿Desvincular esta hoja de Google Sheets de la aplicación? Los datos locales se conservarán.')) {
      onUpdateLinkedSheet(null);
      setExportResult(null);
    }
  };

  const handleCopyLink = () => {
    const targetUrl = linkedSheet?.spreadsheetUrl || exportResult?.spreadsheetUrl;
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportRepsCsv = () => {
    exportToCsvFile(reps, 'DATA_REP_Xana.csv');
  };

  const handleExportGdsCsv = () => {
    exportToCsvFile(gds, 'DATA_GD_Xana.csv');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Hero Card */}
      <div className="bg-white rounded-3xl border border-[#EAE5E1] p-6 md:p-8 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl theme-gradient-bg flex items-center justify-center text-white shrink-0 shadow-xs">
            <ArrowDownUp className="w-7 h-7" />
          </div>

          <div className="flex-1">
            <div className="inline-block text-[11px] font-bold text-theme-primary bg-theme-10 px-3 py-0.5 rounded-full mb-1.5 uppercase tracking-wider">
              Sincronización Bidireccional
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1E] tracking-tight">
              Sincronización con Google Sheets
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">
              Conexión bidireccional en tiempo real: al <strong>agregar o modificar un representante en la app</strong> se actualiza en Google Sheets, y al <strong>agregar o editar datos en Google Sheets</strong> se actualizan en el aplicativo.
            </p>
          </div>
        </div>

        {/* Auth Section */}
        <div className="mt-8 pt-6 border-t border-[#EAE5E1]">
          {!user ? (
            <div>
              <div className="bg-[#F8F4F2] border border-[#EAE5E1] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[#1A1A1E]">
                    Conexión con Google requerida
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">
                    Inicia sesión con tu cuenta de Google para sincronizar automáticamente con tus hojas de cálculo.
                  </div>
                </div>

                <button
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="flex items-center justify-center gap-2.5 px-6 py-3 text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-full transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0"
                >
                  <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
                  <span>{isLoggingIn ? 'Iniciando sesión...' : 'Iniciar sesión con Google'}</span>
                </button>
              </div>

              {loginError && (
                <div className="mt-3.5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Aviso de conexión:</span> {loginError}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account Status bar */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-[#F8F4F2] p-3.5 rounded-2xl border border-[#EAE5E1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Conectado con <strong className="text-[#1A1A1E]">{user.email || user.displayName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold bg-emerald-100/60 px-2.5 py-0.5 rounded-full text-[10px]">
                    Google Conectado
                  </span>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold cursor-pointer transition-colors px-2 py-0.5"
                    >
                      Cerrar sesión
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Active Linked Spreadsheet Status Banner */}
              {linkedSheet ? (
                <div className="p-6 bg-linear-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200 rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">
                            Hoja Vinculada Activa
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            Pestaña: <strong className="text-slate-800">{linkedSheet.sheetTabName || 'Representantes'}</strong>
                          </span>
                        </div>
                        <h3 className="text-base font-black text-emerald-950 mt-0.5">
                          {linkedSheet.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={linkedSheet.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-100/50 rounded-full transition-all cursor-pointer shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir en Google Sheets</span>
                      </a>

                      <button
                        onClick={handleUnlink}
                        title="Desvincular esta hoja"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-full transition-colors cursor-pointer"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sync action strip */}
                  <div className="pt-3 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-emerald-900 font-medium">
                      {linkedSheet.lastSyncedAt ? (
                        <span>Última sincronización: <strong>{new Date(linkedSheet.lastSyncedAt).toLocaleString('es-ES')}</strong></span>
                      ) : (
                        <span>Listo para sincronizar cambios</span>
                      )}
                    </div>

                    <button
                      onClick={onPullSync}
                      disabled={isPullSyncing}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all shadow-sm cursor-pointer disabled:opacity-60"
                    >
                      <RefreshCw className={`w-4 h-4 ${isPullSyncing ? 'animate-spin' : ''}`} />
                      <span>{isPullSyncing ? 'Sincronizando con Google Sheets...' : 'Sincronizar ahora con Google Sheets'}</span>
                    </button>
                  </div>

                  {/* Sync Stats Banner */}
                  {syncStats && (
                    <div className="p-3.5 bg-white/90 border border-emerald-200 rounded-2xl text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Sincronización completada exitosamente</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                          <span className="text-slate-500 block">Nuevos agregados:</span>
                          <span className="font-bold text-emerald-700 text-sm">{syncStats.added}</span>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
                          <span className="text-slate-500 block">Actualizados:</span>
                          <span className="font-bold text-blue-700 text-sm">{syncStats.updated}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <span className="text-slate-500 block">Sin cambios:</span>
                          <span className="font-bold text-slate-700 text-sm">{syncStats.unchanged}</span>
                        </div>
                        <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                          <span className="text-slate-500 block">Total en hoja:</span>
                          <span className="font-bold text-amber-800 text-sm">{syncStats.totalRemote}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {syncError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Error de sincronización: {syncError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5 font-medium">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold">No hay hoja vinculada actualmente.</span> Puedes vincular una hoja existente pegando su enlace a continuación o crear una nueva hoja con un solo clic.
                  </div>
                </div>
              )}

              {/* 3. Option A: Link Existing Spreadsheet */}
              <div className="bg-[#F8F4F2] p-5 rounded-2xl border border-[#EAE5E1] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1E]">
                  <LinkIcon className="w-4 h-4 text-theme-primary" />
                  <span>Vincular una hoja de cálculo existente</span>
                </div>
                <form onSubmit={handleLinkExisting} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={existingInput}
                    onChange={(e) => setExistingInput(e.target.value)}
                    placeholder="Pega el enlace o ID de tu Google Sheet (ej. https://docs.google.com/spreadsheets/d/...)"
                    className="flex-1 px-4 py-2.5 text-xs bg-white border border-[#EAE5E1] rounded-full focus:outline-none focus:ring-2 focus:ring-theme-primary transition-all font-medium"
                  />
                  <button
                    type="submit"
                    disabled={isLinking || !existingInput.trim()}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-full transition-all shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    {isLinking ? 'Verificando...' : 'Vincular Hoja'}
                  </button>
                </form>
                {linkError && (
                  <p className="text-xs text-rose-600 font-medium">{linkError}</p>
                )}
              </div>

              {/* 4. Option B: Create and Initialize New Spreadsheet */}
              <div className="bg-[#F8F4F2] p-5 rounded-2xl border border-[#EAE5E1] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1E]">
                  <Sparkles className="w-4 h-4 text-theme-primary" />
                  <span>O crear una nueva hoja de cálculo en tu Google Drive</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={sheetTitle}
                      onChange={(e) => setSheetTitle(e.target.value)}
                      placeholder="Título de la nueva hoja"
                      className="w-full px-4 py-2.5 text-xs bg-white border border-[#EAE5E1] rounded-full focus:outline-none focus:ring-2 focus:ring-theme-primary transition-all font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleStartExport}
                    disabled={isExporting}
                    className="w-full py-2.5 px-4 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-[#EAE5E1] rounded-full transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{isExporting ? 'Creando...' : 'Crear y Vincular'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Export Error */}
          {exportError && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error:</span> {exportError}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Direct Excel (.xlsx) and CSV Downloads */}
      <div className="bg-white rounded-3xl border border-[#EAE5E1] p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-black text-[#1A1A1E] tracking-tight">
            Descargas directas en formato Excel (.xlsx)
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Descarga los archivos con encabezados estilizados en verde, columnas estructuradas y listos para abrir en Microsoft Excel:
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            onClick={() => exportRepsToExcel(reps, 'Agenda de Representantes.xlsx')}
            className="flex items-center justify-between p-4 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-2xl transition-all text-left cursor-pointer group shadow-2xs"
          >
            <div>
              <div className="text-xs font-black text-emerald-950 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                <span>Descargar Agenda de Representantes (Excel .xlsx)</span>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">Recomendado</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-mono tabular-nums font-medium mt-0.5">
                {reps.length} registros estructurados (Codigo, Cedula, Representante...)
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-700 shadow-xs group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => exportGdsToExcel(gds, 'Gerentes_Distrito_Calox.xlsx')}
            className="flex items-center justify-between p-4 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-2xl transition-all text-left cursor-pointer group shadow-2xs"
          >
            <div>
              <div className="text-xs font-black text-emerald-950 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                <span>Descargar DATA_GD (Excel .xlsx)</span>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">Recomendado</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-mono tabular-nums font-medium mt-0.5">
                {gds.length} registros de Gerentes y Coordinadores
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-700 shadow-xs group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl border border-[#EAE5E1] max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-theme-10 text-theme-primary flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1A1A1E]">
                  ¿Crear hoja en Google Sheets?
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                  Se creará un nuevo archivo en tu Google Drive titulado{' '}
                  <strong className="text-[#1A1A1E]">"{sheetTitle}"</strong> con{' '}
                  <span className="font-bold text-theme-primary">{reps.length} representantes</span> y{' '}
                  <span className="font-bold text-theme-primary">{gds.length} gerentes de distrito</span>.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-[#F8F4F2] hover:bg-slate-200/70 rounded-full transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={executeExport}
                className="px-5 py-2.5 text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-full transition-all shadow-xs cursor-pointer"
              >
                Confirmar y Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
