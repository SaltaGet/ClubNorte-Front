import { useState, useMemo } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import type { Product } from "@/hooks/admin/Product/productType";
import type { Category } from "@/hooks/admin/Category/categoryType";
import {
  Eye,
  Store,
  Search,
  Barcode,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Modal from "@/components/generic/Modal";

import type { OnChangeFn, PaginationState } from "@tanstack/react-table";

interface DesktopProductTableProps {
  tableData: Product[];
  isLoading: boolean;
  isLoadingCategories: boolean;
  isSearchingByName: boolean;
  isSearchingByCode: boolean;
  isFilteringByCategory: boolean;
  isSearching: boolean;
  categories: Category[];
  searchName: string;
  searchCode: string;
  selectedCategoryId: number | null;
  pagination: PaginationState;
  totalPages: number;
  EditDeleteComponent?: React.ComponentType<{ id: number; onClose: () => void }>;
  onSearchNameChange: (value: string) => void;
  onSearchCodeChange: (value: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onPaginationChange: OnChangeFn<PaginationState>;
}

const DesktopProductTable = ({
  tableData,
  isLoading,
  isLoadingCategories,
  isSearchingByName,
  isSearchingByCode,
  isFilteringByCategory,
  isSearching,
  categories,
  searchName,
  searchCode,
  selectedCategoryId,
  pagination,
  totalPages,
  EditDeleteComponent,
  onSearchNameChange,
  onSearchCodeChange,
  onCategoryChange,
  onPaginationChange,
}: DesktopProductTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Estado del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const handleOpenModal = (productId: number) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  /**
   * Columnas
   */
  const columnHelper = createColumnHelper<Product>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => (
          <span className="text-slate-400 font-mono">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("code", {
        header: "Código",
        cell: (info) => (
          <span className="font-medium text-slate-300">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Nombre",
        cell: (info) => (
          <span className="font-semibold text-white">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("price", {
        header: "Precio",
        cell: (info) => (
          <span className="text-emerald-500 font-medium">
            ${info.getValue().toFixed(0)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "stocks",
        header: "Stock por punto de venta",
        cell: (info) => {
          const { stock_point_sales } = info.row.original;
          return (
            <div className="space-y-1">
              {stock_point_sales && stock_point_sales.length > 0 ? (
                stock_point_sales.map((point) => (
                  <div
                    key={point.id}
                    className="flex items-center gap-2 text-slate-300 text-sm"
                  >
                    <Store className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{point.name}:</span>
                    <span className="text-emerald-500 font-medium">
                      {point.stock}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic text-sm">
                  Sin stock en puntos de venta
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => row.stock_deposit?.stock ?? 0, {
        id: "stock_deposit_only",
        header: "Stock Depósito",
        cell: (info) => (
          <span className="text-emerald-500 font-semibold">
            {info.getValue()}
          </span>
        ),
      }),
      // Solo mostrar columna de acciones si EditDeleteComponent está disponible
      ...(EditDeleteComponent ? [
        columnHelper.display({
          id: "actions",
          header: "Acciones",
          cell: (info) => (
            <button
              onClick={() => handleOpenModal(info.row.original.id)}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
              aria-label="Ver y editar producto"
            >
              <Eye className="w-4 h-4" />
            </button>
          ),
        })
      ] : []),
    ],
    [EditDeleteComponent]
  );

  /**
   * Configuración de la tabla
   */
  const table = useReactTable({
    data: tableData,
    columns,
    pageCount: totalPages,
    state: {
      pagination,
      sorting,
    },
    manualPagination: !isSearching,
    onPaginationChange,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="hidden lg:block space-y-4">
        {/* Filtros de búsqueda y categoría */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Buscar por nombre */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchName}
              onChange={(e) => onSearchNameChange(e.target.value)}
              disabled={searchCode.trim().length > 0 || isFilteringByCategory}
              className={`w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                searchCode.trim().length > 0 || isFilteringByCategory
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>

          {/* Buscar por código */}
          <div className="relative">
            <Barcode className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código..."
              value={searchCode}
              onChange={(e) => onSearchCodeChange(e.target.value)}
              disabled={searchName.trim().length > 0 || isFilteringByCategory}
              className={`w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                searchName.trim().length > 0 || isFilteringByCategory
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>

          {/* Filtro por categoría */}
          <div>
            <select
              value={selectedCategoryId ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                onCategoryChange(value ? Number(value) : null);
              }}
              disabled={
                searchName.trim().length > 0 || searchCode.trim().length > 0
              }
              className={`w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
                searchName.trim().length > 0 || searchCode.trim().length > 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">Filtrar por categoría</option>
              {isLoadingCategories ? (
                <option disabled>Cargando categorías...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
          {isLoading ? (
            <div className="p-6 text-slate-400 text-center">
              {isFilteringByCategory
                ? "Cargando productos por categoría..."
                : isSearchingByName
                ? "Buscando productos por nombre..."
                : isSearchingByCode
                ? "Buscando productos por código..."
                : "Cargando productos..."}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
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
              <tbody className="divide-y divide-white/10">
                {tableData.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`px-6 py-4 text-sm text-slate-300 align-top ${
                            cell.column.id === "stocks" ? "" : "whitespace-nowrap"
                          }`}
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
                      className="px-6 py-4 text-center text-sm text-slate-400"
                    >
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación solo si NO hay búsqueda */}
        {!isSearching && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 transition"
                aria-label="Primera página"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 transition"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-slate-400 text-sm px-2">
                Página{" "}
                <strong className="text-white">
                  {pagination.pageIndex + 1} de {totalPages}
                </strong>
              </span>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 transition"
                aria-label="Página siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => table.setPageIndex(totalPages - 1)}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 transition"
                aria-label="Última página"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>

            <select
              value={pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              aria-label="Tamaño de página"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  Mostrar {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Modal con EditDeleteComponent */}
      {EditDeleteComponent && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Editar Producto"
          size="md"
        >
          {selectedProductId && (
            <EditDeleteComponent id={selectedProductId} onClose={handleCloseModal} />
          )}
        </Modal>
      )}
    </>
  );
};

export default DesktopProductTable;