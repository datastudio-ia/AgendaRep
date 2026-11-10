import { Representante, GerenteDistrito, CredencialDrogueria, isRepComercial } from '../types/contact';
import { getAccessToken } from './firebaseAuth';
import { getMappedUnit } from '../App';
import { getStandardRegion } from '../utils/excelExport';

export interface ExportSheetsResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export interface LinkedSpreadsheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheetTabName?: string;
  lastSyncedAt?: string;
}

export const CANONICAL_DATABASE_TITLE = 'Agenda de Representantes Calox - Base de Datos';
export const CANONICAL_SHEET_KEY = 'calox_canonical_linked_sheet_v1';
const LINKED_SHEET_KEY = 'calox_linked_sheet_v1';

export const getLinkedSpreadsheetInfo = (): LinkedSpreadsheetInfo | null => {
  try {
    const canonicalRaw = localStorage.getItem(CANONICAL_SHEET_KEY);
    if (canonicalRaw) return JSON.parse(canonicalRaw);
    const raw = localStorage.getItem(LINKED_SHEET_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading linked spreadsheet from localStorage:', e);
  }
  return null;
};

export const setLinkedSpreadsheetInfo = (info: LinkedSpreadsheetInfo | null): void => {
  try {
    if (info) {
      const serialized = JSON.stringify(info);
      localStorage.setItem(LINKED_SHEET_KEY, serialized);
      localStorage.setItem(CANONICAL_SHEET_KEY, serialized);
    } else {
      localStorage.removeItem(LINKED_SHEET_KEY);
      localStorage.removeItem(CANONICAL_SHEET_KEY);
    }
  } catch (e) {
    console.error('Error saving linked spreadsheet to localStorage:', e);
  }
};

// Standard Calox Business Schema matching image_c00c1622.png and REP_EXCEL_COLUMNS:
// Codigo | Cedula | Representante | Telefono | Correo | Ciudad | Estado | Region | Unidad de Negocio | Gerente de Distrito | Fecha de Ingreso | Estatus
export const CALOX_REP_HEADERS = [
  'Codigo',
  'Cedula',
  'Representante',
  'Telefono',
  'Correo',
  'Ciudad',
  'Estado',
  'Region',
  'Unidad de Negocio',
  'Gerente de Distrito',
  'Fecha de Ingreso',
  'Estatus',
];

export const CALOX_GD_HEADERS = [
  'Codigo',
  'Cedula',
  'Líder / Gerente',
  'Telefono',
  'Correo',
  'Ciudad',
  'Estado',
  'Region',
  'Cargo',
  'Supervisor',
  'Fecha de Ingreso',
  'Estatus',
];

export const CALOX_CREDENCIALES_HEADERS = [
  'Droguería',
  'Representante',
  'Cédula',
  'Cargo',
  'Región',
  'Correo',
  'Usuario',
  'Contraseña',
  'Portal URL',
  'Estatus',
];

export const REP_SHEET_HEADERS = CALOX_REP_HEADERS;

export function columnIndexToLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter || 'A';
}

/**
 * Dynamically maps a representative object into an array of string values
 * strictly matching the order and names of the provided sheet headers.
 */
