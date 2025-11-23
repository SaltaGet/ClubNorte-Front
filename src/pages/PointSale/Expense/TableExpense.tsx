import { useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { NumericFormat } from "react-number-format";

// Íconos
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  TrendingDown,
  CreditCard,
  ArrowRightLeft,
  Calendar,
  Wallet,
  FileText,
} from "lucide-react";

import Modal from "@/components/generic/Modal";
import { useGetExpensesByDate } from "@/hooks/pointSale/Expense/useGetExpensesByDate";
import type { Expense } from "@/hooks/pointSale/Expense/ExpenseTypes";
import ExpenseActions from "./ExpenseActions/ExpenseActions";
import { PRESET_BUTTONS, type DateRange } from "@/utils/timeFilter/dateRangeUtils";
import DateRangePicker from "@/utils/timeFilter/DateRangePicker";

const TableExpenses = () => {
  /**
   * Paginación
   */
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  /**
   * Ordenamiento
   */
  const [sorting, setSorting] = useState<SortingState>([]);

  /**
   * Estado para modal
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);

  /**
   * Estado para filtros de fecha
   */
  const [dateRange, setDateRange] = useState<DateRange>(
    PRESET_BUTTONS.lastMonth.getRange()
  );

  /**
   * Params dinámicos con el rango de fechas
   */
  const params = {
    from_date: dateRange.from,
    to_date: dateRange.to,
  };

  /**
   * Llamada al hook para traer datos
   */
  const { expensesData, isLoading } = useGetExpensesByDate(
    params,
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  /**
   * Columnas de la tabla
   */
  const columnHelper = createColumnHelper<Expense>();

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <div className="bg-red-500/10 rounded-lg p-1.5">
            <FileText className="w-3.5 h-3.5 text-red-400" />
          </div>
          <span className="text-slate-300 font-medium text-sm">#{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor(
      (row) => `${row.user.first_name} ${row.user.last_name}`,
      {
        id: "user",
        header: "Usuario",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 rounded-lg p-2">
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white">{info.getValue()}</span>
              <span className="text-xs text-slate-400">{info.row.original.user.email}</span>
            </div>
          </div>
        ),
      }
    ),
    columnHelper.accessor("payment_method", {
      header: "Método de Pago",
      cell: (info) => {
        const method = info.getValue();
        const methodConfig = {
          efectivo: { icon: Wallet, color: 'purple', label: 'Efectivo' },
          tarjeta: { icon: CreditCard, color: 'orange', label: 'Tarjeta' },
          transferencia: { icon: ArrowRightLeft, color: 'cyan', label: 'Transferencia' },
        };
        
        const config = methodConfig[method as keyof typeof methodConfig];
        const Icon = config.icon;
        
        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${config.color}-500/10 border border-${config.color}-500/20`}>
            <Icon className={`w-4 h-4 text-${config.color}-400`} />
            <span className={`text-${config.color}-400 font-medium text-sm`}>{config.label}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("total", {
      header: "Total",
      cell: (info) => (
        <div className="text-right">
          <NumericFormat
            value={info.getValue()}
            displayType="text"
            thousandSeparator="."
            decimalSeparator=","
            prefix="$"
            decimalScale={0}
            fixedDecimalScale
            className="text-red-400 font-bold text-lg"
            renderText={(value) => <span className="text-red-400 font-bold text-lg">{value}</span>}
          />
        </div>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Fecha",
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <div className="flex items-center gap-2">
            <div className="bg-slate-700/50 rounded-lg p-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-200 font-medium text-sm">{format(date, 'dd/MM/yyyy')}</span>
              <span className="text-xs text-slate-500">{format(date, 'HH:mm:ss')}</span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => (
        <button
          onClick={() => {
            setSelectedExpenseId(info.row.original.id);
            setIsModalOpen(true);
          }}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all hover:scale-105 shadow-lg hover:shadow-indigo-500/30"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    }),
  ];

  /**
   * Configuración de la tabla
   */
  const table = useReactTable({
    data: expensesData.expenses || [],
    columns,
    pageCount: expensesData.total_pages || 0,
    state: {
      pagination,
      sorting,
    },
    manualPagination: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Calcular métricas para el resumen
  const totalGeneral = expensesData.expenses?.reduce((acc, expense) => acc + (expense.total || 0), 0) || 0;
  const totalEfectivo = expensesData.expenses?.filter(expense => expense.payment_method === 'efectivo').reduce((acc, expense) => acc + (expense.total || 0), 0) || 0;
  const totalTarjeta = expensesData.expenses?.filter(expense => expense.payment_method === 'tarjeta').reduce((acc, expense) => acc + (expense.total || 0), 0) || 0;
  const totalTransferencia = expensesData.expenses?.filter(expense => expense.payment_method === 'transferencia').reduce((acc, expense) => acc + (expense.total || 0), 0) || 0;
  const usuariosUnicos = expensesData.expenses ? new Set(expensesData.expenses.map(expense => `${expense.user.first_name}-${expense.user.last_name}`)).size : 0;
  const promedioGasto = expensesData.expenses && expensesData.expenses.length > 0 ? totalGeneral / expensesData.expenses.length : 0;

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-full">
      <div className="w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="p-3 bg-red-600 rounded-xl">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">
              Listado de Gastos
            </h2>
            <p className="text-slate-400">Gestiona y visualiza todos los gastos del sistema</p>
          </div>
        </div>

        {/* Filtros con DateRangePicker */}
        <DateRangePicker
          dateRange={dateRange}
          onChange={setDateRange}
          presets={['today', 'last7days', 'last30days', 'lastMonth']}
          defaultPreset="lastMonth"
          showTitle={true}
          buttonStyle="default"
        />

        {/* Tabla */}
        <div className="overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/50 shadow-2xl">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-3 text-slate-400">
                <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                Cargando gastos...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {expensesData.expenses && expensesData.expenses.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-700/30 transition-all duration-200"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-sm"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-red-500/10 rounded-xl p-4">
                            <TrendingDown className="w-12 h-12 text-red-400" />
                          </div>
                          <div className="text-slate-300 font-medium text-lg">
                            No se encontraron gastos
                          </div>
                          <div className="text-sm text-slate-500">
                            Intenta ajustar los filtros de fecha
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800 rounded-xl p-4 border-2 border-slate-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg bg-slate-700 hover:bg-indigo-600 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Primera página"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg bg-slate-700 hover:bg-indigo-600 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Página anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-slate-300 text-sm px-4 py-2 bg-slate-900 rounded-lg font-medium">
              Página{" "}
              <strong className="text-white">
                {pagination.pageIndex + 1}
              </strong>
              {" "}de{" "}
              <strong className="text-white">
                {expensesData.total_pages || 1}
              </strong>
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg bg-slate-700 hover:bg-indigo-600 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Página siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => table.setPageIndex((expensesData.total_pages || 1) - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg bg-slate-700 hover:bg-indigo-600 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Última página"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>

          <select
            value={pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-slate-900 border-2 border-slate-700 text-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Mostrar {size}
              </option>
            ))}
          </select>
        </div>

        {/* Resumen de Métricas - Primera fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 border-2 border-slate-700 hover:border-red-500/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-red-400" />
              <span className="text-sm text-slate-400 font-medium">Total Gastos</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {expensesData.total || 0}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border-2 border-slate-700 hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-400 font-medium">Monto Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              <NumericFormat
                value={totalGeneral}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                decimalScale={0}
                fixedDecimalScale
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border-2 border-slate-700 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-400 font-medium">Efectivo</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              <NumericFormat
                value={totalEfectivo}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                decimalScale={0}
                fixedDecimalScale
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border-2 border-slate-700 hover:border-orange-500/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-slate-400 font-medium">Tarjeta</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">
              <NumericFormat
                value={totalTarjeta}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                decimalScale={0}
                fixedDecimalScale
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border-2 border-slate-700 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-slate-400 font-medium">Transferencias</span>
            </div>
            <div className="text-2xl font-bold text-cyan-400">
              <NumericFormat
                value={totalTransferencia}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                decimalScale={0}
                fixedDecimalScale
              />
            </div>
          </div>
        </div>

        {/* Resumen adicional - Segunda fila */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 border-2 border-slate-700 hover:border-yellow-500/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-slate-400 font-medium">Promedio por Gasto</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              <NumericFormat
                value={promedioGasto}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                decimalScale={0}
                fixedDecimalScale
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border-2 border-slate-700 hover:border-indigo-500/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-slate-400 font-medium">Usuarios Únicos</span>
            </div>
            <div className="text-3xl font-bold text-indigo-400">
              {usuariosUnicos}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border-2 border-slate-700 hover:border-pink-500/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-pink-400" />
              <span className="text-sm text-slate-400 font-medium">Período</span>
            </div>
            <div className="text-sm font-bold text-pink-400">
              {dateRange.from === dateRange.to 
                ? format(new Date(dateRange.from), 'dd/MM/yyyy')
                : `${format(new Date(dateRange.from), 'dd/MM/yyyy')} - ${format(new Date(dateRange.to), 'dd/MM/yyyy')}`
              }
            </div>
          </div>
        </div>

      </div>

      {/* Modal para ver detalles del gasto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpenseId(null);
        }}
        title="Detalle del Gasto"
        size="md"
      >
        {selectedExpenseId && (
          <ExpenseActions id={selectedExpenseId} />
        )}
      </Modal>
    </div>
  );
};

export default TableExpenses;