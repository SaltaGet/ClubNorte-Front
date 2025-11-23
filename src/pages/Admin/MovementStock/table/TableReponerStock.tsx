import { useState, useEffect } from "react";
import { useGetAllProducts } from "@/hooks/admin/Product/useGetAllProducts";
import { useSearchProductsByName } from "@/hooks/admin/Product/useSearchProductsByName";
import { useSearchProductsByCode } from "@/hooks/admin/Product/useSearchProductsByCode";
import { useGetProductsByCategory } from "@/hooks/admin/Product/useGetProductsByCategory";
import { useGetAllCategories } from "@/hooks/admin/Category/useGetAllCategories";
import type { Product } from "@/hooks/admin/Product/productType";

// Componentes modularizados
import DesktopReponerStockTable from "./DesktopReponerStockTable";
import MobileReponerStockTable from "./MobileReponerStockTable";
import FormMovementStock from "@/pages/Admin/MovementStock/formMovementStock/FormMovementStock";
import Modal from "@/components/generic/Modal";

const TableReponerStock = () => {
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
   * Estado del modal
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
   * Funciones del modal
   */
  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

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
    onOpenModal: handleOpenModal,
  };

  return (
    <div className="flex flex-col items-center w-full p-4 md:p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-7xl space-y-4">
        {/* Tabla Desktop */}
        <DesktopReponerStockTable {...sharedTableProps} />

        {/* Tabla Mobile/Tablet */}
        <MobileReponerStockTable {...sharedTableProps} />
      </div>

      {/* Modal con el formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProduct ? ` ${selectedProduct.name}` : "Mover Stock"}
        description={selectedProduct ? `Código: ${selectedProduct.code}` : undefined}
        size="md"
      >
        {selectedProduct && (
          <FormMovementStock productId={selectedProduct.id} />
        )}
      </Modal>
    </div>
  );
};

export default TableReponerStock;