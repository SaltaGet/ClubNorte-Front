import { useState, useEffect } from "react";
import { Warehouse, ArrowRight } from "lucide-react";
import { useGetAllProducts } from "@/hooks/admin/Product/useGetAllProducts";
import { useSearchProductsByName } from "@/hooks/admin/Product/useSearchProductsByName";
import { useGetProductsByCategory } from "@/hooks/admin/Product/useGetProductsByCategory";
import { useGetAllCategories } from "@/hooks/admin/Category/useGetAllCategories";
import { usePointSaleGetAll } from "@/hooks/pointSale/usePointSaleGetAll";
import { useMovementStockMutations } from "@/hooks/admin/MovementStock/useMovementStockMutations";
import type { Product } from "@/hooks/admin/Product/productType";
import type { MovementStockBulkData } from "@/hooks/admin/MovementStock/useMovementStockMutations";
import { Button } from "@/components/ui/button";
import Modal from "@/components/generic/Modal";
import BulkMovementFilters from "./BulkMovementFilters";
import AdjustDepositStock from "../../formMovementStock/AdjustDepositStock";
import BulkMovementTableComponent from "./BulkMovementTableComponent";

interface ProductMovements {
  [productId: number]: {
    [pointSaleId: number]: number;
  };
}

interface PointSale {
  id: number;
  name: string;
}