export const repToRowByHeaders = (r: Representante, headers?: string[]): string[] => {
  const targetHeaders = headers && headers.length > 0 ? headers : CALOX_REP_HEADERS;
  return targetHeaders.map((h) => {
    const lower = (h || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (lower.includes('codigo') || lower.includes('sector')) {
      return r.codigoSector || '';
    }
    if (lower.includes('cedula') || lower === 'ci' || lower === 'c.i.') {
      return r.cedula || '';
    }
    if (lower.includes('representante') || lower.includes('nombre') || lower.includes('asesor')) {
      return r.nombre || '';
    }
    if (lower.includes('tel') || lower.includes('cel') || lower.includes('movil')) {
      return r.telefono || '';
    }
    if (lower.includes('correo') || lower.includes('mail')) {
      return r.correo || '';
    }
    if (lower.includes('ciudad')) {
      return r.ciudad || '';
    }
    if (lower === 'estado' || lower.includes('estado geografico') || lower.includes('entidad')) {
      return r.estado || '';
    }
    if (lower.includes('region')) {
      return getStandardRegion(r.region || '');
    }
    if (lower.includes('unidad') || lower.includes('linea')) {
      return getMappedUnit(r.unidadNegocio || '');
    }
    if (
      lower.includes('gerente') ||
      lower.includes('coordinador') ||
      lower.includes('supervisor') ||
      lower.includes('lider')
    ) {
      return r.gerenteDistrito || '';
    }
    if (lower.includes('fecha') || lower.includes('ingreso')) {
      return r.fechaIngreso || '';
    }
    if (lower.includes('estatus') || lower.includes('status') || lower.includes('actividad')) {
      return r.status || 'ACTIVO';
    }
    if (lower.includes('secuencia')) {
      return r.secuencia || '';
    }
    if (lower === 'n°' || lower === 'no' || lower === 'num' || lower === 'numero') {
      return r.num || '';
    }
    return '';
  });
};

export const repToRowArray = (r: Representante): string[] => {
  return repToRowByHeaders(r, CALOX_REP_HEADERS);
};

export const gdToRowByHeaders = (g: GerenteDistrito, headers?: string[]): string[] => {
  const targetHeaders = headers && headers.length > 0 ? headers : CALOX_GD_HEADERS;
  return targetHeaders.map((h) => {
    const lower = (h || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (lower.includes('codigo') || lower.includes('sector')) return g.codigoSector || '';
    if (lower.includes('cedula') || lower === 'ci' || lower === 'c.i.') return g.cedula || '';
    if (lower.includes('lider') || lower.includes('gerente') || lower.includes('nombre')) return g.nombre || '';
    if (lower.includes('tel') || lower.includes('cel') || lower.includes('movil')) return g.telefono || '';
    if (lower.includes('correo') || lower.includes('mail')) return g.correo || '';
    if (lower.includes('ciudad')) return g.ciudad || '';
    if (lower === 'estado' || lower.includes('estado geografico') || lower.includes('entidad')) return g.estado || '';
    if (lower.includes('region')) return getStandardRegion(g.region || '');
    if (lower.includes('cargo') || lower.includes('puesto')) return g.cargo || '';
    if (lower.includes('supervisor')) return g.supervisor || '';
    if (lower.includes('fecha') || lower.includes('ingreso')) return g.fechaIngreso || '';
    if (lower.includes('estatus') || lower.includes('status')) return g.status || 'ACTIVO';
    return '';
  });
};

export const credToRowByHeaders = (c: CredencialDrogueria, headers?: string[]): string[] => {
  const targetHeaders = headers && headers.length > 0 ? headers : CALOX_CREDENCIALES_HEADERS;
  return targetHeaders.map((h) => {
    const lower = (h || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (lower.includes('drogueria') || lower.includes('drog')) return c.drogueria || '';
    if (lower.includes('representante') || lower.includes('nombre') || lower.includes('asesor')) return c.representante || '';
    if (lower.includes('cedula') || lower === 'ci' || lower === 'c.i.') return c.cedula || '';
    if (lower.includes('cargo')) return c.cargo || '';
    if (lower.includes('region')) return c.region || '';
    if (lower.includes('correo') || lower.includes('mail')) return c.correo || '';
    if (lower.includes('usuario') || lower.includes('login') || lower.includes('user')) return c.usuario || '';
    if (lower.includes('clave') || lower.includes('password') || lower.includes('contrasena')) return c.password || '';
    if (lower.includes('portal') || lower.includes('url') || lower.includes('link')) return c.portalUrl || '';
    if (lower.includes('estatus') || lower.includes('status')) return c.estatus || 'Activo';
    return '';
  });
};

/**
 * Extracts spreadsheet ID from either a full URL or raw ID string.
 */
export const extractSpreadsheetId = (input: string): string => {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
};

/**
 * Universal CSV parser supporting comma and semicolon delimiters, quoted values,
 * and escaped quotes.
 */
export function parseCsvText(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const firstLine = lines[0];
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';

  const parseLine = (line: string): string[] => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        fields.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim().replace(/^"|"$/g, ''));
    return fields;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

/**
 * Reads any public or shared Google Sheets document directly via the Google
 * Visualization API CSV export endpoint without requiring OAuth sign-in.
 */
export async function fetchSpreadsheetPublicCsv(
  spreadsheetId: string,
  tabName?: string
): Promise<{ headers: string[]; rows: string[][] }> {
  const cleanId = extractSpreadsheetId(spreadsheetId) || spreadsheetId;
  const sheetParam = tabName ? `&sheet=${encodeURIComponent(tabName)}` : '';
  const url = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv${sheetParam}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `No se pudo leer la hoja (${res.status}). Verifica que la hoja esté compartida como "Cualquiera con el enlace puede ver".`
    );
  }
  const text = await res.text();
  return parseCsvText(text);
}

/**
 * Fetch spreadsheet metadata to locate sheet tabs. Supports both authenticated
 * Google API and public Google Sheets documents without requiring OAuth login.
 */
export async function getSpreadsheetDetails(
  spreadsheetId: string
): Promise<{ title: string; sheets: string[] }> {
  const cleanId = extractSpreadsheetId(spreadsheetId) || spreadsheetId;
  const token = await getAccessToken();

  // Try Google Sheets API v4 if token is present
  if (token && token !== 'local-token') {
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const sheets = (data.sheets || []).map((s: any) => s.properties?.title as string);
        return {
          title: data.properties?.title || 'Hoja de Google Sheets',
          sheets,
        };
      }
    } catch (e) {
      console.warn('API v4 fetch failed, trying public GViz probe:', e);
    }
  }

  // Fallback: Probe public Google Sheets GViz CSV export
  try {
    const csvData = await fetchSpreadsheetPublicCsv(cleanId);
    if (csvData.headers.length > 0) {
      return {
        title: 'Hoja de Google Sheets Vinculada',
        sheets: ['Representantes', 'Gerentes de Distrito', 'Credenciales'],
      };
    }
  } catch (publicErr: any) {
    if (!token || token === 'local-token') {
      throw new Error(
        'Para acceder a esta hoja: o bien compártela en Google Sheets como "Cualquiera con el enlace puede ver", o conecta tu cuenta de Google.'
      );
    }
    throw publicErr;
  }

  return {
    title: 'Hoja de Google Sheets Vinculada',
    sheets: ['Representantes'],
  };
}

/**
 * Generic fetcher for any Google Sheet tab, returning headers and structured object rows.
 */
