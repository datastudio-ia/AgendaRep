import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Representante, GerenteDistrito, ViewMode, isRepComercial, isRepActive } from '../types/contact';
import {
  MapPin,
  Users,
  Briefcase,
  Stethoscope,
  ChevronRight,
  ChevronDown,
  Check,
  ShieldCheck,
  Phone,
  MessageCircle,
  X,
  Compass,
  Layers,
  Sparkles,
  Search,
  Filter,
  Download,
  Eye,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { getWhatsAppUrl, getTelUrl, downloadVCard } from '../utils/phoneUtils';
import { VENEZUELA_STATES_PATHS, VenezuelaStatePath } from '../data/venezuelaSvgMap';
import { ThemeId } from '../types/theme';

interface CoverageMapProps {
  reps: Representante[];
  gds: GerenteDistrito[];
  viewMode: ViewMode;
  onSelectRep: (rep: Representante) => void;
  onSelectGd: (gd: GerenteDistrito) => void;
  onFilterByManager: (managerName: string) => void;
  onFilterByRegion?: (region: string) => void;
  currentTheme?: ThemeId;
}

export interface RegionConfig {
  code: string;
  name: string;
  color: string;
  fill: string;
  hoverFill: string;
  stroke: string;
  badgeBg: string;
  badgeText: string;
  lightBg: string;
  borderColor: string;
  statesList: string[];
  description: string;
}

export const REGIONS_CONFIG: Record<string, RegionConfig> = {
  '2 - CAPITAL ESTE': {
    code: '2 - CAPITAL ESTE',
    name: 'Capital Este',
    color: '#9333EA', // Violeta / Morado para diferenciar Capital Este
    fill: '#9333EA',
    hoverFill: '#A855F7',
    stroke: '#D8B4FE',
    badgeBg: 'bg-[#9333EA]',
    badgeText: 'text-white',
    lightBg: 'bg-[#9333EA]/15',
    borderColor: 'border-[#9333EA]/50',
    statesList: ['Miranda / Caracas Este'],
    description: 'Caracas Este y Estado Miranda',
  },
  '3 - CAPITAL OESTE': {
    code: '3 - CAPITAL OESTE',
    name: 'Capital Oeste',
    color: '#BE06A2', // Fucsia / Magenta
    fill: '#BE06A2',
    hoverFill: '#D500F9',
    stroke: '#F472B6',
    badgeBg: 'bg-[#BE06A2]',
    badgeText: 'text-white',
    lightBg: 'bg-[#BE06A2]/15',
    borderColor: 'border-[#BE06A2]/50',
    statesList: ['Distrito Capital (Caracas)'],
    description: 'Caracas Centro-Oeste y Libertador',
  },
  '4 - CENTRO': {
    code: '4 - CENTRO',
    name: 'Centro',
    color: '#ED1626', // Rojo Carmesí
    fill: '#ED1626',
    hoverFill: '#FF1744',
    stroke: '#FDA4AF',
    badgeBg: 'bg-[#ED1626]',
    badgeText: 'text-white',
    lightBg: 'bg-[#ED1626]/15',
    borderColor: 'border-[#ED1626]/50',
      statesList: ['Carabobo', 'Aragua', 'Apure'],
    description: 'Carabobo (Valencia), Aragua (Maracay) y Apure',
  },
  '1 - ANDES': {
    code: '1 - ANDES',
    name: 'Andes',
    color: '#02A74B', // Verde Esmeralda
    fill: '#02A74B',
    hoverFill: '#00C853',
    stroke: '#69F0AE',
    badgeBg: 'bg-[#02A74B]',
    badgeText: 'text-white',
    lightBg: 'bg-[#02A74B]/15',
    borderColor: 'border-[#02A74B]/50',
    statesList: ['Táchira', 'Mérida', 'Trujillo'],
    description: 'Táchira, Mérida y Trujillo',
  },
  '6 - OCCIDENTE': {
    code: '6 - OCCIDENTE',
    name: 'Occidente',
    color: '#FEF800', // Amarillo Occidente
    fill: '#FEF800',
    hoverFill: '#FFD600',
    stroke: '#FFF566',
    badgeBg: 'bg-[#FEF800]',
    badgeText: 'text-slate-950',
    lightBg: 'bg-[#FEF800]/20',
    borderColor: 'border-[#FEF800]/60',
    statesList: ['Zulia', 'Falcón'],
    description: 'Zulia (Maracaibo) y Falcón (Punto Fijo)',
  },
  '7 - ORIENTE': {
    code: '7 - ORIENTE',
    name: 'Oriente',
    color: '#0189C3', // Azul Oriente
    fill: '#0189C3',
    hoverFill: '#00B0FF',
    stroke: '#7DD3FC',
    badgeBg: 'bg-[#0189C3]',
    badgeText: 'text-white',
    lightBg: 'bg-[#0189C3]/15',
    borderColor: 'border-[#0189C3]/50',
    statesList: ['Anzoátegui', 'Bolívar', 'Monagas', 'Sucre'],
    description: 'Anzoátegui, Bolívar, Monagas y Sucre',
  },
  '5 - CENTRO OCCIDENTE': {
    code: '5 - CENTRO OCCIDENTE',
    name: 'Centro Occidente',
    color: '#FA6D04', // Naranja Intenso
    fill: '#FA6D04',
    hoverFill: '#FF6D00',
    stroke: '#FDBA74',
    badgeBg: 'bg-[#FA6D04]',
    badgeText: 'text-white',
    lightBg: 'bg-[#FA6D04]/15',
    borderColor: 'border-[#FA6D04]/50',
    statesList: ['Lara', 'Barinas'],
    description: 'Lara (Barquisimeto) y Barinas',
  },
};

export function resolveRegionCodeFromRaw(rawRegion?: string | null): string | null {
  if (!rawRegion) return null;
  const clean = rawRegion
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^\d+\s*-\s*/, '')
    .trim();

  if (clean === 'CENTRO OCCIDENTE' || clean === 'CENTRO-OCCIDENTE' || (clean.includes('CENTRO') && clean.includes('OCCIDENTE'))) {
    return '5 - CENTRO OCCIDENTE';
  }
  if (clean === 'CAPITAL ESTE' || clean === 'CAPITAL-ESTE' || (clean.includes('CAPITAL') && clean.includes('ESTE'))) {
    return '2 - CAPITAL ESTE';
  }
  if (clean === 'CAPITAL OESTE' || clean === 'CAPITAL-OESTE' || (clean.includes('CAPITAL') && clean.includes('OESTE'))) {
    return '3 - CAPITAL OESTE';
  }
  if (clean === 'ANDES' || clean.includes('ANDE')) {
    return '1 - ANDES';
  }
  if (clean === 'CENTRO' || clean.startsWith('CENTRO')) {
    return '4 - CENTRO';
  }
  if (clean === 'OCCIDENTE' || clean.includes('OCCIDENTE')) {
    return '6 - OCCIDENTE';
  }
  if (clean === 'ORIENTE' || clean.includes('ORIENTE')) {
    return '7 - ORIENTE';
  }
  return null;
}

export const REFERENCE_STATE_COLORS: Record<
  string,
  { fill: string; stroke: string; glow: string; regionName: string }
