import React, { useState, useMemo, useEffect } from 'react';
import { Representante, GerenteDistrito } from '../types/contact';
import { getMappedUnit } from '../App';
import {
  Printer,
  FileText,
  X,
  Check,
  Download,
  Filter,
  CheckCircle2,
  Pill,
} from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reps: Representante[];
  gds: GerenteDistrito[];
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  reps,
  gds,
}) => {
  const [scope, setScope] = useState<'all' | 'comercial' | 'medica' | 'gds'>('all');
  const [includePhone, setIncludePhone] = useState(true);
  const [includeEmail, setIncludeEmail] = useState(true);
  const [includeRegion, setIncludeRegion] = useState(true);

  const filteredReps = useMemo(() => {
    if (scope === 'comercial') {
      return reps.filter((r) => r.tipoRepresentante === 'Comercial' || (!r.tipoRepresentante && r.gerenteDistrito?.match(/(VICTORIA|KERVIN|DANA|ELIZABETH|DOUGLAS|JUANITA|JUAN MENDEZ|YESSICA)/i)));
    }
    if (scope === 'medica') {
      return reps.filter((r) => r.tipoRepresentante === 'Visita Médica' || (!r.tipoRepresentante && !r.gerenteDistrito?.match(/(VICTORIA|KERVIN|DANA|ELIZABETH|DOUGLAS|JUANITA|JUAN MENDEZ|YESSICA)/i)));
    }
    return reps;
  }, [reps, scope]);

  // Bloquear scroll de la interfaz de fondo al abrir el modal
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

  const handlePrint = () => {
    // Generate dedicated print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite las ventanas emergentes (popups) para generar el PDF imprimible.');
      return;
    }

    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const titleMap = {
      all: 'Directorio General Farma · Representantes y Gerencias',
      comercial: 'Directorio Oficial · Representantes Comerciales',
      medica: 'Directorio Oficial · Representantes Visita Médica',
      gds: 'Directorio Oficial · Gerentes de Distrito y Coordinadores',
    };

    const docTitle = titleMap[scope];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 12mm 15mm 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1A1A1E;
              margin: 0;
              padding: 0;
              font-size: 11px;
              line-height: 1.4;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #0850FD;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .brand {
              font-size: 22px;
              font-weight: 900;
              color: #1A1A1E;
              letter-spacing: -0.5px;
            }
            .brand span {
              color: #0850FD;
            }
            .meta {
              text-align: right;
              font-size: 10px;
              color: #64748B;
            }
            .doc-title {
              font-size: 16px;
              font-weight: 800;
              color: #1A1A1E;
              margin-bottom: 4px;
            }
            .stats-bar {
              display: flex;
              gap: 16px;
              background-color: #F8F4F2;
              padding: 8px 12px;
              border-radius: 8px;
              margin-bottom: 16px;
              font-size: 11px;
              font-weight: 700;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            th {
              background-color: #F1ECE9;
              text-align: left;
              padding: 6px 8px;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #475569;
              border-bottom: 1px solid #CBD5E1;
            }
            td {
              padding: 6px 8px;
              border-bottom: 1px solid #E2E8F0;
              vertical-align: middle;
            }
            tr:nth-child(even) td {
              background-color: #FAFAF9;
            }
            .badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 9999px;
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
            }
            .badge-comercial {
              background-color: #FFEDD5;
              color: #C2410C;
            }
            .badge-medica {
              background-color: #DBEAFE;
              color: #1D4ED8;
            }
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 9px;
              color: #94A3B8;
              border-top: 1px solid #E2E8F0;
              padding-top: 6px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">XANA <span>Farma</span></div>
              <div style="font-size: 10px; color: #64748B; font-weight: 600;">Agenda de Contactos &amp; Fuerza de Ventas</div>
            </div>
            <div class="meta">
              <div>Fecha de Emisión: <strong>${currentDate}</strong></div>
              <div>Estatus: <strong>100% Activos</strong></div>
            </div>
          </div>

          <div class="doc-title">${docTitle}</div>

          <div class="stats-bar">
            ${scope !== 'gds' ? `<div>Representantes Listados: <strong>${filteredReps.length}</strong></div>` : ''}
            ${scope === 'all' || scope === 'gds' ? `<div>Gerencias de Distrito: <strong>${gds.length}</strong></div>` : ''}
            <div>Fuente de Datos: <strong>DATA_REP &amp; DATA_GD</strong></div>
          </div>

          ${
            scope !== 'gds'
              ? `
              <table>
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Representante</th>
                    <th>Cédula</th>
                    <th>Unidad de Negocio</th>
                    ${includeRegion ? '<th>Región / Estado</th>' : ''}
                    ${includePhone ? '<th>Teléfono</th>' : ''}
                    ${includeEmail ? '<th>Correo</th>' : ''}
                    <th>Gerente Distrito</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredReps
                    .map((r, i) => {
                      const unitName = getMappedUnit(r.unidadNegocio);
                      const isCom = unitName === 'COMERCIAL';
                      return `
                    <tr>
                      <td style="font-weight: 700; color: #64748B;">${i + 1}</td>
                      <td style="font-weight: 800;">${r.nombre}</td>
                      <td>${r.cedula}</td>
                      <td>
                        <span class="badge ${isCom ? 'badge-comercial' : 'badge-medica'}">
                          ${unitName}
                        </span>
                      </td>
                      ${includeRegion ? `<td>${r.region} <br/><span style="color:#64748B; font-size:9px;">${r.ciudad}, ${r.estado}</span></td>` : ''}
                      ${includePhone ? `<td style="font-family: monospace; font-weight: 600;">${r.telefono}</td>` : ''}
                      ${includeEmail ? `<td style="font-size: 9px;">${r.correo}</td>` : ''}
                      <td style="font-weight: 600;">${r.gerenteDistrito}</td>
                    </tr>
                  `;
                    })
                    .join('')}
                </tbody>
              </table>
            `
              : ''
          }

          ${
            scope === 'all' || scope === 'gds'
              ? `
              <div class="doc-title" style="margin-top: 24px; font-size: 14px;">Liderazgo: Gerentes de Distrito y Coordinadores</div>
              <table>
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Líder</th>
                    <th>Cargo</th>
                    <th>Región Asignada</th>
                    ${includePhone ? '<th>Teléfono</th>' : ''}
                    ${includeEmail ? '<th>Correo</th>' : ''}
                    <th>Supervisor</th>
                  </tr>
                </thead>
                <tbody>
                  ${gds
                    .map(
                      (g, i) => `
                    <tr>
                      <td style="font-weight: 700; color: #64748B;">${i + 1}</td>
                      <td style="font-weight: 800;">${g.nombre}</td>
                      <td style="font-weight: 700; color: #0850FD;">${g.cargo}</td>
                      <td>${g.region}</td>
                      ${includePhone ? `<td style="font-family: monospace; font-weight: 600;">${g.telefono}</td>` : ''}
                      ${includeEmail ? `<td style="font-size: 9px;">${g.correo}</td>` : ''}
                      <td>${g.supervisor}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            `
              : ''
          }

          <div class="footer">
            Xana Farma · Directorio Oficial Corporativo · Generado automáticamente
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Trigger native browser print dialog
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overscroll-contain animate-in fade-in"
      style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-[#EAE5E1] shadow-2xl relative space-y-6 overscroll-contain"
        style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-[#1A1A1E] hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl theme-gradient-bg flex items-center justify-center text-white shrink-0 shadow-xs">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#1A1A1E] tracking-tight">
              Exportar Directorio a PDF
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Genera una guía corporativa maquetada lista para imprimir o guardar como documento PDF.
            </p>
          </div>
        </div>

        {/* Scope selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#1A1A1E]">
            Contenido a incluir en el documento:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setScope('all')}
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                scope === 'all'
                  ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border-[#EAE5E1] hover:bg-slate-200/70'
              }`}
            >
              Directorio Completo (83 Reps + 12 GDs)
            </button>
            <button
              onClick={() => setScope('comercial')}
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                scope === 'comercial'
                  ? 'bg-theme-secondary text-white border-theme-secondary shadow-xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border-[#EAE5E1] hover:bg-slate-200/70'
              }`}
            >
              Solo Comerciales (19 Reps)
            </button>
            <button
              onClick={() => setScope('medica')}
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                scope === 'medica'
                  ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border-[#EAE5E1] hover:bg-slate-200/70'
              }`}
            >
              Solo Visita Médica (64 Reps)
            </button>
            <button
              onClick={() => setScope('gds')}
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                scope === 'gds'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-[#F8F4F2] text-[#1A1A1E] border-[#EAE5E1] hover:bg-slate-200/70'
              }`}
            >
              Solo Gerentes y Coordinadores (12)
            </button>
          </div>
        </div>

        {/* Column toggles */}
        <div className="space-y-2 pt-2 border-t border-[#EAE5E1]">
          <span className="block text-xs font-bold text-[#1A1A1E]">
            Campos adicionales:
          </span>
          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includePhone}
                onChange={(e) => setIncludePhone(e.target.checked)}
                className="rounded accent-[var(--app-primary)]"
              />
              <span>Número de Teléfono</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeEmail}
                onChange={(e) => setIncludeEmail(e.target.checked)}
                className="rounded accent-[var(--app-primary)]"
              />
              <span>Correo Electrónico</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeRegion}
                onChange={(e) => setIncludeRegion(e.target.checked)}
                className="rounded accent-[var(--app-primary)]"
              />
              <span>Región y Estado</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE5E1]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Generar e Imprimir / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