export async function fetchGenericSpreadsheet(
  spreadsheetId: string,
  tabName?: string
): Promise<{ headers: string[]; rows: Record<string, string>[]; rawRows: string[][] }> {
  const cleanId = extractSpreadsheetId(spreadsheetId) || spreadsheetId;
  const token = await getAccessToken();

  let rows: string[][] = [];
  let headers: string[] = [];

  if (token && token !== 'local-token') {
    try {
      const targetTab = tabName || 'Hoja 1';
      const range = `${encodeURIComponent(targetTab)}!A1:ZZ`;
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const apiRows: string[][] = data.values || [];
        if (apiRows.length > 0) {
          headers = apiRows[0];
          rows = apiRows.slice(1);
        }
      }
    } catch (err) {
      console.warn('API v4 generic fetch failed, falling back to public csv:', err);
    }
  }

  if (headers.length === 0) {
    const publicData = await fetchSpreadsheetPublicCsv(cleanId, tabName);
    headers = publicData.headers;
    rows = publicData.rows;
  }

  const structuredRows: Record<string, string>[] = rows.map((row) => {
    const item: Record<string, string> = {};
    headers.forEach((h, idx) => {
      item[h || `Columna ${idx + 1}`] = row[idx] !== undefined ? String(row[idx]).trim() : '';
    });
    return item;
  });

  return {
    headers,
    rows: structuredRows,
    rawRows: rows,
  };
}

/**
 * Create a new agenda spreadsheet in Google Drive with initial Reps and GDs.
 */
export async function createAgendaSpreadsheet(
  title: string,
  reps: Representante[],
  gds: GerenteDistrito[]
): Promise<ExportSheetsResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Debes iniciar sesión con Google para crear una hoja en Google Sheets.');
  }

  const repRows = reps.map(r => repToRowByHeaders(r, CALOX_REP_HEADERS));

  const gdRows = gds.map(g => [
    g.codigoSector || '',
    g.cedula || '',
    g.nombre || '',
    g.telefono || '',
    g.correo || '',
    g.ciudad || '',
    g.estado || '',
    g.region || '',
    g.cargo || '',
    g.supervisor || '',
    g.fechaIngreso || '',
    g.status || 'ACTIVO',
  ]);

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title || `Agenda Farma - ${new Date().toLocaleDateString('es-ES')}`,
      },
      sheets: [
        {
          properties: {
            title: 'Representantes',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: 'Gerentes de Distrito',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error('Error creating spreadsheet:', errText);
    throw new Error(`Error de Google Sheets API (${createRes.status}): ${errText}`);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = createdData.spreadsheetUrl;

  const repEndCol = columnIndexToLetter(CALOX_REP_HEADERS.length);
  const gdEndCol = columnIndexToLetter(CALOX_GD_HEADERS.length);

  // Batch update initial values
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `Representantes!A1:${repEndCol}${repRows.length + 1}`,
            values: [CALOX_REP_HEADERS, ...repRows],
          },
          {
            range: `Gerentes de Distrito!A1:${gdEndCol}${gdRows.length + 1}`,
            values: [CALOX_GD_HEADERS, ...gdRows],
          },
        ],
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    console.error('Error populating spreadsheet:', errText);
    throw new Error(`Error al poblar datos en la hoja (${updateRes.status}): ${errText}`);
  }

  // Automatically save as active linked spreadsheet
  const result: ExportSheetsResult = {
    spreadsheetId,
    spreadsheetUrl,
    title: createdData.properties?.title || title,
  };

  setLinkedSpreadsheetInfo({
    spreadsheetId,
    spreadsheetUrl,
    title: result.title,
    sheetTabName: 'Representantes',
    lastSyncedAt: new Date().toISOString(),
  });

  return result;
}

/**
 * Normalizes headers from Google Sheets to property keys.
 */
function buildHeaderColumnMap(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((h, idx) => {
    if (!h) return;
    const lower = h
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (lower.includes('cedula') || lower === 'ci' || lower === 'c.i.') {
      map['cedula'] = idx;
    } else if (lower.includes('representante') || lower.includes('nombre') || lower.includes('asesor')) {
      map['nombre'] = idx;
    } else if (lower.includes('actividad') || lower.includes('estatus') || lower.includes('status')) {
      map['status'] = idx;
    } else if (lower === 'n°' || lower === 'no' || lower === 'numero' || lower === 'num') {
      map['num'] = idx;
    } else if (lower.includes('ciudad')) {
      map['ciudad'] = idx;
    } else if (lower === 'estado' || lower.includes('estado geografico') || lower.includes('entidad')) {
      map['estado'] = idx;
    } else if (lower.includes('region')) {
      map['region'] = idx;
    } else if (lower.includes('unidad') || lower.includes('linea')) {
      map['unidadNegocio'] = idx;
    } else if (lower.includes('sector') || lower.includes('codigo')) {
      map['codigoSector'] = idx;
    } else if (lower.includes('secuencia')) {
      map['secuencia'] = idx;
    } else if (lower.includes('gerente') || lower.includes('coordinador') || lower.includes('supervisor') || lower.includes('lider')) {
      map['gerenteDistrito'] = idx;
    } else if (lower.includes('fecha') || lower.includes('ingreso')) {
      map['fechaIngreso'] = idx;
    } else if (lower.includes('tel') || lower.includes('cel') || lower.includes('movil')) {
      map['telefono'] = idx;
    } else if (lower.includes('correo') || lower.includes('mail')) {
      map['correo'] = idx;
    }
  });

  return map;
}

export interface PullSyncResult {
  updatedReps: Representante[];
  stats: {
    added: number;
    updated: number;
    unchanged: number;
    totalRemote: number;
  };
}

/**
 * PULL SYNC: Fetch all rows from Google Sheets, compare against existing local reps,
 * add new representatives and update modified ones.
 */
