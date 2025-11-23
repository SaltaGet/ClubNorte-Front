import { useState, useEffect } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { useGetAllProducts } from "@/hooks/admin/Product/useGetAllProducts";
import { useSearchProductsByName } from "@/hooks/admin/Product/useSearchProductsByName";
import { useSearchProductsByCode } from "@/hooks/admin/Product/useSearchProductsByCode";
import { useGetProductsByCategory } from "@/hooks/admin/Product/useGetProductsByCategory";
import { useGetAllCategories } from "@/hooks/admin/Category/useGetAllCategories";

// Íconos
import {
  Eye,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Store,
  Search,
  Barcode,
} from "lucide-react";
import Modal from "@/components/generic/Modal";
import EditDeleteProduct from "./EditDeleteProduct";
import type { Product } from "@/hooks/admin/Product/productType";

const TableProduct = () => {
  /**
   * Estados de búsqueda
   */
  const [searchName, setSearchName] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");

  const [searchCode, setSearchCode] = useState("");
  const [debouncedSearchCode, setDebouncedSearchCode] = useState("");

  /**
   * Estado para categoría seleccionada
   */
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  // Para el Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );

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
   * Debounce para búsqueda por nombre
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchName(searchName);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchName]);

  /**
   * Debounce para búsqueda por código
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchCode(searchCode);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchCode]);

  /**
   * Hooks para obtener datos
   */
  const { categories, isLoading: isLoadingCategories } = useGetAllCategories();

  const { productsData, isLoading: isLoadingAll } = useGetAllProducts(
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  const { products: searchedByName, isLoading: isLoadingName } =
    useSearchProductsByName(debouncedSearchName);

  const { products: searchedByCode, isLoading: isLoadingCode } =
    useSearchProductsByCode(debouncedSearchCode);

  const { products: productsByCategory, isLoading: isLoadingCategory } =
    useGetProductsByCategory(selectedCategoryId);

  /**
   * Lógica para determinar qué datos mostrar
   */
  const isSearchingByName = debouncedSearchName.trim().length > 0;
  const isSearchingByCode = debouncedSearchCode.trim().length > 0;
  const isFilteringByCategory = !!selectedCategoryId;

  const isSearching =
    isSearchingByName || isSearchingByCode || isFilteringByCategory;

  const tableData = isFilteringByCategory
    ? productsByCategory
    : isSearchingByName
    ? searchedByName
    : isSearchingByCode
    ? searchedByCode
    : productsData.products;

  const isLoading = isFilteringByCategory
    ? isLoadingCategory
    : isSearchingByName
    ? isLoadingName
    : isSearchingByCode
    ? isLoadingCode
    : isLoadingAll;

  /**
   * Columnas
   */
  const columnHelper = createColumnHelper<Product>();

  const columns = [
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
          ${info.getValue().toFixed(2)}
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
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => (
        <button
          onClick={() => {
            setSelectedProductId(info.row.original.id);
            setIsEditModalOpen(true);
          }}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
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
    data: tableData,
    columns,
    pageCount: productsData.total_pages,
    state: {
      pagination,
      sorting,
    },
    manualPagination: !isSearching,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col items-center w-full p-4 md:p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-7xl space-y-4">
        {/* Filtros de búsqueda y categoría */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Buscar por nombre */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                if (e.target.value.trim()) {
                  setSearchCode("");
                  setSelectedCategoryId(null);
                }
              }}
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
              onChange={(e) => {
                setSearchCode(e.target.value);
                if (e.target.value.trim()) {
                  setSearchName("");
                  setSelectedCategoryId(null);
                }
              }}
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
                setSelectedCategoryId(value ? Number(value) : null);
                setSearchName("");
                setSearchCode("");
              }}
              disabled={
                searchName.trim().length > 0 || searchCode.trim().length > 0
              }
              className={`w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500
      ${
        searchName.trim().length > 0 || searchCode.trim().length > 0
          ? "opacity-50 cursor-not-allowed"
          : ""
      }
    `}
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

        {/* Vista Desktop: Tabla tradicional */}
        <div className="hidden lg:block overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
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
                          className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 align-top"
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

        {/* Vista Móvil/Tablet: Cards */}
        <div className="lg:hidden space-y-4">
          {isLoading ? (
            <div className="p-6 text-slate-400 text-center rounded-2xl border border-white/10 bg-white/5">
              {isFilteringByCategory
                ? "Cargando productos por categoría..."
                : isSearchingByName
                ? "Buscando productos por nombre..."
                : isSearchingByCode
                ? "Buscando productos por código..."
                : "Cargando productos..."}
            </div>
          ) : tableData.length > 0 ? (
            tableData.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-lg p-4 space-y-3 relative"
              >
                {/* Botón de acción sticky en la esquina superior derecha */}
                <button
                  onClick={() => {
                    setSelectedProductId(product.id);
                    setIsEditModalOpen(true);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg z-10"
                  aria-label="Ver producto"
                >
                  <Eye className="w-5 h-5" />
                </button>

                {/* Contenido del producto */}
                <div className="pr-12">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {product.name}
                      </h3>
                      <p className="text-slate-400 text-sm font-mono">
                        ID: {product.id} • Código: {product.code}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-emerald-500 font-bold text-xl">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Stock por punto de venta */}
                  <div className="space-y-2 mb-3">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Stock por punto de venta
                    </p>
                    {product.stock_point_sales &&
                    product.stock_point_sales.length > 0 ? (
                      <div className="space-y-1">
                        {product.stock_point_sales.map((point) => (
                          <div
                            key={point.id}
                            className="flex items-center gap-2 text-slate-300 text-sm bg-white/5 rounded-lg p-2"
                          >
                            <Store className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="truncate flex-1">{point.name}</span>
                            <span className="text-emerald-500 font-medium">
                              {point.stock}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 italic text-sm">
                        Sin stock en puntos de venta
                      </div>
                    )}
                  </div>

                  {/* Stock depósito */}
                  <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <span className="text-slate-400 text-sm font-medium">
                      Stock Depósito
                    </span>
                    <span className="text-emerald-500 font-bold text-lg">
                      {product.stock_deposit?.stock ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-slate-400 rounded-2xl border border-white/10 bg-white/5">
              No se encontraron productos
            </div>
          )}
        </div>

        {/* Paginación solo si NO hay búsqueda */}
        {!isSearching && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
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
                  {pagination.pageIndex + 1} de {productsData.total_pages}
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
                onClick={() => table.setPageIndex(productsData.total_pages - 1)}
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProductId(null);
        }}
        title="Editar Producto"
        size="md"
      >
        {selectedProductId && (
          <EditDeleteProduct
            id={selectedProductId}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default TableProduct;