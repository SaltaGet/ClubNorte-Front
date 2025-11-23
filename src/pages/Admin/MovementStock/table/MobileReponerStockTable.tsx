import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import type { Product } from "@/hooks/admin/Product/productType";
import type { Category } from "@/hooks/admin/Category/categoryType";
import {
  Store,
  Search,
  Barcode,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MobileReponerStockTableProps {
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
  onSearchNameChange: (value: string) => void;
  onSearchCodeChange: (value: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onPaginationChange: (updater: PaginationState) => void;
  onOpenModal: (product: Product) => void;
}

const MobileReponerStockTable = ({
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
  onSearchNameChange,
  onSearchCodeChange,
  onCategoryChange,
  onPaginationChange,
  onOpenModal,
}: MobileReponerStockTableProps) => {
  // Paginación local para móvil
  const [localPage, setLocalPage] = useState(pagination.pageIndex);

  const handlePageChange = (newPageIndex: number) => {
    setLocalPage(newPageIndex);
    onPaginationChange({ ...pagination, pageIndex: newPageIndex });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    onPaginationChange({ pageIndex: 0, pageSize: newPageSize });
    setLocalPage(0);
  };

  const canPreviousPage = localPage > 0;
  const canNextPage = localPage < totalPages - 1;

  return (
    <div className="lg:hidden space-y-4">
      {/* Filtros de búsqueda y categoría */}
      <div className="grid grid-cols-1 gap-3">
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

      {/* Cards de productos */}
      <div className="space-y-4">
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
              className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-lg p-4 space-y-3"
            >
              {/* Header del producto */}
              <div className="mb-3">
                <h3 className="font-bold text-white text-xl mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500 font-mono">
                    Código: <span className="text-slate-400">{product.code}</span>
                  </span>
                </div>
              </div>

              {/* Stock depósito */}
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                      Stock Depósito
                    </div>
                    <div
                      className={`font-bold text-3xl ${
                        (product.stock_deposit?.stock ?? 0) < 0
                          ? "text-red-500"
                          : "text-amber-400"
                      }`}
                    >
                      {product.stock_deposit?.stock ?? 0}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <div className="text-amber-400 text-xs font-bold">UND</div>
                  </div>
                </div>
              </div>

              {/* Stock por punto de venta */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-4 h-4 text-indigo-400" />
                  <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    Puntos de Venta
                  </p>
                </div>
                {product.stock_point_sales &&
                product.stock_point_sales.length > 0 ? (
                  <div className="space-y-2">
                    {product.stock_point_sales.map((point) => (
                      <div
                        key={point.id}
                        className="flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-lg p-3 hover:border-indigo-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                          <span className="text-slate-200 font-medium truncate">
                            {point.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <span className="text-indigo-400 text-xl font-bold">
                            {point.stock}
                          </span>
                          <span className="text-indigo-500/60 text-xs">
                            und.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-sm bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50">
                    Sin stock asignado
                  </div>
                )}
              </div>

              {/* Botón de acción */}
              <button
                onClick={() => onOpenModal(product)}
                className="w-full px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg"
              >
                Mover Stock
              </button>
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
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(0)}
              disabled={!canPreviousPage}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 transition"
              aria-label="Primera página"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePageChange(localPage - 1)}
              disabled={!canPreviousPage}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 transition"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-slate-400 text-sm px-2">
              Página{" "}
              <strong className="text-white">
                {localPage + 1} de {totalPages}
              </strong>
            </span>

            <button
              onClick={() => handlePageChange(localPage + 1)}
              disabled={!canNextPage}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 transition"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={!canNextPage}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 transition"
              aria-label="Última página"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>

          <select
            value={pagination.pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
  );
};

export default MobileReponerStockTable;