export async function pullRepsFromSpreadsheet(
  spreadsheetId: string,
  localReps: Representante[],
  tabName?: string
): Promise<PullSyncResult> {
  const token = await getAccessToken();

  let rows: string[][] = [];
  let targetTab = tabName;

  if (token && token !== 'local-token') {
    try {
      if (!targetTab) {
        const details = await getSpreadsheetDetails(spreadsheetId);
        targetTab = details.sheets.find(s => s.toLowerCase().includes('representante')) || details.sheets[0] || 'Representantes';
      }

      const range = `${encodeURIComponent(targetTab)}!A1:Z`;
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        rows = data.values || [];
      }
    } catch (apiErr) {
      console.warn('API v4 pull failed, falling back to public CSV pull:', apiErr);
    }
  }

  // Fallback to public CSV export
  if (rows.length === 0) {
    try {
      const publicData = await fetchSpreadsheetPublicCsv(spreadsheetId, targetTab);
      if (publicData.headers.length > 0) {
        rows = [publicData.headers, ...publicData.rows];
      }
    } catch (publicErr) {
      if (!token || token === 'local-token') {
        throw new Error(
          'Para sincronizar esta hoja: asegúrate de que esté compartida en Google Sheets como "Cualquiera con el enlace puede ver", o conecta tu cuenta de Google.'
        );
      }
      throw publicErr;
    }
  }

  if (rows.length < 2) {
    return {
      updatedReps: localReps,
      stats: { added: 0, updated: 0, unchanged: localReps.length, totalRemote: 0 },
    };
  }

  const headers = rows[0];
  const colMap = buildHeaderColumnMap(headers);
  const dataRows = rows.slice(1);

  let addedCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;

  // Work on a mutable copy of local representatives
  const mergedReps = [...localReps];

  dataRows.forEach((row, rowIdx) => {
    const getVal = (colKey: string): string => {
      const idx = colMap[colKey];
      return idx !== undefined && row[idx] !== undefined ? String(row[idx]).trim() : '';
    };

    const nombre = getVal('nombre');
    const cedula = getVal('cedula');

    // Skip empty ghost rows
    if (!nombre && !cedula) return;

    const rawSheetUnit = getVal('unidadNegocio');
    const normalizedSheetUnit = getMappedUnit(rawSheetUnit);
    const gerenteDistritoVal = getVal('gerenteDistrito');

    const isCom =
      gerenteDistritoVal.match(/(VICTORIA|KERVIN|DANA|ELIZABETH|DOUGLAS|JUANITA|JUAN MENDEZ|YESSICA)/i) !== null ||
      rawSheetUnit.toUpperCase().includes('COMERCIAL');

    const repFromSheet: Partial<Representante> = {
      status: getVal('status') || 'ACTIVO',
      num: getVal('num') || String(rowIdx + 1),
      cedula: cedula,
      nombre: nombre,
      ciudad: getVal('ciudad'),
      estado: getVal('estado'),
      region: getVal('region'),
      unidadNegocio: normalizedSheetUnit,
      codigoSector: getVal('codigoSector'),
      secuencia: getVal('secuencia'),
      gerenteDistrito: gerenteDistritoVal,
      fechaIngreso: getVal('fechaIngreso'),
      telefono: getVal('telefono'),
      correo: getVal('correo'),
      tipoRepresentante: isCom ? 'Comercial' : 'Visita Médica',
    };

    // Match with local rep: first by cedula (if not empty), then by nombre
    let matchIndex = -1;
    if (cedula) {
      matchIndex = mergedReps.findIndex(
        r => r.cedula && r.cedula.replace(/\D/g, '') === cedula.replace(/\D/g, '')
      );
    }
    if (matchIndex === -1 && nombre) {
      matchIndex = mergedReps.findIndex(
        r => r.nombre.trim().toUpperCase() === nombre.trim().toUpperCase()
      );
    }

    if (matchIndex >= 0) {
      // Representative exists: check if any fields differ
      const current = mergedReps[matchIndex];
      const hasChanges =
        (repFromSheet.nombre && repFromSheet.nombre !== current.nombre) ||
        (repFromSheet.cedula && repFromSheet.cedula !== current.cedula) ||
        (repFromSheet.status && repFromSheet.status !== current.status) ||
        (repFromSheet.ciudad && repFromSheet.ciudad !== current.ciudad) ||
        (repFromSheet.estado && repFromSheet.estado !== current.estado) ||
        (repFromSheet.region && repFromSheet.region !== current.region) ||
        (repFromSheet.unidadNegocio && repFromSheet.unidadNegocio !== current.unidadNegocio) ||
        (repFromSheet.codigoSector && repFromSheet.codigoSector !== current.codigoSector) ||
        (repFromSheet.gerenteDistrito && repFromSheet.gerenteDistrito !== current.gerenteDistrito) ||
        (repFromSheet.telefono && repFromSheet.telefono !== current.telefono) ||
        (repFromSheet.correo && repFromSheet.correo !== current.correo);

      if (hasChanges) {
        mergedReps[matchIndex] = {
          ...current,
          ...repFromSheet,
          tipoRepresentante:
            repFromSheet.unidadNegocio?.toUpperCase().includes('COMERCIAL')
              ? 'Comercial'
              : 'Visita Médica',
        } as Representante;
        updatedCount++;
      } else {
        unchangedCount++;
      }
    } else {
      // New representative added directly into Google Sheets!
      const newRep: Representante = {
        id: `sheet-rep-${Date.now()}-${rowIdx}`,
        status: repFromSheet.status || 'ACTIVO',
        num: repFromSheet.num || String(mergedReps.length + 1),
        cedula: repFromSheet.cedula || '',
        nombre: repFromSheet.nombre || 'REPRESENTANTE NUEVO',
        ciudad: repFromSheet.ciudad || '',
        estado: repFromSheet.estado || '',
        region: repFromSheet.region || 'CENTRO',
        unidadNegocio: repFromSheet.unidadNegocio || 'LA SANTE',
        codigoSector: repFromSheet.codigoSector || '',
        secuencia: repFromSheet.secuencia || '',
        gerenteDistrito: repFromSheet.gerenteDistrito || '',
        fechaIngreso: repFromSheet.fechaIngreso || '',
        telefono: repFromSheet.telefono || '',
        correo: repFromSheet.correo || '',
        tipoRepresentante:
          repFromSheet.unidadNegocio?.toUpperCase().includes('COMERCIAL')
            ? 'Comercial'
            : 'Visita Médica',
      };
      mergedReps.push(newRep);
      addedCount++;
    }
  });

  // Update last sync time
  const currentInfo = getLinkedSpreadsheetInfo();
  if (currentInfo && currentInfo.spreadsheetId === spreadsheetId) {
    setLinkedSpreadsheetInfo({
      ...currentInfo,
      lastSyncedAt: new Date().toISOString(),
    });
  }

  return {
    updatedReps: mergedReps,
    stats: {
      added: addedCount,
      updated: updatedCount,
      unchanged: unchangedCount,
      totalRemote: dataRows.length,
    },
  };
}

