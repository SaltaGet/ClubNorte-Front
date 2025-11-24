import { useState, useEffect } from "react";
import {
  Package,
  Warehouse,
  Store,
  ArrowRight,
  Zap,
  Divide,
  Search,
  Edit,
} from "lucide-react";
import { useGetAllProducts } from "@/hooks/admin/Product/useGetAllProducts";
import { useSearchProductsByName } from "@/hooks/admin/Product/useSearchProductsByName";
import { useGetProductsByCategory } from "@/hooks/admin/Product/useGetProductsByCategory";
import { useGetAllCategories } from "@/hooks/admin/Category/useGetAllCategories";
import { usePointSaleGetAll } from "@/hooks/pointSale/usePointSaleGetAll";
import { useMovementStockMutations } from "@/hooks/admin/MovementStock/useMovementStockMutations";
import type { Product } from "@/hooks/admin/Product/productType";
import type { MovementStockBulkData } from "@/hooks/admin/MovementStock/useMovementStockMutations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import Modal from "@/components/generic/Modal";
import AdjustDepositStock from "../formMovementStock/AdjustDepositStock";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-32 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-4 md:p-6 border border-indigo-500/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
              Movimientos Masivos
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Distribuye stock desde depósito a todos los puntos de venta
            </p>
          </div>
          <Warehouse className="w-10 h-10 md:w-12 md:h-12 text-indigo-400" />
        </div>
      </div>

      {/* Filtros de búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                setSelectedCategoryId(null);
              }
            }}
            disabled={isFilteringByCategory}
            className={`w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              isFilteringByCategory ? "opacity-50 cursor-not-allowed" : ""
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
            }}
            disabled={searchName.trim().length > 0}
            className={`w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
              searchName.trim().length > 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <option value="">Todas las categorías</option>
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

      {/* Vista Cards para móvil y tablet (< lg) */}
      <div className="lg:hidden space-y-3">
        {products.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <p className="text-slate-400">No se encontraron productos</p>
          </div>
        ) : (
          products.map((product) => {
            const movements = productMovements[product.id] || {};
            const depositStock = getDepositStock(product);
            const totalToMove = getTotalMovements(product.id);
            const hasError = totalToMove > depositStock && !ignoreStock;
            const remainingStock = depositStock - totalToMove;

            return (
              <div
                key={product.id}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
              >
                {/* Header del producto */}
                <div className="bg-slate-900 p-4 border-b border-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Package className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-semibold text-base break-words">
                          {product.name}
                        </h3>
                        <p className="text-slate-400 text-sm">{product.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`font-bold text-sm flex-shrink-0 ${
                          depositStock > 0
                            ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                            : "bg-red-600 hover:bg-red-600 text-white"
                        }`}
                      >
                        Stock: {depositStock}
                      </Badge>
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition-colors"
                        title="Actualizar stock manualmente"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Botón distribuir */}
                  <Button
                    onClick={() => distributeEqually(product.id)}
                    disabled={
                      isCreatingBulk || (depositStock <= 0 && !ignoreStock)
                    }
                    size="sm"
                    className="w-full mt-3 text-sm bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                  >
                    <Divide className="w-4 h-4 mr-2" />
                    Distribuir
                  </Button>
                </div>

                {/* Lista de puntos de venta - Grid */}
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {pointSalesList.map((pointSale) => {
                      const amount = movements[pointSale.id] || 0;
                      const currentStock = getPointSaleStock(
                        product,
                        pointSale.id
                      );

                      return (
                        <div
                          key={pointSale.id}
                          className="bg-slate-900/50 rounded-lg p-3 border border-slate-700"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Store className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-white font-medium text-sm block truncate">
                                {pointSale.name}
                              </span>
                              <span className="text-xs text-slate-400">
                                Stock:{" "}
                                <span className="text-emerald-400 font-semibold">
                                  {currentStock}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <NumericFormat
                              value={amount || ""}
                              onValueChange={(values: NumberFormatValues) => {
                                updateAmount(
                                  product.id,
                                  pointSale.id,
                                  values.floatValue || 0
                                );
                              }}
                              thousandSeparator={false}
                              decimalScale={0}
                              allowNegative={false}
                              placeholder="0"
                              disabled={isCreatingBulk}
                              className="w-full h-10 text-sm bg-slate-900 border border-slate-600 text-white text-center rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <Button
                              onClick={() =>
                                assignAllToPoint(product.id, pointSale.id)
                              }
                              disabled={
                                isCreatingBulk ||
                                (depositStock <= 0 && !ignoreStock)
                              }
                              size="sm"
                              className="w-full h-9 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Asignar todo
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer con total */}
                {totalToMove > 0 && (
                  <div className="bg-slate-900 p-4 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm font-medium">
                        Total a mover:
                      </span>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`font-bold ${
                            hasError
                              ? "bg-red-600 hover:bg-red-600 text-white"
                              : "bg-indigo-600 hover:bg-indigo-600 text-white"
                          }`}
                        >
                          {totalToMove}
                        </Badge>
                        <span
                          className={`text-sm font-semibold ${
                            remainingStock < 0
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          Resta: {remainingStock}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Tabla para desktop (>= lg) */}
      <div className="hidden lg:block bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase sticky left-0 bg-slate-900 z-10">
                  Producto
                </th>
                <th className="px-3 md:px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">
                  Stock Depósito
                </th>
                <th className="px-3 md:px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">
                  Acciones Rápidas
                </th>
                {pointSalesList.map((ps) => (
                  <th
                    key={ps.id}
                    className="px-3 md:px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase min-w-[140px]"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Store className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{ps.name}</span>
                    </div>
                  </th>
                ))}
                <th className="px-3 md:px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={pointSalesList.length + 4}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const movements = productMovements[product.id] || {};
                  const depositStock = getDepositStock(product);
                  const totalToMove = getTotalMovements(product.id);
                  const hasError = totalToMove > depositStock && !ignoreStock;
                  const remainingStock = depositStock - totalToMove;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-700/50 transition"
                    >
                      {/* Producto */}
                      <td className="px-3 md:px-4 py-3 sticky left-0 bg-slate-800 z-10">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm truncate max-w-[150px]">
                              {product.name}
                            </p>
                            <p className="text-slate-400 text-xs">
                              {product.code}
                            </p>
                          </div>
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="px-2 py-1 text-xs rounded-md bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition-colors flex-shrink-0 font-medium"
                            title="Editar stock de depósito"
                          >
                            Depósito
                          </button>
                        </div>
                      </td>

                      {/* Stock Depósito */}
                      <td className="px-3 md:px-4 py-3 text-center">
                        <Badge
                          className={`font-bold text-sm ${
                            depositStock > 0
                              ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                              : "bg-red-600 hover:bg-red-600 text-white"
                          }`}
                        >
                          {depositStock}
                        </Badge>
                      </td>

                      {/* Acciones Rápidas */}
                      <td className="px-3 md:px-4 py-3">
                        <Button
                          onClick={() => distributeEqually(product.id)}
                          disabled={
                            isCreatingBulk ||
                            (depositStock <= 0 && !ignoreStock)
                          }
                          size="sm"
                          className="w-full min-w-[120px] text-xs bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                        >
                          <Divide className="w-3 h-3 mr-1" />
                          Distribuir
                        </Button>
                      </td>

                      {/* Columna por cada punto de venta */}
                      {pointSalesList.map((pointSale) => {
                        const amount = movements[pointSale.id] || 0;
                        const currentStock = getPointSaleStock(
                          product,
                          pointSale.id
                        );

                        return (
                          <td key={pointSale.id} className="px-3 md:px-4 py-3">
                            <div className="flex flex-col gap-1">
                              {/* Stock actual del punto */}
                              <div className="text-center mb-1">
                                <span className="text-xs text-slate-400">
                                  Stock:{" "}
                                </span>
                                <span className="text-xs font-semibold text-emerald-400">
                                  {currentStock}
                                </span>
                              </div>

                              <NumericFormat
                                value={amount || ""}
                                onValueChange={(values: NumberFormatValues) => {
                                  updateAmount(
                                    product.id,
                                    pointSale.id,
                                    values.floatValue || 0
                                  );
                                }}
                                thousandSeparator={false}
                                decimalScale={0}
                                allowNegative={false}
                                placeholder="0"
                                disabled={isCreatingBulk}
                                className="w-full h-8 text-sm bg-slate-900 border border-slate-600 text-white text-center rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <Button
                                onClick={() =>
                                  assignAllToPoint(product.id, pointSale.id)
                                }
                                disabled={
                                  isCreatingBulk ||
                                  (depositStock <= 0 && !ignoreStock)
                                }
                                size="sm"
                                className="w-full h-7 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30"
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Todo
                              </Button>
                            </div>
                          </td>
                        );
                      })}

                      {/* Total */}
                      <td className="px-3 md:px-4 py-3 text-center">
                        {totalToMove > 0 && (
                          <div className="flex flex-col gap-1">
                            <Badge
                              className={`font-bold ${
                                hasError
                                  ? "bg-red-600 hover:bg-red-600 text-white"
                                  : "bg-indigo-600 hover:bg-indigo-600 text-white"
                              }`}
                            >
                              {totalToMove}
                            </Badge>
                            <span
                              className={`text-xs font-semibold ${
                                remainingStock < 0
                                  ? "text-red-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              Resta: {remainingStock}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer con controles */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 md:p-6 space-y-4 fixed bottom-0 left-0 right-0 md:static shadow-2xl md:shadow-none z-20 mx-4 mb-4 md:mx-0 md:mb-0">
        {/* Checkbox ignorar stock */}
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 md:p-4">
          <input
            type="checkbox"
            id="ignore-stock"
            checked={ignoreStock}
            onChange={(e) => setIgnoreStock(e.target.checked)}
            disabled={isCreatingBulk}
            className="w-4 h-4 md:w-5 md:h-5 rounded"
          />
          <label
            htmlFor="ignore-stock"
            className="text-amber-300 text-xs md:text-sm cursor-pointer"
          >
            Ignorar validación de stock (permitir stock negativo en depósito)
          </label>
        </div>

        {/* Botón ejecutar */}
        <Button
          onClick={handleExecuteBulk}
          disabled={isCreatingBulk || !hasValidMovements()}
          className="w-full h-12 md:h-14 bg-indigo-600 hover:bg-indigo-500 text-white text-base md:text-lg font-bold shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          <Warehouse className="w-5 h-5 md:w-6 md:h-6 mr-2" />
          {isCreatingBulk
            ? "Procesando movimientos..."
            : "Ejecutar Todos los Movimientos"}
          <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-2" />
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

export default BulkMovementTable;
