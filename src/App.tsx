import React, { useState, useEffect, useMemo, useRef } from 'react';
import rawReps from './data/representantes.json';
import rawGds from './data/gerentes.json';
import {
  Representante,
  GerenteDistrito,
  ActiveTab,
  ViewMode,
  isRepComercial,
  isRepActive,
  isGdActive,
} from './types/contact';
import { Header } from './components/Header';
import { MetricStrip } from './components/MetricStrip';
import { TypeSelector } from './components/TypeSelector';
import { RepresentantesList } from './components/RepresentantesList';
import { GerentesList } from './components/GerentesList';
import { HierarchyTree } from './components/HierarchyTree';
import { CoverageMap } from './components/CoverageMap';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PdfExportModal } from './components/PdfExportModal';
import { GoogleSheetsSync } from './components/GoogleSheetsSync';
import { ContactModal } from './components/ContactModal';
import { RepFormModal } from './components/RepFormModal';
import { GdFormModal } from './components/GdFormModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ThemeId, APP_THEMES } from './types/theme';
import {
  AuthUser,
  initAuth,
  googleSignIn,
  logout,
} from './services/firebaseAuth';
import {
  LinkedSpreadsheetInfo,
  getLinkedSpreadsheetInfo,
  setLinkedSpreadsheetInfo,
  pullRepsFromSpreadsheet,
  syncRepToSpreadsheet,
  deleteRepFromSpreadsheet,
  getOrCreateCanonicalSpreadsheet,
} from './services/sheetsService';
import { exportToCsvFile } from './utils/phoneUtils';
import { exportRepsToExcel, exportGdsToExcel, getStandardRegion } from './utils/excelExport';
import {
  Pill,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  X,
  Plus,
  Pencil,
  Users,
  Search,
  LayoutGrid,
  Table2,
  FileSpreadsheet,
} from 'lucide-react';

export const REGION_OPTIONS = [
  'CAPITAL ESTE',
  'CAPITAL OESTE',
  'CENTRO',
  'ANDES',
  'OCCIDENTE',
  'ORIENTE',
  'CENTRO OCCIDENTE',
];

export const UNIDADES_OPTIONS = [
  'COMERCIAL',
  'LA SANTE',
  'LINEA 1',
  'LINEA 2',
  'LINEA 3',
  'LINEA HIBRIDA 1',
  'LINEA HIBRIDA 2',
  'LINEA HIBRIDA 3',
  'OTC',
];

export const GERENTES_DISTRITO_OPTIONS = [
  'ANDREA ALARCON',
  'MARAHY CHURION',
  'RANDOLPH GRAMCKO',
  'RICARDO GUEVARA',
  'TONNY ESPINOZA',
  'JHOSELYN SANCHEZ',
  'GD ORIENTE VACANTE',
];

export const COORDINADORES_OPTIONS = [
  'DANA RIERA',
  'JUAN MENDEZ',
  'KERVIN PALOMO',
  'VICTORIA HERNANDEZ',
  'YESSICA NOGUERA',
];