const BulkMovementTable = () => {
  // Estados para búsqueda
  const [searchName, setSearchName] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");

  // Estado para categoría
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  const { productsData, isLoading: isLoadingProducts } = useGetAllProducts(
    1,
    100
  );
  const { products: searchedByName, isLoading: isLoadingName } =
    useSearchProductsByName(debouncedSearchName);
  const { products: productsByCategory, isLoading: isLoadingCategory } =
    useGetProductsByCategory(selectedCategoryId);
  const { categories, isLoading: isLoadingCategories } = useGetAllCategories();
  const { pointSales, isLoading: isLoadingPoints } = usePointSaleGetAll();
  const {
    createMovementStockBulk,
    isCreatingBulk,
    isCreatedBulk,
    resetCreateBulkState,
  } = useMovementStockMutations();

  const [productMovements, setProductMovements] = useState<ProductMovements>(
    {}
  );
  const [ignoreStock, setIgnoreStock] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Debounce búsqueda por nombre
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchName(searchName);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchName]);

  // Determinar estado de búsqueda y datos a mostrar
  const isSearchingByName = debouncedSearchName.trim().length > 3;
  const isFilteringByCategory = !!selectedCategoryId;

  const products: Product[] = isFilteringByCategory
    ? productsByCategory
    : isSearchingByName
    ? searchedByName
    : productsData?.products || [];

  const pointSalesList: PointSale[] = pointSales || [];

  const isLoading = isFilteringByCategory
    ? isLoadingCategory
    : isSearchingByName
    ? isLoadingName
    : isLoadingProducts || isLoadingPoints;

  // Reset cuando la operación es exitosa
  if (isCreatedBulk) {
    setProductMovements({});
    setIgnoreStock(false);
    resetCreateBulkState();
  }

  // Actualizar cantidad de un movimiento con validación
  const updateAmount = (
    productId: number,
    pointSaleId: number,
    amount: number
  ): void => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const depositStock = getDepositStock(product);
    let finalAmount = amount >= 0 ? amount : 0;

    if (!ignoreStock) {
      const currentTotal = getTotalMovements(productId);
      const otherMovements =
        currentTotal - (productMovements[productId]?.[pointSaleId] || 0);
      const maxAllowed = depositStock - otherMovements;

      if (finalAmount > maxAllowed) {
        finalAmount = maxAllowed > 0 ? maxAllowed : 0;
      }
    }

    setProductMovements((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [pointSaleId]: finalAmount,
      },
    }));
  };

  // Distribuir equitativamente entre todos los puntos de venta
  const distributeEqually = (productId: number): void => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const depositStock = getDepositStock(product);
    if (depositStock <= 0 && !ignoreStock) return;

    const numPoints = pointSalesList.length;
    const amountPerPoint = Math.floor(depositStock / numPoints);

    const newMovements: { [key: number]: number } = {};
    pointSalesList.forEach((ps) => {
      newMovements[ps.id] = amountPerPoint;
    });

    setProductMovements((prev) => ({
      ...prev,
      [productId]: newMovements,
    }));
  };

  // Asignar todo el stock a un punto de venta específico
  const assignAllToPoint = (productId: number, pointSaleId: number): void => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const depositStock = getDepositStock(product);
    if (depositStock <= 0 && !ignoreStock) return;

    const newMovements: { [key: number]: number } = {};
    pointSalesList.forEach((ps) => {
      newMovements[ps.id] = 0;
    });

    newMovements[pointSaleId] = depositStock;

    setProductMovements((prev) => ({
      ...prev,
      [productId]: newMovements,
    }));
  };

  // Calcular totales por producto
  const getTotalMovements = (productId: number): number => {
    const movements = productMovements[productId] || {};
    return Object.values(movements).reduce((sum, amount) => sum + amount, 0);
  };

  // Obtener stock de depósito de un producto
  const getDepositStock = (product: Product): number => {
    return product.stock_deposit?.stock ?? 0;
  };

  // Obtener stock de un punto de venta específico para un producto
  const getPointSaleStock = (product: Product, pointSaleId: number): number => {
    const stockPoint = product.stock_point_sales?.find(
      (sp) => sp.id === pointSaleId
    );
    return stockPoint?.stock ?? 0;
  };

  // Validar si hay movimientos para ejecutar
  const hasValidMovements = (): boolean => {
    return Object.values(productMovements).some((movements) =>
      Object.values(movements).some((amount) => (amount as number) > 0)
    );
  };

  // Ejecutar todos los movimientos en bulk
  const handleExecuteBulk = (): void => {
    // Validar stock si ignoreStock está desactivado
    if (!ignoreStock) {
      const errors: string[] = [];

      Object.keys(productMovements).forEach((productIdStr) => {
        const productId = Number(productIdStr);
        const product = products.find((p) => p.id === productId);

        if (!product) return;

        const totalToMove = getTotalMovements(productId);
        const depositStock = getDepositStock(product);

        if (totalToMove > depositStock) {
          errors.push(
            `${product.name}: intentas mover ${totalToMove} unidades pero solo hay ${depositStock} en depósito`
          );
        }
      });

      if (errors.length > 0) {
        alert(
          "No se puede ejecutar la operación:\n\n" +
            errors.join("\n") +
            "\n\nReduce las cantidades o activa 'Ignorar validación de stock'"
        );
        return;
      }
    }

    const bulkData: MovementStockBulkData[] = [];

    Object.keys(productMovements).forEach((productIdStr) => {
      const productId = Number(productIdStr);
      const movements = productMovements[productId];

      if (!movements) return;

      const validMovements = Object.keys(movements)
        .map((pointSaleIdStr) => {
          const pointSaleId = Number(pointSaleIdStr);
          const amount = movements[pointSaleId] as number;
          return { pointSaleId, amount };
        })
        .filter((mov) => mov.amount > 0)
        .map((mov) => ({
          amount: mov.amount,
          from_id: 1,
          from_type: "deposit" as const,
          ignore_stock: ignoreStock,
          to_id: mov.pointSaleId,
          to_type: "point_sale" as const,
        }));

      if (validMovements.length > 0) {
        bulkData.push({
          product_id: productId,
          movement_stock_item: validMovements,
        });
      }
    });

    if (bulkData.length === 0) {
      alert("No hay movimientos válidos para ejecutar");
      return;
    }

    createMovementStockBulk(bulkData);
  };

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-32 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-3 sm:p-4 md:p-6 border border-indigo-500/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
              Movimientos Masivos
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-tight">
              Distribuye stock desde depósito a puntos de venta
            </p>
          </div>
          <Warehouse className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-indigo-400 flex-shrink-0" />
        </div>
      </div>

      {/* Filtros */}
      <BulkMovementFilters
        searchName={searchName}
        setSearchName={setSearchName}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        categories={categories}
        isLoadingCategories={isLoadingCategories}
        isFilteringByCategory={isFilteringByCategory}
      />

      {/* Loading state para la tabla */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-slate-800 rounded-xl border border-slate-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        /* Tabla/Cards de productos */
        <BulkMovementTableComponent
          products={products}
          pointSalesList={pointSalesList}
          productMovements={productMovements}
          ignoreStock={ignoreStock}
          isCreatingBulk={isCreatingBulk}
          updateAmount={updateAmount}
          distributeEqually={distributeEqually}
          assignAllToPoint={assignAllToPoint}
          getTotalMovements={getTotalMovements}
          getDepositStock={getDepositStock}
          getPointSaleStock={getPointSaleStock}
          handleOpenModal={handleOpenModal}
        />
      )}

      {/* Footer con controles */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 fixed bottom-0 left-0 right-0 md:static shadow-2xl md:shadow-none z-20 mx-2 mb-2 sm:mx-4 sm:mb-4 md:mx-0 md:mb-0">
        {/* Checkbox ignorar stock */}
        <div className="flex items-start gap-2 sm:gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 sm:p-3 md:p-4">
          <input
            type="checkbox"
            id="ignore-stock"
            checked={ignoreStock}
            onChange={(e) => setIgnoreStock(e.target.checked)}
            disabled={isCreatingBulk}
            className="w-4 h-4 sm:w-5 sm:h-5 rounded mt-0.5 flex-shrink-0"
          />
          <label
            htmlFor="ignore-stock"
            className="text-amber-300 text-xs sm:text-sm leading-tight cursor-pointer"
          >
            Ignorar validación de stock (permitir stock negativo)
          </label>
        </div>

        {/* Botón ejecutar */}
        <Button
          onClick={handleExecuteBulk}
          disabled={isCreatingBulk || !hasValidMovements()}
          className="w-full h-11 sm:h-12 md:h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed px-3"
        >
          <Warehouse className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1.5 sm:mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm md:text-base lg:text-lg truncate">
            {isCreatingBulk
              ? "Procesando..."
              : "Ejecutar Movimientos"}
          </span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-1.5 sm:ml-2 flex-shrink-0" />
        </Button>
      </div>

      {/* Modal para actualizar stock */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Actualizar Stock Manualmente"
        description={selectedProduct ? `Producto: ${selectedProduct.name}` : ""}
        size="lg"
      >
        {selectedProduct && (
          <AdjustDepositStock
            productId={selectedProduct.id}
            onBack={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default BulkMovementTable