import ExcelJS from 'exceljs';
import { Representante, GerenteDistrito } from '../types/contact';
import { getMappedUnit } from '../App';

// Standardized 7 Regions requested by user
export const STANDARD_REGIONS = [
  'CAPITAL ESTE',
  'CAPITAL OESTE',
  'CENTRO',
  'ANDES',
  'OCCIDENTE',
  'ORIENTE',
  'CENTRO OCCIDENTE',
] as const;

export type StandardRegion = (typeof STANDARD_REGIONS)[number];

export function getStandardRegion(rawRegion: string): string {
  if (!rawRegion) return '';
  const clean = rawRegion
    .replace(/^\d+\s*-\s*/, '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Check Centro Occidente before Centro or Occidente
  if (
    clean === 'CENTRO OCCIDENTE' ||
    clean === 'CENTRO-OCCIDENTE' ||
    clean === 'CENTROOCCIDENTE' ||
    (clean.includes('CENTRO') && clean.includes('OCCIDENTE'))
  ) {
    return 'CENTRO OCCIDENTE';
  }

  // Capital Este & Oeste
  if (
    clean === 'CAPITAL ESTE' ||
    clean === 'CAPITAL-ESTE' ||
    (clean.includes('CAPITAL') && (clean.includes('ESTE') || clean.endsWith(' E')))
  ) {
    return 'CAPITAL ESTE';
  }

  if (
    clean === 'CAPITAL OESTE' ||
    clean === 'CAPITAL-OESTE' ||
    (clean.includes('CAPITAL') && (clean.includes('OESTE') || clean.endsWith(' O') || clean.endsWith(' W')))
  ) {
    return 'CAPITAL OESTE';
  }

  // Andes
  if (clean === 'ANDES' || clean.includes('ANDE')) {
    return 'ANDES';
  }

  // Centro
  if (clean === 'CENTRO' || clean.startsWith('CENTRO')) {
    return 'CENTRO';
  }

  // Occidente
  if (clean === 'OCCIDENTE' || clean.includes('OCCIDENTE') || clean.includes('ZULIA') || clean.includes('FALCON')) {
    return 'OCCIDENTE';
  }

  // Oriente
  if (
    clean === 'ORIENTE' ||
    clean.includes('ORIENTE') ||
    clean.includes('GUAYANA') ||
    clean.includes('BOLIVAR') ||
    clean.includes('MONAGAS') ||
    clean.includes('ANZOATEGUI')
  ) {
    return 'ORIENTE';
  }

  const matched = STANDARD_REGIONS.find((r) => r === clean);
  if (matched) return matched;

  return clean;
}

// Column definitions exactly matching user requirements:
// Codigo | Cedula | Representante | Telefono | Correo | Ciudad | Estado | Region | Unidad de Negocio | Gerente de Distrito | Fecha de Ingreso | Estatus

export interface ExcelColumnDef {
  header: string;
  key: string;
  width: number;
}

export const REP_EXCEL_COLUMNS: ExcelColumnDef[] = [
  { header: 'Codigo', key: 'codigo', width: 14 },
  { header: 'Cedula', key: 'cedula', width: 16 },
  { header: 'Representante', key: 'representante', width: 30 },
  { header: 'Telefono', key: 'telefono', width: 18 },
  { header: 'Correo', key: 'correo', width: 34 },
  { header: 'Ciudad', key: 'ciudad', width: 20 },
  { header: 'Estado', key: 'estado', width: 20 },
  { header: 'Region', key: 'region', width: 22 },
  { header: 'Unidad de Negocio', key: 'unidadNegocio', width: 24 },
  { header: 'Gerente de Distrito', key: 'gerenteDistrito', width: 26 },
  { header: 'Fecha de Ingreso', key: 'fechaIngreso', width: 18 },
  { header: 'Estatus', key: 'estatus', width: 14 },
];

export const GD_EXCEL_COLUMNS: ExcelColumnDef[] = [
  { header: 'Codigo', key: 'codigo', width: 14 },
  { header: 'Cedula', key: 'cedula', width: 16 },
  { header: 'Líder / Gerente', key: 'representante', width: 30 },
  { header: 'Telefono', key: 'telefono', width: 18 },
  { header: 'Correo', key: 'correo', width: 34 },
  { header: 'Ciudad', key: 'ciudad', width: 20 },
  { header: 'Estado', key: 'estado', width: 20 },
  { header: 'Region', key: 'region', width: 22 },
  { header: 'Cargo', key: 'unidadNegocio', width: 24 },
  { header: 'Supervisor', key: 'gerenteDistrito', width: 26 },
  { header: 'Fecha de Ingreso', key: 'fechaIngreso', width: 18 },
  { header: 'Estatus', key: 'estatus', width: 14 },
];

export async function exportRepsToExcel(
  reps: Representante[],
  filename: string = 'Agenda de Representantes.xlsx',
  selectedColumnKeys?: string[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Calox Farma';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Agenda de Representantes', {
    views: [{ showGridLines: true }],
  });

  // Set default row height to exactly 14.5
  worksheet.properties.defaultRowHeight = 14.5;

  // Filter columns if selectedColumnKeys is provided
  const activeColumns =
    selectedColumnKeys && selectedColumnKeys.length > 0
      ? REP_EXCEL_COLUMNS.filter((col) => selectedColumnKeys.includes(col.key))
      : REP_EXCEL_COLUMNS;

  // Define columns
  worksheet.columns = activeColumns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  // Style header row exactly like image_05249311.png (Dark Navy Blue fill #002060, White bold text, row height 14.5)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 14.5;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF002060' }, // Dark Navy Blue from reference image
    };
    cell.font = {
      name: 'Calibri',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFFFF' }, // Pure white text
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: false,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };
  });

  // Add data rows with standardized regions and row height 14.5
  reps.forEach((rep) => {
    const fullRowData: Record<string, any> = {
      codigo: rep.codigoSector || '',
      cedula: rep.cedula || '',
      representante: rep.nombre || '',
      telefono: rep.telefono || '',
      correo: rep.correo || '',
      ciudad: rep.ciudad || '',
      estado: rep.estado || '',
      region: getStandardRegion(rep.region || ''),
      unidadNegocio: getMappedUnit(rep.unidadNegocio || ''),
      gerenteDistrito: rep.gerenteDistrito || '',
      fechaIngreso: rep.fechaIngreso || '',
      estatus: rep.status || 'ACTIVO',
    };

    const rowData: Record<string, any> = {};
    activeColumns.forEach((col) => {
      rowData[col.key] = fullRowData[col.key] ?? '';
    });

    const row = worksheet.addRow(rowData);

    row.height = 14.5;

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = {
        name: 'Calibri',
        size: 10,
        color: { argb: 'FF000000' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      };
    });
  });

  // Generate and download XLSX buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportGdsToExcel(
  gds: GerenteDistrito[],
  filename: string = 'Gerentes_Distrito_Calox.xlsx'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Calox Farma';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Lideres_GD', {
    views: [{ showGridLines: true }],
  });

  // Set default row height to exactly 14.5
  worksheet.properties.defaultRowHeight = 14.5;

  // Define columns
  worksheet.columns = GD_EXCEL_COLUMNS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  // Style header row (Dark Navy Blue fill #002060, White bold text, row height 14.5)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 14.5;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF002060' }, // Dark Navy Blue
    };
    cell.font = {
      name: 'Calibri',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFFFF' }, // Pure white text
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: false,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };
  });

  // Add rows with standardized region and row height 14.5
  gds.forEach((gd) => {
    const row = worksheet.addRow({
      codigo: gd.codigoSector || '',
      cedula: gd.cedula || '',
      representante: gd.nombre || '',
      telefono: gd.telefono || '',
      correo: gd.correo || '',
      ciudad: gd.ciudad || '',
      estado: gd.estado || '',
      region: getStandardRegion(gd.region || ''),
      unidadNegocio: gd.cargo || '',
      gerenteDistrito: gd.supervisor || '',
      fechaIngreso: gd.fechaIngreso || '',
      estatus: gd.status || 'ACTIVO',
    });

    row.height = 14.5;

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = {
        name: 'Calibri',
        size: 10,
        color: { argb: 'FF000000' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