export const getMappedUnit = (rawUnit: string): string => {
  const upper = (rawUnit || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (upper.includes('COMERCIAL')) return 'COMERCIAL';
  if (upper.includes('HIBRIDA_1') || upper.includes('HIBRIDA 1') || upper === 'LINEA HIBRIDA 1') return 'LINEA HIBRIDA 1';
  if (upper.includes('HIBRIDA_2') || upper.includes('HIBRIDA 2') || upper === 'LINEA HIBRIDA 2') return 'LINEA HIBRIDA 2';
  if (upper.includes('HIBRIDA_3') || upper.includes('HIBRIDA 3') || upper === 'LINEA HIBRIDA 3') return 'LINEA HIBRIDA 3';
  if (upper.includes('LINEA_1') || upper.includes('LINEA 1') || upper === 'LINEA 1') return 'LINEA 1';
  if (upper.includes('LINEA_2') || upper.includes('LINEA 2') || upper === 'LINEA 2') return 'LINEA 2';
  if (upper.includes('LINEA_3') || upper.includes('LINEA 3') || upper === 'LINEA 3') return 'LINEA 3';
  if (upper.includes('OTC')) return 'OTC';
  if (upper.includes('LA SANTE') || upper.includes('SANTE')) return 'LA SANTE';
  return upper || 'LA SANTE';
};

export const getCleanRegion = (rawRegion: string): string => {
  return getStandardRegion(rawRegion);
};

export const matchGerenteOrCoord = (repManager: string, targetName: string): boolean => {
  if (!repManager) return false;
  const m = repManager.toUpperCase();
  const t = targetName.toUpperCase();
  if (m.includes(t) || t.includes(m)) return true;
  if (t.includes('RICARDO GUEVARA') && m.includes('CENTRO VACANTE')) return true;
  if ((t.includes('ORIENTE') || t.includes('EI-LING')) && (m.includes('EI-LING') || m.includes('ORIENTE'))) return true;
  return false;
};

export const sortRepsAlphabetically = (reps: Representante[]): Representante[] => {
  return [...reps].sort((a, b) =>
    (a.nombre || '').trim().localeCompare((b.nombre || '').trim(), 'es', { sensitivity: 'base' })
  );
};

const STORAGE_REPS_KEY = 'calox_reps_data_v2';
const STORAGE_GDS_KEY = 'calox_gds_data_v2';
const STORAGE_VERSION_KEY = 'calox_data_version';
const CURRENT_DATA_VERSION = 'v5_2026_unit_names_spaced';

const normalizeRepUnits = (reps: Representante[]): Representante[] => {
  return reps.map((r) => ({
    ...r,
    unidadNegocio: getMappedUnit(r.unidadNegocio),
  }));
};

export default function App() {
  const [repsData, setRepsData] = useState<Representante[]>(() => {
    try {
      const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      if (savedVersion === CURRENT_DATA_VERSION) {
        const saved = localStorage.getItem(STORAGE_REPS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = normalizeRepUnits(parsed);
            localStorage.setItem(STORAGE_REPS_KEY, JSON.stringify(normalized));
            return sortRepsAlphabetically(normalized);
          }
        }
      }
    } catch (e) {
      console.error('Error loading reps from localStorage:', e);
    }
    const initial = sortRepsAlphabetically(normalizeRepUnits(rawReps as Representante[]));
    try {
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_DATA_VERSION);
      localStorage.setItem(STORAGE_REPS_KEY, JSON.stringify(initial));
    } catch (e) {
      console.error('Error saving initial reps to localStorage:', e);
    }
    return initial;
  });

  const [gdsData, setGdsData] = useState<GerenteDistrito[]>(() => {
    const rawList = rawGds as GerenteDistrito[];
    try {
      const saved = localStorage.getItem(STORAGE_GDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => {
            const rawMatch = rawList.find((r) => r.id === item.id || r.nombre === item.nombre);
            return {
              ...item,
              ciudad: item.ciudad || rawMatch?.ciudad || '',
              estado: item.estado || rawMatch?.estado || '',
            };
          });
        }
      }
    } catch (e) {
      console.error('Error loading gds from localStorage:', e);
    }
    return rawList;
  });

  // App navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('reps');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Multi-select filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedGerentes, setSelectedGerentes] = useState<string[]>([]);
  const [selectedCoordinadores, setSelectedCoordinadores] = useState<string[]>([]);

  // Modal inspection state
  const [selectedContact, setSelectedContact] = useState<
    Representante | GerenteDistrito | null
  >(null);
  const [isRepModal, setIsRepModal] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('calox_theme') as ThemeId;
      if (saved && (saved === 'calox' || saved === 'nordic' || saved === 'emerald')) {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'calox';
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // User Role state: Invitado (false, primary default read-only) vs Administrador (true, secondary full access)
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Representative Form Modal state (Create & Edit)
  const [isRepFormOpen, setIsRepFormOpen] = useState(false);
  const [repToEdit, setRepToEdit] = useState<Representante | null>(null);

  const handleOpenCreateRep = () => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    setRepToEdit(null);
    setIsRepFormOpen(true);
  };

  const handleOpenEditRep = (rep: Representante) => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    setRepToEdit(rep);
    setIsRepFormOpen(true);
  };

  // Gerente/Coordinador Form Modal state (Create & Edit)
  const [isGdFormOpen, setIsGdFormOpen] = useState(false);
  const [gdToEdit, setGdToEdit] = useState<GerenteDistrito | null>(null);

  const handleOpenCreateGd = () => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    setGdToEdit(null);
    setIsGdFormOpen(true);
  };

  const handleOpenEditGd = (gd: GerenteDistrito) => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    setGdToEdit(gd);
    setIsGdFormOpen(true);
  };

  // Google Sheets integration state
  const [linkedSheet, setLinkedSheet] = useState<LinkedSpreadsheetInfo | null>(() => getLinkedSpreadsheetInfo());
  const [isPullSyncing, setIsPullSyncing] = useState(false);
  const [isSavingToSheets, setIsSavingToSheets] = useState(false);
  const [syncStats, setSyncStats] = useState<{ added: number; updated: number; unchanged: number; totalRemote: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Auto-dismiss notification toast
  useEffect(() => {
    if (!syncToast) return;
    const timer = setTimeout(() => {
      setSyncToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [syncToast]);

  // Pull sync: download latest additions & updates from Google Sheets into the app
  // Pull sync: download latest additions & updates from Google Sheets into the app
  const handlePullSync = async (silent: boolean = false, sheetOverride?: LinkedSpreadsheetInfo) => {
    const targetSheet = sheetOverride || linkedSheet;
    if (!targetSheet) {
      if (!silent) setActiveTab('sheets');
      return;
    }
    setIsPullSyncing(true);
    setSyncError(null);
    try {
      const result = await pullRepsFromSpreadsheet(targetSheet.spreadsheetId, repsData, targetSheet.sheetTabName);
      const sorted = sortRepsAlphabetically(normalizeRepUnits(result.updatedReps));
      setRepsData(sorted);
      try {
        localStorage.setItem(STORAGE_REPS_KEY, JSON.stringify(sorted));
      } catch (e) {
        console.error('Error saving updated reps to localStorage:', e);
      }
      setSyncStats(result.stats);
      const updatedInfo: LinkedSpreadsheetInfo = {
        ...targetSheet,
        lastSyncedAt: new Date().toISOString(),
      };
      setLinkedSheet(updatedInfo);
      setLinkedSpreadsheetInfo(updatedInfo);
      if (!silent || (result.stats.added > 0 || result.stats.updated > 0)) {
        setSyncToast({
          type: 'success',
          message: `Auto-sincronizado con Sheets: ${result.stats.added} agregados, ${result.stats.updated} actualizados.`,
        });
      }
    } catch (err: any) {
      console.error('Error in auto pull sync:', err);
      if (!silent) {
        setSyncError(err.message || 'Error al sincronizar con Google Sheets');
        setSyncToast({
          type: 'error',
          message: `Error al sincronizar: ${err.message || 'Verifica los permisos de la hoja'}`,
        });
      }
    } finally {
      setIsPullSyncing(false);
    }
  };

  const handleSaveRep = async (savedRep: Representante, syncToSheets: boolean = false) => {
    const normalizedSavedRep: Representante = {
      ...savedRep,
      unidadNegocio: getMappedUnit(savedRep.unidadNegocio),
    };
    // 1. Guardar en el estado local de la aplicación
    setRepsData((prev) => {
      const index = prev.findIndex((r) => r.id === normalizedSavedRep.id);
      let updated: Representante[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = normalizedSavedRep;
      } else {
        updated = [normalizedSavedRep, ...prev];
      }
      const sorted = sortRepsAlphabetically(updated);
      try {
        localStorage.setItem(STORAGE_REPS_KEY, JSON.stringify(sorted));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      return sorted;
    });

    // Also update selectedContact if it's currently open
    setSelectedContact((current) => {
      if (current && (current as Representante).id === normalizedSavedRep.id) {
        return normalizedSavedRep;
      }
      return current;
    });

    // 2. Sincronizar automáticamente en la misma base de datos de Google Sheets
    const shouldSync = syncToSheets || !!linkedSheet;
    if (shouldSync && linkedSheet) {
      setIsSavingToSheets(true);
      try {
        const syncRes = await syncRepToSpreadsheet(linkedSheet.spreadsheetId, normalizedSavedRep, linkedSheet.sheetTabName);
        const updatedInfo: LinkedSpreadsheetInfo = {
          ...linkedSheet,
          lastSyncedAt: new Date().toISOString(),
        };
        setLinkedSheet(updatedInfo);
        setLinkedSpreadsheetInfo(updatedInfo);
        setSyncToast({
          type: 'success',
          message: syncRes.action === 'created'
            ? `"${savedRep.nombre}" agregado al aplicativo y a Google Sheets.`
            : `"${savedRep.nombre}" actualizado en el aplicativo y en Google Sheets.`,
        });
      } catch (err: any) {
        console.error('Error auto-syncing to Google Sheets:', err);
        setSyncToast({
          type: 'error',
          message: `Guardado localmente. Error en Google Sheets: ${err.message}`,
        });
      } finally {
        setIsSavingToSheets(false);
      }
    } else {
      setSyncToast({
        type: 'info',
        message: `"${savedRep.nombre}" guardado localmente con éxito.`,
      });
    }
  };

  const handleDeleteRep = async (repId: string) => {
    const repToDelete = repsData.find((r) => r.id === repId);
    setRepsData((prev) => {
      const updated = sortRepsAlphabetically(prev.filter((r) => r.id !== repId));
      try {
        localStorage.setItem(STORAGE_REPS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      return updated;
    });

    setSelectedContact((current) => {
      if (current && (current as Representante).id === repId) {
        return null;
      }
      return current;
    });

    // Sincronizar eliminación automáticamente en la misma base de datos de Google Sheets
    if (linkedSheet && repToDelete) {
      try {
        await deleteRepFromSpreadsheet(
          linkedSheet.spreadsheetId,
          repId,
          repToDelete.cedula,
          repToDelete.nombre,
          linkedSheet.sheetTabName
        );
        setSyncToast({
          type: 'info',
          message: `"${repToDelete.nombre}" eliminado del aplicativo y de Google Sheets.`,
        });
      } catch (e) {
        console.error('Error removing rep from Google Sheets:', e);
      }
    } else {
      setSyncToast({
        type: 'info',
        message: 'Representante eliminado correctamente.',
      });
    }
  };

  const handleToggleRepStatus = async (rep: Representante) => {
    const isCurrentlyActive = (rep.status || 'ACTIVO').toUpperCase() === 'ACTIVO';
    const newStatus = isCurrentlyActive ? 'INACTIVO' : 'ACTIVO';
    const updatedRep: Representante = { ...rep, status: newStatus };
    setRepsData((prev) => {
      const updated = prev.map((r) => (r.id === rep.id ? updatedRep : r));
      try {
        localStorage.setItem(STORAGE_REPS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving reps to localStorage:', e);
      }
      return updated;
    });

    // Sincronizar cambio de estatus automáticamente en la misma base de datos de Google Sheets
    if (linkedSheet) {
      try {
        await syncRepToSpreadsheet(linkedSheet.spreadsheetId, updatedRep, linkedSheet.sheetTabName);
        setSyncToast({
          type: newStatus === 'ACTIVO' ? 'success' : 'info',
          message: `"${rep.nombre}" ahora está ${newStatus} (sincronizado en Google Sheets).`,
        });
        return;
      } catch (e) {
        console.error('Error auto-syncing status to Google Sheets:', e);
      }
    }

    setSyncToast({
      type: newStatus === 'ACTIVO' ? 'success' : 'info',
      message: `Representante "${rep.nombre}" ahora está ${newStatus === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'}.`,
    });
  };

  const handleSaveGd = async (
    updatedGd: GerenteDistrito,
    updateAssignedReps: boolean,
    originalName?: string
  ) => {
    let newGds: GerenteDistrito[];
    const exists = gdsData.some((g) => g.id === updatedGd.id);
    if (exists) {
      newGds = gdsData.map((g) => (g.id === updatedGd.id ? updatedGd : g));
    } else {
      newGds = [...gdsData, updatedGd];
    }
    setGdsData(newGds);
    try {
      localStorage.setItem(STORAGE_GDS_KEY, JSON.stringify(newGds));
    } catch (e) {
      console.error('Error saving gds to localStorage:', e);
    }

    // Cascade update to matching representatives if name changed
    let updatedRepsCount = 0;
    if (originalName && updateAssignedReps && originalName.toUpperCase() !== updatedGd.nombre.toUpperCase()) {
      const updatedReps = repsData.map((rep) => {
        if (matchGerenteOrCoord(rep.gerenteDistrito, originalName)) {
          updatedRepsCount++;
          return { ...rep, gerenteDistrito: updatedGd.nombre };
        }
        return rep;
      });
      if (updatedRepsCount > 0) {
        setRepsData(updatedReps);
        try {
          localStorage.setItem(STORAGE_REPS_KEY, JSON.stringify(updatedReps));
        } catch (e) {
          console.error('Error saving cascaded reps to localStorage:', e);
        }
      }
    }

    // Update selectedContact if open
    setSelectedContact((current) => {
      if (current && (current as GerenteDistrito).id === updatedGd.id) {
        return updatedGd;
      }
      return current;
    });

    setSyncToast({
      type: 'success',
      message: updatedRepsCount > 0
        ? `Líder "${updatedGd.nombre}" guardado y sincronizado en ${updatedRepsCount} representantes.`
        : `Líder "${updatedGd.nombre}" guardado con éxito.`,
    });
  };

  const handleDeleteGd = (gdId: string) => {
    const updated = gdsData.filter((g) => g.id !== gdId);
    setGdsData(updated);
    try {
      localStorage.setItem(STORAGE_GDS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error deleting gd from localStorage:', e);
    }
    setSelectedContact((current) => {
      if (current && (current as GerenteDistrito).id === gdId) {
        return null;
      }
      return current;
    });
    setSyncToast({
      type: 'info',
      message: 'Líder eliminado correctamente.',
    });
  };

  const handleToggleGdStatus = (gd: GerenteDistrito) => {
    const isCurrentlyActive = (gd.status || 'ACTIVO').toUpperCase() === 'ACTIVO';
    const newStatus = isCurrentlyActive ? 'INACTIVO' : 'ACTIVO';
    const updatedGd: GerenteDistrito = { ...gd, status: newStatus };
    setGdsData((prev) => {
      const updated = prev.map((g) => (g.id === gd.id ? updatedGd : g));
      try {
        localStorage.setItem(STORAGE_GDS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving gds to localStorage:', e);
      }
      return updated;
    });
    setSyncToast({
      type: newStatus === 'ACTIVO' ? 'success' : 'info',
      message: `Líder "${gd.nombre}" ahora está ${newStatus === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'}.`,
    });
  };

  const handleResetRepsData = () => {
    const resetSorted = sortRepsAlphabetically(normalizeRepUnits(rawReps as Representante[]));
    setRepsData(resetSorted);
    try {
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_DATA_VERSION);
      localStorage.setItem(STORAGE_REPS_KEY, JSON.stringify(resetSorted));
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  };

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(
        err?.message ||
        'Error al conectar con Google. Si tu navegador bloqueó la ventana emergente, por favor autorízala.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setLoginError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Auto-connect and auto-sync logic
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const initialAutoSyncTriggeredRef = useRef(false);

  // One-click automatic connection: authenticates, binds to canonical spreadsheet database, and syncs
  const handleAutoConnect = async () => {
    setIsAutoConnecting(true);
    setLoginError(null);
    try {
      let currentUser = user;
      if (!currentUser) {
        const res = await googleSignIn();
        if (res?.user) {
          currentUser = res.user;
          setUser(res.user);
        }
      }
      if (!currentUser) throw new Error('No se pudo verificar la sesión de Google.');

      // Resolve the permanent canonical database sheet
      const canonical = await getOrCreateCanonicalSpreadsheet(repsData, gdsData);
      setLinkedSheet(canonical);
      await handlePullSync(false, canonical);
      setSyncToast({
        type: 'success',
        message: `Conexión automática exitosa con "${canonical.title}". Sincronización continua activa.`,
      });
    } catch (err: any) {
      console.error('Auto-connect error:', err);
      setSyncToast({
        type: 'error',
        message: err.message || 'Error al conectar con Google Sheets.',
      });
    } finally {
      setIsAutoConnecting(false);
    }
  };

  // 1. Silent automatic sync on startup when user & linked sheet are detected
  useEffect(() => {
    if (!user) return;

    if (!linkedSheet) {
      // Auto-bind canonical sheet if user is logged in
      getOrCreateCanonicalSpreadsheet(repsData, gdsData)
        .then((sheet) => {
          setLinkedSheet(sheet);
          return handlePullSync(true, sheet);
        })
        .catch((e) => console.warn('Could not auto-bind canonical database:', e));
    } else if (!initialAutoSyncTriggeredRef.current) {
      initialAutoSyncTriggeredRef.current = true;
      handlePullSync(true, linkedSheet);
    }
  }, [user, linkedSheet]);

  // 2. Periodic background auto-sync every 2.5 minutes
  useEffect(() => {
    if (!linkedSheet || !user) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handlePullSync(true, linkedSheet);
      }
    }, 150000);
    return () => clearInterval(interval);
  }, [linkedSheet, user]);

  // 3. Auto-sync on window focus (e.g. user returning from editing the Google Sheet tab)
  useEffect(() => {
    const handleFocus = () => {
      if (linkedSheet && user) {
        handlePullSync(true, linkedSheet);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [linkedSheet, user]);

  // Contabilizar ÚNICAMENTE representantes y líderes activos
  const activeRepsData = useMemo(() => {
    return repsData.filter((r) => isRepActive(r));
  }, [repsData]);

  const activeGdsData = useMemo(() => {
    return gdsData.filter((g) => isGdActive(g));
  }, [gdsData]);

  // Team counts lookup: manager name -> number of reps (with alias and canonical matching, ONLY active reps)
  const teamCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    gdsData.forEach((gd) => {
      counts[gd.nombre.trim()] = 0;
    });
    activeRepsData.forEach((rep) => {
      const mgr = rep.gerenteDistrito?.trim();
      if (!mgr) return;
      const matched = gdsData.find((gd) => matchGerenteOrCoord(mgr, gd.nombre));
      if (matched) {
        counts[matched.nombre.trim()] = (counts[matched.nombre.trim()] || 0) + 1;
      } else {
        counts[mgr] = (counts[mgr] || 0) + 1;
      }
    });
    return counts;
  }, [activeRepsData, gdsData]);

  // Total baseline counts by category (ONLY active reps)
  const totalComerciales = useMemo(() => {
    return activeRepsData.filter((r) => isRepComercial(r)).length;
  }, [activeRepsData]);

  const totalVisitaMedica = useMemo(() => {
    return activeRepsData.filter((r) => !isRepComercial(r)).length;
  }, [activeRepsData]);

  const countGerentesDistrito = useMemo(() => {
    return activeGdsData.filter((g) => g.cargo.toUpperCase().includes('GERENTE')).length;
  }, [activeGdsData]);

  const countCoordinadores = useMemo(() => {
    return activeGdsData.filter((g) => g.cargo.toUpperCase().includes('COORDINADOR')).length;
  }, [activeGdsData]);

  // Tipo de Representante options with counts (ONLY active reps)
  const typeSelectOptions = useMemo(() => {
    return [
      { label: 'Comerciales', value: 'Comerciales', count: totalComerciales },
      { label: 'Visita Médica', value: 'Visita Médica', count: totalVisitaMedica },
    ];
  }, [totalComerciales, totalVisitaMedica]);

  // Region options with counts (ONLY active reps)
  const regionSelectOptions = useMemo(() => {
    return REGION_OPTIONS.map((reg) => {
      const count = activeRepsData.filter((r) => getCleanRegion(r.region) === reg).length;
      return { label: reg, value: reg, count };
    });
  }, [activeRepsData]);

  // Unit options with counts (ONLY active reps)
  const unitSelectOptions = useMemo(() => {
    return UNIDADES_OPTIONS.map((unit) => {
      const count = activeRepsData.filter((r) => getMappedUnit(r.unidadNegocio) === unit).length;
      return { label: unit, value: unit, count };
    });
  }, [activeRepsData]);

  // Dynamic list of GDs and Coordinadores
  const currentGerentesList = useMemo(() => {
    const fromGds = activeGdsData
      .filter((g) => g.cargo.toUpperCase().includes('GERENTE'))
      .map((g) => g.nombre.trim());
    return Array.from(new Set([...fromGds, ...GERENTES_DISTRITO_OPTIONS]));
  }, [activeGdsData]);

  const currentCoordinadoresList = useMemo(() => {
    const fromCoords = activeGdsData
      .filter((g) => g.cargo.toUpperCase().includes('COORDINADOR'))
      .map((g) => g.nombre.trim());
    return Array.from(new Set([...fromCoords, ...COORDINADORES_OPTIONS]));
  }, [activeGdsData]);

  // Gerente de Distrito options with counts (ONLY active reps)
  const gerenteSelectOptions = useMemo(() => {
    return currentGerentesList.map((g) => {
      const count = activeRepsData.filter((r) => matchGerenteOrCoord(r.gerenteDistrito, g)).length;
      return { label: g, value: g, count };
    });
  }, [activeRepsData, currentGerentesList]);

  // Coordinador options with counts (ONLY active reps)
  const coordinadorSelectOptions = useMemo(() => {
    return currentCoordinadoresList.map((c) => {
      const count = activeRepsData.filter((r) => matchGerenteOrCoord(r.gerenteDistrito, c)).length;
      return { label: c, value: c, count };
    });
  }, [activeRepsData, currentCoordinadoresList]);

  // Filtered Reps (Multi-select) sorted alphabetically by name
  const filteredReps = useMemo(() => {
    const filtered = repsData.filter((rep) => {
      // 0. Tipo de Representante filter (multi-select: 'Comerciales', 'Visita Médica')
      if (selectedTypes.length > 0) {
        const isComercial = isRepComercial(rep);
        const matchesComercial = selectedTypes.includes('Comerciales') && isComercial;
        const matchesVisita = selectedTypes.includes('Visita Médica') && !isComercial;
        if (!matchesComercial && !matchesVisita) {
          return false;
        }
      }

      // 1. Region filter (multi-select)
      if (selectedRegions.length > 0) {
        const cleanReg = getCleanRegion(rep.region);
        if (!selectedRegions.includes(cleanReg)) {
          return false;
        }
      }

      // 2. Unit filter (multi-select)
      if (selectedUnits.length > 0) {
        const mappedUnit = getMappedUnit(rep.unidadNegocio);
        if (!selectedUnits.includes(mappedUnit)) {
          return false;
        }
      }

      // 3. Manager / Coordinator filters (multi-select)
      if (selectedGerentes.length > 0 && selectedCoordinadores.length === 0) {
        const matchesG = selectedGerentes.some((g) => matchGerenteOrCoord(rep.gerenteDistrito, g));
        if (!matchesG) return false;
      } else if (selectedCoordinadores.length > 0 && selectedGerentes.length === 0) {
        const matchesC = selectedCoordinadores.some((c) => matchGerenteOrCoord(rep.gerenteDistrito, c));
        if (!matchesC) return false;
      } else if (selectedGerentes.length > 0 && selectedCoordinadores.length > 0) {
        const matchesG = selectedGerentes.some((g) => matchGerenteOrCoord(rep.gerenteDistrito, g));
        const matchesC = selectedCoordinadores.some((c) => matchGerenteOrCoord(rep.gerenteDistrito, c));
        if (!matchesG && !matchesC) return false;
      }

      // 4. Search term
      if (searchTerm) {
        const terms = searchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const searchableText = `${rep.nombre} ${rep.cedula} ${rep.ciudad} ${rep.estado} ${rep.region} ${getMappedUnit(rep.unidadNegocio)} ${rep.gerenteDistrito} ${rep.codigoSector} ${rep.telefono} ${rep.correo}`.toLowerCase();
        const allTermsMatch = terms.every((t) => searchableText.includes(t));
        if (!allTermsMatch) return false;
      }

      return true;
    });
    return sortRepsAlphabetically(filtered);
  }, [repsData, searchTerm, selectedTypes, selectedRegions, selectedUnits, selectedGerentes, selectedCoordinadores]);


  // Segmented filtered representatives
  const repsComerciales = useMemo(() => {
    return filteredReps.filter((r) => isRepComercial(r));
  }, [filteredReps]);

  const repsVisitaMedica = useMemo(() => {
    return filteredReps.filter((r) => !isRepComercial(r));
  }, [filteredReps]);

  // Business Unit Segmentation (La Sante, Pharmetique, OTC)
  const isPharmetiqueRep = (r: Representante): boolean => {
    const mapped = getMappedUnit(r.unidadNegocio);
    return (
      mapped === 'LINEA 1' ||
      mapped === 'LINEA 2' ||
      mapped === 'LINEA 3' ||
      mapped === 'LINEA HIBRIDA 1' ||
      mapped === 'LINEA HIBRIDA 2' ||
      mapped === 'LINEA HIBRIDA 3'
    );
  };

  const totalLaSante = useMemo(() => {
    return activeRepsData.filter((r) => getMappedUnit(r.unidadNegocio) === 'LA SANTE').length;
  }, [activeRepsData]);

  const totalPharmetique = useMemo(() => {
    return activeRepsData.filter((r) => isPharmetiqueRep(r)).length;
  }, [activeRepsData]);

  const totalOtc = useMemo(() => {
    return activeRepsData.filter((r) => getMappedUnit(r.unidadNegocio) === 'OTC').length;
  }, [activeRepsData]);

  const repsLaSante = useMemo(() => {
    return filteredReps.filter((r) => getMappedUnit(r.unidadNegocio) === 'LA SANTE');
  }, [filteredReps]);

  const repsPharmetique = useMemo(() => {
    return filteredReps.filter((r) => isPharmetiqueRep(r));
  }, [filteredReps]);

  const repsOtc = useMemo(() => {
    return filteredReps.filter((r) => getMappedUnit(r.unidadNegocio) === 'OTC');
  }, [filteredReps]);

  // Filtered GDs (in the Gerentes tab, filters were removed; search applies)
  const filteredGds = useMemo(() => {
    return gdsData.filter((gd) => {
      // Search term
      if (searchTerm) {
        const terms = searchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const searchableText = `${gd.nombre} ${gd.cedula} ${gd.cargo} ${gd.region} ${gd.ciudad || ''} ${gd.estado || ''} ${gd.supervisor} ${gd.telefono} ${gd.correo} ${gd.codigoSector}`.toLowerCase();
        const allTermsMatch = terms.every((t) => searchableText.includes(t));
        if (!allTermsMatch) return false;
      }

      return true;
    });
  }, [gdsData, searchTerm]);

  // Actions
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedRegions([]);
    setSelectedUnits([]);
    setSelectedGerentes([]);
    setSelectedCoordinadores([]);
  };

  const handleSelectRep = (rep: Representante) => {
    setSelectedContact(rep);
    setIsRepModal(true);
  };

  const handleSelectGd = (gd: GerenteDistrito) => {
    setSelectedContact(gd);
    setIsRepModal(false);
  };

  const handleViewTeam = (gdName: string) => {
    const isCoord = COORDINADORES_OPTIONS.some((c) => matchGerenteOrCoord(gdName, c));
    if (isCoord) {
      const matched = COORDINADORES_OPTIONS.find((c) => matchGerenteOrCoord(gdName, c));
      if (matched) setSelectedCoordinadores([matched]);
    } else {
      const matched = GERENTES_DISTRITO_OPTIONS.find((g) => matchGerenteOrCoord(gdName, g));
      if (matched) setSelectedGerentes([matched]);
    }
    setActiveTab('reps');
  };

  const handleFilterByManager = (managerName: string) => {
    const isCoord = COORDINADORES_OPTIONS.some((c) => matchGerenteOrCoord(managerName, c));
    if (isCoord) {
      const matched = COORDINADORES_OPTIONS.find((c) => matchGerenteOrCoord(managerName, c));
      if (matched) setSelectedCoordinadores([matched]);
    } else {
      const matched = GERENTES_DISTRITO_OPTIONS.find((g) => matchGerenteOrCoord(managerName, g));
      if (matched) setSelectedGerentes([matched]);
    }
  };

  const handleFilterByRegion = (regionName: string) => {
    const clean = getCleanRegion(regionName);
    if (REGION_OPTIONS.includes(clean)) {
      setSelectedRegions([clean]);
    }
  };

  const handleSelectManagerFromModal = (managerName: string) => {
    const foundGd = gdsData.find(
      (g) => g.nombre.trim().toLowerCase() === managerName.trim().toLowerCase()
    );
    if (foundGd) {
      setSelectedContact(foundGd);
      setIsRepModal(false);
    } else {
      handleFilterByManager(managerName);
      setActiveTab('reps');
    }
  };

  const handleExportExcel = async () => {
    try {
      if (activeTab === 'gds') {
        await exportGdsToExcel(filteredGds, 'Gerentes_Distrito_Calox.xlsx');
      } else {
        await exportRepsToExcel(filteredReps, 'Agenda de Representantes.xlsx');
      }
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}
    >
      {/* 0. Offline Mode Banner for PWA */}
      <OfflineIndicator />

      {/* 1. Header with Branding, Role Switching & Theme Switching */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        currentTheme={currentTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onAddRep={isAdmin ? handleOpenCreateRep : undefined}
        onAddGd={isAdmin ? handleOpenCreateGd : undefined}
        totalRepsCount={activeRepsData.length}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={() => {
          setIsAdmin(false);
          if (activeTab === 'sheets') setActiveTab('reps');
          setSyncToast({
            type: 'info',
            message: 'Sesión cambiada a modo Invitado (Solo lectura).',
          });
        }}
      />

      {/* 2. Quantitative Metric Strip */}
      <MetricStrip
        activeTab={activeTab}
        countComercial={totalComerciales}
        countVisitaMedica={totalVisitaMedica}
        countGerentesDistrito={countGerentesDistrito}
        countCoordinadores={countCoordinadores}
        countLaSante={totalLaSante}
        countPharmetique={totalPharmetique}
        countOtc={totalOtc}
        countRegiones={REGION_OPTIONS.length}
        countRegionesCubiertas={15}
        countRegionesSinReps={9}
      />


      {/* 4. Main Body Container */}
      <main className="flex-1 w-full max-w-full md:max-w-[1440px] overflow-x-hidden mx-auto px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-6 flex flex-col">
        {activeTab === 'reps' && (
          <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-full">
            {/* Directorio Unificado de Representantes con Buscador, Modo y Filtros integrados */}
            <TypeSelector
              reps={filteredReps}
              repsComerciales={repsComerciales}
              repsVisitaMedica={repsVisitaMedica}
              totalComerciales={totalComerciales}
              totalVisitaMedica={totalVisitaMedica}
              totalOriginal={activeRepsData.length}
              viewMode={viewMode}
              onSelectRep={handleSelectRep}
              onFilterByManager={handleFilterByManager}
              onFilterByRegion={handleFilterByRegion}
              onAddRep={isAdmin ? handleOpenCreateRep : undefined}
              onEditRep={isAdmin ? handleOpenEditRep : undefined}
              onDeleteRep={isAdmin ? handleDeleteRep : undefined}
              onToggleStatus={isAdmin ? handleToggleRepStatus : undefined}
              countLaSante={totalLaSante}
              countPharmetique={totalPharmetique}
              countOtc={totalOtc}
              onPullSync={() => handlePullSync(false)}
              isPullSyncing={isPullSyncing}
              linkedSheet={linkedSheet}
              onAutoConnect={handleAutoConnect}
              isAutoConnecting={isAutoConnecting}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onViewModeChange={setViewMode}
              onExportExcel={handleExportExcel}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
              showFilters={true}
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
              typeOptions={typeSelectOptions}
              selectedRegions={selectedRegions}
              onRegionsChange={setSelectedRegions}
              regionOptions={regionSelectOptions}
              selectedUnits={selectedUnits}
              onUnitsChange={setSelectedUnits}
              unitOptions={unitSelectOptions}
              selectedGerentes={selectedGerentes}
              onGerentesChange={setSelectedGerentes}
              gerenteOptions={gerenteSelectOptions}
              selectedCoordinadores={selectedCoordinadores}
              onCoordinadoresChange={setSelectedCoordinadores}
              coordinadorOptions={coordinadorSelectOptions}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        {activeTab === 'gds' && (
          <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-full">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-[#EAE5E1] shadow-2xs flex flex-col gap-2.5 sm:gap-5 w-full max-w-full">
              {/* Fila superior: Título con ícono y Botón Agregar GD / Coordinador */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 w-full">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl theme-gradient-bg text-white flex items-center justify-center shadow-2xs shrink-0">
                    <Users className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-black text-[#1A1A1E] tracking-tight truncate">
                      Gerentes de Distrito y Coordinadores
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      Líderes de gerencias de distrito, comercialización y trade marketing.
                    </p>
                  </div>
                </div>

                {/* Botón de acción: Nuevo GD / Coordinador (Solo Administrador) */}
                {isAdmin && (
                  <button
                    onClick={handleOpenCreateGd}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white text-sm font-bold rounded-xl sm:rounded-full shadow-2xs transition-all cursor-pointer shrink-0"
                    title="Agregar nuevo GD o Coordinador"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Nuevo GD / Coordinador</span>
                  </button>
                )}
              </div>

              {/* Fila inferior: Buscador, Selector de Modo y Botón Exportar a Excel */}
              <div className="pt-2 sm:pt-4 border-t border-[#EAE5E1]/80 w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
                {/* Panel de búsqueda */}
                <div className="relative flex-1 w-full max-w-full">
                  <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-primary" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar líder, cédula, cargo, región..."
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

                {/* Selector de modo tarjeta o tabla y Exportar a Excel */}
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap sm:flex-nowrap shrink-0">
                  <div className="inline-flex bg-[#F8F4F2] p-0.5 sm:p-1 rounded-xl sm:rounded-full border border-[#EAE5E1] shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-theme-primary text-white shadow-2xs'
                          : 'text-slate-600 hover:text-theme-primary'
                      }`}
                      title="Ver en cuadrícula de tarjetas"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
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
                      title="Ver en formato tabla compacta"
                    >
                      <Table2 className="w-3.5 h-3.5" />
                      <span>Tabla</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 sm:px-3.5 rounded-xl sm:rounded-full border border-emerald-300 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition-all cursor-pointer shadow-2xs shrink-0"
                    title="Exportar a Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>
            </div>

            <GerentesList
              gds={filteredGds}
              viewMode={viewMode}
              teamCounts={teamCounts}
              onSelectGd={handleSelectGd}
              onEditGd={isAdmin ? handleOpenEditGd : undefined}
              onAddGd={isAdmin ? handleOpenCreateGd : undefined}
              onViewTeam={handleViewTeam}
              onFilterByRegion={handleFilterByRegion}
              onToggleStatus={isAdmin ? handleToggleGdStatus : undefined}
              onDeleteGd={isAdmin ? handleDeleteGd : undefined}
            />
          </div>
        )}

        {/* Feature 1: Interactive Geographic Territory Map */}
        {activeTab === 'map' && (
          <CoverageMap
            reps={repsData}
            gds={gdsData}
            viewMode={viewMode}
            onSelectRep={handleSelectRep}
            onSelectGd={handleSelectGd}
            onFilterByManager={handleFilterByManager}
            onFilterByRegion={(region) => {
              handleFilterByRegion(region);
              setActiveTab('reps');
            }}
            currentTheme={currentTheme}
          />
        )}

        {/* Feature 5: Business Intelligence Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            reps={repsData}
            gds={gdsData}
            onSelectGd={handleSelectGd}
          />
        )}

        {/* Feature 7: Interactive Hierarchical Organization Tree */}
        {activeTab === 'matrix' && (
          <HierarchyTree
            reps={repsData}
            gds={gdsData}
            onSelectRep={handleSelectRep}
            onSelectGd={handleSelectGd}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsSync
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isLoggingIn={isLoggingIn}
            loginError={loginError}
            reps={repsData}
            gds={gdsData}
            linkedSheet={linkedSheet}
            onUpdateLinkedSheet={(info) => {
              setLinkedSheet(info);
              setLinkedSpreadsheetInfo(info);
            }}
            onPullSync={handlePullSync}
            isPullSyncing={isPullSyncing}
            syncStats={syncStats}
            syncError={syncError}
          />
        )}
      </main>

      {/* 6. Contact Detail Modal */}
      <ContactModal
        contact={selectedContact}
        isRep={isRepModal}
        onClose={() => setSelectedContact(null)}
        onSelectManager={handleSelectManagerFromModal}
        onEditRep={isAdmin ? handleOpenEditRep : undefined}
        onEditGd={isAdmin ? handleOpenEditGd : undefined}
        onDeleteRep={isAdmin ? handleDeleteRep : undefined}
        onDeleteGd={isAdmin ? handleDeleteGd : undefined}
      />

      {/* 7. PDF Export & Printable Guide Modal (Feature 6) */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        reps={repsData}
        gds={gdsData}
      />

      {/* 8. Representative Form Modal (Create / Edit) */}
      <RepFormModal
        isOpen={isRepFormOpen}
        onClose={() => setIsRepFormOpen(false)}
        onSave={handleSaveRep}
        onDelete={handleDeleteRep}
        repToEdit={repToEdit}
        existingReps={repsData}
        linkedSheet={linkedSheet}
        isAuthenticated={Boolean(user)}
        isSavingToSheets={isSavingToSheets}
      />

      {/* 9. Gerente / Coordinador Form Modal (Create / Edit) */}
      <GdFormModal
        isOpen={isGdFormOpen}
        onClose={() => {
          setIsGdFormOpen(false);
          setGdToEdit(null);
        }}
        onSave={handleSaveGd}
        onDelete={handleDeleteGd}
        gdToEdit={gdToEdit}
        reps={repsData}
      />

      {/* 9. Floating Sync Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-3 left-3 right-3 z-50 max-w-full animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-start gap-2.5 p-3 rounded-2xl shadow-xl border backdrop-blur-md ${
              syncToast.type === 'success'
                ? 'bg-emerald-950/95 text-white border-emerald-500/50'
                : syncToast.type === 'error'
                ? 'bg-rose-950/95 text-white border-rose-500/50'
                : 'bg-slate-900/95 text-white border-slate-700'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {syncToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {syncToast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {syncToast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            </div>
            <div className="flex-1 text-xs font-medium leading-relaxed break-words">
              {syncToast.message}
            </div>
            <button
              onClick={() => setSyncToast(null)}
              className="text-white/60 hover:text-white transition-colors cursor-pointer p-0.5 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 9. Theme / Palette Switcher Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={(theme) => {
          setCurrentTheme(theme);
          try {
            localStorage.setItem('calox_theme', theme);
          } catch (e) {
            console.error('Failed to save theme in localStorage:', e);
          }
        }}
      />

      {/* 10. User Role / Admin Access Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setSyncToast({
            type: 'success',
            message: 'Acceso concedido como Administrador (Administrador26). Edición habilitada.',
          });
        }}
        onLogoutAdmin={() => {
          setIsAdmin(false);
          if (activeTab === 'sheets') setActiveTab('reps');
          setSyncToast({
            type: 'info',
            message: 'Sesión cambiada a modo Invitado (Solo lectura).',
          });
        }}
      />
    </div>
  );
}
