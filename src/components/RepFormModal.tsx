import React, { useState, useEffect } from 'react';
import { Representante, isRepComercial } from '../types/contact';
import {
  X,
  Save,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Briefcase,
  IdCard,
  Calendar,
  AlertCircle,
  Plus,
  Check,
} from 'lucide-react';
import { LinkedSpreadsheetInfo } from '../services/sheetsService';
import {
  REGION_OPTIONS,
  UNIDADES_OPTIONS,
  GERENTES_DISTRITO_OPTIONS,
  COORDINADORES_OPTIONS,
  getMappedUnit,
  getCleanRegion,
} from '../App';
import { FileSpreadsheet } from 'lucide-react';

interface RepFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rep: Representante, syncToSheets: boolean) => Promise<void> | void;
  onDelete?: (id: string) => void;
  repToEdit: Representante | null;
  existingReps?: Representante[];
  linkedSheet?: LinkedSpreadsheetInfo | null;
  isAuthenticated?: boolean;
  isSavingToSheets?: boolean;
}

export const REGION_CODE_MAP: Record<string, string> = {
  'ANDES': '1',
  '1 - ANDES': '1',
  'CAPITAL ESTE': '2',
  '2 - CAPITAL ESTE': '2',
  'CAPITAL OESTE': '3',
  '3 - CAPITAL OESTE': '3',
  'CENTRO': '4',
  '4 - CENTRO': '4',
  'CENTRO OCCIDENTE': '5',
  '5 - CENTRO OCCIDENTE': '5',
  'OCCIDENTE': '6',
  '6 - OCCIDENTE': '6',
  'ORIENTE': '7',
  '7 - ORIENTE': '7',
};

export const UNIDAD_CODE_MAP: Record<string, string> = {
  'LA SANTE': '6',
  '6 - LA SANTE': '6',
  'LINEA 1': '8',
  'LINEA_1': '8',
  '8 - LINEA_1': '8',
  '8 - LINEA 1': '8',
  'OTC': '7',
  '7 - OTC': '7',
  'LINEA 2': '9',
  'LINEA_2': '9',
  '9 - LINEA_2': '9',
  '9 - LINEA 2': '9',
  'LINEA HIBRIDA 1': '1',
  'LINEA_HIBRIDA_1': '1',
  '1 - LINEA_HIBRIDA_1': '1',
  '1 - LINEA HIBRIDA 1': '1',
  'COMERCIAL': '3',
  '3 - COMERCIAL': '3',
  'LINEA HIBRIDA 2': '2',
  'LINEA_HIBRIDA_2': '2',
  '2 - LINEA_HIBRIDA_2': '2',
  '2 - LINEA HIBRIDA 2': '2',
  'LINEA 3': '4',
  'LINEA_3': '4',
  '4 - LINEA_3': '4',
  '4 - LINEA 3': '4',
  'LINEA HIBRIDA 3': '5',
  'LINEA_HIBRIDA_3': '5',
  '5 - LINEA_HIBRIDA_3': '5',
  '5 - LINEA HIBRIDA 3': '5',
};

export const getRegionCode = (rawReg: string): string | null => {
  if (!rawReg) return null;
  const clean = getCleanRegion(rawReg).toUpperCase().trim();
  if (REGION_CODE_MAP[clean]) return REGION_CODE_MAP[clean];
  const upper = rawReg.toUpperCase().trim();
  if (REGION_CODE_MAP[upper]) return REGION_CODE_MAP[upper];
  const match = upper.match(/^([1-7])\s*-/);
  if (match) return match[1];
  for (const [key, val] of Object.entries(REGION_CODE_MAP)) {
    if (upper.includes(key)) return val;
  }
  return null;
};

export const getUnidadCode = (rawUnit: string): string | null => {
  if (!rawUnit) return null;
  const mapped = getMappedUnit(rawUnit).toUpperCase().trim();
  if (UNIDAD_CODE_MAP[mapped]) return UNIDAD_CODE_MAP[mapped];
  const upper = rawUnit.toUpperCase().trim();
  if (UNIDAD_CODE_MAP[upper]) return UNIDAD_CODE_MAP[upper];
  const match = upper.match(/^([1-9])\s*-/);
  if (match) return match[1];
  for (const [key, val] of Object.entries(UNIDAD_CODE_MAP)) {
    if (upper.includes(key.replace(/_/g, ' ')) || upper.includes(key)) return val;
  }
  return null;
};

