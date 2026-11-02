export type ThemeId = 'calox' | 'nordic' | 'emerald';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  palette: {
    name: string;
    bgMain: string;
    bgCard: string;
    border: string;
    textMain: string;
    textMuted: string;
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primary10: string;
    secondary: string;
    secondary10: string;
    accent: string;
    bannerGradient: string;
    brandGradient: string;
    badgePill: string;
  };
  characteristics: string[];
}

export const APP_THEMES: Record<ThemeId, ThemeConfig> = {
  calox: {
    id: 'calox',
    name: 'Calox / Xana Cálido',
    subtitle: 'Tema Oficial Farma',
    badge: 'Predeterminado',
    description:
      'Identidad comercial dinámica y cálida. Fondo marfil arena con iconos y etiquetas en azul eléctrico farmacéutico y acentos en naranja fuego.',
    palette: {
      name: 'Arena & Azul Eléctrico',
      bgMain: '#F8F4F2',
      bgCard: '#FFFFFF',
      border: '#EAE5E1',
      textMain: '#1A1A1E',
      textMuted: '#64748B',
      primary: '#0850FD',
      primaryHover: '#0748EA',
      primaryLight: '#EFF4FF',
      primary10: 'rgba(8, 80, 253, 0.10)',
      secondary: '#0284C7',
      secondary10: 'rgba(2, 132, 199, 0.10)',
      accent: '#FF4800',
      bannerGradient: 'from-[#0038B8] via-[#0850FD] to-[#00A3FF]',
      brandGradient: 'from-[#0850FD] to-[#00A3FF]',
      badgePill: 'bg-[#0850FD]/10 text-[#0850FD]',
    },
    characteristics: [
      'Fondo cálido marfil arena (#F8F4F2)',
      'Iconos y etiquetas en azul eléctrico (#0850FD)',
      'Acentos comerciales en naranja (#FF4800)',
      'Excelente contraste para ventas y terreno',
    ],
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic Clinical Slate',
    subtitle: 'Clínico, Sobrio & Tecnológico',
    badge: 'BioTech / Laboratorio',
    description:
      'Estética nórdica minimalista de laboratorio de alta precisión. Fondo gris pizarra con iconos y etiquetas en azul zafiro nórdico y teal quirúrgico.',
    palette: {
      name: 'Pizarra Suave & Azul Zafiro',
      bgMain: '#F1F5F9',
      bgCard: '#FFFFFF',
      border: '#CBD5E1',
      textMain: '#0F172A',
      textMuted: '#64748B',
      primary: '#1D4ED8',
      primaryHover: '#1E40AF',
      primaryLight: '#EFF6FF',
      primary10: 'rgba(29, 78, 216, 0.10)',
      secondary: '#0D9488',
      secondary10: 'rgba(13, 148, 136, 0.10)',
      accent: '#0D9488',
      bannerGradient: 'from-[#0F172A] via-[#1E3A8A] to-[#0D9488]',
      brandGradient: 'from-[#1D4ED8] to-[#0D9488]',
      badgePill: 'bg-[#1D4ED8]/10 text-[#1D4ED8]',
    },
    characteristics: [
      'Fondo gris pizarra suave (#F1F5F9)',
      'Iconos y etiquetas en azul zafiro nórdico (#1D4ED8)',
      'Acentos en teal quirúrgico (#0D9488)',
      'Estilo sobrio, científico y ejecutivo',
    ],
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald BioFarma',
    subtitle: 'Verde Botánico & Salud Integral',
    badge: 'Fitofarma & Bienestar',
    description:
      'Inspirado en la farmacopea natural, biológicos y medicina preventiva. Fondo salvia con iconos y etiquetas transformados en verde bosque esmeralda y menta.',
    palette: {
      name: 'Salvia & Verde Esmeralda',
      bgMain: '#F2F7F4',
      bgCard: '#FFFFFF',
      border: '#D1E0D7',
      textMain: '#132A1E',
      textMuted: '#52796F',
      primary: '#059669',
      primaryHover: '#047857',
      primaryLight: '#ECFDF5',
      primary10: 'rgba(5, 150, 105, 0.10)',
      secondary: '#0D9488',
      secondary10: 'rgba(13, 148, 136, 0.10)',
      accent: '#D97706',
      bannerGradient: 'from-[#064E3B] via-[#059669] to-[#10B981]',
      brandGradient: 'from-[#059669] to-[#10B981]',
      badgePill: 'bg-[#059669]/10 text-[#059669]',
    },
    characteristics: [
      'Fondo salvia herbal clarísimo (#F2F7F4)',
      'Iconos y etiquetas en verde esmeralda (#059669)',
      'Acentos botánicos en menta fresca y oro (#D97706)',
      'Sensación de salud natural, bienestar y ecología',
    ],
  },
};
