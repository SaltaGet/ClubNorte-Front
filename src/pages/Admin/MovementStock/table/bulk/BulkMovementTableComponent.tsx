import {
  Package,
  Store,
  Zap,
  Divide,
  Edit,
} from "lucide-react";
import type { Product } from "@/hooks/admin/Product/productType";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NumericFormat, type NumberFormatValues } from "react-number-format";

interface ProductMovements {
  [productId: number]: {
    [pointSaleId: number]: number;
  };
}

interface PointSale {
  id: number;
  name: string;
}

interface BulkMovementTableProps {
  products: Product[];
  pointSalesList: PointSale[];
  productMovements: ProductMovements;
  ignoreStock: boolean;
  isCreatingBulk: boolean;
  updateAmount: (productId: number, pointSaleId: number, amount: number) => void;
  distributeEqually: (productId: number) => void;
  assignAllToPoint: (productId: number, pointSaleId: number) => void;
  getTotalMovements: (productId: number) => number;
  getDepositStock: (product: Product) => number;
  getPointSaleStock: (product: Product, pointSaleId: number) => number;
  handleOpenModal: (product: Product) => void;
}

const BulkMovementTableComponent = ({
  products,
  pointSalesList,
  productMovements,
  ignoreStock,
  isCreatingBulk,
  updateAmount,
  distributeEqually,
  assignAllToPoint,
  getTotalMovements,
  getDepositStock,
  getPointSaleStock,
  handleOpenModal,
}: BulkMovementTableProps) => {
  if (products.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
        <p className="text-slate-400">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <>
      {/* Vista Cards para móvil y tablet (< lg) */}
      <div className="lg:hidden space-y-3">
        {products.map((product) => {
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
        })}
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
              {products.map((product) => {
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default BulkMovementTableComponent;