export const getNextRepCorrelative = (reps: Representante[] = []): number => {
  const BASE_CORRELATIVE = 104;
  let maxCorrelative = BASE_CORRELATIVE - 1;

  for (const rep of reps) {
    if (rep.secuencia) {
      const parsedSec = parseInt(rep.secuencia.replace(/\D/g, ''), 10);
      if (!isNaN(parsedSec) && parsedSec >= BASE_CORRELATIVE && parsedSec > maxCorrelative) {
        maxCorrelative = parsedSec;
      }
    }
    if (rep.codigoSector) {
      const cleanSector = rep.codigoSector.replace(/\D/g, '');
      if (cleanSector.length >= 6) {
        const lastThree = parseInt(cleanSector.slice(-3), 10);
        if (!isNaN(lastThree) && lastThree >= BASE_CORRELATIVE && lastThree > maxCorrelative) {
          maxCorrelative = lastThree;
        }
      }
    }
  }

  return maxCorrelative + 1;
};

export const CITY_TO_STATE_MAP: Record<string, string> = {
  // CAPITAL
  'CARACAS': 'DISTRITO CAPITAL',
  'LOS TEQUES': 'MIRANDA',
  'GUATIRE': 'MIRANDA',
  'GUARENAS': 'MIRANDA',

  // CENTRO
  'VALENCIA': 'CARABOBO',
  'PUERTO CABELLO': 'CARABOBO',
  'GUACARA': 'CARABOBO',
  'MARACAY': 'ARAGUA',
  'LA VICTORIA': 'ARAGUA',
  'TURMERO': 'ARAGUA',
  'SAN FERNANDO DE APURE': 'APURE',
  'SAN FERNANDO': 'APURE',
  'APURE': 'APURE',

  // ANDES
  'SAN CRISTOBAL': 'TACHIRA',
  'TARIBA': 'TACHIRA',
  'RUBIO': 'TACHIRA',
  'MERIDA': 'MERIDA',
  'EL VIGIA': 'MERIDA',
  'TOVAR': 'MERIDA',
  'VALERA': 'TRUJILLO',
  'TRUJILLO': 'TRUJILLO',
  'BOCONO': 'TRUJILLO',

  // OCCIDENTE
  'MARACAIBO': 'ZULIA',
  'SAN FRANCISCO': 'ZULIA',
  'CABIMAS': 'ZULIA',
  'CIUDAD OJEDA': 'ZULIA',
  'PUNTO FIJO': 'FALCON',
  'CORO': 'FALCON',

  // ORIENTE
  'BARCELONA': 'ANZOATEGUI',
  'PUERTO LA CRUZ': 'ANZOATEGUI',
  'LECHERIA': 'ANZOATEGUI',
  'EL TIGRE': 'ANZOATEGUI',
  'ANACO': 'ANZOATEGUI',
  'PUERTO ORDAZ': 'BOLIVAR',
  'CIUDAD BOLIVAR': 'BOLIVAR',
  'MATURIN': 'MONAGAS',
  'CUMANA': 'SUCRE',
  'CARUPANO': 'SUCRE',

  // CENTRO OCCIDENTE
  'BARQUISIMETO': 'LARA',
  'CABUDARE': 'LARA',
  'CARORA': 'LARA',
  'BARINAS': 'BARINAS',
  'SAN CARLOS': 'COJEDES',
  'ACARIGUA': 'PORTUGUESA',
  'GUANARE': 'PORTUGUESA',
  'SAN FELIPE': 'YARACUY',
};

export const getStateForCity = (cityStr: string): string | null => {
  if (!cityStr) return null;
  const upper = cityStr
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (CITY_TO_STATE_MAP[upper]) return CITY_TO_STATE_MAP[upper];
  for (const [c, s] of Object.entries(CITY_TO_STATE_MAP)) {
    if (upper === c || upper.includes(c) || c.includes(upper)) return s;
  }
  return null;
};

export const REGION_GEO_MAP: Record<
  string,
  {
    ciudades: string[];
    estados: string[];
    ejCiudad: string;
    ejEstado: string;
    defaultCiudad: string;
    defaultEstado: string;
  }
