import React, { useState, useMemo } from 'react';
import { AuthUser, loginAsLocalSession } from '../services/firebaseAuth';
import { Representante, GerenteDistrito, CredencialDrogueria, CustomDatabase } from '../types/contact';
import {
  createAgendaSpreadsheet,
  ExportSheetsResult,
  LinkedSpreadsheetInfo,
  getSpreadsheetDetails,
  extractSpreadsheetId,
  CANONICAL_DATABASE_TITLE,
  fetchGenericSpreadsheet,
  parseCsvText,
} from '../services/sheetsService';
import { exportRepsToExcel, exportGdsToExcel, exportCredencialesToExcel } from '../utils/excelExport';
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
  Database,
  PlusCircle,
  Search,
  Upload,
  Eye,
  Trash2,
  KeyRound,
  Users,
  UserCheck,
  Table as TableIcon,
  HelpCircle,
  Layers,
} from 'lucide-react';
import ExcelJS from 'exceljs';

interface GoogleSheetsSyncProps {
  user: AuthUser | null;
  onLogin: () => void;
  onLogout?: () => void;
  onLoginAsGuest?: (user: AuthUser) => void;
  isLoggingIn: boolean;
  loginError?: string | null;
  reps: Representante[];
  gds: GerenteDistrito[];
  credenciales?: CredencialDrogueria[];
  customDatabases?: CustomDatabase[];
  onAddCustomDatabase?: (db: CustomDatabase) => void;
  onDeleteCustomDatabase?: (id: string) => void;
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
  onLoginAsGuest,
  isLoggingIn,
  loginError,
  reps,
  gds,
  credenciales = [],
  customDatabases = [],
  onAddCustomDatabase,
  onDeleteCustomDatabase,
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
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  // Database Visualizer state
  type PreviewTab = 'reps' | 'gds' | 'credenciales';
  const [previewTab, setPreviewTab] = useState<PreviewTab>('reps');
  const [tableSearch, setTableSearch] = useState('');
  const [previewPage, setPreviewPage] = useState(1);
  const [previewLimit, setPreviewLimit] = useState(15);