> = {
  // 1 - ANDES: Táchira, Mérida, Trujillo (Verde Esmeralda)
  VES: { fill: '#02A74B', stroke: '#6EE7B7', glow: '#02A74B', regionName: 'Andes' },
  VEL: { fill: '#02A74B', stroke: '#6EE7B7', glow: '#02A74B', regionName: 'Andes' },
  VET: { fill: '#02A74B', stroke: '#6EE7B7', glow: '#02A74B', regionName: 'Andes' },

  // 2 - CAPITAL ESTE: Miranda / Caracas Este (Violeta)
  VEM: { fill: '#9333EA', stroke: '#D8B4FE', glow: '#9333EA', regionName: 'Capital Este' },

  // 3 - CAPITAL OESTE: Distrito Capital / Caracas Oeste (Fucsia / Magenta)
  VEA: { fill: '#BE06A2', stroke: '#F472B6', glow: '#BE06A2', regionName: 'Capital Oeste' },
  VEX: { fill: '#BE06A2', stroke: '#F472B6', glow: '#BE06A2', regionName: 'Capital Oeste' },

  // 4 - CENTRO: Carabobo, Aragua, Cojedes, Guárico, Apure (Rojo Carmesí)
  VEG: { fill: '#ED1626', stroke: '#FDA4AF', glow: '#ED1626', regionName: 'Centro' },
  VED: { fill: '#ED1626', stroke: '#FDA4AF', glow: '#ED1626', regionName: 'Centro' },
  VEJ: { fill: '#ED1626', stroke: '#FDA4AF', glow: '#ED1626', regionName: 'Centro' },
  VEH: { fill: '#ED1626', stroke: '#FDA4AF', glow: '#ED1626', regionName: 'Centro' },
  VEC: { fill: '#ED1626', stroke: '#FDA4AF', glow: '#ED1626', regionName: 'Centro' },

  // 5 - CENTRO OCCIDENTE: Lara, Barinas (Naranja Intenso según Base de Datos)
  VEK: { fill: '#FA6D04', stroke: '#FDBA74', glow: '#FA6D04', regionName: 'Centro Occidente' },
  VEE: { fill: '#FA6D04', stroke: '#FDBA74', glow: '#FA6D04', regionName: 'Centro Occidente' },
  VEU: { fill: '#FA6D04', stroke: '#FDBA74', glow: '#FA6D04', regionName: 'Centro Occidente' },
  VEP: { fill: '#FA6D04', stroke: '#FDBA74', glow: '#FA6D04', regionName: 'Centro Occidente' },

  // 6 - OCCIDENTE: Zulia, Falcón (Amarillo según Base de Datos)
  VEV: { fill: '#FEF800', stroke: '#FFF566', glow: '#FEF800', regionName: 'Occidente' },
  VEI: { fill: '#FEF800', stroke: '#FFF566', glow: '#FEF800', regionName: 'Occidente' },

  // 7 - ORIENTE: Anzoátegui, Bolívar, Monagas, Sucre (Azul según Base de Datos)
  VEB: { fill: '#0189C3', stroke: '#7DD3FC', glow: '#0189C3', regionName: 'Oriente' },
  VEF: { fill: '#0189C3', stroke: '#7DD3FC', glow: '#0189C3', regionName: 'Oriente' },
  VEN: { fill: '#0189C3', stroke: '#7DD3FC', glow: '#0189C3', regionName: 'Oriente' },
  VER: { fill: '#0189C3', stroke: '#7DD3FC', glow: '#0189C3', regionName: 'Oriente' },
  VEO: { fill: '#0189C3', stroke: '#7DD3FC', glow: '#0189C3', regionName: 'Oriente' },

  // Estados sin cobertura en la base de datos
  VEW: { fill: '#94A3B8', stroke: '#CBD5E1', glow: '#94A3B8', regionName: 'Sin cobertura' },
  VEZ: { fill: '#94A3B8', stroke: '#CBD5E1', glow: '#94A3B8', regionName: 'Sin cobertura' },
  VEY: { fill: '#94A3B8', stroke: '#CBD5E1', glow: '#94A3B8', regionName: 'Sin cobertura' },
};

// Coordenadas calibradas con separación garantizada para letras de gran tamaño (sin solapamiento)
export const STATE_PIN_LAYOUT: Record<string, { cx: number; cy: number; label: string }> = {
  VEA: { cx: 462, cy: 148, label: 'Caracas' },
  VEM: { cx: 544, cy: 195, label: 'Miranda' },
  VED: { cx: 456, cy: 246, label: 'Aragua' },
  VEG: { cx: 366, cy: 190, label: 'Carabobo' },
  VEK: { cx: 280, cy: 190, label: 'Lara' },
  VEI: { cx: 290, cy: 110, label: 'Falcón' },
  VEV: { cx: 128, cy: 205, label: 'Zulia' },
  VEE: { cx: 288, cy: 318, label: 'Barinas' },
  VEC: { cx: 312, cy: 398, label: 'Apure' },
  VET: { cx: 232, cy: 258, label: 'Trujillo' },
  VEL: { cx: 182, cy: 314, label: 'Mérida' },
  VES: { cx: 122, cy: 380, label: 'Táchira' },
  VEB: { cx: 635, cy: 265, label: 'Anzoátegui' },
  VEN: { cx: 750, cy: 245, label: 'Monagas' },
  VER: { cx: 725, cy: 146, label: 'Sucre' },
  VEF: { cx: 686, cy: 454, label: 'Bolívar' },
};

export const STATE_DESCRIPTIONS: Record<string, string> = {
  VEA: 'Caracas (Libertador)',
  VEM: 'Caracas Este (Baruta, Chacao, Sucre, El Hatillo)',
  VEG: 'Valencia',
  VED: 'Maracay',
  VEK: 'Barquisimeto',
  VEV: 'Maracaibo',
  VEB: 'Barcelona, Lechería',
  VEF: 'Puerto Ordaz, Ciudad Bolívar',
  VEE: 'Barinas',
  VEC: 'San Fernando de Apure',
  VEI: 'Punto Fijo',
  VEN: 'Maturín',
  VER: 'Cumaná',
  VES: 'San Cristóbal',
  VEL: 'Mérida',
  VET: 'Valera',
  VEX: 'Sin representantes asignados',
  VEU: 'Sin representantes asignados',
  VEJ: 'Sin representantes asignados',
  VEZ: 'Sin representantes asignados',
  VEY: 'Sin representantes asignados',
  VEP: 'Sin representantes asignados',
  VEH: 'Sin representantes asignados',
  VEO: 'Margarita, Coche y Cubagua · Sin representantes asignados',
  VEW: 'Los Roques, La Orchila, La Tortuga, La Blanquilla · Sin representantes asignados',
};

// Sombra base limpia continental (sin islas) para dar profundidad y nitidez sin relieve interno
const COMBINED_EXTRUSION_PATH = VENEZUELA_STATES_PATHS
  .filter((st) => st.id !== 'VEW' && st.id !== 'VEO')
  .map((st) => st.d)
  .join(' ');