> = {
  'CAPITAL ESTE': {
    ciudades: ['CARACAS'],
    estados: ['DISTRITO CAPITAL', 'MIRANDA'],
    ejCiudad: 'Ej: CARACAS',
    ejEstado: 'Ej: DISTRITO CAPITAL',
    defaultCiudad: 'CARACAS',
    defaultEstado: 'DISTRITO CAPITAL',
  },
  'CAPITAL OESTE': {
    ciudades: ['CARACAS'],
    estados: ['DISTRITO CAPITAL'],
    ejCiudad: 'Ej: CARACAS',
    ejEstado: 'Ej: DISTRITO CAPITAL',
    defaultCiudad: 'CARACAS',
    defaultEstado: 'DISTRITO CAPITAL',
  },
  'CENTRO': {
    ciudades: ['VALENCIA', 'MARACAY', 'SAN FERNANDO DE APURE'],
    estados: ['CARABOBO', 'ARAGUA', 'APURE'],
    ejCiudad: 'Ej: VALENCIA',
    ejEstado: 'Ej: CARABOBO',
    defaultCiudad: 'VALENCIA',
    defaultEstado: 'CARABOBO',
  },
  'ANDES': {
    ciudades: ['SAN CRISTOBAL', 'MERIDA', 'VALERA'],
    estados: ['TACHIRA', 'MERIDA', 'TRUJILLO'],
    ejCiudad: 'Ej: SAN CRISTOBAL',
    ejEstado: 'Ej: TACHIRA',
    defaultCiudad: 'SAN CRISTOBAL',
    defaultEstado: 'TACHIRA',
  },
  'OCCIDENTE': {
    ciudades: ['MARACAIBO', 'PUNTO FIJO'],
    estados: ['ZULIA', 'FALCON'],
    ejCiudad: 'Ej: MARACAIBO',
    ejEstado: 'Ej: ZULIA',
    defaultCiudad: 'MARACAIBO',
    defaultEstado: 'ZULIA',
  },
  'ORIENTE': {
    ciudades: ['BARCELONA', 'LECHERIA', 'PUERTO ORDAZ', 'CIUDAD BOLIVAR', 'MATURIN', 'CUMANA'],
    estados: ['ANZOATEGUI', 'BOLIVAR', 'MONAGAS', 'SUCRE'],
    ejCiudad: 'Ej: BARCELONA',
    ejEstado: 'Ej: ANZOATEGUI',
    defaultCiudad: 'BARCELONA',
    defaultEstado: 'ANZOATEGUI',
  },
  'CENTRO OCCIDENTE': {
    ciudades: ['BARQUISIMETO', 'BARINAS'],
    estados: ['LARA', 'BARINAS'],
    ejCiudad: 'Ej: BARQUISIMETO',
    ejEstado: 'Ej: LARA',
    defaultCiudad: 'BARQUISIMETO',
    defaultEstado: 'LARA',
  },
};

export const COORDINADORES_COMERCIAL = [
  'DANA RIERA',
  'KERVIN PALOMO',
  'VICTORIA HERNANDEZ',
];

export const GERENTES_VISITA_MEDICA = [
  'ANDREA ALARCON',
  'MARAHY CHURION',
  'RANDOLPH GRAMCKO',
  'RICARDO GUEVARA',
  'TONNY ESPINOZA',
  'JHOSELYN SANCHEZ',
  'GD ORIENTE VACANTE',
];

