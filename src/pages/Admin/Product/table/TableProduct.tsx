import { useState, useEffect } from "react";
import { useGetAllProducts } from "@/hooks/admin/Product/useGetAllProducts";
import { useSearchProductsByName } from "@/hooks/admin/Product/useSearchProductsByName";
import { useSearchProductsByCode } from "@/hooks/admin/Product/useSearchProductsByCode";
import { useGetProductsByCategory } from "@/hooks/admin/Product/useGetProductsByCategory";
import { useGetAllCategories } from "@/hooks/admin/Category/useGetAllCategories";

// Componentes modularizados
import DesktopProductTable from "./DesktopProductTable";
import MobileProductTable from "./MobileProductTable";
import EditDeleteProduct from "../EditDeleteProduct";

// Componente de edición/eliminación

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

  /**
   * Paginación
   */
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

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
   * Props compartidas para ambas tablas
   */
  const sharedTableProps = {
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
    totalPages: productsData.total_pages,
    EditDeleteComponent: EditDeleteProduct, // Opcional: Puedes pasarlo condicionalmente según permisos
    onSearchNameChange: (value: string) => {
      setSearchName(value);
      if (value.trim()) {
        setSearchCode("");
        setSelectedCategoryId(null);
      }
    },
    onSearchCodeChange: (value: string) => {
      setSearchCode(value);
      if (value.trim()) {
        setSearchName("");
        setSelectedCategoryId(null);
      }
    },
    onCategoryChange: (categoryId: number | null) => {
      setSelectedCategoryId(categoryId);
      setSearchName("");
      setSearchCode("");
    },
    onPaginationChange: setPagination,
  };

  return (
    <div className="flex flex-col items-center w-full p-4 md:p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-7xl space-y-4">
        {/* Tabla Desktop */}
        <DesktopProductTable {...sharedTableProps} />

        {/* Tabla Mobile/Tablet */}
        <MobileProductTable {...sharedTableProps} />
      </div>
    </div>
  );
};

export default TableProduct;