export interface PushSyncResult {
  action: 'updated' | 'created';
  rowNumber: number;
  sheetTitle: string;
}

/**
 * PUSH SYNC: When adding or editing a representative in the app,
 * insert or update the corresponding row in the linked Google Sheet.
 */
export async function syncRepToSpreadsheet(
  spreadsheetId: string,
  rep: Representante,
  tabName?: string
): Promise<PushSyncResult> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google para sincronizar con la hoja.');

  let targetTab = tabName;
  if (!targetTab) {
    const details = await getSpreadsheetDetails(spreadsheetId);
    targetTab = details.sheets.find(s => s.toLowerCase().includes('representante')) || details.sheets[0] || 'Representantes';
  }

  // 1. Read existing rows across all columns to find matches and inspect actual headers
  const readRange = `${encodeURIComponent(targetTab)}!A1:Z`;
  const readRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${readRange}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!readRes.ok) {
    const err = await readRes.text();
    throw new Error(`Error al verificar la hoja (${readRes.status}): ${err}`);
  }

  const readData = await readRes.json();
  const rows: string[][] = readData.values || [];

  const headers = rows.length > 0 ? rows[0] : CALOX_REP_HEADERS;
  const colMap = buildHeaderColumnMap(headers);
  const endColLetter = columnIndexToLetter(headers.length);

  let targetRowIndex = -1; // 1-indexed for Sheets

  const cleanCedula = rep.cedula?.replace(/\D/g, '') || '';
  const cleanNombre = rep.nombre?.trim().toUpperCase() || '';

  if (rows.length > 1) {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cedulaIdx = colMap['cedula'];
      const nombreIdx = colMap['nombre'];

      const rowCedula = cedulaIdx !== undefined && row[cedulaIdx] ? String(row[cedulaIdx]).replace(/\D/g, '') : '';
      const rowNombre = nombreIdx !== undefined && row[nombreIdx] ? String(row[nombreIdx]).trim().toUpperCase() : '';

      const directCedulaMatch = cleanCedula && rowCedula && cleanCedula === rowCedula;
      const directNombreMatch = cleanNombre && rowNombre && cleanNombre === rowNombre;

      // Robust check: also search across any cell in the row in case previous data was shifted
      const anyCellCedulaMatch = cleanCedula && row.some(cell => String(cell).replace(/\D/g, '') === cleanCedula);
      const anyCellNombreMatch = cleanNombre && row.some(cell => String(cell).trim().toUpperCase() === cleanNombre);

      if (directCedulaMatch || directNombreMatch || anyCellCedulaMatch || anyCellNombreMatch) {
        targetRowIndex = i + 1; // 1-indexed in Google Sheets
        break;
      }
    }
  }

  // Build row values strictly mapped to the exact column positions of this sheet
  const rowValues = repToRowByHeaders(rep, headers);

  if (targetRowIndex > 0) {
    // UPDATE existing row with properly aligned values
    const updateRange = `${encodeURIComponent(targetTab)}!A${targetRowIndex}:${endColLetter}${targetRowIndex}`;
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Error al actualizar fila en Google Sheets (${updateRes.status}): ${err}`);
    }

    return {
      action: 'updated',
      rowNumber: targetRowIndex,
      sheetTitle: targetTab,
    };
  } else {
    // APPEND new row
    if (rows.length === 0) {
      // If the sheet was completely empty, ensure header row exists first
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(targetTab)}!A1:${endColLetter}1?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [CALOX_REP_HEADERS],
          }),
        }
      );
    }

    const appendRange = `${encodeURIComponent(targetTab)}!A:${endColLetter}`;
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.text();
      throw new Error(`Error al agregar fila en Google Sheets (${appendRes.status}): ${err}`);
    }

    return {
      action: 'created',
      rowNumber: rows.length + 1,
      sheetTitle: targetTab,
    };
  }
}

/**
 * Ensures the app connects to the exact SAME canonical spreadsheet database.
 * If one is already linked, it verifies access.
 * If not, it searches Google Drive for an existing database sheet, or creates it once.
 */
export async function getOrCreateCanonicalSpreadsheet(
  reps: Representante[],
  gds: GerenteDistrito[]
): Promise<LinkedSpreadsheetInfo> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Inicia sesión con Google para conectar la base de datos de Google Sheets.');
  }

  // 1. Check existing linked sheet info
  const existing = getLinkedSpreadsheetInfo();
  if (existing && existing.spreadsheetId) {
    try {
      const details = await getSpreadsheetDetails(existing.spreadsheetId);
      const updatedInfo: LinkedSpreadsheetInfo = {
        ...existing,
        title: details.title,
        sheetTabName: existing.sheetTabName || details.sheets.find(s => s.toLowerCase().includes('representante')) || details.sheets[0] || 'Representantes',
      };
      setLinkedSpreadsheetInfo(updatedInfo);
      return updatedInfo;
    } catch (e) {
      console.warn('Existing linked sheet inaccessible, will search Drive:', e);
    }
  }

  // 2. Search user's Drive for existing database file
  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id, name)&pageSize=20`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (searchRes.ok) {
      const data = await searchRes.json();
      const files: Array<{ id: string; name: string }> = data.files || [];
      const match = files.find(
        f =>
          f.name === CANONICAL_DATABASE_TITLE ||
          f.name.toLowerCase().includes('agenda de representantes') ||
          f.name.toLowerCase().includes('directorio farma')
      );
      if (match) {
        const details = await getSpreadsheetDetails(match.id);
        const linked: LinkedSpreadsheetInfo = {
          spreadsheetId: match.id,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${match.id}/edit`,
          title: match.name,
          sheetTabName: details.sheets.find(s => s.toLowerCase().includes('representante')) || details.sheets[0] || 'Representantes',
          lastSyncedAt: new Date().toISOString(),
        };
        setLinkedSpreadsheetInfo(linked);
        return linked;
      }
    }
  } catch (searchErr) {
    console.warn('Error searching existing spreadsheet in Drive:', searchErr);
  }

  // 3. Create the canonical spreadsheet database once
  const created = await createAgendaSpreadsheet(CANONICAL_DATABASE_TITLE, reps, gds);
  const newLinked: LinkedSpreadsheetInfo = {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl,
    title: created.title,
    sheetTabName: 'Representantes',
    lastSyncedAt: new Date().toISOString(),
  };
  setLinkedSpreadsheetInfo(newLinked);
  return newLinked;
}

/**
 * Removes a representative row from Google Sheets database when deleted from the app.
 */
export async function deleteRepFromSpreadsheet(
  spreadsheetId: string,
  repId: string,
  cedula?: string,
  nombre?: string,
  tabName?: string
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  try {
    let targetTab = tabName;
    if (!targetTab) {
      const details = await getSpreadsheetDetails(spreadsheetId);
      targetTab = details.sheets.find(s => s.toLowerCase().includes('representante')) || details.sheets[0] || 'Representantes';
    }

    const readRange = `${encodeURIComponent(targetTab)}!A1:Z`;
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${readRange}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!readRes.ok) return false;

    const readData = await readRes.json();
    const rows: string[][] = readData.values || [];
    if (rows.length <= 1) return false;

    const headers = rows[0];
    const colMap = buildHeaderColumnMap(headers);
    const cleanCedula = cedula?.replace(/\D/g, '') || '';
    const cleanNombre = nombre?.trim().toUpperCase() || '';

    let targetRowIndex = -1; // 1-indexed in Google Sheets
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowCedula = colMap['cedula'] !== undefined && row[colMap['cedula']] ? String(row[colMap['cedula']]).replace(/\D/g, '') : '';
      const rowNombre = colMap['nombre'] !== undefined && row[colMap['nombre']] ? String(row[colMap['nombre']]).trim().toUpperCase() : '';

      if (
        (cleanCedula && rowCedula === cleanCedula) ||
        (cleanNombre && rowNombre === cleanNombre) ||
        (cleanCedula && row.some(c => String(c).replace(/\D/g, '') === cleanCedula)) ||
        (cleanNombre && row.some(c => String(c).trim().toUpperCase() === cleanNombre))
      ) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex > 0) {
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        const sheetObj = metaData.sheets?.find((s: any) => s.properties?.title === targetTab);
        const numericSheetId = sheetObj?.properties?.sheetId || 0;

        const delRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: numericSheetId,
                    dimension: 'ROWS',
                    startIndex: targetRowIndex - 1,
                    endIndex: targetRowIndex,
                  },
                },
              },
            ],
          }),
        });
        return delRes.ok;
      }
    }
  } catch (err) {
    console.error('Error deleting row from spreadsheet:', err);
  }
  return false;
}

/**
 * Ensures that a given tab exists in the Google Spreadsheet.
 * If not, it creates the tab and initializes it with the provided default headers.
 */
export async function ensureSheetTabExists(
  spreadsheetId: string,
  desiredTabName: string,
  defaultHeaders: string[]
): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Token de Google no disponible.');

  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(`Error al inspeccionar la hoja (${metaRes.status}): ${errText}`);
  }

  const metaData = await metaRes.json();
  const sheets: Array<{ properties: { sheetId: number; title: string } }> = metaData.sheets || [];

  const found = sheets.find(
    (s) =>
      s.properties.title.toLowerCase().trim() === desiredTabName.toLowerCase().trim() ||
      s.properties.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim() ===
        desiredTabName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
  );

  if (found) {
    return found.properties.title;
  }

  // Create the sheet tab
  const addRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          addSheet: {
            properties: {
              title: desiredTabName,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        },
      ],
    }),
  });

  if (!addRes.ok) {
    const errText = await addRes.text();
    console.error('Error adding sheet tab:', errText);
    throw new Error(`Error al crear la pestaña "${desiredTabName}" (${addRes.status}): ${errText}`);
  }

  // Initialize header row
  const endCol = columnIndexToLetter(defaultHeaders.length);
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      desiredTabName
    )}!A1:${endCol}1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [defaultHeaders],
      }),
    }
  );

  return desiredTabName;
}

/**
 * PUSH SYNC GD: When adding or editing a Gerente de Distrito / Coordinador,
 * insert or update the corresponding row in the linked Google Sheet.
 */
export async function syncGdToSpreadsheet(
  spreadsheetId: string,
  gd: GerenteDistrito,
  tabName?: string
): Promise<PushSyncResult> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google para sincronizar con la hoja.');

  const targetTab = tabName || (await ensureSheetTabExists(spreadsheetId, 'Gerentes de Distrito', CALOX_GD_HEADERS));

  const readRange = `${encodeURIComponent(targetTab)}!A1:Z`;
  const readRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${readRange}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!readRes.ok) {
    const err = await readRes.text();
    throw new Error(`Error al verificar la hoja (${readRes.status}): ${err}`);
  }

  const readData = await readRes.json();
  const rows: string[][] = readData.values || [];

  const headers = rows.length > 0 ? rows[0] : CALOX_GD_HEADERS;
  const colMap = buildHeaderColumnMap(headers);
  const endColLetter = columnIndexToLetter(headers.length);

  let targetRowIndex = -1;

  const cleanCedula = gd.cedula?.replace(/\D/g, '') || '';
  const cleanNombre = gd.nombre?.trim().toUpperCase() || '';

  if (rows.length > 1) {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cedulaIdx = colMap['cedula'];
      const nombreIdx = colMap['nombre'] !== undefined ? colMap['nombre'] : colMap['gerenteDistrito'];

      const rowCedula = cedulaIdx !== undefined && row[cedulaIdx] ? String(row[cedulaIdx]).replace(/\D/g, '') : '';
      const rowNombre = nombreIdx !== undefined && row[nombreIdx] ? String(row[nombreIdx]).trim().toUpperCase() : '';

      const directCedulaMatch = cleanCedula && rowCedula && cleanCedula === rowCedula;
      const directNombreMatch = cleanNombre && rowNombre && cleanNombre === rowNombre;
      const anyCellCedulaMatch = cleanCedula && row.some(cell => String(cell).replace(/\D/g, '') === cleanCedula);
      const anyCellNombreMatch = cleanNombre && row.some(cell => String(cell).trim().toUpperCase() === cleanNombre);

      if (directCedulaMatch || directNombreMatch || anyCellCedulaMatch || anyCellNombreMatch) {
        targetRowIndex = i + 1;
        break;
      }
    }
  }

  const rowValues = gdToRowByHeaders(gd, headers);

  if (targetRowIndex > 0) {
    const updateRange = `${encodeURIComponent(targetTab)}!A${targetRowIndex}:${endColLetter}${targetRowIndex}`;
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Error al actualizar fila de líder en Google Sheets (${updateRes.status}): ${err}`);
    }

    return {
      action: 'updated',
      rowNumber: targetRowIndex,
      sheetTitle: targetTab,
    };
  } else {
    const appendRange = `${encodeURIComponent(targetTab)}!A:${endColLetter}`;
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.text();
      throw new Error(`Error al agregar fila de líder en Google Sheets (${appendRes.status}): ${err}`);
    }

    return {
      action: 'created',
      rowNumber: rows.length + 1,
      sheetTitle: targetTab,
    };
  }
}

