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

import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Barcode,
} from "lucide-react";

import { useGetAllProductsPointSale } from "@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale";
import { useSearchProductsPointSaleByCode } from "@/hooks/pointSale/ProductPointSale/useSearchProductsPointSaleByCode";
import { useSearchProductsPointSaleByName } from "@/hooks/pointSale/ProductPointSale/useSearchProductsPointSaleByName";
import { useGetAllCategories } from "@/hooks/admin/Category/useGetAllCategories"; // <-- Hook para listar categorías
import { useSearchProductsPointSaleByCategory } from "@/hooks/pointSale/ProductPointSale/useSearchProductsPointSaleByCategory";

// Tipo unificado para punto de venta
export interface Product {
  id: number;
  code: string;
  name: string;
  category: {
    id: number;
    name: string;
  };
  price: number;
  stock: number;
}

const TableProductPointSale = () => {
  // Estados de búsqueda
  const [searchCode, setSearchCode] = useState("");
  const [debouncedSearchCode, setDebouncedSearchCode] = useState("");

  const [searchName, setSearchName] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Paginación
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  /**
   * Debounce búsqueda por código
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchCode(searchCode.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [searchCode]);

  /**
   * Debounce búsqueda por nombre
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchName(searchName.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [searchName]);

  /**
   * Hook para obtener datos paginados cuando NO hay búsqueda
   */
  const {
    productsData: allProductsData,
    isLoading: isLoadingAll,
  } = useGetAllProductsPointSale(pagination.pageIndex + 1, pagination.pageSize);

  /**
   * Hook búsqueda por código
   */
  const {
    productsData: productsByCodeData,
    isLoading: isLoadingByCode,
  } = useSearchProductsPointSaleByCode(debouncedSearchCode);

  /**
   * Hook búsqueda por nombre
   */
  const {
    productsData: productsByNameData,
    isLoading: isLoadingByName,
  } = useSearchProductsPointSaleByName(debouncedSearchName);

  /**
   * Hook búsqueda por categoría
   */
  const {
    productsData: productsByCategoryData,
    isLoading: isLoadingByCategory,
  } = useSearchProductsPointSaleByCategory(selectedCategoryId);

  /**
   * Hook para obtener todas las categorías
   */
  const {
    categories,
    isLoading: isLoadingCategories,
  } = useGetAllCategories();

  /**
   * Lógica para determinar qué datos mostrar
   */
  const isSearchingByCode = debouncedSearchCode.length > 0;
  const isSearchingByName = debouncedSearchName.length > 0;
  const isSearchingByCategory = !!selectedCategoryId;
  const isSearching = isSearchingByCode || isSearchingByName || isSearchingByCategory;

  const tableData = isSearchingByCode
    ? productsByCodeData.products
    : isSearchingByName
    ? productsByNameData.products
    : isSearchingByCategory
    ? productsByCategoryData.products
    : allProductsData?.products ?? [];

  const isLoading = isSearchingByCode
    ? isLoadingByCode
    : isSearchingByName
    ? isLoadingByName
    : isSearchingByCategory
    ? isLoadingByCategory
    : isLoadingAll;

  // Configuración de columnas
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
          ${info.getValue().toFixed(0)}
        </span>
      ),
    }),
    columnHelper.accessor("stock", {
      header: "Stock",
      cell: (info) => (
        <span className="text-emerald-500 font-semibold">{info.getValue()}</span>
      ),
    }),
    // columnHelper.display({
    //   id: "actions",
    //   header: "Acciones",
    //   cell: (info) => (
    //     <button
    //       onClick={() => alert(`Producto ID: ${info.row.original.id}`)}
    //       className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
    //     >
    //       <Eye className="w-4 h-4" />
    //     </button>
    //   ),
    // }),
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    pageCount: isSearching ? 1 : allProductsData?.total_pages || 1,
    state: {
      pagination,
      sorting,
    },
    manualPagination: !isSearching, // Paginación manual solo si NO hay búsqueda
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 h-full">
      <div className="w-full max-w-6xl space-y-4">
        {/* Inputs de búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  setSelectedCategoryId(null); // limpiar categoría si busca por código
                }
              }}
              disabled={searchName.trim().length > 0 || !!selectedCategoryId}
              className={`w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                searchName.trim().length > 0 || !!selectedCategoryId
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>

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
                  setSelectedCategoryId(null); // limpiar categoría si busca por nombre
                }
              }}
              disabled={searchCode.trim().length > 0 || !!selectedCategoryId}
              className={`w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                searchCode.trim().length > 0 || !!selectedCategoryId
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
              disabled={searchName.trim().length > 0 || searchCode.trim().length > 0}
              className={`w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500
                ${
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
              {isSearchingByCode
                ? "Buscando productos por código..."
                : isSearchingByName
                ? "Buscando productos por nombre..."
                : isSearchingByCategory
                ? "Buscando productos por categoría..."
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
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-white/10">
                {tableData.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 align-top"
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
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-slate-400 text-sm">
                Página{" "}
                <strong className="text-white">
                  {pagination.pageIndex + 1} de {allProductsData?.total_pages || 1}
                </strong>
              </span>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  table.setPageIndex((allProductsData?.total_pages || 1) - 1)
                }
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>

            <select
              value={pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="ml-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500"
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
    </div>
  );
};

export default TableProductPointSale;