export const RepFormModal: React.FC<RepFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  repToEdit,
  existingReps = [],
  linkedSheet,
  isAuthenticated,
  isSavingToSheets = false,
}) => {
  const isEditMode = Boolean(repToEdit);

  // Form fields state
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [status, setStatus] = useState('ACTIVO');
  const [region, setRegion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [estado, setEstado] = useState('');
  const [tipoRepresentante, setTipoRepresentante] = useState<'Comercial' | 'Visita Médica'>('Comercial');
  const [unidadNegocio, setUnidadNegocio] = useState('');
  const [gerenteDistrito, setGerenteDistrito] = useState(COORDINADORES_COMERCIAL[0]);
  const [codigoSector, setCodigoSector] = useState('');
  const [secuencia, setSecuencia] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');

  // Validation state
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Obtiene la secuencia que corresponde al representante (ej. 019 para Abril Marquina, o 104 para nuevo)
  const getRepSecuencia = (rep: Representante | null, currentSec: string, currentSector: string): string => {
    if (currentSec && currentSec.trim()) return currentSec.trim();
    if (rep?.secuencia && rep.secuencia.trim()) return rep.secuencia.trim();
    const digitsFromSector = (currentSector || rep?.codigoSector || '').replace(/\D/g, '');
    if (digitsFromSector.length >= 6) {
      return digitsFromSector.slice(-3);
    }
    if (rep?.num) {
      return String(rep.num).padStart(3, '0');
    }
    return String(getNextRepCorrelative(existingReps));
  };

  // Genera el código único de sector solo cuando todos los parámetros están completos
  const calculateSectorCode = (
    regStr: string,
    unitStr: string,
    customSeq?: string
  ): { code: string; seq: string } | null => {
    const regCode = getRegionCode(regStr);
    const uCode = getUnidadCode(unitStr);
    if (!regCode || !uCode) {
      return null;
    }
    const seq = customSeq || getRepSecuencia(repToEdit, secuencia, codigoSector);
    // Prefijo 1 + Región + Unidad de Negocio + Secuencia que corresponda al representante
    const code = `1${regCode}${uCode}${seq}`;
    return { code, seq };
  };

  // Initialize form when opening or changing rep
  useEffect(() => {
    if (repToEdit) {
      setNombre(repToEdit.nombre || '');
      setCedula(repToEdit.cedula || '');
      setTelefono(repToEdit.telefono || '');
      setCorreo(repToEdit.correo || '');
      setStatus(repToEdit.status || 'ACTIVO');
      const cleanedReg = repToEdit.region ? getCleanRegion(repToEdit.region) : (REGION_OPTIONS[0] || '');
      setRegion(REGION_OPTIONS.includes(cleanedReg) ? cleanedReg : repToEdit.region || REGION_OPTIONS[0]);
      setCiudad(repToEdit.ciudad || '');
      setEstado(repToEdit.estado || '');
      const isComercial = isRepComercial(repToEdit);
      const repType: 'Comercial' | 'Visita Médica' = isComercial ? 'Comercial' : 'Visita Médica';
      setTipoRepresentante(repType);
      const mappedUnit = repToEdit.unidadNegocio ? getMappedUnit(repToEdit.unidadNegocio) : (UNIDADES_OPTIONS[0] || '');
      setUnidadNegocio(UNIDADES_OPTIONS.includes(mappedUnit) ? mappedUnit : repToEdit.unidadNegocio || UNIDADES_OPTIONS[0]);
      
      const allowedManagers = repType === 'Comercial' ? COORDINADORES_COMERCIAL : GERENTES_VISITA_MEDICA;
      const matchedMgr = allowedManagers.find(
        (m) => m.toUpperCase() === (repToEdit.gerenteDistrito || '').trim().toUpperCase()
      );
      setGerenteDistrito(matchedMgr || repToEdit.gerenteDistrito || allowedManagers[0]);

      // Secuencia que corresponda al representante (de su registro o de los últimos dígitos del código de sector)
      const repSec =
        repToEdit.secuencia?.trim() ||
        (repToEdit.codigoSector && repToEdit.codigoSector.replace(/\D/g, '').length >= 6
          ? repToEdit.codigoSector.replace(/\D/g, '').slice(-3)
          : '') ||
        (repToEdit.num ? String(repToEdit.num).padStart(3, '0') : '');

      setCodigoSector(repToEdit.codigoSector || '');
      setSecuencia(repSec);
      setFechaIngreso(repToEdit.fechaIngreso || '');
    } else {
      // Default empty values for new rep
      setNombre('');
      setCedula('');
      setTelefono('');
      setCorreo('');
      setStatus('ACTIVO');
      setRegion('');
      setCiudad('');
      setEstado('');
      setTipoRepresentante('Comercial');
      setUnidadNegocio('');
      setGerenteDistrito('');
      setCodigoSector('');
      // Para nuevo representante, correlativo asignado empezando por 104
      const nextCorr = String(getNextRepCorrelative(existingReps));
      setSecuencia(nextCorr);
      // No colocar fecha, solo mostrar el formato de ejemplo (DD/MM/AAAA)
      setFechaIngreso('');
    }
    setError(null);
    setShowDeleteConfirm(false);
  }, [repToEdit, isOpen]);

  // Bloquear desplazamiento del fondo cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegionChange = (newReg: string) => {
    setRegion(newReg);
    const seq = getRepSecuencia(repToEdit, secuencia, codigoSector);
    const generated = calculateSectorCode(newReg, unidadNegocio, seq);
    if (generated) {
      setCodigoSector(generated.code);
      setSecuencia(generated.seq);
    } else if (!isEditMode) {
      setCodigoSector('');
    }
  };

  const handleTipoChange = (nuevoTipo: 'Comercial' | 'Visita Médica') => {
    setTipoRepresentante(nuevoTipo);
    let targetUnit = unidadNegocio;
    if (nuevoTipo === 'Comercial') {
      targetUnit = 'COMERCIAL';
      setUnidadNegocio('COMERCIAL');
      if (!COORDINADORES_COMERCIAL.includes(gerenteDistrito)) {
        setGerenteDistrito(COORDINADORES_COMERCIAL[0]);
      }
    } else {
      if (unidadNegocio === 'COMERCIAL' || !unidadNegocio) {
        targetUnit = 'LA SANTE';
        setUnidadNegocio('LA SANTE');
      }
      if (!GERENTES_VISITA_MEDICA.includes(gerenteDistrito)) {
        setGerenteDistrito(GERENTES_VISITA_MEDICA[0]);
      }
    }

    const seq = getRepSecuencia(repToEdit, secuencia, codigoSector);
    const generated = calculateSectorCode(region, targetUnit, seq);
    if (generated) {
      setCodigoSector(generated.code);
      setSecuencia(generated.seq);
    } else if (!isEditMode) {
      setCodigoSector('');
    }
  };

  const handleUnidadChange = (nuevaUnidad: string) => {
    setUnidadNegocio(nuevaUnidad);
    if (nuevaUnidad === 'COMERCIAL') {
      setTipoRepresentante('Comercial');
      if (!COORDINADORES_COMERCIAL.includes(gerenteDistrito)) {
        setGerenteDistrito(COORDINADORES_COMERCIAL[0]);
      }
    } else if (tipoRepresentante === 'Comercial') {
      setTipoRepresentante('Visita Médica');
      if (!GERENTES_VISITA_MEDICA.includes(gerenteDistrito)) {
        setGerenteDistrito(GERENTES_VISITA_MEDICA[0]);
      }
    }

    const seq = getRepSecuencia(repToEdit, secuencia, codigoSector);
    const generated = calculateSectorCode(region, nuevaUnidad, seq);
    if (generated) {
      setCodigoSector(generated.code);
      setSecuencia(generated.seq);
    } else if (!isEditMode) {
      setCodigoSector('');
    }
  };

  const handleCodigoSectorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCodigoSector(val);
    const digits = val.replace(/\D/g, '');
    if (digits.length >= 6) {
      setSecuencia(digits.slice(-3));
    }
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 8);
    setCedula(onlyNums);
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.length < telefono.length) {
      setTelefono(val);
      return;
    }
    const digitsOnly = val.replace(/\D/g, '');
    if (val.length === 3 && !val.includes('-')) {
      val = `${val}-`;
    } else if (!val.includes('-') && digitsOnly.length > 3) {
      val = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 10)}`;
    }
    if (val.length > 11) {
      val = val.slice(0, 11);
    }
    setTelefono(val);
  };

  const handleFechaIngresoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    if (inputVal.length < fechaIngreso.length) {
      setFechaIngreso(inputVal);
      return;
    }
    const digits = inputVal.replace(/\D/g, '').slice(0, 8);
    if (digits.length === 0) {
      setFechaIngreso('');
      return;
    }
    let formatted = '';
    if (digits.length <= 2) {
      formatted = digits.length === 2 ? `${digits}/` : digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      if (digits.length === 4) {
        formatted += '/';
      }
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    setFechaIngreso(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setError('El nombre completo del representante es obligatorio.');
      return;
    }

    const cleanCedula = cedula.replace(/\D/g, '');
    if (!cleanCedula) {
      setError('La cédula de identidad es obligatoria (ej. 29904478).');
      return;
    }
    if (cleanCedula.length < 7 || cleanCedula.length > 8) {
      setError('La cédula de identidad debe contener entre 7 y 8 números (ej. 29904478).');
      return;
    }

    if (!telefono.trim()) {
      setError('El teléfono móvil es obligatorio (ej. 414-1234567).');
      return;
    }
    if (telefono.trim().length !== 11) {
      setError('El teléfono móvil debe tener exactamente 11 caracteres (ej. 414-1234567).');
      return;
    }

    if (!correo.trim()) {
      setError('El correo electrónico es obligatorio.');
      return;
    }
    if (!correo.includes('@') || !correo.includes('.')) {
      setError('Por favor ingresa un correo electrónico válido (ej. juan.perez@lasante.com.ve).');
      return;
    }

    if (!region.trim()) {
      setError('La región es obligatoria. Por favor selecciona una región.');
      return;
    }

    if (!ciudad.trim()) {
      setError('La ciudad es obligatoria.');
      return;
    }

    if (!estado.trim()) {
      setError('El estado es obligatorio.');
      return;
    }

    if (!tipoRepresentante) {
      setError('El tipo de representante es obligatorio.');
      return;
    }

    if (!unidadNegocio.trim()) {
      setError('La unidad de negocio es obligatoria. Por favor selecciona una opción.');
      return;
    }

    if (!gerenteDistrito.trim()) {
      setError(
        tipoRepresentante === 'Comercial'
          ? 'El coordinador comercial es obligatorio.'
          : 'El gerente de distrito es obligatorio.'
      );
      return;
    }

    let finalCodigoSector = codigoSector.trim();
    let finalSecuencia = secuencia.trim();
    if (!finalCodigoSector) {
      const generated = calculateSectorCode(region, unidadNegocio);
      if (generated) {
        finalCodigoSector = generated.code;
        finalSecuencia = generated.seq;
      }
    }
    if (!finalCodigoSector) {
      setError('El código de sector es obligatorio.');
      return;
    }

    if (!fechaIngreso.trim()) {
      setError('La fecha de ingreso es obligatoria (formato DD/MM/AAAA).');
      return;
    }
    if (fechaIngreso.trim().length !== 10 || !/^\d{2}\/\d{2}\/\d{4}$/.test(fechaIngreso.trim())) {
      setError('La fecha de ingreso debe tener un formato válido DD/MM/AAAA (ej. 15/01/2026).');
      return;
    }

    const updatedRep: Representante = {
      id: repToEdit ? repToEdit.id : `rep-${Date.now()}`,
      num: repToEdit?.num || String(Date.now()).slice(-4),
      nombre: nombre.trim().toUpperCase(),
      cedula: cleanCedula,
      telefono: telefono.trim(),
      correo: correo.trim().toLowerCase(),
      status: status.trim().toUpperCase(),
      region: region.trim(),
      ciudad: ciudad.trim().toUpperCase(),
      estado: estado.trim().toUpperCase(),
      unidadNegocio: getMappedUnit(unidadNegocio.trim()),
      tipoRepresentante,
      gerenteDistrito: gerenteDistrito.trim(),
      codigoSector: finalCodigoSector,
      secuencia: finalSecuencia,
      fechaIngreso: fechaIngreso.trim(),
    };

    // Guardar directamente en la aplicación y sincronizar con Google Sheets sin consultar
    const shouldSync = Boolean(linkedSheet);
    onSave(updatedRep, shouldSync);
    onClose();
  };

  const handleDelete = () => {
    if (repToEdit && onDelete) {
      onDelete(repToEdit.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#EAE5E1] w-full max-w-full sm:max-w-xl max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-x-hidden overflow-y-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed Header */}
        <div className="bg-gradient-to-r from-[#1A1A1E] to-[#2B2B36] text-white px-3.5 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between shrink-0 w-full max-w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl theme-gradient-bg flex items-center justify-center text-white shadow-2xs shrink-0">
              {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black tracking-tight truncate">
                {isEditMode ? 'Modificar Representante' : 'Nuevo Representante'}
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                Registra un nuevo representante en el Directorio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form - Flex container with scrollable fields */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 w-full max-w-full overflow-hidden">
          {/* Scrollable Fields Body (1 col on mobile, 2 cols on desktop) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 space-y-3 sm:space-y-4 w-full max-w-full">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 w-full">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Sección 1: Datos Personales y Contacto */}
            <div className="space-y-2.5 w-full">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#EAE5E1] pb-1">
                <User className="w-3.5 h-3.5 text-theme-primary" />
                <span>Identificación y Contacto</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
                <div className="w-full sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                    Nombre Completo <span className="text-theme-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: JUAN PEREZ"
                    className="w-full max-w-full px-3 py-2 text-sm font-semibold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                    Cédula de Identidad <span className="text-theme-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={7}
                    maxLength={8}
                    value={cedula}
                    onChange={handleCedulaChange}
                    placeholder="Ej: 29904478"
                    className="w-full max-w-full px-3 py-2 text-sm font-mono font-medium bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-theme-primary" />
                    <span>Teléfono Móvil <span className="text-theme-primary">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={11}
                    maxLength={11}
                    value={telefono}
                    onChange={handleTelefonoChange}
                    placeholder="414-1234567"
                    className="w-full max-w-full px-3 py-2 text-sm font-mono font-medium bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>

                <div className="w-full sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-theme-primary" />
                    <span>Correo Electrónico <span className="text-theme-primary">*</span></span>
                  </label>
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="juan.perez@lasante.com.ve"
                    className="w-full max-w-full px-3 py-2 text-sm font-medium bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Ubicación Geográfica */}
            {(() => {
              const currentGeo = REGION_GEO_MAP[getCleanRegion(region)] || REGION_GEO_MAP['CAPITAL ESTE'];
              const singleEjCiudad = currentGeo.ejCiudad;
              const matchedState = getStateForCity(ciudad);
              const singleEjEstado = matchedState ? `Ej: ${matchedState}` : currentGeo.ejEstado;
              const displayEstados = matchedState ? [matchedState] : currentGeo.estados;

              return (
                <div className="space-y-2.5 pt-1 w-full">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#EAE5E1] pb-1">
                    <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                    <span>Territorio y Ubicación</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
                    <div className="w-full sm:col-span-2">
                      <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                        Región <span className="text-theme-primary">*</span>
                      </label>
                      <select
                        required
                        value={region}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        className="w-full max-w-full px-3 py-2 text-sm font-bold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                      >
                        <option value="">-- Seleccionar Región --</option>
                        {REGION_OPTIONS.map((r) => {
                          const code = getRegionCode(r);
                          return (
                            <option key={r} value={r}>
                              {code ? `${code} - ${r}` : r}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="w-full">
                      <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                        Ciudad <span className="text-theme-primary">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        list="sugerencias-ciudades"
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        placeholder={singleEjCiudad}
                        className="w-full max-w-full px-3 py-2 text-sm font-semibold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                      />
                      <datalist id="sugerencias-ciudades">
                        {currentGeo.ciudades.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>

                    <div className="w-full">
                      <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                        Estado <span className="text-theme-primary">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        list="sugerencias-estados"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        placeholder={singleEjEstado}
                        className="w-full max-w-full px-3 py-2 text-sm font-semibold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                      />
                      <datalist id="sugerencias-estados">
                        {displayEstados.map((est) => (
                          <option key={est} value={est} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Sección 3: Asignación Corporativa */}
            <div className="space-y-2.5 pt-1 w-full">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-[#EAE5E1] pb-1">
                <Building className="w-3.5 h-3.5 text-theme-primary" />
                <span>Unidad de Negocio y Liderazgo</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
                <div className="w-full sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                    Tipo de Representante <span className="text-theme-primary">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => handleTipoChange('Comercial')}
                      className={`py-2 px-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        tipoRepresentante === 'Comercial'
                          ? 'bg-theme-primary text-white border-theme-primary shadow-2xs'
                          : 'bg-[#F8F4F2] text-slate-600 border-[#EAE5E1] hover:bg-white hover:text-[#1A1A1E]'
                      }`}
                    >
                      <span>Comercial</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTipoChange('Visita Médica')}
                      className={`py-2 px-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        tipoRepresentante === 'Visita Médica'
                          ? 'bg-theme-primary text-white border-theme-primary shadow-2xs'
                          : 'bg-[#F8F4F2] text-slate-600 border-[#EAE5E1] hover:bg-white hover:text-[#1A1A1E]'
                      }`}
                    >
                      <span>Visita Médica</span>
                    </button>
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1">
                    Unidad de Negocio <span className="text-theme-primary">*</span>
                  </label>
                  <select
                    required
                    value={unidadNegocio}
                    onChange={(e) => handleUnidadChange(e.target.value)}
                    className="w-full max-w-full px-3 py-2 text-sm font-bold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  >
                    <option value="">-- Seleccionar Unidad de Negocio --</option>
                    {UNIDADES_OPTIONS.map((u) => {
                      const code = getUnidadCode(u);
                      const formattedLabel = u.replace(/ /g, '_');
                      return (
                        <option key={u} value={u}>
                          {code ? `${code} - ${formattedLabel}` : u}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-theme-primary" />
                    <span>
                      {tipoRepresentante === 'Comercial'
                        ? 'Coordinador Comercial'
                        : 'Gerente de Distrito'}{' '}
                      <span className="text-theme-primary">*</span>
                    </span>
                  </label>
                  <select
                    required
                    value={gerenteDistrito}
                    onChange={(e) => setGerenteDistrito(e.target.value)}
                    className="w-full max-w-full px-3 py-2 text-sm font-bold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  >
                    <option value="">
                      {tipoRepresentante === 'Comercial'
                        ? 'Seleccionar Coordinador'
                        : 'Seleccionar Gerente de Distrito'}
                    </option>
                    {(tipoRepresentante === 'Comercial'
                      ? COORDINADORES_COMERCIAL
                      : GERENTES_VISITA_MEDICA
                    ).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <IdCard className="w-3 h-3 text-slate-500" />
                      <span>
                        Código de Sector <span className="text-theme-primary">*</span>
                      </span>
                    </span>
                    {codigoSector && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        Código Asignado
                      </span>
                    )}
                  </label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      required
                      value={codigoSector}
                      onChange={handleCodigoSectorChange}
                      placeholder="Ej: 141104"
                      className="w-full max-w-full px-3 py-2 text-sm font-mono font-bold bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                    />
                  </div>
                  {codigoSector ? (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-900 font-mono bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 flex-wrap">
                      <span className="font-bold text-emerald-700" title="Prefijo fijo">1</span>
                      <span className="text-slate-400 font-sans">+</span>
                      <span className="font-bold text-blue-700" title={`Región: ${region}`}>
                        {getRegionCode(region) || '?'}{' '}
                        <span className="font-sans text-[10px] text-blue-600">({region})</span>
                      </span>
                      <span className="text-slate-400 font-sans">+</span>
                      <span className="font-bold text-purple-700" title={`Unidad: ${unidadNegocio}`}>
                        {getUnidadCode(unidadNegocio) || '?'}{' '}
                        <span className="font-sans text-[10px] text-purple-600">({unidadNegocio})</span>
                      </span>
                      <span className="text-slate-400 font-sans">+</span>
                      <span
                        className="font-bold text-amber-700"
                        title={`Secuencia del representante: ${getRepSecuencia(repToEdit, secuencia, codigoSector)}`}
                      >
                        {getRepSecuencia(repToEdit, secuencia, codigoSector)}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-500 font-medium leading-snug">
                      {!region && !unidadNegocio
                        ? 'El código único se generará automáticamente al seleccionar la Región y la Unidad de Negocio (ej. 141104).'
                        : !region
                        ? 'Selecciona una Región para completar los parámetros del código.'
                        : 'Selecciona una Unidad de Negocio para completar los parámetros del código.'}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-[#1A1A1E] mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>
                      Fecha de Ingreso <span className="text-theme-primary">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={fechaIngreso}
                    onChange={handleFechaIngresoChange}
                    placeholder="DD/MM/AAAA"
                    className="w-full max-w-full px-3 py-2 text-sm font-mono font-medium bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl focus:outline-none focus:border-theme-primary focus:bg-white transition-all text-[#1A1A1E]"
                  />
                </div>
              </div>
            </div>

            <div className="hidden" aria-hidden="true"></div>
          </div>

          {/* Modal Actions - Sticky Bottom Footer */}
          <div className="shrink-0 p-3 border-t border-[#EAE5E1] bg-[#FAF8F7] flex flex-col gap-2 w-full max-w-full">
            {isEditMode && onDelete && (
              <div className="w-full">
                {showDeleteConfirm ? (
                  <div className="flex items-center justify-between gap-2 bg-red-50 p-2 rounded-xl border border-red-200">
                    <span className="text-xs text-red-600 font-bold">¿Confirmar eliminación?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50/70 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar representante</span>
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-3 py-2 text-sm font-bold text-slate-600 hover:text-[#1A1A1E] bg-white hover:bg-[#F8F4F2] border border-[#EAE5E1] rounded-xl transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-xl shadow-2xs transition-all cursor-pointer text-center"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span className="truncate">{isEditMode ? 'Guardar' : 'Registrar'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
