import { useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  useReactTable,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Eye,
  DollarSign,
  Lock,
  Unlock,
  User,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

import Modal from "@/components/generic/Modal";
import { useGetRegisterInfoByDate } from "@/hooks/admin/Register/useGetRegisterInfoByDate";
import type { RegisterType } from "@/hooks/admin/Register/registerType";
import RegisterActions from "./RegisterActions/RegisterActions";
import { PRESET_BUTTONS, type DateRange } from "@/utils/timeFilter/dateRangeUtils";
import DateRangePicker from "@/utils/timeFilter/DateRangePicker";

const TableRegisters = () => {
  /**
   * Paginación (local)
   */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  /**
   * Ordenamiento
   */
  const [sorting, setSorting] = useState<SortingState>([]);

  /**
   * Estado modal
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegisterId, setSelectedRegisterId] = useState<number | null>(null);

  /**
   * Filtros de fecha
   */
  const [dateRange, setDateRange] = useState<DateRange>(
  PRESET_BUTTONS.today.getRange() // Cambiar de lastMonth a today
);

  const params = { 
    from_date: dateRange.from, 
    to_date: dateRange.to 
  };

  /**
   * Llamada al hook
   */
  const { registersData, isLoading } = useGetRegisterInfoByDate(params);

  /**
   * Columnas
   */
  const columnHelper = createColumnHelper<RegisterType>();

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <span className="text-slate-400 font-mono text-sm">{info.getValue()}</span>
      ),
    }),
    
    // Columna combinada: Usuarios (Apertura/Cierre)
    columnHelper.display({
      id: "usuarios",
      header: "Usuarios",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-emerald-400" />
              <div className="text-xs">
                <span className="text-emerald-400 font-medium">Apertura:</span>
                <br />
                <span className="text-white">
                  {row.user_open.first_name} {row.user_open.last_name}
                </span>
              </div>
            </div>
            {row.user_close && (
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-red-400" />
                <div className="text-xs">
                  <span className="text-red-400 font-medium">Cierre:</span>
                  <br />
                  <span className="text-white">
                    {row.user_close.first_name} {row.user_close.last_name}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      },
    }),

    // Columna combinada: Montos (Apertura/Cierre)
    columnHelper.display({
      id: "montos",
      header: "Montos",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="space-y-1">
            <div className="text-xs">
              <span className="text-slate-400">Inicial:</span>
              <span className="text-emerald-400 font-medium ml-1">
                ${row.open_amount.toLocaleString("es-AR")}
              </span>
            </div>
            {row.close_amount !== null && (
              <div className="text-xs">
                <span className="text-slate-400">Final:</span>
                <span className="text-blue-400 font-medium ml-1">
                  ${row.close_amount.toLocaleString("es-AR")}
                </span>
              </div>
            )}
          </div>
        );
      },
    }),

    // Columna combinada: Movimientos de Efectivo
    columnHelper.display({
      id: "movimientos_efectivo",
      header: "Efectivo",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpCircle className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">
                ${row.total_income_cash.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <ArrowDownCircle className="w-3 h-3 text-red-400" />
              <span className="text-red-400 font-medium">
                ${row.total_expense_cash.toLocaleString("es-AR")}
              </span>
            </div>
          </div>
        );
      },
    }),

    // Columna combinada: Otros Movimientos
    columnHelper.display({
      id: "movimientos_otros",
      header: "Otros",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpCircle className="w-3 h-3 text-blue-400" />
              <span className="text-blue-400 font-medium">
                ${row.total_income_others.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <ArrowDownCircle className="w-3 h-3 text-orange-400" />
              <span className="text-orange-400 font-medium">
                ${row.total_expense_others.toLocaleString("es-AR")}
              </span>
            </div>
          </div>
        );
      },
    }),

    // Columna combinada: Estado y Fechas
    columnHelper.display({
      id: "estado_fechas",
      header: "Estado & Horarios",
      cell: (info) => {
        const row = info.row.original;
        const openDate = new Date(row.hour_open);
        const closeDate = row.hour_close ? new Date(row.hour_close) : null;
        
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {row.is_close ? (
                <>
                  <Lock className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium text-xs">Cerrado</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium text-xs">Abierto</span>
                </>
              )}
            </div>
            
            <div className="text-xs space-y-1">
              <div className="text-slate-400">
                <span className="text-emerald-400">Abierto:</span>
                <br />
                {openDate.toLocaleDateString("es-AR")}
                <br />
                {openDate.toLocaleTimeString("es-AR", { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              {closeDate && (
                <div className="text-slate-400">
                  <span className="text-red-400">Cerrado:</span>
                  <br />
                  {closeDate.toLocaleDateString("es-AR")}
                  <br />
                  {closeDate.toLocaleTimeString("es-AR", { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: (info) => (
        <button
          onClick={() => {
            setSelectedRegisterId(info.row.original.id);
            setIsModalOpen(true);
          }}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    }),
  ];

  /**
   * Configuración tabla
   */
  const table = useReactTable({
    data: registersData || [],
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false, // paginación local
    pageCount: Math.ceil((registersData?.length || 0) / pagination.pageSize),
  });

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">
              Listado de Cajas
            </h2>
            <p className="text-slate-400">Consulta los registros de apertura/cierre</p>
          </div>
        </div>

        {/* Filtros con DateRangePicker */}
        <DateRangePicker
          dateRange={dateRange}
          onChange={setDateRange}
          presets={['today', 'last7days', 'last30days', 'lastMonth']}
          defaultPreset="today"
          showTitle={true}
          buttonStyle="default"
        />

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Cargando registros...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-white/10">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-white/5 transition-all duration-200"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-4 py-4 text-sm text-slate-300 align-top"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        No se encontraron registros
                      </td>
                    </tr>
                    )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">
              Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                registersData?.length || 0
              )}{" "}
              de {registersData?.length || 0} registros
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-2 text-sm bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition"
            >
              ««
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-2 text-sm bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition"
            >
              «
            </button>
            <span className="px-3 py-2 text-sm text-slate-300">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-2 text-sm bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition"
            >
              »
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-2 text-sm bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition"
            >
              »»
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRegisterId(null);
        }}
        title="Detalle del Registro"
        size="md"
      >
        {selectedRegisterId && (
          <div className="text-slate-300">
            <RegisterActions id={selectedRegisterId} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TableRegisters;