  // New Custom Database creation state
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuDesc, setNewMenuDesc] = useState('');
  const [newMenuSourceType, setNewMenuSourceType] = useState<'google_sheets' | 'csv'>('google_sheets');
  const [newMenuSheetUrl, setNewMenuSheetUrl] = useState('');
  const [newMenuTabName, setNewMenuTabName] = useState('');
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [menuCreationError, setMenuCreationError] = useState<string | null>(null);
  const [menuCreationSuccess, setMenuCreationSuccess] = useState<string | null>(null);
  const [uploadedFileRows, setUploadedFileRows] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Filtered preview data
  const filteredPreviewData = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    if (previewTab === 'reps') {
      if (!q) return reps;
      return reps.filter(r =>
        (r.nombre || '').toLowerCase().includes(q) ||
        (r.cedula || '').toLowerCase().includes(q) ||
        (r.region || '').toLowerCase().includes(q) ||
        (r.gerenteDistrito || '').toLowerCase().includes(q) ||
        (r.ciudad || '').toLowerCase().includes(q)
      );
    } else if (previewTab === 'gds') {
      if (!q) return gds;
      return gds.filter(g =>
        (g.nombre || '').toLowerCase().includes(q) ||
        (g.cargo || '').toLowerCase().includes(q) ||
        (g.region || '').toLowerCase().includes(q) ||
        (g.cedula || '').toLowerCase().includes(q)
      );
    } else {
      if (!q) return credenciales;
      return credenciales.filter(c =>
        (c.representante || '').toLowerCase().includes(q) ||
        (c.drogueria || '').toLowerCase().includes(q) ||
        (c.cedula || '').toLowerCase().includes(q) ||
        (c.usuario || '').toLowerCase().includes(q)
      );
    }
  }, [previewTab, tableSearch, reps, gds, credenciales]);

  const totalPreviewPages = Math.ceil(filteredPreviewData.length / previewLimit) || 1;
  const paginatedPreviewRows = useMemo(() => {
    const start = (previewPage - 1) * previewLimit;
    return filteredPreviewData.slice(start, start + previewLimit);
  }, [filteredPreviewData, previewPage, previewLimit]);

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
      setLinkSuccess(`Hoja "${result.title}" creada y vinculada con éxito.`);
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
    setLinkSuccess(null);
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
      setLinkSuccess(`Hoja vinculada con éxito: "${details.title}"`);
    } catch (err: any) {
      console.error(err);
      setLinkError(
        err.message ||
        'No se pudo acceder a la hoja indicada. Asegúrate de que el enlace sea correcto y de que la hoja tenga permisos "Cualquiera con el enlace puede ver".'
      );
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = () => {
    if (window.confirm('¿Desvincular esta hoja de Google Sheets de la aplicación? Los datos locales se conservarán.')) {
      onUpdateLinkedSheet(null);
      setExportResult(null);
      setLinkSuccess(null);
    }
  };

  const handleCopyLink = () => {
    const targetUrl = linkedSheet?.spreadsheetUrl || exportResult?.spreadsheetUrl;
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleConnectLocalGuest = () => {
    const localUser = loginAsLocalSession('admin.farma@calox.com', 'Administrador Calox');
    if (onLoginAsGuest) {
      onLoginAsGuest(localUser);
    }
  };

  // CSV/Excel file upload handler for creating a new menu
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMenuCreationError(null);
    setUploadedFileName(file.name);

    if (!newMenuName.trim()) {
      const suggestedName = file.name.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' ');
      setNewMenuName(suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = evt.target?.result;
        if (!buffer) return;

        let headers: string[] = [];
        let rows: Record<string, string>[] = [];

        if (file.name.endsWith('.csv')) {
          const text = typeof buffer === 'string' ? buffer : new TextDecoder('utf-8').decode(buffer as ArrayBuffer);
          const parsed = parseCsvText(text);
          headers = parsed.headers;
          rows = parsed.rows.map(r => {
            const item: Record<string, string> = {};
            headers.forEach((h, idx) => {
              item[h || `Columna ${idx + 1}`] = r[idx] || '';
            });
            return item;
          });
        } else {
          // XLSX / XLS using ExcelJS
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer as ArrayBuffer);
          const sheet = workbook.worksheets[0];
          if (!sheet) throw new Error('No se encontró ninguna hoja en el archivo Excel.');

          sheet.eachRow((row, rowNumber) => {
            const vals = Array.isArray(row.values) ? row.values.slice(1) : [];
            if (rowNumber === 1) {
              headers = vals.map(v => String(v ?? '').trim()).filter(Boolean);
            } else if (headers.length > 0) {
              const item: Record<string, string> = {};
              headers.forEach((h, idx) => {
                item[h] = vals[idx] !== undefined ? String(vals[idx] ?? '').trim() : '';
              });
              // Only push non-empty rows
              if (Object.values(item).some(v => v.length > 0)) {
                rows.push(item);
              }
            }
          });
        }

        if (headers.length === 0 || rows.length === 0) {
          throw new Error('El archivo no contiene filas de datos válidas.');
        }

        setUploadedFileRows({ headers, rows });
        setMenuCreationSuccess(`Archivo cargado: ${rows.length} registros y ${headers.length} columnas detectadas.`);
      } catch (err: any) {
        console.error('Error reading uploaded file:', err);
        setMenuCreationError(err?.message || 'Error al procesar el archivo seleccionado.');
        setUploadedFileRows(null);
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file, 'utf-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Submit and create custom database / menu
  const handleCreateCustomMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) {
      setMenuCreationError('Ingresa un nombre para el nuevo menú.');
      return;
    }

    setMenuCreationError(null);
    setMenuCreationSuccess(null);
    setIsCreatingMenu(true);

    try {
      let finalHeaders: string[] = [];
      let finalRows: Record<string, string>[] = [];
      let spreadsheetId: string | undefined = undefined;
      let sheetUrl: string | undefined = undefined;

      if (newMenuSourceType === 'google_sheets') {
        if (!newMenuSheetUrl.trim()) {
          throw new Error('Ingresa el enlace o ID de la hoja de Google Sheets.');
        }
        const extractedId = extractSpreadsheetId(newMenuSheetUrl);
        if (!extractedId) {
          throw new Error('El enlace de Google Sheets no es válido.');
        }
        spreadsheetId = extractedId;
        sheetUrl = `https://docs.google.com/spreadsheets/d/${extractedId}/edit`;

        const genericData = await fetchGenericSpreadsheet(extractedId, newMenuTabName.trim() || undefined);
        finalHeaders = genericData.headers;
        finalRows = genericData.rows;
      } else {
        if (!uploadedFileRows || uploadedFileRows.rows.length === 0) {
          throw new Error('Selecciona un archivo CSV o Excel válido antes de continuar.');
        }
        finalHeaders = uploadedFileRows.headers;
        finalRows = uploadedFileRows.rows;
      }

      if (finalHeaders.length === 0 || finalRows.length === 0) {
        throw new Error('No se encontraron registros en la fuente especificada.');
      }

      const newDb: CustomDatabase = {
        id: `custom_${Date.now()}`,
        name: newMenuName.trim(),
        description: newMenuDesc.trim() || undefined,
        sourceType: newMenuSourceType,
        sourceUrl: sheetUrl,
        spreadsheetId: spreadsheetId,
        sheetTabName: newMenuTabName.trim() || undefined,
        headers: finalHeaders,
        rows: finalRows,
        totalRows: finalRows.length,
        createdAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
      };

      if (onAddCustomDatabase) {
        onAddCustomDatabase(newDb);
      }

      setMenuCreationSuccess(`¡Menú "${newDb.name}" creado con éxito con ${newDb.totalRows} registros! Ahora aparece en la barra superior.`);
      setNewMenuName('');
      setNewMenuDesc('');
      setNewMenuSheetUrl('');
      setNewMenuTabName('');
      setUploadedFileRows(null);
      setUploadedFileName(null);
    } catch (err: any) {
      console.error('Error creating custom menu database:', err);
      setMenuCreationError(
        err?.message ||
        'Error al crear el nuevo menú. Verifica el enlace o los permisos de la hoja ("Cualquiera con el enlace puede ver").'
      );
    } finally {
      setIsCreatingMenu(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 1. Hero Card: Sincronización y Estado de Google Sheets */}
      <div className="bg-white rounded-3xl border border-[#EAE5E1] p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl theme-gradient-bg flex items-center justify-center text-white shrink-0 shadow-xs">
              <FileSpreadsheet className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-block text-[11px] font-bold text-theme-primary bg-theme-10 px-3 py-0.5 rounded-full mb-1 uppercase tracking-wider">
                Base de Datos y Sincronización
              </div>
              <h2 className="text-xl md:text-2xl font-black text-[#1A1A1E] tracking-tight">
                Google Sheets y Bases de Datos
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">
                Visualiza los datos en tiempo real, sincroniza con Google Sheets o añade nuevas bases de datos para generar menús personalizados en la aplicación.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {linkedSheet && (
              <a
                href={linkedSheet.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100/70 rounded-full transition-all cursor-pointer shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>Abrir Hoja Principal</span>
              </a>
            )}
            <button
              onClick={handleCopyLink}
              disabled={!linkedSheet}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-[#F8F4F2] hover:bg-slate-200/80 rounded-full transition-all cursor-pointer disabled:opacity-40"
              title="Copiar enlace de la hoja"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'Copiado' : 'Copiar Enlace'}</span>
            </button>
          </div>
        </div>

        {/* Auth Section with Friendly Resilience */}
        <div className="mt-8 pt-6 border-t border-[#EAE5E1]">
          {!user ? (
            <div>
              <div className="bg-[#F8F4F2] border border-[#EAE5E1] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[#1A1A1E] flex items-center gap-2">
                    <span>Conexión con Google Sheets</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                      Hojas públicas o privadas
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Puedes iniciar sesión con Google para sincronización privada automática, o usar el modo directo para vincular hojas compartidas ("Cualquiera con el enlace puede ver") sin necesidad de cuenta.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    onClick={onLogin}
                    disabled={isLoggingIn}
                    className="flex items-center justify-center gap-2.5 px-5 py-2.5 text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-full transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60 whitespace-nowrap"
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
                    <span>{isLoggingIn ? 'Abriendo Google...' : 'Iniciar sesión con Google'}</span>
                  </button>

                  <button
                    onClick={handleConnectLocalGuest}
                    className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-[#EAE5E1] rounded-full transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    Modo Directo (Sin cuenta)
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="mt-3.5 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5 font-medium">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold">Aviso:</span> {loginError}{' '}
                    <span className="text-slate-600">
                      Puedes vincular cualquier hoja pública pegando su enlace abajo o continuar en Modo Directo.
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-slate-700 bg-[#F8F4F2] p-3.5 rounded-2xl border border-[#EAE5E1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Sesión activa:{' '}
                    <strong className="text-[#1A1A1E]">{user.email || user.displayName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold bg-emerald-100/60 px-2.5 py-0.5 rounded-full text-[10px]">
                    Listo para sincronizar
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
            </div>
          )}

          {/* Active Linked Sheet Strip */}
          {linkedSheet && (
            <div className="mt-4 p-5 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">
                      Hoja Vinculada
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Pestaña: <strong className="text-slate-800">{linkedSheet.sheetTabName || 'Representantes'}</strong>
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-black text-emerald-950 mt-0.5">
                    {linkedSheet.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onPullSync}
                  disabled={isPullSyncing}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPullSyncing ? 'animate-spin' : ''}`} />
                  <span>{isPullSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
                </button>

                <button
                  onClick={handleUnlink}
                  title="Desvincular hoja"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-full transition-colors cursor-pointer"
                >
                  <Unlink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {syncStats && (
            <div className="mt-3 p-3 bg-white border border-emerald-200 rounded-2xl text-xs text-slate-700 flex flex-wrap gap-4 items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-emerald-800">Última sincronización exitosa:</span>
              <span>Nuevos: <strong className="text-emerald-700">{syncStats.added}</strong></span>
              <span>Actualizados: <strong className="text-blue-700">{syncStats.updated}</strong></span>
              <span>Sin cambios: <strong className="text-slate-700">{syncStats.unchanged}</strong></span>
              <span>Total en hoja: <strong className="text-amber-800">{syncStats.totalRemote}</strong></span>
            </div>
          )}

          {syncError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Error de sincronización: {syncError}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. VISUALIZADOR DE LA BASE DE DATOS PRINCIPAL (Interactive Database Viewer) */}
      <div className="bg-white rounded-3xl border border-[#EAE5E1] p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme-10 text-theme-primary flex items-center justify-center shrink-0">
              <TableIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-theme-primary uppercase tracking-wider">
                Visualizador en Tiempo Real
              </div>
              <h3 className="text-lg md:text-xl font-black text-[#1A1A1E] tracking-tight">
                Visualizador de la Base de Datos Principal
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {previewTab === 'reps' && (
              <button
                onClick={() => exportRepsToExcel(reps, 'Agenda_Representantes_Calox.xlsx')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-full transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Excel ({reps.length})</span>
              </button>
            )}
            {previewTab === 'gds' && (
              <button
                onClick={() => exportGdsToExcel(gds, 'Gerentes_Distrito_Calox.xlsx')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-full transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Excel ({gds.length})</span>
              </button>
            )}
            {previewTab === 'credenciales' && (
              <button
                onClick={() => exportCredencialesToExcel(credenciales, 'Credenciales_Droguerias_Calox.xlsx')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-full transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Excel ({credenciales.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Dataset Switcher & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-[#EAE5E1]">
          <div className="flex items-center gap-1.5 bg-[#F8F4F2] p-1 rounded-2xl border border-[#EAE5E1] overflow-x-auto">
            <button
              onClick={() => {
                setPreviewTab('reps');
                setPreviewPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                previewTab === 'reps'
                  ? 'bg-white text-[#1A1A1E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Representantes ({reps.length})</span>
            </button>
            <button
              onClick={() => {
                setPreviewTab('gds');
                setPreviewPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                previewTab === 'gds'
                  ? 'bg-white text-[#1A1A1E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>GD - Coordinadores ({gds.length})</span>
            </button>
            <button
              onClick={() => {
                setPreviewTab('credenciales');
                setPreviewPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                previewTab === 'credenciales'
                  ? 'bg-white text-[#1A1A1E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-600" />
              <span>Credenciales Drog ({credenciales.length})</span>
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setPreviewPage(1);
              }}
              placeholder="Buscar en la base de datos..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#F8F4F2] border border-[#EAE5E1] rounded-full focus:outline-none focus:ring-2 focus:ring-theme-primary font-medium"
            />
          </div>
        </div>

        {/* Live Table Display */}
        <div className="border border-[#EAE5E1] rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto max-h-[460px] scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#F8F4F2] text-[#1A1A1E] border-b border-[#EAE5E1] z-10">
                {previewTab === 'reps' && (
                  <tr>
                    <th className="px-3.5 py-2.5 font-bold text-slate-400 w-10 text-center">#</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Representante</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Cédula</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Región</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Unidad</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Gerente Distrito</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Teléfono</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Ciudad</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700 text-center">Estatus</th>
                  </tr>
                )}
                {previewTab === 'gds' && (
                  <tr>
                    <th className="px-3.5 py-2.5 font-bold text-slate-400 w-10 text-center">#</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Líder / Gerente</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Cargo</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Región</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Cédula</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Teléfono</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Correo</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Supervisor</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700 text-center">Estatus</th>
                  </tr>
                )}
                {previewTab === 'credenciales' && (
                  <tr>
                    <th className="px-3.5 py-2.5 font-bold text-slate-400 w-10 text-center">#</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Droguería</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Representante</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Cédula</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Región</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Usuario</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">Portal</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700 text-center">Estatus</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-[#EAE5E1]">
                {paginatedPreviewRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400 font-medium">
                      No se encontraron registros coincidentes.
                    </td>
                  </tr>
                ) : (
                  paginatedPreviewRows.map((item: any, idx: number) => {
                    const rowNum = (previewPage - 1) * previewLimit + idx + 1;
                    const isActive = (item.status || item.estatus || 'ACTIVO').toUpperCase() === 'ACTIVO';

                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3.5 py-2.5 text-center font-mono text-[11px] text-slate-400">
                          {rowNum}
                        </td>

                        {previewTab === 'reps' && (
                          <>
                            <td className="px-3.5 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                              {item.nombre}
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                              {item.cedula || '—'}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                              {item.region || '—'}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                              {item.unidadNegocio || '—'}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                              {item.gerenteDistrito || '—'}
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                              {item.telefono || '—'}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">
                              {item.ciudad || '—'}
                            </td>
                            <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.status || 'ACTIVO'}
                              </span>
                            </td>
                          </>
                        )}

                        {previewTab === 'gds' && (
                          <>
                            <td className="px-3.5 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                              {item.nombre}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                              {item.cargo}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                              {item.region}
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                              {item.cedula || '—'}
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                              {item.telefono || '—'}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">
                              {item.correo || '—'}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                              {item.supervisor || '—'}
                            </td>
                            <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.status || 'ACTIVO'}
                              </span>
                            </td>
                          </>
                        )}

                        {previewTab === 'credenciales' && (
                          <>
                            <td className="px-3.5 py-2.5 font-bold text-theme-primary whitespace-nowrap">
                              {item.drogueria}
                            </td>
                            <td className="px-3.5 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                              {item.representante}
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                              {item.cedula}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                              {item.region}
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                              {item.usuario}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">
                              {item.portalUrl ? (
                                <a
                                  href={item.portalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-theme-primary hover:underline flex items-center gap-1 font-semibold"
                                >
                                  <span>Portal</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : '—'}
                            </td>
                            <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.estatus || 'Activo'}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Controls */}
          <div className="p-3 bg-[#F8F4F2] border-t border-[#EAE5E1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span>Filas por página:</span>
              <select
                value={previewLimit}
                onChange={(e) => {
                  setPreviewLimit(Number(e.target.value));
                  setPreviewPage(1);
                }}
                className="px-2 py-1 bg-white border border-[#EAE5E1] rounded-lg font-bold text-slate-700"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
              <span>(Total filtrados: {filteredPreviewData.length})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                disabled={previewPage === 1}
                className="px-3 py-1 bg-white hover:bg-slate-100 border border-[#EAE5E1] rounded-full font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <span className="font-mono text-xs">
                Página {previewPage} de {totalPreviewPages}
              </span>
              <button
                onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
                disabled={previewPage === totalPreviewPages}
                className="px-3 py-1 bg-white hover:bg-slate-100 border border-[#EAE5E1] rounded-full font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AGREGAR OTRA BASE DE DATOS PARA CREAR UN NUEVO MENÚ */}
      <div className="bg-white rounded-3xl border border-[#EAE5E1] p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
              Expande la Aplicación
            </div>
            <h3 className="text-lg md:text-xl font-black text-[#1A1A1E] tracking-tight">
              Agregar Otra Base de Datos para Crear un Nuevo Menú
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Vincula otra hoja de Google Sheets (pública o privada) o sube un archivo Excel/CSV. Se creará automáticamente una nueva pestaña en la barra de navegación con su propio buscador y visualizador.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateCustomMenu} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre del Menú / Pestaña <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder="Ej. Clientes, Farmacias, Precios, Inventario, Rutas..."
                className="w-full px-4 py-2.5 text-xs bg-[#F8F4F2] border border-[#EAE5E1] rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={newMenuDesc}
                onChange={(e) => setNewMenuDesc(e.target.value)}
                placeholder="Ej. Directorio de farmacias aliadas por zona"
                className="w-full px-4 py-2.5 text-xs bg-[#F8F4F2] border border-[#EAE5E1] rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>
          </div>

          {/* Source Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Tipo de Fuente de Datos:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  newMenuSourceType === 'google_sheets'
                    ? 'border-purple-500 bg-purple-50/50 text-purple-950 font-bold'
                    : 'border-[#EAE5E1] bg-[#F8F4F2] text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="sourceType"
                  value="google_sheets"
                  checked={newMenuSourceType === 'google_sheets'}
                  onChange={() => setNewMenuSourceType('google_sheets')}
                  className="accent-purple-600"
                />
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Google Sheets (Enlace o ID)</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    Compatible con hojas públicas y compartidas
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  newMenuSourceType === 'csv'
                    ? 'border-purple-500 bg-purple-50/50 text-purple-950 font-bold'
                    : 'border-[#EAE5E1] bg-[#F8F4F2] text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="sourceType"
                  value="csv"
                  checked={newMenuSourceType === 'csv'}
                  onChange={() => setNewMenuSourceType('csv')}
                  className="accent-purple-600"
                />
                <Upload className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Subir Archivo Excel o CSV</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    Cargar archivo .xlsx, .xls o .csv desde tu equipo
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Dynamic source inputs */}
          {newMenuSourceType === 'google_sheets' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8F4F2] p-4 rounded-2xl border border-[#EAE5E1]">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enlace o ID de la hoja de Google Sheets
                </label>
                <input
                  type="text"
                  value={newMenuSheetUrl}
                  onChange={(e) => setNewMenuSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-[#EAE5E1] rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de pestaña (opcional)
                </label>
                <input
                  type="text"
                  value={newMenuTabName}
                  onChange={(e) => setNewMenuTabName(e.target.value)}
                  placeholder="Ej. Hoja 1 o Datos"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-[#EAE5E1] rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>
            </div>
          ) : (
            <div className="bg-[#F8F4F2] p-4 rounded-2xl border border-[#EAE5E1] space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Selecciona tu archivo (.xlsx, .xls o .csv):
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
              />
              {uploadedFileName && (
                <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Archivo listo: <strong>{uploadedFileName}</strong></span>
                </div>
              )}
            </div>
          )}

          {menuCreationError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error al agregar base de datos:</span> {menuCreationError}
              </div>
            </div>
          )}

          {menuCreationSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <span className="font-bold">¡Éxito!</span> {menuCreationSuccess}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isCreatingMenu}
              className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-full transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isCreatingMenu ? 'Leyendo datos y creando menú...' : 'Crear Nuevo Menú'}</span>
            </button>
          </div>
        </form>

        {/* Existing Custom Menus List */}
        {customDatabases.length > 0 && (
          <div className="pt-4 border-t border-[#EAE5E1] space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Menús Personalizados Creados ({customDatabases.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {customDatabases.map((db) => (
                <div
                  key={db.id}
                  className="bg-[#F8F4F2] p-4 rounded-2xl border border-[#EAE5E1] flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-black text-[#1A1A1E]">{db.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {db.totalRows} filas · {db.headers.length} columnas
                    </p>
                  </div>

                  {onDeleteCustomDatabase && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar el menú "${db.name}"?`)) {
                          onDeleteCustomDatabase(db.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      title="Eliminar este menú"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. VINCULAR O CREAR HOJA PRINCIPAL DE REPRESENTANTES */}
      <div className="bg-white rounded-3xl border border-[#EAE5E1] p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-theme-10 text-theme-primary flex items-center justify-center shrink-0">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-black text-[#1A1A1E] tracking-tight">
              Vincular o Inicializar Hoja Principal en Google Drive
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Gestiona la hoja principal vinculada para la sincronización continua de Representantes y Gerentes de Distrito.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Option A: Link Existing Sheet */}
          <div className="bg-[#F8F4F2] p-5 rounded-2xl border border-[#EAE5E1] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1E]">
                <LinkIcon className="w-4 h-4 text-theme-primary" />
                <span>Vincular hoja existente de Representantes</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Pega el enlace o ID de tu hoja. Soporta hojas compartidas sin requerir inicio de sesión.
              </p>
            </div>

            <form onSubmit={handleLinkExisting} className="space-y-2">
              <input
                type="text"
                value={existingInput}
                onChange={(e) => setExistingInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full px-4 py-2.5 text-xs bg-white border border-[#EAE5E1] rounded-full focus:outline-none focus:ring-2 focus:ring-theme-primary font-medium"
              />
              <button
                type="submit"
                disabled={isLinking || !existingInput.trim()}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-full transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isLinking ? 'Verificando y Vinculando...' : 'Vincular Hoja Existente'}
              </button>
            </form>

            {linkError && <p className="text-xs text-rose-600 font-medium">{linkError}</p>}
            {linkSuccess && <p className="text-xs text-emerald-700 font-medium">{linkSuccess}</p>}
          </div>

          {/* Option B: Create and Initialize New Spreadsheet */}
          <div className="bg-[#F8F4F2] p-5 rounded-2xl border border-[#EAE5E1] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1E]">
                <Sparkles className="w-4 h-4 text-theme-primary" />
                <span>Crear nueva hoja en tu Google Drive</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Crea una hoja nueva con todas las columnas estándar y los {reps.length} representantes y {gds.length} gerentes.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={sheetTitle}
                onChange={(e) => setSheetTitle(e.target.value)}
                placeholder="Título de la nueva hoja"
                className="w-full px-4 py-2.5 text-xs bg-white border border-[#EAE5E1] rounded-full focus:outline-none focus:ring-2 focus:ring-theme-primary font-medium"
              />
              <button
                type="button"
                onClick={handleStartExport}
                disabled={isExporting}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-[#EAE5E1] rounded-full transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{isExporting ? 'Creando...' : 'Crear e Inicializar Hoja'}</span>
              </button>
            </div>

            {exportError && <p className="text-xs text-rose-600 font-medium">{exportError}</p>}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
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