/**
 * Removes a Gerente de Distrito row from Google Sheets when deleted from the app.
 */
export async function deleteGdFromSpreadsheet(
  spreadsheetId: string,
  gdId: string,
  cedula?: string,
  nombre?: string,
  tabName?: string
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  try {
    const targetTab = tabName || (await ensureSheetTabExists(spreadsheetId, 'Gerentes de Distrito', CALOX_GD_HEADERS));
    const readRange = `${encodeURIComponent(targetTab)}!A1:Z`;
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${readRange}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!readRes.ok) return false;

    const readData = await readRes.json();
    const rows: string[][] = readData.values || [];
    if (rows.length <= 1) return false;

    const headers = rows[0];
    const colMap = buildHeaderColumnMap(headers);
    const cleanCedula = cedula?.replace(/\D/g, '') || '';
    const cleanNombre = nombre?.trim().toUpperCase() || '';

    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowCedula = colMap['cedula'] !== undefined && row[colMap['cedula']] ? String(row[colMap['cedula']]).replace(/\D/g, '') : '';
      const rowNombre = colMap['nombre'] !== undefined && row[colMap['nombre']] ? String(row[colMap['nombre']]).trim().toUpperCase() : '';

      if (
        (cleanCedula && rowCedula === cleanCedula) ||
        (cleanNombre && rowNombre === cleanNombre) ||
        (cleanCedula && row.some(c => String(c).replace(/\D/g, '') === cleanCedula)) ||
        (cleanNombre && row.some(c => String(c).trim().toUpperCase() === cleanNombre))
      ) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex > 0) {
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        const sheetObj = metaData.sheets?.find((s: any) => s.properties?.title === targetTab);
        const numericSheetId = sheetObj?.properties?.sheetId || 0;

        const delRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: numericSheetId,
                    dimension: 'ROWS',
                    startIndex: targetRowIndex - 1,
                    endIndex: targetRowIndex,
                  },
                },
              },
            ],
          }),
        });
        return delRes.ok;
      }
    }
  } catch (err) {
    console.error('Error deleting GD row from spreadsheet:', err);
  }
  return false;
}

