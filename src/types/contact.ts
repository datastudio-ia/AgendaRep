export interface Representante {
  id: string;
  status: string;
  num: string;
  cedula: string;
  nombre: string;
  ciudad: string;
  estado: string;
  region: string;
  unidadNegocio: string;
  codigoSector: string;
  secuencia: string;
  gerenteDistrito: string;
  fechaIngreso: string;
  telefono: string;
  correo: string;
  tipoRepresentante?: 'Comercial' | 'Visita Médica';
}

export const isRepActive = (rep: Representante): boolean => {
  return (rep.status || 'ACTIVO').toUpperCase() === 'ACTIVO';
};

export const isGdActive = (gd: GerenteDistrito): boolean => {
  return (gd.status || 'ACTIVO').toUpperCase() === 'ACTIVO';
};

export const isRepComercial = (rep: Representante): boolean => {
  if (rep.tipoRepresentante) {
    return rep.tipoRepresentante === 'Comercial';
  }
  const gdUpper = (rep.gerenteDistrito || '').toUpperCase();
  const isComercialMgr =
    gdUpper.includes('VICTORIA HERNANDEZ') ||
    gdUpper.includes('KERVIN PALOMO') ||
    gdUpper.includes('DANA RIERA') ||
    gdUpper.includes('ELIZABETH MENDOZA') ||
    gdUpper.includes('DOUGLAS SANCHEZ') ||
    gdUpper.includes('JUANITA HURTADO') ||
    gdUpper.includes('JUAN MENDEZ') ||
    gdUpper.includes('YESSICA NOGUERA');
  if (isComercialMgr) return true;
  return (rep.unidadNegocio || '').toUpperCase().includes('COMERCIAL');
};

export interface GerenteDistrito {
  id: string;
  status: string;
  cedula: string;
  nombre: string;
  cargo: string;
  region: string;
  codigoSector: string;
  supervisor: string;
  fechaIngreso: string;
  telefono: string;
  correo: string;
  ciudad?: string;
  estado?: string;
}

export interface CredencialDrogueria {
  id: string;
  drogueria: string;
  representante: string;
  cedula: string;
  correo: string;
  cargo: string;
  region: string;
  usuario: string;
  password?: string;
  portalUrl: string;
  estatus: string;
}

export interface CustomDatabase {
  id: string;
  name: string;
  description?: string;
  sourceType: 'google_sheets' | 'csv' | 'local';
  sourceUrl?: string;
  spreadsheetId?: string;
  sheetTabName?: string;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  createdAt: string;
  lastSyncedAt?: string;
}

export type ViewMode = 'grid' | 'table';
export type ActiveTab =
  | 'reps'
  | 'gds'
  | 'map'
  | 'analytics'
  | 'matrix'
  | 'credenciales'
  | 'sheets'
  | string;
export type RepCategory = 'all' | 'comercial' | 'visita_medica' | 'split';

