import React, { useState, useMemo } from 'react';
import { CustomDatabase, ViewMode } from '../types/contact';
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  Download,
  RefreshCw,
  Trash2,
  ExternalLink,
  Database,
  Layers,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { exportGenericDatabaseToExcel } from '../utils/excelExport';

interface CustomDatabaseViewProps {
  database: CustomDatabase;
  isAdmin: boolean;
  onDeleteDatabase: (id: string) => void;
  onSyncDatabase?: (id: string) => Promise<void>;
  isSyncing?: boolean;
}

export const CustomDatabaseView: React.FC<CustomDatabaseViewProps> = ({
  database,
  isAdmin,
  onDeleteDatabase,
  onSyncDatabase,
  isSyncing = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return database.rows;
    const term = searchTerm.toLowerCase();
    return database.rows.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    );
  }, [database.rows, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const handleExportExcel = async () => {
    try {
      await exportGenericDatabaseToExcel(
        database.headers,
        filteredRows,
        database.name,
        `${database.name.replace(/\s+/g, '_')}_export.xlsx`
      );
    } catch (e) {
      console.error('Error exporting custom database to Excel:', e);
    }
  };

  const primaryColumns = database.headers.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Card */}
      <div className="bg-white rounded-3xl border border-[#EAE5E1] p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl theme-gradient-bg flex items-center justify-center text-white shrink-0 shadow-xs">
              <Database className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-theme-primary bg-theme-10 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Menú Personalizado
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-400" />
                  {database.sourceType === 'google_sheets' ? 'Google Sheets' : 'Archivo CSV / Excel'}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-[#1A1A1E] tracking-tight">
                {database.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                {database.description || `Base de datos personalizada con ${database.totalRows} registros y ${database.headers.length} columnas.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {database.spreadsheetId && (
              <a
                href={database.sourceUrl || `https://docs.google.com/spreadsheets/d/${database.spreadsheetId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100/70 rounded-full transition-all cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Abrir Hoja</span>
                <ExternalLink className="w-3 h-3 text-emerald-500" />
              </a>
            )}

            {onSyncDatabase && database.spreadsheetId && (
              <button
                onClick={() => onSyncDatabase(database.id)}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-theme-primary bg-white border border-theme-primary/30 hover:bg-theme-10 rounded-full transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>
            )}

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-white border border-[#EAE5E1] hover:bg-slate-50 rounded-full transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar Excel</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminar el menú "${database.name}" y su base de datos local?`)) {
                    onDeleteDatabase(database.id);
                  }
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                title="Eliminar este menú"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stat badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#EAE5E1]">
          <div className="bg-[#F8F4F2] p-3 rounded-2xl border border-[#EAE5E1]">
            <span className="text-[11px] text-slate-500 block font-medium">Total Registros</span>
            <span className="text-base font-black text-[#1A1A1E] font-mono">{database.totalRows}</span>
          </div>
          <div className="bg-[#F8F4F2] p-3 rounded-2xl border border-[#EAE5E1]">
            <span className="text-[11px] text-slate-500 block font-medium">Columnas Detectadas</span>
            <span className="text-base font-black text-[#1A1A1E] font-mono">{database.headers.length}</span>
          </div>
          <div className="bg-[#F8F4F2] p-3 rounded-2xl border border-[#EAE5E1]">
            <span className="text-[11px] text-slate-500 block font-medium">Filtrados</span>
            <span className="text-base font-black text-theme-primary font-mono">{filteredRows.length}</span>
          </div>
          <div className="bg-[#F8F4F2] p-3 rounded-2xl border border-[#EAE5E1]">
            <span className="text-[11px] text-slate-500 block font-medium">Última Sincronización</span>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              {database.lastSyncedAt ? new Date(database.lastSyncedAt).toLocaleDateString('es-ES') : 'Hoy'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search & View Mode Controls */}
      <div className="bg-white rounded-2xl border border-[#EAE5E1] p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={`Buscar en ${database.name}...`}
            className="w-full pl-10 pr-9 py-2 text-xs bg-[#F8F4F2] border border-[#EAE5E1] rounded-full focus:outline-none focus:ring-2 focus:ring-theme-primary transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 bg-[#F8F4F2] p-1 rounded-full border border-[#EAE5E1]">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tarjetas</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Content: Table or Cards */}
      {filteredRows.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EAE5E1] p-12 text-center">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1A1A1E]">No se encontraron registros</h3>
          <p className="text-xs text-slate-500 mt-1">
            Intenta con otro término de búsqueda o limpia el filtro.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-[#EAE5E1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F4F2] border-b border-[#EAE5E1] text-[#1A1A1E]">
                  <th className="px-4 py-3 font-bold text-slate-400 w-12 text-center">#</th>
                  {database.headers.map((col, idx) => (
                    <th key={idx} className="px-4 py-3 font-bold uppercase tracking-wider text-[11px] text-slate-700 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5E1]">
                {paginatedRows.map((row, rowIdx) => {
                  const globalIdx = (currentPage - 1) * rowsPerPage + rowIdx + 1;
                  return (
                    <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center font-mono text-slate-400 text-[11px]">
                        {globalIdx}
                      </td>
                      {database.headers.map((col, colIdx) => {
                        const val = row[col] || '';
                        return (
                          <td key={colIdx} className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap max-w-xs truncate">
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-[#EAE5E1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span>Mostrar</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-[#F8F4F2] border border-[#EAE5E1] rounded-lg font-bold text-slate-700 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>filas por página (Total: {filteredRows.length})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-[#F8F4F2] hover:bg-slate-200 border border-[#EAE5E1] rounded-full font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <span className="font-mono text-xs">
                Pág. {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-[#F8F4F2] hover:bg-slate-200 border border-[#EAE5E1] rounded-full font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedRows.map((row, idx) => {
            const firstHeader = database.headers[0];
            const secondHeader = database.headers[1];
            const titleVal = row[firstHeader] || row[secondHeader] || `Registro #${idx + 1}`;

            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-[#EAE5E1] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-theme-primary bg-theme-10 px-2.5 py-0.5 rounded-full font-mono">
                      #{ (currentPage - 1) * rowsPerPage + idx + 1 }
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-[#1A1A1E] leading-snug mb-3">
                    {titleVal}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                    {primaryColumns.map((col, cIdx) => (
                      <div key={cIdx} className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1">
                        <span className="text-[11px] text-slate-400 font-semibold">{col}:</span>
                        <span className="font-bold text-slate-800 text-right truncate max-w-[60%]">
                          {row[col] || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