/**
 * PUSH SYNC CREDENCIAL: When adding or editing a Credencial Droguería,
 * insert or update the corresponding row in Google Sheets.
 */
export async function syncCredencialToSpreadsheet(
  spreadsheetId: string,
  cred: CredencialDrogueria,
  tabName?: string
): Promise<PushSyncResult> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google para sincronizar con la hoja.');

  const targetTab = tabName || (await ensureSheetTabExists(spreadsheetId, 'Credenciales Droguerías', CALOX_CREDENCIALES_HEADERS));

  const readRange = `${encodeURIComponent(targetTab)}!A1:Z`;
  const readRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${readRange}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!readRes.ok) {
    const err = await readRes.text();
    throw new Error(`Error al verificar la hoja (${readRes.status}): ${err}`);
  }

  const readData = await readRes.json();
  const rows: string[][] = readData.values || [];

  const headers = rows.length > 0 ? rows[0] : CALOX_CREDENCIALES_HEADERS;
  const endColLetter = columnIndexToLetter(headers.length);

  let targetRowIndex = -1;

  const cleanDrog = cred.drogueria?.trim().toUpperCase() || '';
  const cleanUsuario = cred.usuario?.trim().toUpperCase() || '';
  const cleanCedula = cred.cedula?.replace(/\D/g, '') || '';
  const cleanNombre = cred.representante?.trim().toUpperCase() || '';

  if (rows.length > 1) {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowText = row.map(c => String(c).trim().toUpperCase());
      const hasDrog = cleanDrog && rowText.some(c => c === cleanDrog);
      const hasUser = cleanUsuario && rowText.some(c => c === cleanUsuario);
      const hasCedula = cleanCedula && row.some(c => String(c).replace(/\D/g, '') === cleanCedula);
      const hasNombre = cleanNombre && rowText.some(c => c === cleanNombre);

      if ((hasDrog && hasUser) || (hasDrog && hasCedula) || (hasDrog && hasNombre)) {
        targetRowIndex = i + 1;
        break;
      }
    }
  }

  const rowValues = credToRowByHeaders(cred, headers);

  if (targetRowIndex > 0) {
    const updateRange = `${encodeURIComponent(targetTab)}!A${targetRowIndex}:${endColLetter}${targetRowIndex}`;
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Error al actualizar credencial en Google Sheets (${updateRes.status}): ${err}`);
    }

    return {
      action: 'updated',
      rowNumber: targetRowIndex,
      sheetTitle: targetTab,
    };
  } else {
    const appendRange = `${encodeURIComponent(targetTab)}!A:${endColLetter}`;
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.text();
      throw new Error(`Error al registrar credencial en Google Sheets (${appendRes.status}): ${err}`);
    }

    return {
      action: 'created',
      rowNumber: rows.length + 1,
      sheetTitle: targetTab,
    };
  }
}

/**
 * Removes a Credencial Droguería row from Google Sheets when deleted from the app.
 */
export async function deleteCredencialFromSpreadsheet(
  spreadsheetId: string,
  credId: string,
  drogueria?: string,
  usuario?: string,
  cedula?: string,
  representante?: string,
  tabName?: string
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  try {
    const targetTab = tabName || (await ensureSheetTabExists(spreadsheetId, 'Credenciales Droguerías', CALOX_CREDENCIALES_HEADERS));
    const readRange = `${encodeURIComponent(targetTab)}!A1:Z`;
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${readRange}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!readRes.ok) return false;

    const readData = await readRes.json();
    const rows: string[][] = readData.values || [];
    if (rows.length <= 1) return false;

    const cleanDrog = drogueria?.trim().toUpperCase() || '';
    const cleanUsuario = usuario?.trim().toUpperCase() || '';
    const cleanCedula = cedula?.replace(/\D/g, '') || '';
    const cleanNombre = representante?.trim().toUpperCase() || '';

    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowText = row.map(c => String(c).trim().toUpperCase());
      const hasDrog = cleanDrog && rowText.some(c => c === cleanDrog);
      const hasUser = cleanUsuario && rowText.some(c => c === cleanUsuario);
      const hasCedula = cleanCedula && row.some(c => String(c).replace(/\D/g, '') === cleanCedula);
      const hasNombre = cleanNombre && rowText.some(c => c === cleanNombre);

      if ((hasDrog && hasUser) || (hasDrog && hasCedula) || (hasDrog && hasNombre)) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex > 0) {
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        const sheetObj = metaData.sheets?.find((s: any) => s.properties?.title === targetTab);
        const numericSheetId = sheetObj?.properties?.sheetId || 0;

        const delRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: numericSheetId,
                    dimension: 'ROWS',
                    startIndex: targetRowIndex - 1,
                    endIndex: targetRowIndex,
                  },
                },
              },
            ],
          }),
        });
        return delRes.ok;
      }
    }
  } catch (err) {
    console.error('Error deleting credencial row from spreadsheet:', err);
  }
  return false;
}