const CANONICAL_UNITS = [
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

const normalizeUnitName = (rawUnit?: string): string => {
  const u = (rawUnit || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (!u) return 'SIN UNIDAD';
  if (u.includes('HIBRIDA 1') || u.includes('H1')) return 'LINEA HIBRIDA 1';
  if (u.includes('HIBRIDA 2') || u.includes('H2')) return 'LINEA HIBRIDA 2';
  if (u.includes('HIBRIDA 3') || u.includes('H3')) return 'LINEA HIBRIDA 3';
  if (u.includes('LINEA 1') || u === 'L1') return 'LINEA 1';
  if (u.includes('LINEA 2') || u === 'L2') return 'LINEA 2';
  if (u.includes('LINEA 3') || u === 'L3') return 'LINEA 3';
  if (u.includes('LA SANTE') || u.includes('SANTE')) return 'LA SANTE';
  if (u.includes('OTC')) return 'OTC';
  if (u.includes('COMERCIAL')) return 'COMERCIAL';
  return u;
};

// Función rápida para sombrear un color hexadecimal sin duplicar nodos <path> en el DOM
const shadeHexColor = (hex: string, darkness: number): string => {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  // Mezclar hacia slate-900 (#0F172A -> 15, 23, 42)
  const nr = Math.round(r * (1 - darkness) + 15 * darkness);
  const ng = Math.round(g * (1 - darkness) + 23 * darkness);
  const nb = Math.round(b * (1 - darkness) + 42 * darkness);
  return `rgb(${nr}, ${ng}, ${nb})`;
};

export interface UnitCountItem {
  unit: string;
  count: number;
}

interface EnrichedState extends VenezuelaStatePath {
  regionName: string;
  hasReps: boolean;
  totalReps: number;
  actualRepsCount: number;
  isSatelliteZone: boolean;
  comerciales: number;
  visitaMedica: number;
  unitBreakdown: UnitCountItem[];
  repsList: Representante[];
  gdsList: GerenteDistrito[];
  regionConf: RegionConfig | null;
  description: string;
}

interface VenezuelaVectorMapProps {
  enrichedStates: EnrichedState[];
  selectedStateId: string | null;
  selectedRegionFilter: string | null;
  onSelectState: (stateId: string | null) => void;
}

const GRID_D1 = [-600, -400, -200, 0, 200, 400, 600, 800, 1000, 1200, 1400];
const GRID_D2 = [-200, 0, 200, 400, 600, 800, 1000, 1200, 1400, 1600];

// Subcomponente estático memoizado para el fondo, cuadrícula y bisel 3D a 90 grados (con geometría cacheada en <defs>)
const StaticMapBackdropAndBevel: React.FC = React.memo(() => (
  <>
    <defs>
      <linearGradient id="softBackdropGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="52%" stopColor="#DBEAFE" />
        <stop offset="100%" stopColor="#BFDBFE" />
      </linearGradient>
      <path id="ve-continent-extrusion" d={COMBINED_EXTRUSION_PATH} />
    </defs>

    {/* 1. FONDO TENUE Y DEGRADADO EN AZUL */}
    <rect x="0" y="0" width="1000" height="877" fill="url(#softBackdropGradient)" />

    {/* 2. CUADRÍCULA GEOMÉTRICA SUTIL */}
    <g className="soft-grid" stroke="#3B82F6" strokeWidth="0.6" opacity="0.1" pointerEvents="none">
      {GRID_D1.map((x, i) => (
        <line key={`grid-d1-${i}`} x1={x} y1="0" x2={x + 1100} y2="877" />
      ))}
      {GRID_D2.map((x, i) => (
        <line key={`grid-d2-${i}`} x1={x} y1="0" x2={x - 1100} y2="877" />
      ))}
    </g>

    {/* 3. BISEL 3D DEL MAPA CON ÁNGULO GLOBAL DE 90 GRADOS (VERTICAL) */}
    <g className="map-depth-layer" pointerEvents="none">
      {/* Sombra proyectada a 90° */}
      <use
        href="#ve-continent-extrusion"
        transform="translate(0, 13)"
        fill="rgba(71, 85, 105, 0.16)"
        stroke="none"
      />
      {/* Nivel inferior del bisel 3D a 90° */}
      <use
        href="#ve-continent-extrusion"
        transform="translate(0, 8)"
        fill="#94A3B8"
        stroke="#64748B"
        strokeWidth="1.4"
      />
      {/* Nivel medio del bisel 3D a 90° */}
      <use
        href="#ve-continent-extrusion"
        transform="translate(0, 4)"
        fill="#CBD5E1"
        stroke="#94A3B8"
        strokeWidth="1.2"
      />
    </g>
  </>
));

interface StatePolygonItemProps {
  st: EnrichedState;
  isSelected: boolean;
  isRegionFilteredOut: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const StatePolygonItem: React.FC<StatePolygonItemProps> = React.memo(
  ({ st, isSelected, isRegionFilteredOut, onSelect, onHover }) => {
    const hasReps = Boolean(st.hasReps && st.totalReps > 0);

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(st.id);
      },
      [onSelect, st.id]
    );

    const handleMouseEnter = useCallback(() => {
      onHover(st.id);
    }, [onHover, st.id]);

    const handleMouseLeave = useCallback(() => {
      onHover(null);
    }, [onHover]);

    if (!hasReps) {
      return (
        <g
          className="cursor-pointer hover:brightness-[0.95]"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <path
            d={st.d}
            fill={isSelected ? '#CBD5E1' : '#EBF1F7'}
            fillOpacity={isRegionFilteredOut ? 0.55 : 1.0}
            stroke="#94A3B8"
            strokeWidth={1.35}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    }

    const baseHex =
      st.regionConf?.fill ||
      REFERENCE_STATE_COLORS[st.id]?.fill ||
      '#0189C3';

    // Sombreado directo en un único <path> (sin remarcar en negro y con hover por GPU CSS)
    const computedFill = isSelected ? shadeHexColor(baseHex, 0.27) : baseHex;
    const strokeWidth = isSelected ? 2.2 : 1.75;
    const fillOpacity = isRegionFilteredOut ? 0.28 : 1.0;
    const strokeOpacity = isRegionFilteredOut ? 0.5 : 1.0;

    return (
      <g
        className="cursor-pointer hover:brightness-[0.91]"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <path
          d={st.d}
          fill={computedFill}
          fillOpacity={fillOpacity}
          stroke="#FFFFFF"
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    );
  }
);

interface StatePinItemProps {
  st: EnrichedState;
  isSelected: boolean;
  isRegionFilteredOut: boolean;
}

const StatePinItem: React.FC<StatePinItemProps> = React.memo(
  ({ st, isSelected, isRegionFilteredOut }) => {
    const basePinFill =
      st.regionConf?.fill ||
      REFERENCE_STATE_COLORS[st.id]?.fill ||
      '#02A74B';

    const pinFill = isSelected ? shadeHexColor(basePinFill, 0.22) : basePinFill;
    const layout = STATE_PIN_LAYOUT[st.id] || { cx: st.cx, cy: st.cy, label: st.name };
    const opacity = isRegionFilteredOut ? 0.25 : 1.0;
    const scale = isSelected ? 1.12 : 1.0;

    const labelText = layout.label;
    const pillWidth = Math.max(58, labelText.length * 7.8 + 18);
    const pillHeight = 22;

    return (
      <g
        transform={`translate(${layout.cx}, ${layout.cy}) scale(${scale})`}
        opacity={opacity}
      >
        {/* Sombra suave del pin */}
        <circle r="15" cy="2.5" fill="rgba(15, 23, 42, 0.28)" />

        {/* Círculo con contador de representantes */}
        <circle
          r="13.5"
          fill={pinFill}
          stroke="#FFFFFF"
          strokeWidth="2.4"
        />
        <text
          textAnchor="middle"
          dy="4.5"
          fill={basePinFill === '#FEF800' && !isSelected ? '#0F172A' : '#FFFFFF'}
          fontSize="12.5"
          fontWeight="900"
          fontFamily="monospace"
        >
          {st.totalReps}
        </text>

        {/* Etiqueta del estado */}
        <g transform="translate(0, 16.5)">
          <rect
            x={-pillWidth / 2}
            y="2"
            width={pillWidth}
            height={pillHeight}
            rx="6.5"
            fill="rgba(15, 23, 42, 0.24)"
          />
          <rect
            x={-pillWidth / 2}
            y="0"
            width={pillWidth}
            height={pillHeight}
            rx="6.5"
            fill="rgba(15, 23, 42, 0.90)"
            stroke="#FFFFFF"
            strokeWidth="1.4"
          />
          <text
            textAnchor="middle"
            y="15"
            fill="#FFFFFF"
            fontSize="11.5"
            fontWeight="800"
            letterSpacing="-0.2px"
          >
            {labelText}
          </text>
        </g>
      </g>
    );
  }
);

interface MemoizedSvgCanvasProps {
  orderedStates: EnrichedState[];
  activePinStates: EnrichedState[];
  selectedStateId: string | null;
  selectedRegionFilter: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

// El lienzo SVG nunca se re-renderiza cuando cambia hoveredStateId (cero mutaciones SVG en hover)
const MemoizedSvgCanvas: React.FC<MemoizedSvgCanvasProps> = React.memo(
  ({ orderedStates, activePinStates, selectedStateId, selectedRegionFilter, onSelect, onHover }) => (
    <svg
      viewBox="25 32 950 825"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Capas estáticas memoizadas: Fondo, Cuadrícula y Bisel 3D a 90° */}
      <StaticMapBackdropAndBevel />

      {/* 4. CAPA DE ESTADOS VECTORIALES CON BORDES DEFINIDOS Y SOMBREADO AL SELECCIONAR */}
      <g className="states-layer">
        {orderedStates.map((st) => (
          <StatePolygonItem
            key={st.id}
            st={st}
            isSelected={selectedStateId === st.id}
            isRegionFilteredOut={selectedRegionFilter !== null && st.region !== selectedRegionFilter}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </g>

      {/* 5. CAPA DE PINES Y ETIQUETAS DE ALTA NITIDEZ (pointerEvents="none" evita parpadeo en hover) */}
      <g className="pins-layer" pointerEvents="none">
        {activePinStates.map((st) => (
          <StatePinItem
            key={`pin-${st.id}`}
            st={st}
            isSelected={selectedStateId === st.id}
            isRegionFilteredOut={selectedRegionFilter !== null && st.region !== selectedRegionFilter}
          />
        ))}
      </g>
    </svg>
  )
);

const VenezuelaVectorMap: React.FC<VenezuelaVectorMapProps> = React.memo(
  ({ enrichedStates, selectedStateId, selectedRegionFilter, onSelectState }) => {
    const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

    // Ordenar capas para que los estados activos (con borde blanco nítido) siempre se dibujen encima de los inactivos
    const orderedStates = useMemo(() => {
      return [...enrichedStates].sort((a, b) => {
        const aActive = a.hasReps && a.totalReps > 0 ? 1 : 0;
        const bActive = b.hasReps && b.totalReps > 0 ? 1 : 0;
        return aActive - bActive;
      });
    }, [enrichedStates]);

    const activePinStates = useMemo(
      () => enrichedStates.filter((st) => Boolean(st.hasReps && st.totalReps > 0)),
      [enrichedStates]
    );

    const hoveredState = useMemo(
      () => (hoveredStateId ? enrichedStates.find((s) => s.id === hoveredStateId) || null : null),
      [hoveredStateId, enrichedStates]
    );

    const handlePolygonSelect = useCallback(
      (id: string) => {
        onSelectState(selectedStateId === id ? null : id);
      },
      [onSelectState, selectedStateId]
    );

    const handlePolygonHover = useCallback((id: string | null) => {
      setHoveredStateId(id);
    }, []);

    return (
      <div
        className="relative w-full aspect-[1000/877] flex items-center justify-center my-auto overflow-hidden rounded-2xl select-none"
        style={{
          contain: 'layout paint',
          touchAction: 'pan-y',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 52%, #BFDBFE 100%)',
        }}
        onClick={() => onSelectState(null)}
      >
        <MemoizedSvgCanvas
          orderedStates={orderedStates}
          activePinStates={activePinStates}
          selectedStateId={selectedStateId}
          selectedRegionFilter={selectedRegionFilter}
          onSelect={handlePolygonSelect}
          onHover={handlePolygonHover}
        />

        {/* FLOATING TOOLTIP ON HOVER */}
        {hoveredState && (
          <div className="absolute top-3.5 right-3.5 pointer-events-none bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-white/20 min-w-[220px] max-w-[270px] z-30">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-xs border border-white/40 shrink-0"
                style={{
                  backgroundColor: hoveredState.hasReps
                    ? hoveredState.regionConf?.color ||
                      REFERENCE_STATE_COLORS[hoveredState.id]?.fill ||
                      '#0189C3'
                    : '#CBD5E1',
                }}
              />
              <span className="text-[10px] uppercase font-black text-sky-300 tracking-wider truncate">
                {hoveredState.hasReps
                  ? hoveredState.regionConf?.name ||
                    REFERENCE_STATE_COLORS[hoveredState.id]?.regionName ||
                    hoveredState.regionName
                  : hoveredState.regionName || 'Sin cobertura activa'}
              </span>
            </div>
            <div className="text-sm font-black text-white">{hoveredState.name}</div>
            <div className="mt-2 pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400 font-mono">
                {hoveredState.totalReps} Representantes
              </span>
              <span className="text-slate-300 text-[10px]">
                {hoveredState.comerciales} Com / {hoveredState.visitaMedica} Méd
              </span>
            </div>
            {hoveredState.unitBreakdown.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-800/90 flex flex-wrap gap-1">
                {hoveredState.unitBreakdown.map((u) => (
                  <span
                    key={u.unit}
                    className="inline-flex items-center gap-1 text-[9.5px] font-bold bg-slate-800/95 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700"
                  >
                    <span className="truncate max-w-[115px]">{u.unit}</span>
                    <span className="font-mono font-black text-sky-300">{u.count}</span>
                  </span>
                ))}
              </div>
            )}
            <div className="text-[9px] text-slate-400 mt-1.5 italic">
              Clic para inspeccionar unidades y equipo
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Pre-normalizar nombres de estados del mapa una sola vez al cargar el módulo
const NORMALIZED_STATE_META = VENEZUELA_STATES_PATHS.map((st) => ({
  st,
  stNameUpper: st.name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
}));

const computeMatchingStateIdsForRep = (r: Representante): Set<string> => {
  const repStateUpper = (r.estado || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const repCityUpper = (r.ciudad || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const repRegionUpper = (r.region || '').toUpperCase();
  const matchedIds = new Set<string>();

  for (const { st, stNameUpper } of NORMALIZED_STATE_META) {
    let matches = false;
    if (st.id === 'VEA') {
      matches =
        (repStateUpper.includes('DISTRITO CAPITAL') ||
          repStateUpper.includes('CARACAS') ||
          repCityUpper.includes('CARACAS')) &&
        repRegionUpper.includes('CAPITAL OESTE');
    } else if (st.id === 'VEM') {
      matches = repRegionUpper.includes('CAPITAL ESTE') || repStateUpper.includes('MIRANDA');
    } else if (st.id === 'VEX') {
      matches = false;
    } else if (st.id === 'VEJ') {
      matches =
        repStateUpper.includes('GUARICO') ||
        repCityUpper.includes('CALABOZO') ||
        repCityUpper.includes('SAN JUAN');
    } else if (st.id === 'VEU') {
      matches = repStateUpper.includes('YARACUY') || repCityUpper.includes('SAN FELIPE');
    } else if (st.id === 'VEC') {
      matches =
        repStateUpper.includes('APURE') ||
        repCityUpper.includes('APURE') ||
        repCityUpper.includes('SAN FERNANDO') ||
        repCityUpper.includes('BIRUACA') ||
        repCityUpper.includes('GUASDUALITO') ||
        repCityUpper.includes('ACHAGUAS');
    } else {
      matches = repStateUpper === stNameUpper || repStateUpper.includes(stNameUpper);
    }
    if (matches) matchedIds.add(st.id);
  }
  return matchedIds;
};

interface RegionStatItem extends RegionConfig {
  statesInRegion: EnrichedState[];
  totalReps: number;
  comCount: number;
  medCount: number;
  leadersCount: number;
}

interface MapHeaderControlsProps {
  regionStats: RegionStatItem[];
  unitFilterStats: { totalScoped: number; items: UnitCountItem[] };
  selectedRegionFilter: string | null;
  selectedUnitFilter: string | null;
  selectedStateId: string | null;
  activeStateName: string | null;
  repFilterType: 'all' | 'comercial' | 'medica';
  totalRepsCovered: number;
  totalActiveRepsCount: number;
  onSelectRegion: (code: string | null) => void;
  onSelectUnit: (unit: string | null) => void;
  onResetAll: () => void;
  onCloseStateSelection: () => void;
}

// Subcomponente aislado para los menús desplegables Region y Linea: abrir/cerrar menús es instantáneo (<0.5ms) sin re-renderizar el mapa
const MapHeaderControls: React.FC<MapHeaderControlsProps> = React.memo(
  ({
    regionStats,
    unitFilterStats,
    selectedRegionFilter,
    selectedUnitFilter,
    selectedStateId,
    activeStateName,
    repFilterType,
    totalRepsCovered,
    totalActiveRepsCount,
    onSelectRegion,
    onSelectUnit,
    onResetAll,
    onCloseStateSelection,
  }) => {
    const [openMenu, setOpenMenu] = useState<'region' | 'linea' | null>(null);
    const controlsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!openMenu) return;
      const handleClickOutside = (event: MouseEvent) => {
        if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
          setOpenMenu(null);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [openMenu]);

    const activeRegionObj = useMemo(
      () => (selectedRegionFilter ? regionStats.find((r) => r.code === selectedRegionFilter) || null : null),
      [selectedRegionFilter, regionStats]
    );

    const activeUnitObj = useMemo(
      () => (selectedUnitFilter ? unitFilterStats.items.find((u) => u.unit === selectedUnitFilter) || null : null),
      [selectedUnitFilter, unitFilterStats]
    );

    return (
      <div ref={controlsRef} className="flex flex-wrap items-center gap-2">
        {/* 1. Botón integrado: Region */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((prev) => (prev === 'region' ? null : 'region'))}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border shadow-2xs select-none ${
              activeRegionObj
                ? 'text-white shadow-xs'
                : 'bg-[#F8F4F2] text-slate-700 hover:bg-slate-200/80 border-[#EAE5E1]'
            }`}
            style={{
              backgroundColor: activeRegionObj ? activeRegionObj.color : undefined,
              borderColor: activeRegionObj ? activeRegionObj.color : undefined,
              color: activeRegionObj && activeRegionObj.color === '#FEF800' ? '#0F172A' : undefined,
            }}
            title="Filtrar por Región en el mapa"
          >
            {activeRegionObj ? (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/60"
                style={{ backgroundColor: activeRegionObj.color }}
              />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-[#0850FD]" />
            )}
            <span>{activeRegionObj ? `Region: ${activeRegionObj.name}` : 'Region'}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                activeRegionObj
                  ? activeRegionObj.color === '#FEF800'
                    ? 'bg-slate-900/15 text-slate-950'
                    : 'bg-white/25 text-white'
                  : 'bg-slate-200/80 text-slate-700'
              }`}
            >
              {activeRegionObj ? activeRegionObj.totalReps : totalRepsCovered}
            </span>
            {activeRegionObj ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRegion(null);
                  setOpenMenu(null);
                }}
                className="hover:bg-black/15 rounded-full p-0.5 transition-colors ml-0.5"
                title="Quitar filtro de región"
              >
                <X className="w-3 h-3" />
              </span>
            ) : (
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                  openMenu === 'region' ? 'rotate-180 text-[#0850FD]' : ''
                }`}
              />
            )}
          </button>

          {openMenu === 'region' && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-white rounded-2xl border border-[#EAE5E1] shadow-xl z-50 py-2">
              <div className="flex items-center justify-between px-3.5 pb-2 mb-1 border-b border-[#EAE5E1] text-[11px]">
                <span className="font-extrabold text-slate-400 uppercase tracking-wider">
                  Regiones
                </span>
                {selectedRegionFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRegion(null);
                      setOpenMenu(null);
                    }}
                    className="text-[#0850FD] hover:underline font-bold cursor-pointer"
                  >
                    Ver todas
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto px-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onSelectRegion(null);
                    setOpenMenu(null);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    selectedRegionFilter === null
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:bg-[#F8F4F2] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                    <span className="truncate">Todas las Regiones</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                      selectedRegionFilter === null
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {totalRepsCovered}
                  </span>
                </button>

                {regionStats.map((r) => {
                  const isSelected = selectedRegionFilter === r.code;
                  return (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => {
                        onSelectRegion(isSelected ? null : r.code);
                        setOpenMenu(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? 'bg-blue-50 text-[#0850FD] font-bold'
                          : 'text-slate-700 hover:bg-[#F8F4F2] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: r.color }}
                        />
                        <span className="truncate">{r.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                            isSelected
                              ? 'bg-[#0850FD] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.totalReps}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0850FD]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Botón integrado: Linea (Unidades de Negocio sincronizadas con el mapa) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((prev) => (prev === 'linea' ? null : 'linea'))}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border shadow-2xs select-none ${
              selectedUnitFilter
                ? selectedUnitFilter === 'COMERCIAL'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-[#0850FD] text-white border-[#0850FD] shadow-xs'
                : 'bg-[#F8F4F2] text-slate-700 hover:bg-slate-200/80 border-[#EAE5E1]'
            }`}
            title="Filtrar por Línea / Unidad de Negocio sincronizada con el mapa"
          >
            <Layers className={`w-3.5 h-3.5 ${selectedUnitFilter ? 'text-white' : 'text-[#0850FD]'}`} />
            <span>{selectedUnitFilter ? `Linea: ${selectedUnitFilter}` : 'Linea'}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                selectedUnitFilter
                  ? 'bg-white/25 text-white'
                  : 'bg-blue-100 text-[#0850FD]'
              }`}
            >
              {activeUnitObj ? activeUnitObj.count : unitFilterStats.totalScoped}
            </span>
            {selectedUnitFilter ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectUnit(null);
                  setOpenMenu(null);
                }}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors ml-0.5"
                title="Quitar filtro de línea"
              >
                <X className="w-3 h-3" />
              </span>
            ) : (
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                  openMenu === 'linea' ? 'rotate-180 text-[#0850FD]' : ''
                }`}
              />
            )}
          </button>

          {openMenu === 'linea' && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-68 bg-white rounded-2xl border border-[#EAE5E1] shadow-xl z-50 py-2">
              <div className="flex items-center justify-between px-3.5 pb-2 mb-1 border-b border-[#EAE5E1] text-[11px]">
                <span className="font-extrabold text-slate-400 uppercase tracking-wider truncate">
                  {activeStateName ? `Líneas · ${activeStateName}` : 'Unidades de Negocio'}
                </span>
                {selectedUnitFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectUnit(null);
                      setOpenMenu(null);
                    }}
                    className="text-[#0850FD] hover:underline font-bold cursor-pointer shrink-0 ml-2"
                  >
                    Ver todas
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto px-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onSelectUnit(null);
                    setOpenMenu(null);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    selectedUnitFilter === null
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:bg-[#F8F4F2] font-medium'
                  }`}
                >
                  <span className="truncate">Todas las Líneas</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                      selectedUnitFilter === null
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {unitFilterStats.totalScoped}
                  </span>
                </button>

                {unitFilterStats.items.map((item) => {
                  const isSelected = selectedUnitFilter === item.unit;
                  const isComercialUnit = item.unit === 'COMERCIAL';
                  const hasCount = item.count > 0;
                  return (
                    <button
                      key={item.unit}
                      type="button"
                      onClick={() => {
                        onSelectUnit(isSelected ? null : item.unit);
                        setOpenMenu(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? isComercialUnit
                            ? 'bg-emerald-50 text-emerald-800 font-bold'
                            : 'bg-blue-50 text-[#0850FD] font-bold'
                          : hasCount
                          ? 'text-slate-700 hover:bg-[#F8F4F2] font-medium'
                          : 'text-slate-400 hover:bg-[#F8F4F2] font-medium opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isComercialUnit ? 'bg-emerald-500' : 'bg-[#0850FD]'
                          }`}
                        />
                        <span className="truncate">{item.unit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                            isSelected
                              ? isComercialUnit
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#0850FD] text-white'
                              : hasCount
                              ? isComercialUnit
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-[#0850FD]'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {item.count}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-current" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Botón: Todos (anula la selección anterior) */}
        <button
          onClick={onResetAll}
          className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
            repFilterType === 'all' && !selectedUnitFilter && !selectedRegionFilter
              ? 'bg-[#1A1A1E] text-white border-[#1A1A1E] shadow-xs'
              : 'bg-[#F8F4F2] text-slate-700 hover:bg-slate-200 border-[#EAE5E1]'
          }`}
          title="Mostrar todos los representantes y anular filtro anterior"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Todos ({totalActiveRepsCount})</span>
        </button>

        {(selectedRegionFilter || selectedUnitFilter || repFilterType !== 'all') && (
          <button
            onClick={onResetAll}
            className="px-3.5 py-2 rounded-full text-xs font-bold bg-[#FF4800]/10 text-[#FF4800] hover:bg-[#FF4800]/20 transition-colors cursor-pointer flex items-center gap-1.5 border border-[#FF4800]/30 shadow-2xs"
            title="Restablecer filtros de región y línea"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ver Todo</span>
          </button>
        )}

        {selectedStateId && (
          <button
            onClick={onCloseStateSelection}
            className="px-3.5 py-2 rounded-full text-xs font-bold bg-[#1A1A1E] text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cerrar Selección</span>
          </button>
        )}
      </div>
    );
  }
);

export const CoverageMap: React.FC<CoverageMapProps> = ({
  reps,
  gds,
  onSelectRep,
  onSelectGd,
  onFilterByManager,
  onFilterByRegion,
}) => {
  // Selected state ID in SVG (e.g. 'VEA', 'VEV', etc.)
  const [selectedStateId, setSelectedStateId] = useState<string | null>('VEA');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string | null>(null);
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string | null>(null);

  // Reps filter & search in the right inspector panel
  const [repFilterType, setRepFilterType] = useState<'all' | 'comercial' | 'medica'>('all');
  const [repSearchQuery, setRepSearchQuery] = useState('');
  const inspectorRef = useRef<HTMLDivElement>(null);

  const handleSelectState = useCallback((stateId: string | null) => {
    setSelectedStateId(stateId);
    if (stateId && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        inspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }, []);

  const handleSelectRegion = useCallback((code: string | null) => {
    setSelectedRegionFilter(code);
  }, []);

  const handleSelectUnit = useCallback((unit: string | null) => {
    setSelectedUnitFilter(unit);
    if (unit === 'COMERCIAL') {
      setRepFilterType((prev) => (prev === 'medica' ? 'all' : prev));
    }
  }, []);

  const handleResetAllFilters = useCallback(() => {
    setRepFilterType('all');
    setSelectedUnitFilter(null);
    setSelectedRegionFilter(null);
  }, []);

  const handleCloseStateSelection = useCallback(() => {
    handleSelectState(null);
  }, [handleSelectState]);

  // Contabilizar ÚNICAMENTE representantes activos (no inactivos)
  const activeReps = useMemo(() => reps.filter((r) => isRepActive(r)), [reps]);

  // Pre-indexar los estados que corresponden a cada representante UNA sola vez (O(1) lookup)
  const repMatchedStatesMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const r of activeReps) {
      map.set(r.id, computeMatchingStateIdsForRep(r));
    }
    return map;
  }, [activeReps]);

  // Dataset filtered by representative type (Comercial / Visita Medica / All, only active)
  const roleFilteredReps = useMemo(() => {
    if (repFilterType === 'comercial') {
      return activeReps.filter((r) => isRepComercial(r));
    }
    if (repFilterType === 'medica') {
      return activeReps.filter((r) => !isRepComercial(r));
    }
    return activeReps;
  }, [activeReps, repFilterType]);

  // Dataset sincronizado que alimenta el mapa (filtrado por tipo de representante + unidad de negocio seleccionada)
  const typeFilteredReps = useMemo(() => {
    if (!selectedUnitFilter) return roleFilteredReps;
    return roleFilteredReps.filter((r) => normalizeUnitName(r.unidadNegocio) === selectedUnitFilter);
  }, [roleFilteredReps, selectedUnitFilter]);

  // Estadísticas de botones de Unidades de Negocio sincronizadas con el estado o región seleccionada en el mapa
  const unitFilterStats = useMemo(() => {
    const normalizeReg = (reg?: string | null) =>
      (reg || '')
        .toUpperCase()
        .replace(/^\d+\s*-\s*/, '')
        .trim();

    let scopedReps = roleFilteredReps;
    if (selectedStateId) {
      scopedReps = scopedReps.filter((r) => repMatchedStatesMap.get(r.id)?.has(selectedStateId));
    } else if (selectedRegionFilter) {
      const cleanTarget = normalizeReg(selectedRegionFilter);
      scopedReps = scopedReps.filter((r) => normalizeReg(r.region) === cleanTarget);
    }

    const countsMap = new Map<string, number>();
    CANONICAL_UNITS.forEach((u) => countsMap.set(u, 0));

    activeReps.forEach((r) => {
      const u = normalizeUnitName(r.unidadNegocio);
      if (u !== 'SIN UNIDAD' && !countsMap.has(u)) {
        countsMap.set(u, 0);
      }
    });

    scopedReps.forEach((r) => {
      const u = normalizeUnitName(r.unidadNegocio);
      if (u !== 'SIN UNIDAD') {
        countsMap.set(u, (countsMap.get(u) || 0) + 1);
      }
    });

    const items = Array.from(countsMap.entries()).map(([unit, count]) => ({
      unit,
      count,
    }));

    return {
      totalScoped: scopedReps.length,
      items,
    };
  }, [roleFilteredReps, activeReps, selectedStateId, selectedRegionFilter, repMatchedStatesMap]);

  // Calculate dynamic stats for each SVG state based on active dataset and active filters
  const enrichedStates = useMemo(() => {
    return VENEZUELA_STATES_PATHS.map((st) => {
      const matchedReps = typeFilteredReps
        .filter((r) => repMatchedStatesMap.get(r.id)?.has(st.id))
        .sort((a, b) =>
          (a.nombre || '').trim().localeCompare((b.nombre || '').trim(), 'es', { sensitivity: 'base' })
        );

      const allActiveStateReps = activeReps.filter((r) => repMatchedStatesMap.get(r.id)?.has(st.id));

      const comerciales = matchedReps.filter((r) => isRepComercial(r)).length;
      const visitaMedica = matchedReps.length - comerciales;

      const unitCountsMap = new Map<string, number>();
      matchedReps.forEach((r) => {
        const unitName = normalizeUnitName(r.unidadNegocio);
        unitCountsMap.set(unitName, (unitCountsMap.get(unitName) || 0) + 1);
      });

      const unitBreakdown: UnitCountItem[] = Array.from(unitCountsMap.entries())
        .map(([unit, count]) => ({ unit, count }))
        .sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count;
          const idxA = CANONICAL_UNITS.indexOf(a.unit);
          const idxB = CANONICAL_UNITS.indexOf(b.unit);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          return a.unit.localeCompare(b.unit, 'es');
        });

      const actualCount = matchedReps.length;
      const hasActualReps = actualCount > 0;

      const resolvedRegionCode =
        resolveRegionCodeFromRaw(matchedReps[0]?.region) ||
        resolveRegionCodeFromRaw(allActiveStateReps[0]?.region) ||
        st.region;

      const regionConf = resolvedRegionCode ? REGIONS_CONFIG[resolvedRegionCode] || null : null;
      const resolvedRegionName = regionConf?.name || st.regionName;

      const repManagerNames = new Set(
        matchedReps.map((r) => r.gerenteDistrito?.toUpperCase().trim()).filter(Boolean)
      );

      const matchedGds = gds.filter((g) => {
        const gdNameUpper = g.nombre?.toUpperCase().trim();
        for (const rName of repManagerNames) {
          if (rName.includes(gdNameUpper) || gdNameUpper.includes(rName)) return true;
        }
        if (resolvedRegionCode && g.region) {
          const gdRegCode = resolveRegionCodeFromRaw(g.region);
          if (gdRegCode === resolvedRegionCode || g.region.toUpperCase().includes(resolvedRegionName.toUpperCase())) {
            return true;
          }
        }
        return false;
      });

      return {
        ...st,
        region: resolvedRegionCode,
        regionName: resolvedRegionName,
        hasReps: hasActualReps,
        totalReps: actualCount,
        actualRepsCount: actualCount,
        isSatelliteZone: false,
        comerciales,
        visitaMedica,
        unitBreakdown,
        repsList: matchedReps,
        gdsList: matchedGds,
        regionConf,
        description: (() => {
          if (st.id === 'VEO') return 'Margarita, Coche y Cubagua · Sin representantes asignados';
          if (st.id === 'VEW') return 'Los Roques, La Orchila, La Tortuga, La Blanquilla · Sin representantes asignados';
          if (!hasActualReps) return 'Sin representantes asignados';
          if (st.id === 'VEA') return 'Caracas (Libertador)';
          if (st.id === 'VEM') return 'Caracas Este (Baruta, Chacao, Sucre, El Hatillo)';
          const repsCities = Array.from(
            new Set(matchedReps.map((r) => r.ciudad?.trim()).filter(Boolean))
          );
          if (repsCities.length > 0) {
            return repsCities
              .map((c) =>
                c
                  .toLowerCase()
                  .split(' ')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')
              )
              .join(', ');
          }
          return STATE_DESCRIPTIONS[st.id] || 'Sin representantes asignados';
        })(),
      };
    });
  }, [typeFilteredReps, activeReps, gds, repMatchedStatesMap]);

  // Selected state details
  const activeState = useMemo(() => {
    if (!selectedStateId) return null;
    return enrichedStates.find((s) => s.id === selectedStateId) || null;
  }, [selectedStateId, enrichedStates]);

  // Stats by region for the legend (exact matching with database region)
  const regionStats = useMemo(() => {
    const normalizeReg = (reg?: string | null) =>
      (reg || '')
        .toUpperCase()
        .replace(/^\d+\s*-\s*/, '')
        .trim();

    return Object.entries(REGIONS_CONFIG).map(([code, conf]) => {
      const cleanTarget = normalizeReg(code);
      const statesInRegion = enrichedStates.filter(
        (s) => normalizeReg(s.region) === cleanTarget && s.hasReps
      );
      const totalReps = typeFilteredReps.filter(
        (r) => normalizeReg(r.region) === cleanTarget
      ).length;
      const comCount = typeFilteredReps.filter(
        (r) => normalizeReg(r.region) === cleanTarget && isRepComercial(r)
      ).length;
      const medCount = totalReps - comCount;
      const leadersCount = gds.filter(
        (g) => normalizeReg(g.region) === cleanTarget
      ).length;

      return {
        ...conf,
        statesInRegion,
        totalReps,
        comCount,
        medCount,
        leadersCount,
      };
    });
  }, [enrichedStates, typeFilteredReps, gds]);

  // Filtered reps in active state inspector
  const filteredActiveReps = useMemo(() => {
    if (!activeState) return [];
    let list = activeState.repsList;

    if (repSearchQuery) {
      const q = repSearchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.nombre?.toLowerCase().includes(q) ||
          r.cedula?.includes(q) ||
          r.ciudad?.toLowerCase().includes(q) ||
          r.codigoSector?.toLowerCase().includes(q) ||
          r.gerenteDistrito?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeState, repSearchQuery]);

  // Overall totals
  const totalRepsCovered = typeFilteredReps.length;

  return (
    <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-full overflow-x-hidden">
      {/* 1. Header Card con controles integrados (Region, Linea, Todos) */}
      <div className="relative z-30 bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#EAE5E1] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-4 w-full max-w-full">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl theme-gradient-bg flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-black text-[#1A1A1E] tracking-tight truncate">
              Mapa Territorial por Regiones
            </h2>
          </div>
        </div>

        {/* Action Controls & Integrated Filters */}
        <MapHeaderControls
          regionStats={regionStats}
          unitFilterStats={unitFilterStats}
          selectedRegionFilter={selectedRegionFilter}
          selectedUnitFilter={selectedUnitFilter}
          selectedStateId={selectedStateId}
          activeStateName={activeState?.name || null}
          repFilterType={repFilterType}
          totalRepsCovered={totalRepsCovered}
          totalActiveRepsCount={activeReps.length}
          onSelectRegion={handleSelectRegion}
          onSelectUnit={handleSelectUnit}
          onResetAll={handleResetAllFilters}
          onCloseStateSelection={handleCloseStateSelection}
        />
      </div>

      {/* 2. Main Layout: 1 col on mobile, 12-col split on desktop (7 cols map + 5 cols inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-start w-full max-w-full">
        {/* Left/Top Section: Interactive Venezuela Map Canvas */}
        <div className="lg:col-span-7 flex flex-col w-full max-w-full">
          <div
            className="rounded-2xl sm:rounded-3xl border border-blue-200/90 p-2 sm:p-4 shadow-2xs flex flex-col justify-between relative overflow-hidden min-h-[260px] sm:min-h-[460px] w-full max-w-full"
            style={{
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 52%, #BFDBFE 100%)',
            }}
          >
            <VenezuelaVectorMap
              enrichedStates={enrichedStates}
              selectedStateId={selectedStateId}
              selectedRegionFilter={selectedRegionFilter}
              onSelectState={handleSelectState}
            />
          </div>
        </div>

        {/* Right/Bottom Section: Liderazgo y Representantes del Estado Seleccionado */}
        <div ref={inspectorRef} className="lg:col-span-5 flex flex-col gap-3 sm:gap-4 w-full max-w-full">
          {activeState ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAE5E1] p-3 sm:p-5 shadow-2xs flex flex-col space-y-3 sm:space-y-4 w-full max-w-full">
              {/* Header of Selected State */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE5E1]">
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl text-white font-black text-base font-mono flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: activeState.regionConf?.color || '#0850FD' }}
                  >
                    {activeState.totalReps}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${activeState.regionConf?.color || '#0850FD'}20`,
                          color: activeState.regionConf?.color || '#0850FD',
                        }}
                      >
                        {activeState.regionName}
                      </span>
                      {selectedUnitFilter && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0850FD]">
                          {selectedUnitFilter}
                        </span>
                      )}
                      {repFilterType !== 'all' && (
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            repFilterType === 'comercial'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {repFilterType === 'comercial' ? 'Comercial' : 'Visita Medica'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-[#1A1A1E] tracking-tight mt-0.5">
                      {activeState.name}
                    </h3>
                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                      {activeState.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onFilterByRegion && activeState.region && (
                    <button
                      onClick={() => onFilterByRegion(activeState.region || '')}
                      className="px-2 py-1 rounded-full text-[10px] font-bold bg-[#F8F4F2] text-[#1A1A1E] hover:bg-slate-200 transition-all cursor-pointer"
                      title="Filtrar esta región en toda la app"
                    >
                      Filtrar Región
                    </button>
                  )}
                  <button
                    onClick={() => handleSelectState(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                    title="Cerrar selección"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* District Manager(s) / Coordinador(es) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#0850FD]" />
                    <span>Gerente de Distrito / Liderazgo</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {activeState.gdsList.length > 0
                      ? `${activeState.gdsList.length} asignado(s)`
                      : 'Supervisión regional'}
                  </span>
                </div>

                {activeState.gdsList.length > 0 ? (
                  <div className="space-y-2">
                    {activeState.gdsList.map((gd) => {
                      const isVacant = gd.nombre.includes('VACANTE');
                      return (
                        <div
                          key={gd.id}
                          className="p-3.5 rounded-2xl bg-[#F8F4F2] border border-[#EAE5E1] flex items-center justify-between gap-3 group hover:border-[#0850FD]/40 transition-all"
                        >
                          <div className="min-w-0">
                            <button
                              onClick={() => onSelectGd(gd)}
                              className={`text-left font-black text-xs hover:underline cursor-pointer truncate block ${
                                isVacant ? 'text-sky-700' : 'text-[#1A1A1E] group-hover:text-[#0850FD]'
                              }`}
                            >
                              {gd.nombre}
                            </button>
                            <div className="text-[10px] text-[#0850FD] font-extrabold uppercase mt-0.5">
                              {gd.cargo}
                            </div>
                            {gd.telefono && (
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {gd.telefono}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {gd.telefono && (
                              <>
                                <a
                                  href={getWhatsAppUrl(gd.telefono, `Hola ${gd.nombre}`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-full bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all shadow-2xs"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={getTelUrl(gd.telefono)}
                                  className="p-2 rounded-full bg-white text-[#0850FD] hover:bg-[#0850FD] hover:text-white border border-blue-200 transition-all shadow-2xs"
                                  title="Llamar"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </>
                            )}
                            <button
                              onClick={() => onSelectGd(gd)}
                              className="p-2 rounded-full bg-white text-slate-400 hover:text-[#0850FD] border border-slate-200 transition-all shadow-2xs cursor-pointer"
                              title="Ver ficha completa"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  (() => {
                    const fallbackManagers = Array.from(
                      new Set(activeState.repsList.map((r) => r.gerenteDistrito).filter(Boolean))
                    );
                    return fallbackManagers.length > 0 ? (
                      <div className="space-y-1.5">
                        {fallbackManagers.map((mName, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-[#F8F4F2] border border-[#EAE5E1] flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-black text-[#1A1A1E]">{mName}</div>
                              <div className="text-[10px] text-[#0850FD] font-bold">
                                Gerente de Distrito asignado a la zona
                              </div>
                            </div>
                            <button
                              onClick={() => onFilterByManager(mName)}
                              className="px-2.5 py-1 text-[11px] font-bold text-[#0850FD] bg-white rounded-full border border-blue-200 hover:bg-blue-50 cursor-pointer"
                            >
                              Ver equipo
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-[#F8F4F2] border border-dashed border-[#EAE5E1] text-[11px] text-slate-500">
                        Gerencia centralizada desde {activeState.regionName}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Representatives in this state */}
              <div className="space-y-3 pt-2 border-t border-[#EAE5E1]">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#0850FD]" />
                    <span>Representantes Asignados ({filteredActiveReps.length})</span>
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono">
                    <button
                      onClick={() => setRepFilterType(repFilterType === 'comercial' ? 'all' : 'comercial')}
                      className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        repFilterType === 'comercial'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {activeState.comerciales} Com
                    </button>
                    <button
                      onClick={() => setRepFilterType(repFilterType === 'medica' ? 'all' : 'medica')}
                      className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        repFilterType === 'medica'
                          ? 'bg-[#0850FD] text-white border-[#0850FD]'
                          : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      {activeState.visitaMedica} Méd
                    </button>
                  </div>
                </div>

                {/* Reps Cards List */}
                {filteredActiveReps.length > 0 ? (
                  <div className="space-y-1.5">
                    {filteredActiveReps.map((rep) => {
                      const isComercial = isRepComercial(rep);
                      const unitLabel = normalizeUnitName(rep.unidadNegocio);
                      return (
                        <div
                          key={rep.id}
                          onClick={() => onSelectRep(rep)}
                          className="py-1.5 px-3 rounded-xl bg-[#F8F4F2] hover:bg-slate-100 border border-[#EAE5E1] hover:border-[#0850FD]/40 transition-all group flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <span className="font-black text-xs text-[#1A1A1E] group-hover:text-[#0850FD] transition-colors truncate">
                            {rep.nombre}
                          </span>
                          <span
                            className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded font-mono shrink-0 ${
                              isComercial
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {unitLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#F8F4F2] border border-dashed border-[#EAE5E1] text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-1">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-black text-slate-700">Sin Representantes Asignados</div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {repSearchQuery
                        ? 'No hay representantes que coincidan con la búsqueda en este estado.'
                        : selectedUnitFilter
                        ? `No hay representantes en la unidad ${selectedUnitFilter} para ${activeState.name}.`
                        : repFilterType !== 'all'
                        ? `El estado ${activeState.name} no cuenta con representantes de tipo ${
                            repFilterType === 'comercial' ? 'Comercial' : 'Visita Medica'
                          } asignados.`
                        : `El estado ${activeState.name} no cuenta actualmente con representantes de ventas o visita médica en la plantilla activa.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State when no state is selected */
            <div className="bg-white rounded-3xl border border-[#EAE5E1] p-8 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-[#0850FD]/10 text-[#0850FD] flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1A1A1E]">Selecciona un Estado en el Mapa</h3>
                <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto mt-1">
                  Haz clic en cualquier estado sombreado para inspeccionar su fuerza de ventas, gerentes de distrito y coordinadores asignados.
                </p>
              </div>
              <button
                onClick={() => handleSelectState('VEA')}
                className="px-4 py-2 bg-[#0850FD] text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Ver Caracas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
